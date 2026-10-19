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
      assignedWorkQueue
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
      assignedWorkQueue
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
      assignedWorkQueue
    }
  }
`;

export const ASSIGN_STAFF_WORK_QUEUE_MUTATION = gql`
  mutation AssignStaffWorkQueue($userId: UUID!, $workQueue: String!) {
    assignStaffWorkQueue(userId: $userId, workQueue: $workQueue) {
      id
      fullName
      role
      assignedWorkQueue
    }
  }
`;

export const TRIGGER_USER_PASSWORD_RESET_MUTATION = gql`
  mutation TriggerUserPasswordReset($userId: UUID!) {
    triggerUserPasswordReset(userId: $userId)
  }
`;

export const ACCOUNT_AUDIT_LOGS_QUERY = gql`
  query AccountAuditLogs($userId: UUID!) {
    accountAuditLogs(userId: $userId) {
      id
      userId
      action
      details
      createdAt
      performedByName
    }
  }
`;

export const OPERATIONS_INCIDENT_SUMMARY_QUERY = gql`
  query OperationsIncidentSummary {
    operationsIncidentSummary {
      breachedSlaOrdersCount
      unresolvedDisputesCount
      criticalAlertsCount
      activeWarehousePickers
      activeDeliveryCouriers
      avgPickerOrdersLoad
      avgRetailerKycReviewMinutes
      flaggedLatePayersCount
      lowStockReplenishmentCount
      authFailureAttempts24h
      reportingDataBalanced
    }
  }
`;

export const SEND_RETAILER_PAYMENT_REMINDER_MUTATION = gql`
  mutation SendRetailerPaymentReminder($shopkeeperId: UUID!) {
    sendRetailerPaymentReminder(shopkeeperId: $shopkeeperId)
  }
`;

// ── Products ────────────────────────────────────────────

export const PRODUCTS_QUERY = gql`
  query Products(
    $search: String
    $category: String
    $page: Int
    $perPage: Int
  ) {
    products(
      search: $search
      category: $category
      page: $page
      perPage: $perPage
    ) {
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
        deliveryOtp
        rating
        feedbackText
        estimatedArrivalWindow
      }
      totalCount
      hasNextPage
    }
  }
`;

export const PLACE_ORDER_MUTATION = gql`
  mutation PlaceOrder($input: PlaceOrderInput!, $shopkeeperId: UUID) {
    placeOrder(input: $input, shopkeeperId: $shopkeeperId) {
      id
      orderNumber
      status
    }
  }
`;

export const CONFIRM_ORDER_MUTATION = gql`
  mutation ConfirmOrder($orderId: UUID!) {
    confirmOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

export const CANCEL_ORDER_MUTATION = gql`
  mutation CancelOrder($orderId: UUID!, $reason: String) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      id
      status
    }
  }
`;

// ── Delivery Partner Handshake & Remittance ──────────────

export const MY_DELIVERIES_QUERY = gql`
  query MyDeliveries($deliveryBoyId: UUID, $status: String) {
    myDeliveries(deliveryBoyId: $deliveryBoyId, status: $status) {
      id
      orderId
      orderNumber
      shopName
      shopAddress
      status
      deliveryNotes
      proofImageUrl
      deliveryOtp
      cashCollected
      upiCollected
      assignedAt
      deliveredAt
    }
  }
`;

export const ASSIGN_DELIVERY_MUTATION = gql`
  mutation AssignDelivery($orderId: UUID!, $deliveryBoyId: UUID!) {
    assignDelivery(orderId: $orderId, deliveryBoyId: $deliveryBoyId) {
      id
      orderId
      deliveryOtp
      status
    }
  }
`;

export const COMPLETE_DELIVERY_WITH_OTP_MUTATION = gql`
  mutation CompleteDeliveryWithOtp($input: CompleteDeliveryInput!) {
    completeDeliveryWithOtp(input: $input) {
      id
      status
      cashCollected
      upiCollected
      deliveredAt
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
    advancePayments(
      shopkeeperId: $shopkeeperId
      page: $page
      perPage: $perPage
    ) {
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

// ── Financial Ledger ─────────────────────────────────────

export const MY_LEDGER_QUERY = gql`
  query MyLedger($shopkeeperId: UUID, $limit: Int, $offset: Int) {
    myLedger(shopkeeperId: $shopkeeperId, limit: $limit, offset: $offset) {
      id
      shopkeeperId
      entryType
      amount
      balanceAfter
      referenceNumber
      description
      createdAt
      shopkeeperName
    }
  }
`;

// ── Return Claims / Damage Requests ───────────────────────

export const RETURN_CLAIMS_QUERY = gql`
  query ReturnClaims($status: String, $page: Int, $perPage: Int) {
    returnClaims(status: $status, page: $page, perPage: $perPage) {
      id
      requestNumber
      shopkeeperId
      productId
      productName
      batchNumber
      quantity
      reason
      remarks
      imageUrl
      status
      rejectionReason
      createdAt
      shopkeeperName
    }
  }
`;

export const SUBMIT_RETURN_CLAIM_MUTATION = gql`
  mutation SubmitReturnClaim($input: SubmitReturnRequestInput!) {
    submitReturnClaim(input: $input) {
      id
      requestNumber
      status
      createdAt
    }
  }
`;

export const REVIEW_RETURN_CLAIM_MUTATION = gql`
  mutation ReviewReturnClaim($input: ReviewReturnRequestInput!) {
    reviewReturnClaim(input: $input) {
      id
      status
      rejectionReason
    }
  }
`;

// ── Shopkeepers / Retail Pharmacies KYC & Credit ──────────

export const SHOPKEEPERS_QUERY = gql`
  query Shopkeepers(
    $search: String
    $status: String
    $page: Int
    $perPage: Int
  ) {
    shopkeepers(
      search: $search
      status: $status
      page: $page
      perPage: $perPage
    ) {
      id
      userId
      shopName
      shopAddress
      gstin
      drugLicenseNo
      area
      city
      creditLimit
      outstandingBalance
      verificationStatus
      verificationNotes
      creditLimitReason
      ownerName
      phone
      email
      totalOrders
    }
  }
`;

export const UPDATE_SHOPKEEPER_KYC_MUTATION = gql`
  mutation UpdateShopkeeperKyc(
    $shopkeeperId: UUID!
    $status: String!
    $notes: String
  ) {
    updateShopkeeperKyc(
      shopkeeperId: $shopkeeperId
      status: $status
      notes: $notes
    ) {
      id
      userId
      shopName
      verificationStatus
      verificationNotes
    }
  }
`;

export const UPDATE_SHOPKEEPER_CREDIT_LIMIT_MUTATION = gql`
  mutation UpdateShopkeeperCreditLimit(
    $shopkeeperId: UUID!
    $newLimit: Float!
    $reason: String!
  ) {
    updateShopkeeperCreditLimit(
      shopkeeperId: $shopkeeperId
      newLimit: $newLimit
      reason: $reason
    ) {
      id
      userId
      shopName
      creditLimit
      creditLimitReason
    }
  }
`;

// ── Shopkeeper Ratings, Disputes & Notification Preferences ──

export const RATE_ORDER_MUTATION = gql`
  mutation RateOrder($input: RateOrderInput!) {
    rateOrder(input: $input) {
      id
      rating
      feedbackText
    }
  }
`;

export const DISPUTE_DELIVERY_MUTATION = gql`
  mutation DisputeDelivery($orderId: UUID!, $reason: String!) {
    disputeDelivery(orderId: $orderId, reason: $reason) {
      id
      remarks
    }
  }
`;

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($isRead: Boolean) {
    notifications(isRead: $isRead) {
      id
      userId
      title
      message
      category
      isRead
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ_MUTATION = gql`
  mutation MarkNotificationAsRead($notificationId: UUID!) {
    markNotificationAsRead(notificationId: $notificationId)
  }
`;

export const NOTIFICATION_PREFERENCES_QUERY = gql`
  query NotificationPreferences {
    notificationPreferences
  }
`;

export const UPDATE_NOTIFICATION_PREFERENCES_MUTATION = gql`
  mutation UpdateNotificationPreferences(
    $input: UpdateNotificationPreferencesInput!
  ) {
    updateNotificationPreferences(input: $input)
  }
`;

// ── Operations Automation, Background Jobs & API Health ───

export const AUTOMATION_JOBS_QUERY = gql`
  query AutomationJobs($status: String) {
    automationJobs(status: $status) {
      id
      jobType
      payload
      status
      retryCount
      maxRetries
      errorMessage
      createdAt
      updatedAt
    }
  }
`;

export const INTEGRATION_HEALTH_QUERY = gql`
  query IntegrationHealth {
    integrationHealth {
      databaseStatus
      databaseLatencyMs
      gstEinvoicePortal
      gstLatencyMs
      smsDltGateway
      whatsappApi
      redisEventQueue
      failedJobsCount
      failedNotificationsCount
      activeWorkers
    }
  }
`;

export const RETRY_FAILED_JOB_MUTATION = gql`
  mutation RetryFailedJob($jobId: UUID!) {
    retryFailedJob(jobId: $jobId) {
      id
      status
      retryCount
      errorMessage
      updatedAt
    }
  }
`;

// ── Super Admin Governance, Simulation & Emergency Circuit Breakers ──

export const SIMULATE_BULK_PRICE_QUERY = gql`
  query SimulateBulkPrice($action: String!, $value: Float!, $category: String) {
    simulateBulkPriceUpdate(
      action: $action
      value: $value
      category: $category
    ) {
      dryRun
      totalMatched
      totalAffected
      canApply
      previewItems {
        productId
        productName
        packSize
        category
        currentMrp
        newMrp
        currentPtr
        newPtr
        projectedMarginPct
        warning
      }
      validationWarnings
      auditId
    }
  }
`;

export const APPLY_BULK_PRICE_MUTATION = gql`
  mutation ApplyBulkPrice(
    $action: String!
    $value: Float!
    $reason: String!
    $category: String
  ) {
    applyBulkPriceUpdate(
      action: $action
      value: $value
      reason: $reason
      category: $category
    ) {
      dryRun
      totalMatched
      totalAffected
      canApply
      auditId
    }
  }
`;

export const AUTOMATION_CIRCUITS_QUERY = gql`
  query AutomationCircuits {
    automationCircuits {
      subsystem
      isPaused
      pausedBy
      pauseReason
      updatedAt
    }
  }
`;

export const TOGGLE_AUTOMATION_CIRCUIT_MUTATION = gql`
  mutation ToggleAutomationCircuit(
    $subsystem: String!
    $paused: Boolean!
    $reason: String
  ) {
    toggleAutomationCircuit(
      subsystem: $subsystem
      paused: $paused
      reason: $reason
    ) {
      subsystem
      isPaused
      pausedBy
      pauseReason
      updatedAt
    }
  }
`;

export const HIGH_RISK_APPROVALS_QUERY = gql`
  query HighRiskApprovals($status: String) {
    highRiskApprovals(status: $status) {
      id
      actionType
      targetId
      description
      status
      requestedById
      requestedByName
      approvedById
      approvedByName
      rejectionReason
      createdAt
      updatedAt
    }
  }
`;

export const REVIEW_HIGH_RISK_APPROVAL_MUTATION = gql`
  mutation ReviewHighRiskApproval(
    $requestId: UUID!
    $approve: Boolean!
    $reason: String
  ) {
    reviewHighRiskApproval(
      requestId: $requestId
      approve: $approve
      reason: $reason
    ) {
      id
      actionType
      status
      approvedByName
      rejectionReason
      updatedAt
    }
  }
`;

// ── Warehouse Operations: Rack Picking & Barcode Verification ──

export const WAREHOUSE_PICKING_SLIP_QUERY = gql`
  query WarehousePickingSlip($orderId: UUID!) {
    warehousePickingSlip(orderId: $orderId) {
      orderId
      orderNumber
      shopkeeperName
      deliveryArea
      priority
      totalItemsCount
      isFullyPicked
      pickingLines {
        itemId
        productName
        packSize
        batchNumber
        expiryDate
        rackLocation
        quantityToPick
        barcode
        isPicked
        barcodeVerified
      }
    }
  }
`;

export const VERIFY_PICKING_BARCODE_MUTATION = gql`
  mutation VerifyPickingBarcode($orderItemId: UUID!, $scannedBarcode: String!) {
    verifyPickingLineBarcode(
      orderItemId: $orderItemId
      scannedBarcode: $scannedBarcode
    ) {
      isValid
      matchedSku
      matchedBatch
      message
    }
  }
`;

export const COMPLETE_ORDER_PICKING_MUTATION = gql`
  mutation CompleteOrderPicking($orderId: UUID!) {
    completeOrderPicking(orderId: $orderId)
  }
`;

export const RECORD_STOCK_ADJUSTMENT_MUTATION = gql`
  mutation RecordStockAdjustment(
    $batchId: UUID!
    $adjustmentType: String!
    $quantityDelta: Int!
    $reason: String!
    $evidenceUrl: String
  ) {
    recordStockAdjustment(
      batchId: $batchId
      adjustmentType: $adjustmentType
      quantityDelta: $quantityDelta
      reason: $reason
      evidenceUrl: $evidenceUrl
    ) {
      id
      stockBatchId
      batchNumber
      productName
      adjustmentType
      quantityDelta
      reason
      evidenceUrl
      isRepeated
      adjustedByName
      createdAt
    }
  }
`;

export const STOCK_ADJUSTMENTS_QUERY = gql`
  query StockAdjustments($batchId: UUID) {
    stockAdjustments(batchId: $batchId) {
      id
      stockBatchId
      batchNumber
      productName
      adjustmentType
      quantityDelta
      reason
      evidenceUrl
      isRepeated
      adjustedByName
      createdAt
    }
  }
`;

// ── Super Admin Master Governance, Purchases & Audit Controls ───

export const SUPER_ADMIN_GOVERNANCE_OVERVIEW_QUERY = gql`
  query SuperAdminGovernanceOverview {
    superAdminGovernanceOverview {
      pendingSupplierInvoicesCount
      purchaseReconciliationExceptionsCount
      supplierDiscrepanciesCount
      supplierReconciliations {
        id
        supplierName
        poNumber
        invoiceNumber
        invoiceAmount
        receivedAmount
        discrepancyAmount
        discrepancyType
        status
        notes
        createdAt
      }
      mfaEnforced
      privilegedAccountsCount
      unusualSigninAlertsCount
      unresolvedAuditExceptionsCount
      catalogChangeHistory {
        id
        productName
        category
        changeType
        oldValue
        newValue
        performedBy
        createdAt
      }
      unusualPricingAlertsCount
      bankReconciledPercentage
      pendingExternalSettlementsCount
      automationRulesVersion
    }
  }
`;

export const TOGGLE_MFA_ENFORCEMENT_MUTATION = gql`
  mutation ToggleMfaEnforcement($enable: Boolean!) {
    toggleMfaEnforcement(enable: $enable)
  }
`;

export const RESOLVE_SUPPLIER_RECONCILIATION_MUTATION = gql`
  mutation ResolveSupplierReconciliation(
    $recordId: String!
    $status: String!
    $notes: String
  ) {
    resolveSupplierReconciliation(
      recordId: $recordId
      status: $status
      notes: $notes
    ) {
      id
      supplierName
      poNumber
      invoiceNumber
      invoiceAmount
      receivedAmount
      discrepancyAmount
      discrepancyType
      status
      notes
      createdAt
    }
  }
`;
