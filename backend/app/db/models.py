"""
SQLAlchemy ORM models for Pharmacy Fantasy.

All tables match the schema defined in docs/DATABASE.md.
"""

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Numeric,
    String,
    Text,
    Integer,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


# ── Enums ────────────────────────────────────────────────


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    WAREHOUSE = "WAREHOUSE"
    DELIVERY = "DELIVERY"
    SHOPKEEPER = "SHOPKEEPER"


class OrderStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PICKING = "PICKING"
    PACKED = "PACKED"
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class DeliveryStatus(str, enum.Enum):
    ASSIGNED = "ASSIGNED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"


class PaymentMethod(str, enum.Enum):
    CASH = "CASH"
    UPI = "UPI"
    BANK_TRANSFER = "BANK_TRANSFER"
    CHEQUE = "CHEQUE"


# ── Users ────────────────────────────────────────────────


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole))
    full_name: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    shopkeeper_profile: Mapped["ShopkeeperProfile | None"] = relationship(
        back_populates="user", uselist=False
    )
    delivery_profile: Mapped["DeliveryProfile | None"] = relationship(
        back_populates="user", uselist=False
    )


class ShopkeeperProfile(Base):
    __tablename__ = "shopkeeper_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True
    )
    shop_name: Mapped[str] = mapped_column(String(255))
    shop_address: Mapped[str] = mapped_column(Text)
    gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)
    drug_license_no: Mapped[str | None] = mapped_column(String(50), nullable=True)
    area: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    credit_limit: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    outstanding_balance: Mapped[float] = mapped_column(Numeric(12, 2), default=0)

    user: Mapped[User] = relationship(back_populates="shopkeeper_profile")


class DeliveryProfile(Base):
    __tablename__ = "delivery_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"), unique=True
    )
    vehicle_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    vehicle_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    assigned_area: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)

    user: Mapped[User] = relationship(back_populates="delivery_profile")


# ── Products & Inventory ─────────────────────────────────


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255))
    composition: Mapped[str | None] = mapped_column(Text, nullable=True)
    manufacturer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    pack_size: Mapped[str] = mapped_column(String(50))
    hsn_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    default_mrp: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    default_sgst_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=2.5)
    default_cgst_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=2.5)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    stock_batches: Mapped[list["StockBatch"]] = relationship(back_populates="product")


class StockBatch(Base):
    __tablename__ = "stock_batches"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    batch_number: Mapped[str] = mapped_column(String(50))
    expiry_date: Mapped[date] = mapped_column(Date)
    purchase_rate: Mapped[float] = mapped_column(Numeric(10, 2))
    mrp: Mapped[float] = mapped_column(Numeric(10, 2))
    quantity_received: Mapped[int] = mapped_column(Integer)
    quantity_available: Mapped[int] = mapped_column(Integer)
    quantity_sold: Mapped[int] = mapped_column(Integer, default=0)
    supplier_invoice_no: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )
    received_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    product: Mapped[Product] = relationship(back_populates="stock_batches")

    __table_args__ = (
        Index("idx_stock_batches_product", "product_id", "quantity_available"),
        Index("idx_stock_batches_expiry", "expiry_date"),
    )


# ── Orders ───────────────────────────────────────────────


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_number: Mapped[str] = mapped_column(String(30), unique=True)
    shopkeeper_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    confirmed_by: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id"), nullable=True
    )
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus), default=OrderStatus.DRAFT
    )
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    discount_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    gst_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    net_amount: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    placed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order")
    invoice: Mapped["Invoice | None"] = relationship(
        back_populates="order", uselist=False
    )
    delivery: Mapped["DeliveryAssignment | None"] = relationship(
        back_populates="order", uselist=False
    )
    challan: Mapped["DeliveryChallan | None"] = relationship(
        back_populates="order", uselist=False
    )

    __table_args__ = (
        Index("idx_orders_shopkeeper", "shopkeeper_id", "status"),
        Index("idx_orders_status", "status", "placed_at"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    stock_batch_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("stock_batches.id"), nullable=True
    )
    quantity: Mapped[int] = mapped_column(Integer)
    free_quantity: Mapped[int] = mapped_column(Integer, default=0)
    rate: Mapped[float] = mapped_column(Numeric(10, 2))
    mrp: Mapped[float] = mapped_column(Numeric(10, 2))
    discount1_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    discount2_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    sgst_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=2.5)
    cgst_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=2.5)
    sgst_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    cgst_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    line_total: Mapped[float] = mapped_column(Numeric(10, 2), default=0)

    order: Mapped[Order] = relationship(back_populates="items")
    product: Mapped[Product] = relationship()

    __table_args__ = (Index("idx_order_items_order", "order_id"),)


# ── Invoices ─────────────────────────────────────────────


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.id"), unique=True
    )
    invoice_number: Mapped[str] = mapped_column(String(30), unique=True)
    invoice_date: Mapped[date] = mapped_column(Date)
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2))
    total_discount: Mapped[float] = mapped_column(Numeric(12, 2))
    total_sgst: Mapped[float] = mapped_column(Numeric(12, 2))
    total_cgst: Mapped[float] = mapped_column(Numeric(12, 2))
    grand_total: Mapped[float] = mapped_column(Numeric(12, 2))
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    order: Mapped[Order] = relationship(back_populates="invoice")
    returns: Mapped[list["InvoiceReturn"]] = relationship(
        back_populates="invoice", cascade="all, delete-orphan"
    )


# ── Delivery ─────────────────────────────────────────────


class DeliveryAssignment(Base):
    __tablename__ = "delivery_assignments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("orders.id"), unique=True
    )
    delivery_boy_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    assigned_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    status: Mapped[DeliveryStatus] = mapped_column(
        Enum(DeliveryStatus), default=DeliveryStatus.ASSIGNED
    )
    delivery_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    proof_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    order: Mapped[Order] = relationship(back_populates="delivery")

    __table_args__ = (
        Index("idx_delivery_assignments_boy", "delivery_boy_id", "status"),
    )


# ── Payments ─────────────────────────────────────────────


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id"))
    shopkeeper_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod))
    reference_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    paid_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("idx_payments_shopkeeper", "shopkeeper_id", "paid_at"),
    )


# ── Purchase Entries (Incoming Stock) ────────────────────


class PurchaseEntry(Base):
    __tablename__ = "purchase_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    supplier_name: Mapped[str] = mapped_column(String(255))
    supplier_gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)
    invoice_number: Mapped[str] = mapped_column(String(50))
    invoice_date: Mapped[date] = mapped_column(Date)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2))
    entered_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    items: Mapped[list["PurchaseItem"]] = relationship(back_populates="purchase_entry")


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    purchase_entry_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("purchase_entries.id")
    )
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    batch_number: Mapped[str] = mapped_column(String(50))
    expiry_date: Mapped[date] = mapped_column(Date)
    hsn_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer)
    free_quantity: Mapped[int] = mapped_column(Integer, default=0)
    rate: Mapped[float] = mapped_column(Numeric(10, 2))
    mrp: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    sgst_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=2.5)
    cgst_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=2.5)
    line_total: Mapped[float] = mapped_column(Numeric(10, 2))

    purchase_entry: Mapped[PurchaseEntry] = relationship(back_populates="items")


# ── Delivery Challans ────────────────────────────────────


class DeliveryChallan(Base):
    __tablename__ = "delivery_challans"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("orders.id"), unique=True)
    challan_number: Mapped[str] = mapped_column(String(50), unique=True)
    challan_date: Mapped[date] = mapped_column(Date)
    transporter_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    vehicle_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    total_cartons: Mapped[int] = mapped_column(Integer, default=1)
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    order: Mapped[Order] = relationship(back_populates="challan")
    items: Mapped[list["ChallanItem"]] = relationship(
        back_populates="challan", cascade="all, delete-orphan"
    )
    returns: Mapped[list["ChallanReturn"]] = relationship(
        back_populates="challan", cascade="all, delete-orphan"
    )


class ChallanItem(Base):
    __tablename__ = "challan_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("delivery_challans.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    stock_batch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stock_batches.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    free_quantity: Mapped[int] = mapped_column(Integer, default=0)

    challan: Mapped[DeliveryChallan] = relationship(back_populates="items")
    product: Mapped[Product] = relationship()
    stock_batch: Mapped[StockBatch] = relationship()


class ChallanReturn(Base):
    __tablename__ = "challan_returns"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("delivery_challans.id"))
    return_number: Mapped[str] = mapped_column(String(50), unique=True)
    return_date: Mapped[date] = mapped_column(Date)
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    processed_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    challan: Mapped[DeliveryChallan] = relationship(back_populates="returns")
    items: Mapped[list["ChallanReturnItem"]] = relationship(
        back_populates="challan_return", cascade="all, delete-orphan"
    )


class ChallanReturnItem(Base):
    __tablename__ = "challan_return_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    challan_return_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("challan_returns.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    stock_batch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stock_batches.id"))
    quantity: Mapped[int] = mapped_column(Integer)

    challan_return: Mapped[ChallanReturn] = relationship(back_populates="items")
    product: Mapped[Product] = relationship()
    stock_batch: Mapped[StockBatch] = relationship()


# ── Invoice Returns (Credit Notes) ───────────────────────


class InvoiceReturn(Base):
    __tablename__ = "invoice_returns"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    invoice_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("invoices.id"))
    credit_note_no: Mapped[str] = mapped_column(String(50), unique=True)
    return_date: Mapped[date] = mapped_column(Date)
    refund_subtotal: Mapped[float] = mapped_column(Numeric(12, 2))
    refund_sgst: Mapped[float] = mapped_column(Numeric(12, 2))
    refund_cgst: Mapped[float] = mapped_column(Numeric(12, 2))
    grand_refund: Mapped[float] = mapped_column(Numeric(12, 2))
    reason: Mapped[str | None] = mapped_column(Text, nullable=True)
    restock_status: Mapped[str] = mapped_column(String(20), default="RESTOCKED")
    created_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    invoice: Mapped[Invoice] = relationship(back_populates="returns")
    items: Mapped[list["InvoiceReturnItem"]] = relationship(
        back_populates="invoice_return", cascade="all, delete-orphan"
    )


class InvoiceReturnItem(Base):
    __tablename__ = "invoice_return_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    invoice_return_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("invoice_returns.id"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    stock_batch_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stock_batches.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    rate: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0)

    invoice_return: Mapped[InvoiceReturn] = relationship(back_populates="items")
    product: Mapped[Product] = relationship()
    stock_batch: Mapped[StockBatch] = relationship()


# ── Advance Payments ─────────────────────────────────────


class AdvancePayment(Base):
    __tablename__ = "advance_payments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    receipt_number: Mapped[str] = mapped_column(String(50), unique=True)
    shopkeeper_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    amount: Mapped[float] = mapped_column(Numeric(12, 2))
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod))
    reference_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    paid_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    shopkeeper: Mapped[User] = relationship(foreign_keys=[shopkeeper_id])
    recorder: Mapped[User] = relationship(foreign_keys=[recorded_by])
