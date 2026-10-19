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
    assigned_work_queue: str | None = None


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
    user_id: uuid.UUID | None = None
    verification_status: str = "VERIFIED"
    verification_notes: str | None = None
    credit_limit_reason: str | None = None
    owner_name: str | None = None
    phone: str | None = None
    email: str | None = None
    total_orders: int | None = 0


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
    delivery_otp: str | None = None
    rating: int | None = None
    feedback_text: str | None = None
    estimated_arrival_window: str | None = None


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
    order_id: uuid.UUID | None = None
    order_number: str | None = None
    delivery_boy_id: uuid.UUID | None = None
    delivery_boy_name: str | None = None
    shop_name: str | None = None
    shop_address: str | None = None
    status: str
    delivery_notes: str | None
    proof_image_url: str | None = None
    delivery_otp: str | None = None
    cash_collected: float = 0.0
    upi_collected: float = 0.0
    payment_reference: str | None = None
    failure_reason: str | None = None
    failure_photo_url: str | None = None
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


# ── Logistics & Returns Types ────────────────────────────


@strawberry.type
class ChallanItemType:
    id: uuid.UUID
    product_id: uuid.UUID
    stock_batch_id: uuid.UUID
    quantity: int
    free_quantity: int
    product_name: str | None = None


@strawberry.type
class ChallanReturnType:
    id: uuid.UUID
    challan_id: uuid.UUID
    return_number: str
    return_date: date
    reason: str | None
    created_at: datetime


@strawberry.type
class DeliveryChallanType:
    id: uuid.UUID
    order_id: uuid.UUID
    challan_number: str
    challan_date: date
    transporter_name: str | None
    vehicle_number: str | None
    total_cartons: int
    created_at: datetime
    items: list[ChallanItemType] = strawberry.field(default_factory=list)
    returns: list[ChallanReturnType] = strawberry.field(default_factory=list)


@strawberry.type
class InvoiceReturnItemType:
    id: uuid.UUID
    product_id: uuid.UUID
    stock_batch_id: uuid.UUID
    quantity: int
    rate: float
    discount_pct: float
    product_name: str | None = None


@strawberry.type
class InvoiceReturnType:
    id: uuid.UUID
    invoice_id: uuid.UUID
    credit_note_no: str
    return_date: date
    refund_subtotal: float
    refund_sgst: float
    refund_cgst: float
    grand_refund: float
    reason: str | None
    restock_status: str
    created_at: datetime
    items: list[InvoiceReturnItemType] = strawberry.field(default_factory=list)


@strawberry.type
class AdvancePaymentType:
    id: uuid.UUID
    receipt_number: str
    shopkeeper_id: uuid.UUID
    amount: float
    payment_method: str
    reference_no: str | None
    notes: str | None
    paid_at: datetime
    shopkeeper_name: str | None = None


@strawberry.input
class CreateChallanInput:
    order_id: uuid.UUID
    transporter_name: str | None = None
    vehicle_number: str | None = None
    total_cartons: int = 1


@strawberry.input
class ChallanReturnLineInput:
    product_id: uuid.UUID
    stock_batch_id: uuid.UUID
    quantity: int


@strawberry.input
class CreateChallanReturnInput:
    challan_id: uuid.UUID
    items: list[ChallanReturnLineInput]
    reason: str | None = None


@strawberry.input
class InvoiceReturnLineInput:
    product_id: uuid.UUID
    stock_batch_id: uuid.UUID
    quantity: int
    rate: float
    discount_pct: float = 0.0


@strawberry.input
class CreateInvoiceReturnInput:
    invoice_id: uuid.UUID
    items: list[InvoiceReturnLineInput]
    restock_status: str = "RESTOCKED"
    reason: str | None = None


@strawberry.input
class RecordAdvancePaymentInput:
    shopkeeper_id: uuid.UUID
    amount: float
    payment_method: str = "CASH"
    reference_no: str | None = None
    notes: str | None = None


@strawberry.input
class CompleteDeliveryInput:
    assignment_id: uuid.UUID
    otp: str
    cash_collected: float = 0.0
    upi_collected: float = 0.0
    payment_reference: str | None = None
    notes: str | None = None
    proof_image_url: str | None = None


# ── Financial Ledger & Claims Types ─────────────────────


@strawberry.type
class LedgerRecordType:
    id: uuid.UUID
    shopkeeper_id: uuid.UUID
    entry_type: str
    amount: float
    balance_after: float
    reference_number: str
    description: str
    created_at: datetime
    shopkeeper_name: str | None = None


@strawberry.type
class ReturnClaimType:
    id: uuid.UUID
    request_number: str
    shopkeeper_id: uuid.UUID
    product_id: uuid.UUID
    product_name: str | None = None
    stock_batch_id: uuid.UUID | None = None
    batch_number: str | None = None
    quantity: int
    reason: str
    remarks: str | None = None
    image_url: str | None = None
    status: str
    reviewed_by: uuid.UUID | None = None
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime
    shopkeeper_name: str | None = None


@strawberry.input
class SubmitReturnRequestInput:
    product_id: uuid.UUID
    quantity: int
    reason: str
    stock_batch_id: uuid.UUID | None = None
    remarks: str | None = None
    image_url: str | None = None


@strawberry.input
class ReviewReturnRequestInput:
    request_id: uuid.UUID
    action: str  # "APPROVE" or "REJECT"
    rejection_reason: str | None = None


@strawberry.type
class DeliveryShiftSummaryType:
    total_assigned: int
    total_delivered: int
    total_failed: int
    cash_collected: float
    upi_collected: float
    total_collected: float
    pending_handover: float


@strawberry.input
class ReportDeliveryFailureInput:
    assignment_id: uuid.UUID
    reason: str
    notes: str | None = None
    photo_url: str | None = None


@strawberry.type
class DeliveryRosterType:
    id: uuid.UUID
    delivery_boy_id: uuid.UUID
    shift_date: date
    shift_type: str
    assigned_zone: str | None = None
    status: str
    notes: str | None = None


@strawberry.input
class RateOrderInput:
    order_id: uuid.UUID
    rating: int
    feedback: str | None = None


@strawberry.type
class NotificationType:
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    message: str
    category: str
    is_read: bool
    created_at: datetime


@strawberry.input
class UpdateNotificationPreferencesInput:
    in_app: bool
    sms: bool
    whatsapp: bool


@strawberry.type
class AutomationJobType:
    id: uuid.UUID
    job_type: str
    payload: str | None = None
    status: str
    retry_count: int
    max_retries: int
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime


@strawberry.type
class IntegrationHealthType:
    database_status: str
    database_latency_ms: float
    gst_einvoice_portal: str
    gst_latency_ms: float
    sms_dlt_gateway: str
    whatsapp_api: str
    redis_event_queue: str
    failed_jobs_count: int
    failed_notifications_count: int
    active_workers: int


# ── Super Admin Governance & Simulation Types ────────────


@strawberry.type
class BulkPricePreviewItem:
    product_id: uuid.UUID
    product_name: str
    pack_size: str
    category: str | None
    current_mrp: float
    new_mrp: float
    current_ptr: float
    new_ptr: float
    projected_margin_pct: float
    warning: str | None = None


@strawberry.type
class BulkPriceSimulationResult:
    dry_run: bool
    total_matched: int
    total_affected: int
    can_apply: bool
    preview_items: list[BulkPricePreviewItem]
    validation_warnings: list[str]
    audit_id: str | None = None


@strawberry.type
class AutomationCircuitType:
    subsystem: str
    is_paused: bool
    paused_by: str | None = None
    pause_reason: str | None = None
    updated_at: datetime


@strawberry.type
class HighRiskApprovalType:
    id: uuid.UUID
    action_type: str
    target_id: str | None = None
    description: str
    status: str
    requested_by_id: uuid.UUID
    requested_by_name: str
    approved_by_id: uuid.UUID | None = None
    approved_by_name: str | None = None
    rejection_reason: str | None = None
    created_at: datetime
    updated_at: datetime


# ── Warehouse Floor, Barcodes & Picking Slip Types ───────


@strawberry.type
class StockAdjustmentType:
    id: uuid.UUID
    stock_batch_id: uuid.UUID
    batch_number: str
    product_name: str
    adjustment_type: str
    quantity_delta: int
    reason: str
    evidence_url: str | None = None
    is_repeated: bool = False
    adjusted_by_name: str = "Warehouse Officer"
    created_at: datetime


@strawberry.type
class WarehousePickingLineType:
    item_id: uuid.UUID
    product_name: str
    pack_size: str
    batch_number: str
    expiry_date: str
    rack_location: str
    quantity_to_pick: int
    barcode: str
    is_picked: bool
    barcode_verified: bool


@strawberry.type
class WarehousePickingSlipType:
    order_id: uuid.UUID
    order_number: str
    shopkeeper_name: str
    delivery_area: str
    priority: str
    total_items_count: int
    picking_lines: list[WarehousePickingLineType]
    is_fully_picked: bool


@strawberry.type
class BarcodeVerificationResult:
    is_valid: bool
    matched_sku: str
    matched_batch: str
    message: str


@strawberry.type
class AccountAuditLogType:
    id: uuid.UUID
    user_id: uuid.UUID
    action: str
    details: str
    performed_by_id: uuid.UUID
    created_at: datetime
    performed_by_name: str | None = None


@strawberry.type
class OperationsIncidentSummaryType:
    breached_sla_orders_count: int
    unresolved_disputes_count: int
    critical_alerts_count: int
    active_warehouse_pickers: int
    active_delivery_couriers: int
    avg_picker_orders_load: float
    avg_retailer_kyc_review_minutes: float
    flagged_late_payers_count: int
    low_stock_replenishment_count: int
    auth_failure_attempts_24h: int
    reporting_data_balanced: bool


# ── Super Admin Governance, Purchases & Audit Types ─────


@strawberry.type
class SupplierReconciliationItemType:
    id: str
    supplier_name: str
    po_number: str
    invoice_number: str
    invoice_amount: float
    received_amount: float
    discrepancy_amount: float
    discrepancy_type: str  # PRICE_MISMATCH, QUANTITY_SHORTAGE, TAX_MISMATCH, DUPLICATE_INVOICE
    status: str            # PENDING_REVIEW, RESOLVED, CREDIT_NOTE_ISSUED
    notes: str | None = None
    created_at: datetime


@strawberry.type
class ProductChangeAuditItemType:
    id: str
    product_name: str
    category: str | None
    change_type: str       # MRP_UPDATE, TRADE_DISCOUNT, PACKAGING_REVISION, TAX_SLAB
    old_value: str
    new_value: str
    performed_by: str
    created_at: datetime


@strawberry.type
class SuperAdminGovernanceOverviewType:
    pending_supplier_invoices_count: int
    purchase_reconciliation_exceptions_count: int
    supplier_discrepancies_count: int
    supplier_reconciliations: list[SupplierReconciliationItemType]
    mfa_enforced: bool
    privileged_accounts_count: int
    unusual_signin_alerts_count: int
    unresolved_audit_exceptions_count: int
    catalog_change_history: list[ProductChangeAuditItemType]
    unusual_pricing_alerts_count: int
    bank_reconciled_percentage: float
    pending_external_settlements_count: int
    automation_rules_version: str







