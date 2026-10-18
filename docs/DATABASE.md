# 🗄️ Database Schema Design

## Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ DELIVERY_ASSIGNMENT : delivers
    USER {
        uuid id PK
        string email
        string phone
        string password_hash
        enum role "SUPER_ADMIN | ADMIN | WAREHOUSE | DELIVERY | SHOPKEEPER"
        string full_name
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    SHOPKEEPER_PROFILE ||--|| USER : extends
    SHOPKEEPER_PROFILE {
        uuid id PK
        uuid user_id FK
        string shop_name
        string shop_address
        string gstin
        string drug_license_no
        string area
        string city
        decimal credit_limit
        decimal outstanding_balance
    }

    DELIVERY_PROFILE ||--|| USER : extends
    DELIVERY_PROFILE {
        uuid id PK
        uuid user_id FK
        string vehicle_type
        string vehicle_number
        string assigned_area
        boolean is_available
    }

    PRODUCT ||--o{ STOCK_BATCH : has
    PRODUCT ||--o{ ORDER_ITEM : ordered_in
    PRODUCT {
        uuid id PK
        string name
        string composition
        string manufacturer
        string pack_size
        string hsn_code
        string category
        decimal default_mrp
        decimal default_sgst_rate
        decimal default_cgst_rate
        boolean is_active
        datetime created_at
    }

    STOCK_BATCH {
        uuid id PK
        uuid product_id FK
        string batch_number
        date expiry_date
        decimal purchase_rate
        decimal mrp
        integer quantity_received
        integer quantity_available
        integer quantity_sold
        string supplier_invoice_no
        datetime received_at
    }

    ORDER ||--o{ ORDER_ITEM : contains
    ORDER ||--o| INVOICE : generates
    ORDER ||--o| DELIVERY_ASSIGNMENT : assigned_to
    ORDER {
        uuid id PK
        string order_number
        uuid shopkeeper_id FK
        uuid confirmed_by FK
        enum status "DRAFT | PLACED | CONFIRMED | PICKING | PACKED | DISPATCHED | DELIVERED | CANCELLED"
        text remarks
        decimal total_amount
        decimal discount_amount
        decimal gst_amount
        decimal net_amount
        datetime placed_at
        datetime confirmed_at
        datetime delivered_at
    }

    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        uuid stock_batch_id FK
        integer quantity
        integer free_quantity
        decimal rate
        decimal mrp
        decimal discount1_pct
        decimal discount2_pct
        decimal sgst_pct
        decimal cgst_pct
        decimal sgst_amount
        decimal cgst_amount
        decimal line_total
    }

    INVOICE {
        uuid id PK
        uuid order_id FK
        string invoice_number
        date invoice_date
        decimal subtotal
        decimal total_discount
        decimal total_sgst
        decimal total_cgst
        decimal grand_total
        string pdf_url
        datetime created_at
    }

    DELIVERY_ASSIGNMENT {
        uuid id PK
        uuid order_id FK
        uuid delivery_boy_id FK
        uuid assigned_by FK
        enum status "ASSIGNED | PICKED_UP | IN_TRANSIT | DELIVERED | FAILED"
        text delivery_notes
        string proof_image_url
        datetime assigned_at
        datetime delivered_at
    }

    PAYMENT {
        uuid id PK
        uuid order_id FK
        uuid shopkeeper_id FK
        decimal amount
        enum method "CASH | UPI | BANK_TRANSFER | CHEQUE"
        string reference_number
        text notes
        datetime paid_at
    }

    PURCHASE_ENTRY ||--o{ PURCHASE_ITEM : contains
    PURCHASE_ENTRY {
        uuid id PK
        string supplier_name
        string supplier_gstin
        string invoice_number
        date invoice_date
        decimal total_amount
        uuid entered_by FK
        datetime created_at
    }

    PURCHASE_ITEM {
        uuid id PK
        uuid purchase_entry_id FK
        uuid product_id FK
        string batch_number
        date expiry_date
        string hsn_code
        integer quantity
        integer free_quantity
        decimal rate
        decimal mrp
        decimal discount_pct
        decimal sgst_pct
        decimal cgst_pct
        decimal line_total
    }
```

## Tables Summary

| Table                | Purpose                                          | Key Relations           |
|----------------------|--------------------------------------------------|-------------------------|
| `users`              | All system users (unified, role-differentiated)  | —                       |
| `shopkeeper_profiles`| Extended info for shopkeeper users               | → users                 |
| `delivery_profiles`  | Extended info for delivery boy users             | → users                 |
| `products`           | Medicine master catalog                          | —                       |
| `stock_batches`      | Per-batch inventory tracking                     | → products              |
| `orders`             | Shopkeeper purchase orders                       | → users (shopkeeper)    |
| `order_items`        | Line items within an order                       | → orders, products      |
| `invoices`           | GST invoices generated from confirmed orders     | → orders                |
| `delivery_assignments` | Delivery boy assignment + tracking             | → orders, users         |
| `payments`           | Payment records against orders                   | → orders, users         |
| `purchase_entries`   | Incoming stock from distributors (header)        | → users (entered_by)    |
| `purchase_items`     | Line items in a purchase entry                   | → purchase_entries, products |

## Indexes

```sql
-- Performance-critical indexes
CREATE INDEX idx_orders_shopkeeper ON orders(shopkeeper_id, status);
CREATE INDEX idx_orders_status ON orders(status, placed_at DESC);
CREATE INDEX idx_stock_batches_product ON stock_batches(product_id, quantity_available);
CREATE INDEX idx_stock_batches_expiry ON stock_batches(expiry_date);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_delivery_assignments_boy ON delivery_assignments(delivery_boy_id, status);
CREATE INDEX idx_payments_shopkeeper ON payments(shopkeeper_id, paid_at DESC);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
```
