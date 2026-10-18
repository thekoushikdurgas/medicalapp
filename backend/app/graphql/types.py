"""
Strawberry GraphQL types — mirrors the SQLAlchemy models.
"""

import enum
import uuid
from datetime import date, datetime

import strawberry


@strawberry.enum
class UserRoleType(enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    WAREHOUSE = "WAREHOUSE"
    DELIVERY = "DELIVERY"
    SHOPKEEPER = "SHOPKEEPER"


@strawberry.enum
class OrderStatusType(enum.Enum):
    DRAFT = "DRAFT"
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PICKING = "PICKING"
    PACKED = "PACKED"
    DISPATCHED = "DISPATCHED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


@strawberry.enum
class DeliveryStatusType(enum.Enum):
    ASSIGNED = "ASSIGNED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    FAILED = "FAILED"


@strawberry.enum
class PaymentMethodType(enum.Enum):
    CASH = "CASH"
    UPI = "UPI"
    BANK_TRANSFER = "BANK_TRANSFER"
    CHEQUE = "CHEQUE"


# ── Object Types ─────────────────────────────────────────


@strawberry.type
class UserType:
    id: uuid.UUID
    email: str | None
    phone: str | None
    full_name: str
    role: str
    is_active: bool
    created_at: datetime


@strawberry.type
class ShopkeeperProfileType:
    id: uuid.UUID
    shop_name: str
    shop_address: str
    gstin: str | None
    drug_license_no: str | None
    area: str | None
    city: str | None
    credit_limit: float
    outstanding_balance: float


@strawberry.type
class ProductType:
    id: uuid.UUID
    name: str
    composition: str | None
    manufacturer: str | None
    pack_size: str
    hsn_code: str | None
    category: str | None
    default_mrp: float | None
    available_stock: int | None = None


@strawberry.type
class StockBatchType:
    id: uuid.UUID
    batch_number: str
    expiry_date: date
    mrp: float
    purchase_rate: float
    quantity_available: int
    quantity_sold: int


@strawberry.type
class OrderItemType:
    id: uuid.UUID
    product: ProductType
    quantity: int
    free_quantity: int
    rate: float
    mrp: float
    discount1_pct: float
    discount2_pct: float
    sgst_pct: float
    cgst_pct: float
    sgst_amount: float
    cgst_amount: float
    line_total: float


@strawberry.type
class OrderType:
    id: uuid.UUID
    order_number: str
    status: str
    total_amount: float
    discount_amount: float
    gst_amount: float
    net_amount: float
    placed_at: datetime | None
    confirmed_at: datetime | None
    delivered_at: datetime | None
    remarks: str | None
    item_count: int | None = None


@strawberry.type
class InvoiceType:
    id: uuid.UUID
    invoice_number: str
    invoice_date: date
    subtotal: float
    total_discount: float
    total_sgst: float
    total_cgst: float
    grand_total: float
    pdf_url: str | None


@strawberry.type
class DeliveryAssignmentType:
    id: uuid.UUID
    status: str
    delivery_notes: str | None
    assigned_at: datetime
    delivered_at: datetime | None


@strawberry.type
class PaymentType:
    id: uuid.UUID
    amount: float
    method: str
    reference_number: str | None
    notes: str | None
    paid_at: datetime


@strawberry.type
class AuthPayload:
    access_token: str
    refresh_token: str
    user: UserType


@strawberry.type
class PaginatedProducts:
    items: list[ProductType]
    total_count: int
    has_next_page: bool


@strawberry.type
class PaginatedOrders:
    items: list[OrderType]
    total_count: int
    has_next_page: bool


@strawberry.type
class DashboardStats:
    total_orders: int
    pending_orders: int
    today_sales: float
    low_stock_count: int
    expiring_batches_count: int
    outstanding_payments: float


# ── Input Types ──────────────────────────────────────────


@strawberry.input
class LoginInput:
    email: str
    password: str


@strawberry.input
class CreateUserInput:
    email: str | None = None
    phone: str | None = None
    password: str
    full_name: str
    role: str
    # Shopkeeper fields (optional)
    shop_name: str | None = None
    shop_address: str | None = None
    gstin: str | None = None
    # Delivery fields (optional)
    vehicle_type: str | None = None
    vehicle_number: str | None = None
    assigned_area: str | None = None


@strawberry.input
class RegisterInput:
    role: str  # "SHOPKEEPER" or "DELIVERY"
    full_name: str
    phone: str
    password: str
    email: str | None = None
    # Shopkeeper fields
    shop_name: str | None = None
    shop_address: str | None = None
    gstin: str | None = None
    drug_license_no: str | None = None
    area: str | None = None
    city: str | None = None
    # Delivery fields
    vehicle_type: str | None = None
    vehicle_number: str | None = None
    assigned_area: str | None = None


@strawberry.input
class ProductInput:
    name: str
    composition: str | None = None
    manufacturer: str | None = None
    pack_size: str
    hsn_code: str | None = None
    category: str | None = None
    default_mrp: float | None = None
    default_sgst_rate: float = 2.5
    default_cgst_rate: float = 2.5


@strawberry.input
class StockBatchInput:
    product_id: uuid.UUID
    batch_number: str
    expiry_date: date
    purchase_rate: float
    mrp: float
    quantity_received: int
    supplier_invoice_no: str | None = None


@strawberry.input
class OrderItemInput:
    product_id: uuid.UUID
    quantity: int


@strawberry.input
class PlaceOrderInput:
    items: list[OrderItemInput]
    remarks: str | None = None


@strawberry.input
class PaymentInput:
    order_id: uuid.UUID
    amount: float
    method: str
    reference_number: str | None = None
    notes: str | None = None
