# 🔌 GraphQL API Reference

## Endpoint

```
POST /graphql
```

## Authentication

All queries/mutations (except `login` and `register`) require a JWT token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

---

## Queries

### Auth & Users

```graphql
query Me {
  me {
    id
    email
    phone
    fullName
    role
    isActive
  }
}

query Users(role: UserRole, isActive: Boolean) {
  users(role: $role, isActive: $isActive) {
    id
    fullName
    role
    phone
  }
}
```

### Products & Catalog

```graphql
query Products(search: String, category: String, page: Int, perPage: Int) {
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

query Product(id: ID!) {
  product(id: $id) {
    id
    name
    composition
    manufacturer
    packSize
    hsnCode
    stockBatches {
      batchNumber
      expiryDate
      mrp
      quantityAvailable
    }
  }
}
```

### Orders

```graphql
query Orders(status: OrderStatus, page: Int, perPage: Int) {
  orders(status: $status, page: $page, perPage: $perPage) {
    items {
      id
      orderNumber
      shopkeeper { shopName }
      status
      netAmount
      placedAt
      itemCount
    }
    totalCount
  }
}

query Order(id: ID!) {
  order(id: $id) {
    id
    orderNumber
    status
    items {
      product { name, packSize }
      quantity
      freeQuantity
      rate
      discount1Pct
      sgstAmount
      cgstAmount
      lineTotal
    }
    totalAmount
    discountAmount
    gstAmount
    netAmount
    invoice { invoiceNumber, pdfUrl }
    delivery { status, deliveryBoy { fullName } }
  }
}

# Shopkeeper: own orders only
query MyOrders(status: OrderStatus, page: Int) {
  myOrders(status: $status, page: $page) {
    items { id, orderNumber, status, netAmount, placedAt }
    totalCount
  }
}
```

### Delivery

```graphql
# Delivery boy: own assignments
query MyDeliveries(status: DeliveryStatus) {
  myDeliveries(status: $status) {
    id
    order { orderNumber, shopkeeper { shopName, shopAddress } }
    status
    assignedAt
  }
}
```

### Dashboard & Reports

```graphql
query DashboardStats {
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

---

## Mutations

### Auth

```graphql
mutation Login(email: String!, password: String!) {
  login(email: $email, password: $password) {
    accessToken
    refreshToken
    user { id, fullName, role }
  }
}

mutation RefreshToken(refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken
  }
}
```

### Users

```graphql
mutation CreateUser(input: CreateUserInput!) {
  createUser(input: $input) {
    id
    fullName
    role
  }
}
```

### Inventory

```graphql
mutation AddProduct(input: ProductInput!) {
  addProduct(input: $input) { id, name }
}

mutation AddStockBatch(input: StockBatchInput!) {
  addStockBatch(input: $input) { id, batchNumber, quantityAvailable }
}

mutation AddPurchaseEntry(input: PurchaseEntryInput!) {
  addPurchaseEntry(input: $input) { id, invoiceNumber }
}
```

### Orders

```graphql
mutation PlaceOrder(input: PlaceOrderInput!) {
  placeOrder(input: $input) { id, orderNumber, status }
}

mutation ConfirmOrder(orderId: ID!) {
  confirmOrder(orderId: $orderId) { id, status }
}

mutation UpdateOrderStatus(orderId: ID!, status: OrderStatus!) {
  updateOrderStatus(orderId: $orderId, status: $status) { id, status }
}

mutation CancelOrder(orderId: ID!, reason: String) {
  cancelOrder(orderId: $orderId, reason: $reason) { id, status }
}
```

### Delivery

```graphql
mutation AssignDelivery(orderId: ID!, deliveryBoyId: ID!) {
  assignDelivery(orderId: $orderId, deliveryBoyId: $deliveryBoyId) {
    id
    status
  }
}

mutation UpdateDeliveryStatus(assignmentId: ID!, status: DeliveryStatus!, notes: String, proofImageUrl: String) {
  updateDeliveryStatus(assignmentId: $assignmentId, status: $status, notes: $notes, proofImageUrl: $proofImageUrl) {
    id
    status
    deliveredAt
  }
}
```

### Payments

```graphql
mutation RecordPayment(input: PaymentInput!) {
  recordPayment(input: $input) { id, amount, method }
}
```

---

## Enums

```graphql
enum UserRole {
  SUPER_ADMIN
  ADMIN
  WAREHOUSE
  DELIVERY
  SHOPKEEPER
}

enum OrderStatus {
  DRAFT
  PLACED
  CONFIRMED
  PICKING
  PACKED
  DISPATCHED
  DELIVERED
  CANCELLED
}

enum DeliveryStatus {
  ASSIGNED
  PICKED_UP
  IN_TRANSIT
  DELIVERED
  FAILED
}

enum PaymentMethod {
  CASH
  UPI
  BANK_TRANSFER
  CHEQUE
}
```
