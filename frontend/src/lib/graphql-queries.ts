/**
 * GraphQL query and mutation definitions.
 */

import { gql } from "@apollo/client";

// ── Auth ────────────────────────────────────────────────

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
      user {
        id
        email
        fullName
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        fullName
        role
      }
    }
  }
`;

export const ME_QUERY = gql`
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
`;

export const USERS_QUERY = gql`
  query Users($role: String, $search: String, $page: Int, $perPage: Int) {
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
`;

export const ASSIGN_USER_ROLE_MUTATION = gql`
  mutation AssignUserRole($userId: UUID!, $newRole: String!) {
    assignUserRole(userId: $userId, newRole: $newRole) {
      id
      email
      phone
      fullName
      role
      isActive
    }
  }
`;

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      email
      phone
      fullName
      role
      isActive
    }
  }
`;

// ── Products ────────────────────────────────────────────

export const PRODUCTS_QUERY = gql`
  query Products($search: String, $category: String, $page: Int, $perPage: Int) {
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
`;

export const PRODUCT_QUERY = gql`
  query Product($id: ID!) {
    product(id: $id) {
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
  }
`;

// ── Orders ──────────────────────────────────────────────

export const ORDERS_QUERY = gql`
  query Orders($status: String, $page: Int, $perPage: Int) {
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
      }
      totalCount
      hasNextPage
    }
  }
`;

export const PLACE_ORDER_MUTATION = gql`
  mutation PlaceOrder($input: PlaceOrderInput!, $shopkeeperId: ID!) {
    placeOrder(input: $input, shopkeeperId: $shopkeeperId) {
      id
      orderNumber
      status
    }
  }
`;

export const CONFIRM_ORDER_MUTATION = gql`
  mutation ConfirmOrder($orderId: ID!) {
    confirmOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

// ── Dashboard ───────────────────────────────────────────

export const DASHBOARD_STATS_QUERY = gql`
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
`;

// ── Delivery Challans & Returns ──────────────────────────

export const GET_DELIVERY_CHALLANS_QUERY = gql`
  query GetDeliveryChallans($page: Int, $perPage: Int) {
    deliveryChallans(page: $page, perPage: $perPage) {
      id
      orderId
      challanNumber
      challanDate
      transporterName
      vehicleNumber
      totalCartons
      createdAt
      items {
        id
        productId
        stockBatchId
        quantity
        freeQuantity
        productName
      }
      returns {
        id
        returnNumber
        returnDate
        reason
        createdAt
      }
    }
  }
`;

export const CREATE_DELIVERY_CHALLAN_MUTATION = gql`
  mutation CreateDeliveryChallan($input: CreateChallanInput!) {
    createDeliveryChallan(input: $input) {
      id
      challanNumber
      challanDate
      totalCartons
      transporterName
      vehicleNumber
    }
  }
`;

export const CREATE_CHALLAN_RETURN_MUTATION = gql`
  mutation CreateChallanReturn($input: CreateChallanReturnInput!) {
    createChallanReturn(input: $input) {
      id
      returnNumber
      returnDate
      reason
    }
  }
`;

// ── Invoice Returns & Credit Notes ───────────────────────

export const GET_INVOICE_RETURNS_QUERY = gql`
  query GetInvoiceReturns($page: Int, $perPage: Int) {
    invoiceReturns(page: $page, perPage: $perPage) {
      id
      invoiceId
      creditNoteNo
      returnDate
      refundSubtotal
      refundSgst
      refundCgst
      grandRefund
      reason
      restockStatus
      createdAt
      items {
        id
        productId
        stockBatchId
        quantity
        rate
        discountPct
        productName
      }
    }
  }
`;

export const CREATE_INVOICE_RETURN_MUTATION = gql`
  mutation CreateInvoiceReturn($input: CreateInvoiceReturnInput!) {
    createInvoiceReturn(input: $input) {
      id
      creditNoteNo
      returnDate
      grandRefund
      restockStatus
    }
  }
`;

// ── Advance Payments ─────────────────────────────────────

export const GET_ADVANCE_PAYMENTS_QUERY = gql`
  query GetAdvancePayments($shopkeeperId: UUID, $page: Int, $perPage: Int) {
    advancePayments(shopkeeperId: $shopkeeperId, page: $page, perPage: $perPage) {
      id
      receiptNumber
      shopkeeperId
      amount
      paymentMethod
      referenceNo
      notes
      paidAt
      shopkeeperName
    }
  }
`;

export const RECORD_ADVANCE_PAYMENT_MUTATION = gql`
  mutation RecordAdvancePayment($input: RecordAdvancePaymentInput!) {
    recordAdvancePayment(input: $input) {
      id
      receiptNumber
      amount
      paymentMethod
      paidAt
    }
  }
`;
