"""
Product & inventory resolvers.
"""

import uuid

import strawberry
from strawberry.types import Info
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.db.models import Product, StockBatch, UserRole
from app.db.session import async_session_factory
from app.graphql.resolvers.auth import _get_caller
from app.graphql.types import (
    ProductType,
    PaginatedProducts,
    StockBatchType,
    ProductInput,
    StockBatchInput,
)


def _product_to_type(product: Product, stock: int | None = None) -> ProductType:
    return ProductType(
        id=product.id,
        name=product.name,
        composition=product.composition,
        manufacturer=product.manufacturer,
        pack_size=product.pack_size,
        hsn_code=product.hsn_code,
        category=product.category,
        default_mrp=float(product.default_mrp) if product.default_mrp else None,
        available_stock=stock,
    )


@strawberry.type
class ProductQuery:
    @strawberry.field
    async def products(
        self,
        search: str | None = None,
        category: str | None = None,
        page: int = 1,
        per_page: int = 20,
    ) -> PaginatedProducts:
        """List products with optional search and pagination."""
        async with async_session_factory() as session:
            query = select(Product).where(Product.is_active == True)

            if search:
                query = query.where(Product.name.ilike(f"%{search}%"))
            if category:
                query = query.where(Product.category == category)

            # Count total
            count_query = select(func.count()).select_from(query.subquery())
            total = (await session.execute(count_query)).scalar() or 0

            # Paginate
            offset = (page - 1) * per_page
            query = query.offset(offset).limit(per_page)
            result = await session.execute(query)
            products = result.scalars().all()

            items = [_product_to_type(p) for p in products]

            return PaginatedProducts(
                items=items,
                total_count=total,
                has_next_page=(offset + per_page) < total,
            )

    @strawberry.field
    async def product(self, id: uuid.UUID) -> ProductType:
        """Get a single product by ID."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(Product)
                .options(selectinload(Product.stock_batches))
                .where(Product.id == id)
            )
            product = result.scalar_one_or_none()
            if not product:
                raise Exception("Product not found")

            total_stock = sum(
                b.quantity_available for b in product.stock_batches
            )
            return _product_to_type(product, stock=total_stock)

    @strawberry.field
    async def stock_batches(self, product_id: uuid.UUID) -> list[StockBatchType]:
        """Get all stock batches for a product."""
        async with async_session_factory() as session:
            result = await session.execute(
                select(StockBatch)
                .where(StockBatch.product_id == product_id)
                .order_by(StockBatch.expiry_date)
            )
            batches = result.scalars().all()
            return [
                StockBatchType(
                    id=b.id,
                    batch_number=b.batch_number,
                    expiry_date=b.expiry_date,
                    mrp=float(b.mrp),
                    purchase_rate=float(b.purchase_rate),
                    quantity_available=b.quantity_available,
                    quantity_sold=b.quantity_sold,
                )
                for b in batches
            ]


@strawberry.type
class ProductMutation:
    @strawberry.mutation
    async def add_product(self, info: Info, input: ProductInput) -> ProductType:
        """Add a new product to the catalog (Super Admin, Admin, or Warehouse only)."""
        _, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception("Permission denied: You are not authorized to add products.")

        async with async_session_factory() as session:
            product = Product(
                name=input.name,
                composition=input.composition,
                manufacturer=input.manufacturer,
                pack_size=input.pack_size,
                hsn_code=input.hsn_code,
                category=input.category,
                default_mrp=input.default_mrp,
                default_sgst_rate=input.default_sgst_rate,
                default_cgst_rate=input.default_cgst_rate,
            )
            session.add(product)
            await session.commit()
            await session.refresh(product)
            return _product_to_type(product)

    @strawberry.mutation
    async def add_stock_batch(self, info: Info, input: StockBatchInput) -> StockBatchType:
        """Add a stock batch for a product (Super Admin, Admin, or Warehouse only)."""
        _, role = _get_caller(info)
        if role not in (
            UserRole.SUPER_ADMIN.value,
            UserRole.ADMIN.value,
            UserRole.WAREHOUSE.value,
        ):
            raise Exception("Permission denied: You are not authorized to add inventory stock.")

        async with async_session_factory() as session:
            batch = StockBatch(
                product_id=input.product_id,
                batch_number=input.batch_number,
                expiry_date=input.expiry_date,
                purchase_rate=input.purchase_rate,
                mrp=input.mrp,
                quantity_received=input.quantity_received,
                quantity_available=input.quantity_received,
                supplier_invoice_no=input.supplier_invoice_no,
            )
            session.add(batch)
            await session.commit()
            await session.refresh(batch)
            return StockBatchType(
                id=batch.id,
                batch_number=batch.batch_number,
                expiry_date=batch.expiry_date,
                mrp=float(batch.mrp),
                purchase_rate=float(batch.purchase_rate),
                quantity_available=batch.quantity_available,
                quantity_sold=batch.quantity_sold,
            )
