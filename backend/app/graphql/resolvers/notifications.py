"""
Notification resolvers — user alerts, preference toggles, and notification center.
"""

import json
import uuid
from sqlalchemy import select

import strawberry
from strawberry.types import Info

from app.db.models import Notification, ShopkeeperProfile, User
from app.db.session import async_session_factory
from app.graphql.resolvers.auth import _get_caller
from app.graphql.types import (
    NotificationType,
    UpdateNotificationPreferencesInput,
)


@strawberry.type
class NotificationQuery:
    @strawberry.field
    async def notifications(
        self,
        info: Info,
        is_read: bool | None = None,
    ) -> list[NotificationType]:
        """Fetch notifications for the authenticated user."""
        user_id_str, _ = _get_caller(info)
        user_id = uuid.UUID(user_id_str)

        async with async_session_factory() as session:
            query = select(Notification).where(Notification.user_id == user_id)
            if is_read is not None:
                query = query.where(Notification.is_read == is_read)
            query = query.order_by(Notification.created_at.desc()).limit(50)

            result = await session.execute(query)
            items = result.scalars().all()
            return [
                NotificationType(
                    id=n.id,
                    user_id=n.user_id,
                    title=n.title,
                    message=n.message,
                    category=n.category,
                    is_read=n.is_read,
                    created_at=n.created_at,
                )
                for n in items
            ]

    @strawberry.field
    async def notification_preferences(self, info: Info) -> str:
        """Fetch JSON notification channel preferences (in_app, sms, whatsapp)."""
        user_id_str, _ = _get_caller(info)
        user_id = uuid.UUID(user_id_str)

        async with async_session_factory() as session:
            result = await session.execute(
                select(ShopkeeperProfile).where(ShopkeeperProfile.user_id == user_id)
            )
            profile = result.scalar_one_or_none()
            if profile and profile.notification_preferences:
                return profile.notification_preferences
            return '{"in_app":true,"sms":false,"whatsapp":true}'


@strawberry.type
class NotificationMutation:
    @strawberry.mutation
    async def mark_notification_as_read(
        self,
        info: Info,
        notification_id: uuid.UUID,
    ) -> bool:
        """Mark a notification as read."""
        user_id_str, _ = _get_caller(info)
        user_id = uuid.UUID(user_id_str)

        async with async_session_factory() as session:
            result = await session.execute(
                select(Notification).where(
                    Notification.id == notification_id,
                    Notification.user_id == user_id,
                )
            )
            item = result.scalar_one_or_none()
            if not item:
                return False

            item.is_read = True
            await session.commit()
            return True

    @strawberry.mutation
    async def update_notification_preferences(
        self,
        info: Info,
        input: UpdateNotificationPreferencesInput,
    ) -> bool:
        """Toggle notification channels (In-app, SMS, WhatsApp)."""
        user_id_str, _ = _get_caller(info)
        user_id = uuid.UUID(user_id_str)

        async with async_session_factory() as session:
            result = await session.execute(
                select(ShopkeeperProfile).where(ShopkeeperProfile.user_id == user_id)
            )
            profile = result.scalar_one_or_none()
            if not profile:
                return False

            prefs = {
                "in_app": input.in_app,
                "sms": input.sms,
                "whatsapp": input.whatsapp,
            }
            profile.notification_preferences = json.dumps(prefs)
            await session.commit()
            return True
