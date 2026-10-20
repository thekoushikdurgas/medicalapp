/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
import type * as Types from "./types";

export type ChallanReturnLineInput = {
  productId: string;
  quantity: number;
  stockBatchId: string;
};

export type CompleteDeliveryInput = {
  assignmentId: string;
  cashCollected?: number;
  notes?: string | null | undefined;
  otp: string;
  paymentReference?: string | null | undefined;
  proofImageUrl?: string | null | undefined;
  upiCollected?: number;
};

export type CreateChallanInput = {
  orderId: string;
  totalCartons?: number;
  transporterName?: string | null | undefined;
  vehicleNumber?: string | null | undefined;
};

export type CreateChallanReturnInput = {
  challanId: string;
  items: Array<ChallanReturnLineInput>;
  reason?: string | null | undefined;
};

export type CreateInvoiceReturnInput = {
  invoiceId: string;
  items: Array<InvoiceReturnLineInput>;
  reason?: string | null | undefined;
  restockStatus?: string;
};

export type CreateUserInput = {
  assignedArea?: string | null | undefined;
  email?: string | null | undefined;
  fullName: string;
  gstin?: string | null | undefined;
  password: string;
  phone?: string | null | undefined;
  role: string;
  shopAddress?: string | null | undefined;
  shopName?: string | null | undefined;
  vehicleNumber?: string | null | undefined;
  vehicleType?: string | null | undefined;
};

export type InvoiceReturnLineInput = {
  discountPct?: number;
  productId: string;
  quantity: number;
  rate: number;
  stockBatchId: string;
};

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type PlaceOrderInput = {
  items: Array<OrderItemInput>;
  remarks?: string | null | undefined;
};

export type RateOrderInput = {
  feedback?: string | null | undefined;
  orderId: string;
  rating: number;
};

export type RecordAdvancePaymentInput = {
  amount: number;
  notes?: string | null | undefined;
  paymentMethod?: string;
  referenceNo?: string | null | undefined;
  shopkeeperId: string;
};

export type RegisterInput = {
  area?: string | null | undefined;
  assignedArea?: string | null | undefined;
  city?: string | null | undefined;
  drugLicenseNo?: string | null | undefined;
  email?: string | null | undefined;
  fullName: string;
  gstin?: string | null | undefined;
  password: string;
  phone: string;
  role: string;
  shopAddress?: string | null | undefined;
  shopName?: string | null | undefined;
  vehicleNumber?: string | null | undefined;
  vehicleType?: string | null | undefined;
};

export type ReviewReturnRequestInput = {
  action: string;
  rejectionReason?: string | null | undefined;
  requestId: string;
};

export type SubmitReturnRequestInput = {
  imageUrl?: string | null | undefined;
  productId: string;
  quantity: number;
  reason: string;
  remarks?: string | null | undefined;
  stockBatchId?: string | null | undefined;
};

export type UpdateNotificationPreferencesInput = {
  inApp: boolean;
  sms: boolean;
  whatsapp: boolean;
};

export type LoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;

export type LoginMutation = {
  login: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string | null; fullName: string; role: string };
  };
};

export type RegisterMutationVariables = Exact<{
  input: Types.RegisterInput;
}>;

export type RegisterMutation = {
  register: {
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string | null; fullName: string; role: string };
  };
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  me: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string;
    role: string;
    isActive: boolean;
  };
};

export type UsersQueryVariables = Exact<{
  role?: string | null | undefined;
  search?: string | null | undefined;
  page?: number | null | undefined;
  perPage?: number | null | undefined;
}>;

export type UsersQuery = {
  users: Array<{
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string;
    role: string;
    isActive: boolean;
    assignedWorkQueue: string | null;
    createdAt: string;
  }>;
};

export type AssignUserRoleMutationVariables = Exact<{
  userId: string;
  newRole: string;
}>;

export type AssignUserRoleMutation = {
  assignUserRole: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string;
    role: string;
    isActive: boolean;
    assignedWorkQueue: string | null;
  };
};

export type CreateUserMutationVariables = Exact<{
  input: Types.CreateUserInput;
}>;

export type CreateUserMutation = {
  createUser: {
    id: string;
    email: string | null;
    phone: string | null;
    fullName: string;
    role: string;
    isActive: boolean;
    assignedWorkQueue: string | null;
  };
};

export type AssignStaffWorkQueueMutationVariables = Exact<{
  userId: string;
  workQueue: string;
}>;

export type AssignStaffWorkQueueMutation = {
  assignStaffWorkQueue: {
    id: string;
    fullName: string;
    role: string;
    assignedWorkQueue: string | null;
  };
};

export type TriggerUserPasswordResetMutationVariables = Exact<{
  userId: string;
}>;

export type TriggerUserPasswordResetMutation = {
  triggerUserPasswordReset: boolean;
};

export type AccountAuditLogsQueryVariables = Exact<{
  userId: string;
}>;

export type AccountAuditLogsQuery = {
  accountAuditLogs: Array<{
    id: string;
    userId: string;
    action: string;
    details: string;
    createdAt: string;
    performedByName: string | null;
  }>;
};

export type OperationsIncidentSummaryQueryVariables = Exact<{
  [key: string]: never;
}>;

export type OperationsIncidentSummaryQuery = {
  operationsIncidentSummary: {
    breachedSlaOrdersCount: number;
    unresolvedDisputesCount: number;
    criticalAlertsCount: number;
    activeWarehousePickers: number;
    activeDeliveryCouriers: number;
    avgPickerOrdersLoad: number;
    avgRetailerKycReviewMinutes: number;
    flaggedLatePayersCount: number;
    lowStockReplenishmentCount: number;
    authFailureAttempts24h: number;
    reportingDataBalanced: boolean;
  };
};

export type SendRetailerPaymentReminderMutationVariables = Exact<{
  shopkeeperId: string;
}>;

export type SendRetailerPaymentReminderMutation = {
  sendRetailerPaymentReminder: boolean;
};

export type ProductsQueryVariables = Exact<{
  search?: string | null | undefined;
  category?: string | null | undefined;
  page?: number | null | undefined;
  perPage?: number | null | undefined;
}>;

export type ProductsQuery = {
  products: {
    totalCount: number;
    hasNextPage: boolean;
    items: Array<{
      id: string;
      name: string;
      composition: string | null;
      manufacturer: string | null;
      packSize: string;
      hsnCode: string | null;
      category: string | null;
      defaultMrp: number | null;
      availableStock: number | null;
    }>;
  };
};

export type ProductQueryVariables = Exact<{
  id: string;
}>;

export type ProductQuery = {
  product: {
    id: string;
    name: string;
    composition: string | null;
    manufacturer: string | null;
    packSize: string;
    hsnCode: string | null;
    category: string | null;
    defaultMrp: number | null;
    availableStock: number | null;
  };
};

export type OrdersQueryVariables = Exact<{
  status?: string | null | undefined;
  page?: number | null | undefined;
  perPage?: number | null | undefined;
}>;

export type OrdersQuery = {
  orders: {
    totalCount: number;
    hasNextPage: boolean;
    items: Array<{
      id: string;
      orderNumber: string;
      status: string;
      totalAmount: number;
      discountAmount: number;
      gstAmount: number;
      netAmount: number;
      placedAt: string | null;
      deliveryOtp: string | null;
      rating: number | null;
      feedbackText: string | null;
      estimatedArrivalWindow: string | null;
    }>;
  };
};

export type PlaceOrderMutationVariables = Exact<{
  input: Types.PlaceOrderInput;
  shopkeeperId?: string | null | undefined;
}>;

export type PlaceOrderMutation = {
  placeOrder: { id: string; orderNumber: string; status: string };
};

export type ConfirmOrderMutationVariables = Exact<{
  orderId: string;
}>;

export type ConfirmOrderMutation = {
  confirmOrder: { id: string; status: string };
};

export type CancelOrderMutationVariables = Exact<{
  orderId: string;
  reason?: string | null | undefined;
}>;

export type CancelOrderMutation = {
  cancelOrder: { id: string; status: string };
};

export type MyDeliveriesQueryVariables = Exact<{
  deliveryBoyId?: string | null | undefined;
  status?: string | null | undefined;
}>;

export type MyDeliveriesQuery = {
  myDeliveries: Array<{
    id: string;
    orderId: string | null;
    orderNumber: string | null;
    shopName: string | null;
    shopAddress: string | null;
    status: string;
    deliveryNotes: string | null;
    proofImageUrl: string | null;
    deliveryOtp: string | null;
    cashCollected: number;
    upiCollected: number;
    assignedAt: string;
    deliveredAt: string | null;
  }>;
};

export type AssignDeliveryMutationVariables = Exact<{
  orderId: string;
  deliveryBoyId: string;
}>;

export type AssignDeliveryMutation = {
  assignDelivery: {
    id: string;
    orderId: string | null;
    deliveryOtp: string | null;
    status: string;
  };
};

export type CompleteDeliveryWithOtpMutationVariables = Exact<{
  input: Types.CompleteDeliveryInput;
}>;

export type CompleteDeliveryWithOtpMutation = {
  completeDeliveryWithOtp: {
    id: string;
    status: string;
    cashCollected: number;
    upiCollected: number;
    deliveredAt: string | null;
  };
};

export type DashboardStatsQueryVariables = Exact<{ [key: string]: never }>;

export type DashboardStatsQuery = {
  dashboardStats: {
    totalOrders: number;
    pendingOrders: number;
    todaySales: number;
    lowStockCount: number;
    expiringBatchesCount: number;
    outstandingPayments: number;
  };
};

export type GetDeliveryChallansQueryVariables = Exact<{
  page?: number | null | undefined;
  perPage?: number | null | undefined;
}>;

export type GetDeliveryChallansQuery = {
  deliveryChallans: Array<{
    id: string;
    orderId: string;
    challanNumber: string;
    challanDate: string;
    transporterName: string | null;
    vehicleNumber: string | null;
    totalCartons: number;
    createdAt: string;
    items: Array<{
      id: string;
      productId: string;
      stockBatchId: string;
      quantity: number;
      freeQuantity: number;
      productName: string | null;
    }>;
    returns: Array<{
      id: string;
      returnNumber: string;
      returnDate: string;
      reason: string | null;
      createdAt: string;
    }>;
  }>;
};

export type CreateDeliveryChallanMutationVariables = Exact<{
  input: Types.CreateChallanInput;
}>;

export type CreateDeliveryChallanMutation = {
  createDeliveryChallan: {
    id: string;
    challanNumber: string;
    challanDate: string;
    totalCartons: number;
    transporterName: string | null;
    vehicleNumber: string | null;
  };
};

export type CreateChallanReturnMutationVariables = Exact<{
  input: Types.CreateChallanReturnInput;
}>;

export type CreateChallanReturnMutation = {
  createChallanReturn: {
    id: string;
    returnNumber: string;
    returnDate: string;
    reason: string | null;
  };
};

export type GetInvoiceReturnsQueryVariables = Exact<{
  page?: number | null | undefined;
  perPage?: number | null | undefined;
}>;

export type GetInvoiceReturnsQuery = {
  invoiceReturns: Array<{
    id: string;
    invoiceId: string;
    creditNoteNo: string;
    returnDate: string;
    refundSubtotal: number;
    refundSgst: number;
    refundCgst: number;
    grandRefund: number;
    reason: string | null;
    restockStatus: string;
    createdAt: string;
    items: Array<{
      id: string;
      productId: string;
      stockBatchId: string;
      quantity: number;
      rate: number;
      discountPct: number;
      productName: string | null;
    }>;
  }>;
};

export type CreateInvoiceReturnMutationVariables = Exact<{
  input: Types.CreateInvoiceReturnInput;
}>;

export type CreateInvoiceReturnMutation = {
  createInvoiceReturn: {
    id: string;
    creditNoteNo: string;
    returnDate: string;
    grandRefund: number;
    restockStatus: string;
  };
};

export type GetAdvancePaymentsQueryVariables = Exact<{
  shopkeeperId?: string | null | undefined;
  page?: number | null | undefined;
  perPage?: number | null | undefined;
}>;

export type GetAdvancePaymentsQuery = {
  advancePayments: Array<{
    id: string;
    receiptNumber: string;
    shopkeeperId: string;
    amount: number;
    paymentMethod: string;
    referenceNo: string | null;
    notes: string | null;
    paidAt: string;
    shopkeeperName: string | null;
  }>;
};

export type RecordAdvancePaymentMutationVariables = Exact<{
  input: Types.RecordAdvancePaymentInput;
}>;

export type RecordAdvancePaymentMutation = {
  recordAdvancePayment: {
    id: string;
    receiptNumber: string;
    amount: number;
    paymentMethod: string;
    paidAt: string;
  };
};

export type MyLedgerQueryVariables = Exact<{
  shopkeeperId?: string | null | undefined;
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;

export type MyLedgerQuery = {
  myLedger: Array<{
    id: string;
    shopkeeperId: string;
    entryType: string;
    amount: number;
    balanceAfter: number;
    referenceNumber: string;
    description: string;
    createdAt: string;
    shopkeeperName: string | null;
  }>;
};

export type ReturnClaimsQueryVariables = Exact<{
  status?: string | null | undefined;
  page?: number | null | undefined;
  perPage?: number | null | undefined;
}>;

export type ReturnClaimsQuery = {
  returnClaims: Array<{
    id: string;
    requestNumber: string;
    shopkeeperId: string;
    productId: string;
    productName: string | null;
    batchNumber: string | null;
    quantity: number;
    reason: string;
    remarks: string | null;
    imageUrl: string | null;
    status: string;
    rejectionReason: string | null;
    createdAt: string;
    shopkeeperName: string | null;
  }>;
};

export type SubmitReturnClaimMutationVariables = Exact<{
  input: Types.SubmitReturnRequestInput;
}>;

export type SubmitReturnClaimMutation = {
  submitReturnClaim: {
    id: string;
    requestNumber: string;
    status: string;
    createdAt: string;
  };
};

export type ReviewReturnClaimMutationVariables = Exact<{
  input: Types.ReviewReturnRequestInput;
}>;

export type ReviewReturnClaimMutation = {
  reviewReturnClaim: {
    id: string;
    status: string;
    rejectionReason: string | null;
  };
};

export type ShopkeepersQueryVariables = Exact<{
  search?: string | null | undefined;
  status?: string | null | undefined;
  page?: number | null | undefined;
  perPage?: number | null | undefined;
}>;

export type ShopkeepersQuery = {
  shopkeepers: Array<{
    id: string;
    userId: string | null;
    shopName: string;
    shopAddress: string;
    gstin: string | null;
    drugLicenseNo: string | null;
    area: string | null;
    city: string | null;
    creditLimit: number;
    outstandingBalance: number;
    verificationStatus: string;
    verificationNotes: string | null;
    creditLimitReason: string | null;
    ownerName: string | null;
    phone: string | null;
    email: string | null;
    totalOrders: number | null;
  }>;
};

export type UpdateShopkeeperKycMutationVariables = Exact<{
  shopkeeperId: string;
  status: string;
  notes?: string | null | undefined;
}>;

export type UpdateShopkeeperKycMutation = {
  updateShopkeeperKyc: {
    id: string;
    userId: string | null;
    shopName: string;
    verificationStatus: string;
    verificationNotes: string | null;
  };
};

export type UpdateShopkeeperCreditLimitMutationVariables = Exact<{
  shopkeeperId: string;
  newLimit: number;
  reason: string;
}>;

export type UpdateShopkeeperCreditLimitMutation = {
  updateShopkeeperCreditLimit: {
    id: string;
    userId: string | null;
    shopName: string;
    creditLimit: number;
    creditLimitReason: string | null;
  };
};

export type RateOrderMutationVariables = Exact<{
  input: Types.RateOrderInput;
}>;

export type RateOrderMutation = {
  rateOrder: { id: string; rating: number | null; feedbackText: string | null };
};

export type DisputeDeliveryMutationVariables = Exact<{
  orderId: string;
  reason: string;
}>;

export type DisputeDeliveryMutation = {
  disputeDelivery: { id: string; remarks: string | null };
};

export type NotificationsQueryVariables = Exact<{
  isRead?: boolean | null | undefined;
}>;

export type NotificationsQuery = {
  notifications: Array<{
    id: string;
    userId: string;
    title: string;
    message: string;
    category: string;
    isRead: boolean;
    createdAt: string;
  }>;
};

export type MarkNotificationAsReadMutationVariables = Exact<{
  notificationId: string;
}>;

export type MarkNotificationAsReadMutation = {
  markNotificationAsRead: boolean;
};

export type NotificationPreferencesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type NotificationPreferencesQuery = { notificationPreferences: string };

export type UpdateNotificationPreferencesMutationVariables = Exact<{
  input: Types.UpdateNotificationPreferencesInput;
}>;

export type UpdateNotificationPreferencesMutation = {
  updateNotificationPreferences: boolean;
};

export type AutomationJobsQueryVariables = Exact<{
  status?: string | null | undefined;
}>;

export type AutomationJobsQuery = {
  automationJobs: Array<{
    id: string;
    jobType: string;
    payload: string | null;
    status: string;
    retryCount: number;
    maxRetries: number;
    errorMessage: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type IntegrationHealthQueryVariables = Exact<{ [key: string]: never }>;

export type IntegrationHealthQuery = {
  integrationHealth: {
    databaseStatus: string;
    databaseLatencyMs: number;
    gstEinvoicePortal: string;
    gstLatencyMs: number;
    smsDltGateway: string;
    whatsappApi: string;
    redisEventQueue: string;
    failedJobsCount: number;
    failedNotificationsCount: number;
    activeWorkers: number;
  };
};

export type RetryFailedJobMutationVariables = Exact<{
  jobId: string;
}>;

export type RetryFailedJobMutation = {
  retryFailedJob: {
    id: string;
    status: string;
    retryCount: number;
    errorMessage: string | null;
    updatedAt: string;
  };
};

export type SimulateBulkPriceQueryVariables = Exact<{
  action: string;
  value: number;
  category?: string | null | undefined;
}>;

export type SimulateBulkPriceQuery = {
  simulateBulkPriceUpdate: {
    dryRun: boolean;
    totalMatched: number;
    totalAffected: number;
    canApply: boolean;
    validationWarnings: Array<string>;
    auditId: string | null;
    previewItems: Array<{
      productId: string;
      productName: string;
      packSize: string;
      category: string | null;
      currentMrp: number;
      newMrp: number;
      currentPtr: number;
      newPtr: number;
      projectedMarginPct: number;
      warning: string | null;
    }>;
  };
};

export type ApplyBulkPriceMutationVariables = Exact<{
  action: string;
  value: number;
  reason: string;
  category?: string | null | undefined;
}>;

export type ApplyBulkPriceMutation = {
  applyBulkPriceUpdate: {
    dryRun: boolean;
    totalMatched: number;
    totalAffected: number;
    canApply: boolean;
    auditId: string | null;
  };
};

export type AutomationCircuitsQueryVariables = Exact<{ [key: string]: never }>;

export type AutomationCircuitsQuery = {
  automationCircuits: Array<{
    subsystem: string;
    isPaused: boolean;
    pausedBy: string | null;
    pauseReason: string | null;
    updatedAt: string;
  }>;
};

export type ToggleAutomationCircuitMutationVariables = Exact<{
  subsystem: string;
  paused: boolean;
  reason?: string | null | undefined;
}>;

export type ToggleAutomationCircuitMutation = {
  toggleAutomationCircuit: {
    subsystem: string;
    isPaused: boolean;
    pausedBy: string | null;
    pauseReason: string | null;
    updatedAt: string;
  };
};

export type HighRiskApprovalsQueryVariables = Exact<{
  status?: string | null | undefined;
}>;

export type HighRiskApprovalsQuery = {
  highRiskApprovals: Array<{
    id: string;
    actionType: string;
    targetId: string | null;
    description: string;
    status: string;
    requestedById: string;
    requestedByName: string;
    approvedById: string | null;
    approvedByName: string | null;
    rejectionReason: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type ReviewHighRiskApprovalMutationVariables = Exact<{
  requestId: string;
  approve: boolean;
  reason?: string | null | undefined;
}>;

export type ReviewHighRiskApprovalMutation = {
  reviewHighRiskApproval: {
    id: string;
    actionType: string;
    status: string;
    approvedByName: string | null;
    rejectionReason: string | null;
    updatedAt: string;
  };
};

export type WarehousePickingSlipQueryVariables = Exact<{
  orderId: string;
}>;

export type WarehousePickingSlipQuery = {
  warehousePickingSlip: {
    orderId: string;
    orderNumber: string;
    shopkeeperName: string;
    deliveryArea: string;
    priority: string;
    totalItemsCount: number;
    isFullyPicked: boolean;
    pickingLines: Array<{
      itemId: string;
      productName: string;
      packSize: string;
      batchNumber: string;
      expiryDate: string;
      rackLocation: string;
      quantityToPick: number;
      barcode: string;
      isPicked: boolean;
      barcodeVerified: boolean;
    }>;
  };
};

export type VerifyPickingBarcodeMutationVariables = Exact<{
  orderItemId: string;
  scannedBarcode: string;
}>;

export type VerifyPickingBarcodeMutation = {
  verifyPickingLineBarcode: {
    isValid: boolean;
    matchedSku: string;
    matchedBatch: string;
    message: string;
  };
};

export type CompleteOrderPickingMutationVariables = Exact<{
  orderId: string;
}>;

export type CompleteOrderPickingMutation = { completeOrderPicking: boolean };

export type RecordStockAdjustmentMutationVariables = Exact<{
  batchId: string;
  adjustmentType: string;
  quantityDelta: number;
  reason: string;
  evidenceUrl?: string | null | undefined;
}>;

export type RecordStockAdjustmentMutation = {
  recordStockAdjustment: {
    id: string;
    stockBatchId: string;
    batchNumber: string;
    productName: string;
    adjustmentType: string;
    quantityDelta: number;
    reason: string;
    evidenceUrl: string | null;
    isRepeated: boolean;
    adjustedByName: string;
    createdAt: string;
  };
};

export type StockAdjustmentsQueryVariables = Exact<{
  batchId?: string | null | undefined;
}>;

export type StockAdjustmentsQuery = {
  stockAdjustments: Array<{
    id: string;
    stockBatchId: string;
    batchNumber: string;
    productName: string;
    adjustmentType: string;
    quantityDelta: number;
    reason: string;
    evidenceUrl: string | null;
    isRepeated: boolean;
    adjustedByName: string;
    createdAt: string;
  }>;
};

export type SuperAdminGovernanceOverviewQueryVariables = Exact<{
  [key: string]: never;
}>;

export type SuperAdminGovernanceOverviewQuery = {
  superAdminGovernanceOverview: {
    pendingSupplierInvoicesCount: number;
    purchaseReconciliationExceptionsCount: number;
    supplierDiscrepanciesCount: number;
    mfaEnforced: boolean;
    privilegedAccountsCount: number;
    unusualSigninAlertsCount: number;
    unresolvedAuditExceptionsCount: number;
    unusualPricingAlertsCount: number;
    bankReconciledPercentage: number;
    pendingExternalSettlementsCount: number;
    automationRulesVersion: string;
    supplierReconciliations: Array<{
      id: string;
      supplierName: string;
      poNumber: string;
      invoiceNumber: string;
      invoiceAmount: number;
      receivedAmount: number;
      discrepancyAmount: number;
      discrepancyType: string;
      status: string;
      notes: string | null;
      createdAt: string;
    }>;
    catalogChangeHistory: Array<{
      id: string;
      productName: string;
      category: string | null;
      changeType: string;
      oldValue: string;
      newValue: string;
      performedBy: string;
      createdAt: string;
    }>;
  };
};

export type ToggleMfaEnforcementMutationVariables = Exact<{
  enable: boolean;
}>;

export type ToggleMfaEnforcementMutation = { toggleMfaEnforcement: boolean };

export type ResolveSupplierReconciliationMutationVariables = Exact<{
  recordId: string;
  status: string;
  notes?: string | null | undefined;
}>;

export type ResolveSupplierReconciliationMutation = {
  resolveSupplierReconciliation: {
    id: string;
    supplierName: string;
    poNumber: string;
    invoiceNumber: string;
    invoiceAmount: number;
    receivedAmount: number;
    discrepancyAmount: number;
    discrepancyType: string;
    status: string;
    notes: string | null;
    createdAt: string;
  };
};
