# 🔌 GraphQL API Specification & Schema Reference

> **Pharmacy Fantasy — Strawberry GraphQL API Contract**  
> Endpoint: `POST /graphql` | Authentication: `Authorization: Bearer <access_token>`

---

## 1. Authentication & Role Governance API

### 1.1 Queries

#### `me`
Returns details of the currently authenticated session user.
```graphql
query Me {
  me {
    id
    email
    phone
    fullName
    role
    isActive
    createdAt
  }
}
```

#### `users`
Returns list of registered users. Super Admin and Operations Admin only.
```graphql
query GetUsers($role: String, $search: String, $page: Int, $perPage: Int) {
  users(role: $role, search: $search, page: $page, perPage: $perPage) {
    id
    email
    phone
    fullName
    role
    isActive
    createdAt
  }
}
```

### 1.2 Mutations

#### `login`
Authenticate any user role using either Email OR Phone number.
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    accessToken
    refreshToken
    user {
      id
      fullName
      role
      email
      phone
    }
  }
}
```

#### `register`
Instant self-service registration for Retail Shopkeepers and Delivery Boys.
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    accessToken
    refreshToken
    user {
      id
      fullName
      role
    }
  }
}

# Input Definition
input RegisterInput {
  fullName: String!
  phone: String!
  email: String
  password: String!
  role: String! # Only "SHOPKEEPER" or "DELIVERY"
  shopName: String
  shopAddress: String
  gstin: String
  drugLicenseNo: String
  area: String
  city: String
  vehicleType: String
  vehicleNumber: String
  assignedArea: String
}
```

#### `createUser` (Protected RBAC)
- **Super Admin**: Can create any role (`SUPER_ADMIN`, `ADMIN`, `WAREHOUSE`, `DELIVERY`, `SHOPKEEPER`).
- **Operations Admin**: Can create all roles **except** `SUPER_ADMIN`.
```graphql
mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    fullName
    role
    phone
    email
  }
}

input CreateUserInput {
  fullName: String!
  phone: String!
  email: String
  password: String!
  role: String!
  shopName: String
  shopAddress: String
  gstin: String
  vehicleType: String
  vehicleNumber: String
  assignedArea: String
}
```

#### `assignUserRole` (Protected RBAC)
- **Super Admin**: Can assign any role to any user.
- **Operations Admin**: Can assign roles to staff/retailers, but cannot assign `SUPER_ADMIN`.
```graphql
mutation AssignUserRole($userId: UUID!, $newRole: String!) {
  assignUserRole(userId: $userId, newRole: $newRole) {
    id
    fullName
    role
  }
}
```

---

## 2. Product Master & Warehouse Inventory API

### 2.1 Queries

#### `products`
Search and filter pharmaceutical SKUs.
```graphql
query GetProducts($search: String, $category: String, $page: Int, $perPage: Int) {
  products(search: $search, category: $category, page: $page, perPage: $perPage) {
    items {
      id
      name
      composition
      manufacturer
      packSize
      hsnCode
      category
      defaultMrp
      availableStock
    }
    totalCount
    hasNextPage
  }
}
```

#### `stockBatches`
View batch-level rack stock with FEFO priority and expiry warnings.
```graphql
query GetStockBatches($productId: UUID, $filterExpiry: String) {
  stockBatches(productId: $productId, filterExpiry: $filterExpiry) {
    id
    productId
    productName
    batchNumber
    expiryDate
    purchaseRate
    sellingRate
    mrp
    quantityAvailable
    expiryStatus # "healthy" | "warning" | "critical"
  }
}
```

### 2.2 Mutations

#### `createProduct`
Add new medicine SKU (Warehouse Staff, Operations Admin, Super Admin).
```graphql
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) {
    id
    name
    composition
    manufacturer
    packSize
    hsnCode
    category
    defaultMrp
    defaultSgstRate
    defaultCgstRate
  }
}

input CreateProductInput {
  name: String!
  composition: String
  manufacturer: String
  packSize: String!
  hsnCode: String
  category: String
  defaultMrp: Float
  defaultSgstRate: Float
  defaultCgstRate: Float
}
```

#### `recordPurchaseEntry`
Inward supplier bill entry that populates physical stock batches.
```graphql
mutation RecordPurchaseEntry($input: PurchaseEntryInput!) {
  recordPurchaseEntry(input: $input) {
    id
    invoiceNumber
    supplierName
    totalAmount
    itemsCount
  }
}

input PurchaseEntryInput {
  supplierName: String!
  supplierGstin: String
  invoiceNumber: String!
  invoiceDate: Date!
  items: [PurchaseItemInput!]!
}

input PurchaseItemInput {
  productId: UUID!
  batchNumber: String!
  expiryDate: Date!
  quantity: Int!
  freeQuantity: Int
  purchaseRate: Float!
  mrp: Float!
  discountPct: Float
  sgstPct: Float
  cgstPct: Float
}
```

---

## 3. Wholesale Orders & Warehouse Picking API

### 3.1 Queries

#### `orders`
List orders with status and date filtering.
```graphql
query GetOrders($status: String, $page: Int, $perPage: Int) {
  orders(status: $status, page: $page, perPage: $perPage) {
    items {
      id
      orderNumber
      status
      totalAmount
      discountAmount
      gstAmount
      netAmount
      placedAt
      confirmedAt
      remarks
    }
    totalCount
    hasNextPage
  }
}
```

#### `dashboardStats`
Overview metrics for Warehouse Staff and Admins.
```graphql
query GetDashboardStats {
  dashboardStats {
    totalOrders
    pendingOrders
    todaySales
    lowStockCount
    expiringBatchesCount
    outstandingPayments
  }
}
```

### 3.2 Mutations

#### `placeOrder`
Placed by Retail Shopkeeper. Validates credit limit and notifies Warehouse queue.
```graphql
mutation PlaceOrder($shopkeeperId: UUID!, $input: PlaceOrderInput!) {
  placeOrder(shopkeeperId: $shopkeeperId, input: $input) {
    id
    orderNumber
    status # "PLACED"
    netAmount
    placedAt
  }
}

input PlaceOrderInput {
  remarks: String
  items: [PlaceOrderItemInput!]!
}

input PlaceOrderItemInput {
  productId: UUID!
  quantity: Int!
}
```

#### `confirmOrder`
Warehouse Staff confirms order and executes automated FEFO batch allocation.
```graphql
mutation ConfirmOrder($orderId: UUID!) {
  confirmOrder(orderId: $orderId) {
    id
    orderNumber
    status # "CONFIRMED"
    confirmedAt
  }
}
```

#### `updateOrderStatus`
Warehouse updates floor status: `PICKING` ➔ `PACKED`.
```graphql
mutation UpdateOrderStatus($orderId: UUID!, $status: String!) {
  updateOrderStatus(orderId: $orderId, status: $status) {
    id
    orderNumber
    status
  }
}
```

---

## 4. Delivery Challan, Invoicing & Returns API

### 4.1 Mutations

#### `createDeliveryChallan`
Warehouse Staff creates dispatch challan before goods leave the bay.
```graphql
mutation CreateDeliveryChallan($orderId: UUID!, $input: CreateChallanInput!) {
  createDeliveryChallan(orderId: $orderId, input: $input) {
    id
    challanNumber
    challanDate
    transporterName
    vehicleNumber
    totalCartons
  }
}

input CreateChallanInput {
  transporterName: String
  vehicleNumber: String
  totalCartons: Int
}
```

#### `createChallanReturn`
Process items rejected at loading bay or during courier transit.
```graphql
mutation CreateChallanReturn($challanId: UUID!, $input: ChallanReturnInput!) {
  createChallanReturn(challanId: $challanId, input: $input) {
    id
    returnNumber
    returnDate
    reason
  }
}

input ChallanReturnInput {
  reason: String!
  items: [ReturnItemInput!]!
}

input ReturnItemInput {
  productId: UUID!
  stockBatchId: UUID!
  quantity: Int!
}
```

#### `createInvoiceReturn` (Credit Note)
Post-invoice sales returns with GST reversal and retailer credit adjustment.
```graphql
mutation CreateInvoiceReturn($invoiceId: UUID!, $input: InvoiceReturnInput!) {
  createInvoiceReturn(invoiceId: $invoiceId, input: $input) {
    id
    creditNoteNo
    returnDate
    grandRefund
    restockStatus
  }
}

input InvoiceReturnInput {
  reason: String!
  restock: Boolean! # True if items are undamaged and restocked
  items: [InvoiceReturnLineInput!]!
}

input InvoiceReturnLineInput {
  productId: UUID!
  stockBatchId: UUID!
  quantity: Int!
  rate: Float!
  discountPct: Float
}
```

#### `recordAdvancePayment`
Records advance cash/UPI deposits from shopkeepers, reducing outstanding debt.
```graphql
mutation RecordAdvancePayment($input: AdvancePaymentInput!) {
  recordAdvancePayment(input: $input) {
    id
    receiptNumber
    amount
    paymentMethod
    paidAt
  }
}

input AdvancePaymentInput {
  shopkeeperId: UUID!
  amount: Float!
  paymentMethod: String! # "CASH" | "UPI" | "CHEQUE" | "BANK_TRANSFER"
  referenceNo: String
  notes: String
}
```

---

## 5. Courier Delivery & Digital Signature POD API

### 5.1 Queries

#### `myDeliveries`
Delivery Boy checks active assignments.
```graphql
query MyDeliveries($deliveryBoyId: UUID!, $status: String) {
  myDeliveries(deliveryBoyId: $deliveryBoyId, status: $status) {
    id
    status
    deliveryNotes
    assignedAt
    deliveredAt
    order {
      orderNumber
      netAmount
      shopkeeper {
        shopName
        shopAddress
        phone
      }
    }
  }
}
```

### 5.2 Mutations

#### `assignDelivery`
Warehouse Staff or Admin assigns order to a Delivery Boy.
```graphql
mutation AssignDelivery($orderId: UUID!, $deliveryBoyId: UUID!, $assignedBy: UUID!) {
  assignDelivery(orderId: $orderId, deliveryBoyId: $deliveryBoyId, assignedBy: $assignedBy) {
    id
    status # "ASSIGNED"
  }
}
```

#### `updateDeliveryStatus` & `uploadProofOfDelivery`
Delivery Boy picks up order, navigates, captures shopkeeper signature, and uploads POD.
```graphql
mutation UpdateDeliveryStatus(
  $assignmentId: UUID!
  $status: String!
  $notes: String
  $proofImageUrl: String # Base64 digital signature data or image URL
) {
  updateDeliveryStatus(
    assignmentId: $assignmentId
    status: $status
    notes: $notes
    proofImageUrl: $proofImageUrl
  ) {
    id
    status
    deliveredAt
  }
}
```

---

## 🔮 Future Works & Implementation TODOs

### 📋 Phase A.1: Real-Time Streaming & WebSockets
- [ ] **A.1.1 GraphQL Subscriptions for Order Arrival**:
  - Implement `@strawberry.subscription` using Redis Pub/Sub:
    ```graphql
    subscription OnNewWholesaleOrder {
      orderPlaced {
        id
        orderNumber
        shopkeeper { shopName area }
        netAmount
        placedAt
      }
    }
    ```
  - Eliminates frontend polling and triggers instant visual/audio alerts on the Warehouse Staff picking dashboard.
- [ ] **A.1.2 Live Delivery Fleet Location Subscription**:
  - Add subscription streaming real-time courier GPS coordinates to the Operations Admin map view.

### 📋 Phase A.2: Performance, DataLoaders & N+1 Elimination
- [ ] **A.2.1 Strawberry DataLoaders for Relationships**:
  - Implement DataLoader classes for:
    - `ProductBatchLoader`: Batches stock batch lookups for product catalogs.
    - `ShopkeeperProfileLoader`: Batches retailer KYC lookups for orders list.
    - `InvoiceItemLoader`: Batches invoice line calculations.
  - Enforces single batched SQL queries (`WHERE id IN (...)`) instead of N individual roundtrips.
- [ ] **A.2.2 Automatic Persisted Queries (APQ)**:
  - Cache GraphQL query hashes in Redis so mobile delivery clients only send 32-character hashes rather than full multi-kilobyte query documents over 4G networks.

### 📋 Phase A.3: External ERP & Accounting Integrations
- [ ] **A.3.1 Outbound Webhooks**:
  - Emit HMAC-signed webhooks on `order.delivered`, `invoice.generated`, and `credit_note.created`.
- [ ] **A.3.2 Tally XML / JSON Export Endpoint**:
  - Provide a dedicated REST exporter `/api/export/tally` generating statutory Tally XML vouchers for sales, receipts, and inventory journals.

