"""
Auth resolvers — login, registration, user management, and role assignment.
"""

import uuid
import strawberry
from strawberry.types import Info
from sqlalchemy import select, or_, func
from sqlalchemy.orm import selectinload

from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
)
from app.db.models import (
    User,
    UserRole,
    ShopkeeperProfile,
    DeliveryProfile,
    Order,
    Notification,
)
from app.db.session import async_session_factory
from app.graphql.types import (
    AuthPayload,
    UserType,
    CreateUserInput,
    RegisterInput,
    ShopkeeperProfileType,
)


def _user_to_type(user: User) -> UserType:
    return UserType(
        id=user.id,
        email=user.email,
        phone=user.phone,
        full_name=user.full_name,
        role=user.role.value if hasattr(user.role, "value") else str(user.role),
        is_active=user.is_active,
        created_at=user.created_at,
        assigned_work_queue=getattr(user, "assigned_work_queue", None),
    )


def _get_caller(info: Info) -> tuple[str, str]:
    """Return (user_id, role) from Authorization header or test context."""
    context = info.context
    request = (
        context.get("request")
        if isinstance(context, dict)
        else getattr(context, "request", None)
    )
    if not request:
        user_id = (
            context.get("user_id")
            if isinstance(context, dict)
            else getattr(context, "user_id", None)
        )
        role = (
            context.get("role")
            if isinstance(context, dict)
            else getattr(context, "role", None)
        )
        if user_id and role:
            return str(user_id), str(role)
        raise Exception("Not authenticated")

    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        raise Exception("Not authenticated")

    token = auth_header.split(" ", 1)[1]
    payload = decode_token(token)
    user_id = payload.get("sub")
    role = payload.get("role")
    if not user_id or not role:
        raise Exception("Invalid token claims")
    return user_id, role


@strawberry.type
class AuthQuery:
    @strawberry.field
    async def me(self, info: Info) -> UserType:
        """Return the currently authenticated user."""
        user_id, _ = _get_caller(info)

        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found")
            return _user_to_type(user)

    @strawberry.field
    async def users(
        self,
        info: Info,
        role: str | None = None,
        search: str | None = None,
        page: int = 1,
        per_page: int = 50,
    ) -> list[UserType]:
        """List users with optional role and search filtering."""
        _get_caller(info)
        async with async_session_factory() as session:
            stmt = select(User)
            if role and role != "ALL":
                try:
                    stmt = stmt.where(User.role == UserRole(role))
                except ValueError:
                    pass

            if search and search.strip():
                term = f"%{search.strip()}%"
                stmt = stmt.where(
                    or_(
                        User.full_name.ilike(term),
                        User.email.ilike(term),
                        User.phone.ilike(term),
                    )
                )

            stmt = (
                stmt.order_by(User.created_at.desc())
                .offset((page - 1) * per_page)
                .limit(per_page)
            )
            result = await session.execute(stmt)
            users_list = result.scalars().all()
            return [_user_to_type(u) for u in users_list]

    @strawberry.field
    async def shopkeepers(
        self,
        info: Info,
        search: str | None = None,
        status: str | None = None,
        page: int = 1,
        per_page: int = 50,
    ) -> list[ShopkeeperProfileType]:
        """List retail pharmacies with KYC verification status, credit limits and balances."""
        caller_id, caller_role = _get_caller(info)
        async with async_session_factory() as session:
            stmt = select(ShopkeeperProfile).options(
                selectinload(ShopkeeperProfile.user)
            )
            if caller_role == UserRole.SHOPKEEPER.value and caller_id:
                stmt = stmt.where(
                    ShopkeeperProfile.user_id == uuid.UUID(str(caller_id))
                )
            elif status and status != "ALL":
                stmt = stmt.where(ShopkeeperProfile.verification_status == status)

            if search and search.strip():
                term = f"%{search.strip()}%"
                stmt = stmt.where(
                    or_(
                        ShopkeeperProfile.shop_name.ilike(term),
                        ShopkeeperProfile.area.ilike(term),
                        ShopkeeperProfile.city.ilike(term),
                        ShopkeeperProfile.gstin.ilike(term),
                        ShopkeeperProfile.drug_license_no.ilike(term),
                    )
                )

            stmt = stmt.offset((page - 1) * per_page).limit(per_page)
            res = await session.execute(stmt)
            profiles = res.scalars().all()

            results = []
            for p in profiles:
                ord_q = await session.execute(
                    select(func.count(Order.id)).where(Order.shopkeeper_id == p.user_id)
                )
                tot_orders = ord_q.scalar() or 0
                results.append(
                    ShopkeeperProfileType(
                        id=p.id,
                        user_id=p.user_id,
                        shop_name=p.shop_name,
                        shop_address=p.shop_address,
                        gstin=p.gstin,
                        drug_license_no=p.drug_license_no,
                        area=p.area,
                        city=p.city,
                        credit_limit=float(p.credit_limit or 0.0),
                        outstanding_balance=float(p.outstanding_balance or 0.0),
                        verification_status=getattr(
                            p, "verification_status", "VERIFIED"
                        )
                        or "VERIFIED",
                        verification_notes=getattr(p, "verification_notes", None),
                        credit_limit_reason=getattr(p, "credit_limit_reason", None),
                        owner_name=p.user.full_name if p.user else None,
                        phone=p.user.phone if p.user else None,
                        email=p.user.email if p.user else None,
                        total_orders=tot_orders,
                    )
                )
            return results


@strawberry.type
class AuthMutation:
    @strawberry.mutation
    async def login(self, email: str, password: str) -> AuthPayload:
        """
        Authenticate any user role (Super Admin, Operations Admin, Warehouse Staff,
        Delivery Boy, Retail Shopkeeper) using registered Email OR Phone.
        """
        clean_identifier = email.strip()
        async with async_session_factory() as session:
            result = await session.execute(
                select(User).where(
                    or_(
                        User.email == clean_identifier,
                        User.phone == clean_identifier,
                    )
                )
            )
            user = result.scalar_one_or_none()

            if not user or not verify_password(password, user.password_hash):
                raise Exception("Invalid email or password")

            if not user.is_active:
                raise Exception("Account is deactivated. Please contact administrator.")

            token_data = {"sub": str(user.id), "role": user.role.value}
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)

            return AuthPayload(
                access_token=access_token,
                refresh_token=refresh_token,
                user=_user_to_type(user),
            )

    @strawberry.mutation
    async def register(self, input: RegisterInput) -> AuthPayload:
        """
        Free, self-service registration without approval for:
        - 🏪 Retail Shopkeeper (SHOPKEEPER)
        - 🛵 Delivery Boy (DELIVERY)
        """
        allowed_roles = [UserRole.SHOPKEEPER.value, UserRole.DELIVERY.value]
        if input.role not in allowed_roles:
            raise Exception(
                "Self-service registration is only available for Retail Shopkeepers and Delivery Boys. "
                "Admin and Warehouse accounts must be assigned by Super Admin."
            )

        if not input.phone or not input.phone.strip():
            raise Exception("A valid mobile phone number is required for registration.")

        if not input.password or len(input.password) < 6:
            raise Exception("Password must be at least 6 characters long.")

        clean_phone = input.phone.strip()
        clean_email = (
            input.email.strip() if input.email and input.email.strip() else None
        )

        async with async_session_factory() as session:
            # Check phone uniqueness
            existing_phone = await session.execute(
                select(User).where(User.phone == clean_phone)
            )
            if existing_phone.scalar_one_or_none():
                raise Exception(
                    f"An account with phone number '{clean_phone}' already exists."
                )

            # Check email uniqueness if email provided
            if clean_email:
                existing_email = await session.execute(
                    select(User).where(User.email == clean_email)
                )
                if existing_email.scalar_one_or_none():
                    raise Exception(
                        f"An account with email '{clean_email}' already exists."
                    )

            # Create User with is_active=True (free instant access, no waiting for approval)
            user = User(
                id=uuid.uuid4(),
                email=clean_email,
                phone=clean_phone,
                password_hash=hash_password(input.password),
                full_name=input.full_name.strip(),
                role=UserRole(input.role),
                is_active=True,
            )
            session.add(user)
            await session.flush()

            # Create role-specific profile
            if input.role == UserRole.SHOPKEEPER.value:
                profile = ShopkeeperProfile(
                    user_id=user.id,
                    shop_name=input.shop_name or f"{user.full_name}'s Medical",
                    shop_address=input.shop_address or "Address not specified",
                    gstin=input.gstin,
                    drug_license_no=input.drug_license_no,
                    area=input.area,
                    city=input.city,
                )
                session.add(profile)
            elif input.role == UserRole.DELIVERY.value:
                d_profile = DeliveryProfile(
                    user_id=user.id,
                    vehicle_type=input.vehicle_type or "Two-Wheeler",
                    vehicle_number=input.vehicle_number,
                    assigned_area=input.assigned_area,
                    is_available=True,
                )
                session.add(d_profile)

            await session.commit()
            await session.refresh(user)

            token_data = {"sub": str(user.id), "role": user.role.value}
            access_token = create_access_token(token_data)
            refresh_token = create_refresh_token(token_data)

            return AuthPayload(
                access_token=access_token,
                refresh_token=refresh_token,
                user=_user_to_type(user),
            )

    @strawberry.mutation
    async def assign_user_role(
        self, info: Info, user_id: uuid.UUID, new_role: str
    ) -> UserType:
        """
        Super Admin or Operations Admin assigns/changes a user's role.
        - Super Admin can assign any role.
        - Operations Admin can only assign WAREHOUSE, DELIVERY, SHOPKEEPER (cannot assign or modify SUPER_ADMIN/ADMIN).
        - Other roles are rejected.
        """
        caller_id, caller_role = _get_caller(info)
        if caller_role not in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
            raise Exception(
                "Permission denied: You are not authorized to assign roles."
            )

        valid_roles = [r.value for r in UserRole]
        if new_role not in valid_roles:
            raise Exception(
                f"Invalid role '{new_role}'. Must be one of: {', '.join(valid_roles)}"
            )

        if caller_role == UserRole.ADMIN.value:
            if new_role in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
                raise Exception(
                    "Permission denied: Operations Admin cannot assign Admin or Super Admin roles."
                )

        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user:
                raise Exception("User not found.")

            if caller_role == UserRole.ADMIN.value and user.role in (
                UserRole.SUPER_ADMIN,
                UserRole.ADMIN,
            ):
                raise Exception(
                    "Permission denied: Operations Admin cannot modify Super Admin or Admin accounts."
                )

            target_role = UserRole(new_role)
            user.role = target_role

            # If assigning to DELIVERY and profile doesn't exist, create default
            if target_role == UserRole.DELIVERY:
                dp = await session.execute(
                    select(DeliveryProfile).where(DeliveryProfile.user_id == user.id)
                )
                if not dp.scalar_one_or_none():
                    session.add(
                        DeliveryProfile(
                            user_id=user.id,
                            vehicle_type="Two-Wheeler",
                            is_available=True,
                        )
                    )

            # If assigning to SHOPKEEPER and profile doesn't exist, create default
            if target_role == UserRole.SHOPKEEPER:
                sp = await session.execute(
                    select(ShopkeeperProfile).where(
                        ShopkeeperProfile.user_id == user.id
                    )
                )
                if not sp.scalar_one_or_none():
                    session.add(
                        ShopkeeperProfile(
                            user_id=user.id,
                            shop_name=f"{user.full_name}'s Medical Store",
                            shop_address="Default City",
                        )
                    )

            await session.commit()
            await session.refresh(user)
            return _user_to_type(user)

    @strawberry.mutation
    async def create_user(self, info: Info, input: CreateUserInput) -> UserType:
        """Create a new staff or user account directly (Super Admin / Admin)."""
        caller_id, caller_role = _get_caller(info)
        if caller_role not in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
            raise Exception(
                "Permission denied: You are not authorized to create users."
            )

        if caller_role == UserRole.ADMIN.value:
            if input.role in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
                raise Exception(
                    "Permission denied: Operations Admin cannot create Super Admin or Admin accounts."
                )

        clean_email = (
            input.email.strip() if input.email and input.email.strip() else None
        )
        clean_phone = (
            input.phone.strip() if input.phone and input.phone.strip() else None
        )

        async with async_session_factory() as session:
            if clean_email:
                exists_email = await session.execute(
                    select(User).where(User.email == clean_email)
                )
                if exists_email.scalar_one_or_none():
                    raise Exception(
                        f"A user with email '{clean_email}' already exists."
                    )

            if clean_phone:
                exists_phone = await session.execute(
                    select(User).where(User.phone == clean_phone)
                )
                if exists_phone.scalar_one_or_none():
                    raise Exception(
                        f"A user with phone '{clean_phone}' already exists."
                    )

            user = User(
                email=clean_email,
                phone=clean_phone,
                password_hash=hash_password(input.password),
                full_name=input.full_name.strip(),
                role=UserRole(input.role),
                is_active=True,
            )
            session.add(user)
            await session.flush()

            if input.role == UserRole.SHOPKEEPER.value:
                profile = ShopkeeperProfile(
                    user_id=user.id,
                    shop_name=input.shop_name or f"{user.full_name}'s Pharmacy",
                    shop_address=input.shop_address or "Headquarters",
                    gstin=input.gstin,
                )
                session.add(profile)
            elif input.role == UserRole.DELIVERY.value:
                d_profile = DeliveryProfile(
                    user_id=user.id,
                    vehicle_type=input.vehicle_type or "Two-Wheeler",
                    vehicle_number=input.vehicle_number,
                    assigned_area=input.assigned_area,
                    is_available=True,
                )
                session.add(d_profile)

            await session.commit()
            await session.refresh(user)
            return _user_to_type(user)

    @strawberry.mutation
    async def refresh_token(self, refresh_token: str) -> AuthPayload:
        """Exchange a refresh token for new access + refresh tokens."""
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise Exception("Invalid token type")

        user_id = payload.get("sub")
        async with async_session_factory() as session:
            result = await session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if not user or not user.is_active:
                raise Exception("User not found or deactivated")

            token_data = {"sub": str(user.id), "role": user.role.value}
            new_access = create_access_token(token_data)
            new_refresh = create_refresh_token(token_data)

            return AuthPayload(
                access_token=new_access,
                refresh_token=new_refresh,
                user=_user_to_type(user),
            )

    @strawberry.mutation
    async def update_shopkeeper_kyc(
        self,
        info: Info,
        shopkeeper_id: uuid.UUID,
        status: str,
        notes: str | None = None,
    ) -> ShopkeeperProfileType:
        """Approve, reject, or suspend a retail pharmacy's KYC verification (Admin only)."""
        caller_id, caller_role = _get_caller(info)
        if caller_role not in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
            raise Exception(
                "Permission denied: Only Operations Admin or Super Admin can verify retailers."
            )

        if status not in ("VERIFIED", "PENDING_VERIFICATION", "REJECTED", "SUSPENDED"):
            raise Exception(
                f"Invalid verification status '{status}'. Must be VERIFIED, PENDING_VERIFICATION, REJECTED, or SUSPENDED."
            )

        async with async_session_factory() as session:
            stmt = (
                select(ShopkeeperProfile)
                .options(selectinload(ShopkeeperProfile.user))
                .where(
                    (ShopkeeperProfile.id == shopkeeper_id)
                    | (ShopkeeperProfile.user_id == shopkeeper_id)
                )
            )
            res = await session.execute(stmt)
            profile = res.scalar_one_or_none()
            if not profile:
                raise Exception(f"Shopkeeper profile {shopkeeper_id} not found.")

            profile.verification_status = status
            profile.verification_notes = notes

            # Notify retailer about onboarding decisions (Item 57)
            if status == "VERIFIED":
                notif = Notification(
                    user_id=profile.user_id,
                    title="Pharmacy Account Verified",
                    message=f"Congratulations! Your pharmacy '{profile.shop_name}' has been verified. You can now place wholesale orders within your approved credit line.",
                    category="ONBOARDING",
                )
                session.add(notif)
            elif status in ("REJECTED", "SUSPENDED"):
                notif = Notification(
                    user_id=profile.user_id,
                    title="Pharmacy Verification Update",
                    message=f"Verification status for '{profile.shop_name}' was set to {status}. Reason/Notes: {notes or 'Please re-verify submitted documents.'}",
                    category="ONBOARDING",
                )
                session.add(notif)

            await session.commit()
            await session.refresh(profile)

            ord_q = await session.execute(
                select(func.count(Order.id)).where(
                    Order.shopkeeper_id == profile.user_id
                )
            )
            tot_orders = ord_q.scalar() or 0

            return ShopkeeperProfileType(
                id=profile.id,
                user_id=profile.user_id,
                shop_name=profile.shop_name,
                shop_address=profile.shop_address,
                gstin=profile.gstin,
                drug_license_no=profile.drug_license_no,
                area=profile.area,
                city=profile.city,
                credit_limit=float(profile.credit_limit or 0.0),
                outstanding_balance=float(profile.outstanding_balance or 0.0),
                verification_status=profile.verification_status,
                verification_notes=profile.verification_notes,
                credit_limit_reason=profile.credit_limit_reason,
                owner_name=profile.user.full_name if profile.user else None,
                phone=profile.user.phone if profile.user else None,
                email=profile.user.email if profile.user else None,
                total_orders=tot_orders,
            )

    @strawberry.mutation
    async def update_shopkeeper_credit_limit(
        self,
        info: Info,
        shopkeeper_id: uuid.UUID,
        new_limit: float,
        reason: str,
    ) -> ShopkeeperProfileType:
        """Adjust or set retail pharmacy credit limit with documented reason (Admin only)."""
        caller_id, caller_role = _get_caller(info)
        if caller_role not in (UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value):
            raise Exception(
                "Permission denied: Only Operations Admin or Super Admin can adjust credit limits."
            )

        if new_limit < 0:
            raise Exception("Credit limit cannot be negative.")
        if not reason or not reason.strip():
            raise Exception(
                "Documented justification reason is mandatory for credit limit adjustments."
            )

        async with async_session_factory() as session:
            stmt = (
                select(ShopkeeperProfile)
                .options(selectinload(ShopkeeperProfile.user))
                .where(
                    (ShopkeeperProfile.id == shopkeeper_id)
                    | (ShopkeeperProfile.user_id == shopkeeper_id)
                )
            )
            res = await session.execute(stmt)
            profile = res.scalar_one_or_none()
            if not profile:
                raise Exception(f"Shopkeeper profile {shopkeeper_id} not found.")

            profile.credit_limit = new_limit
            profile.credit_limit_reason = reason.strip()
            await session.commit()
            await session.refresh(profile)

            ord_q = await session.execute(
                select(func.count(Order.id)).where(
                    Order.shopkeeper_id == profile.user_id
                )
            )
            tot_orders = ord_q.scalar() or 0

            return ShopkeeperProfileType(
                id=profile.id,
                user_id=profile.user_id,
                shop_name=profile.shop_name,
                shop_address=profile.shop_address,
                gstin=profile.gstin,
                drug_license_no=profile.drug_license_no,
                area=profile.area,
                city=profile.city,
                credit_limit=float(profile.credit_limit or 0.0),
                outstanding_balance=float(profile.outstanding_balance or 0.0),
                verification_status=profile.verification_status,
                verification_notes=profile.verification_notes,
                credit_limit_reason=profile.credit_limit_reason,
                owner_name=profile.user.full_name if profile.user else None,
                phone=profile.user.phone if profile.user else None,
                email=profile.user.email if profile.user else None,
                total_orders=tot_orders,
            )
