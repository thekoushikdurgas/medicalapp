export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** Date (isoformat) */
  Date: { input: string; output: string };
  /** Date with time (isoformat) */
  DateTime: { input: string; output: string };
  UUID: { input: string; output: string };
};

export type AccountAuditLogType = {
  __typename?: "AccountAuditLogType";
  action: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  details: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  performedById: Scalars["UUID"]["output"];
  performedByName?: Maybe<Scalars["String"]["output"]>;
  userId: Scalars["UUID"]["output"];
};

export type AdvancePaymentType = {
  __typename?: "AdvancePaymentType";
  amount: Scalars["Float"]["output"];
  id: Scalars["UUID"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  paidAt: Scalars["DateTime"]["output"];
  paymentMethod: Scalars["String"]["output"];
  receiptNumber: Scalars["String"]["output"];
  referenceNo?: Maybe<Scalars["String"]["output"]>;
  shopkeeperId: Scalars["UUID"]["output"];
  shopkeeperName?: Maybe<Scalars["String"]["output"]>;
};

export type AuthPayload = {
  __typename?: "AuthPayload";
  accessToken: Scalars["String"]["output"];
  refreshToken: Scalars["String"]["output"];
  user: UserType;
};

export type AutomationCircuitType = {
  __typename?: "AutomationCircuitType";
  isPaused: Scalars["Boolean"]["output"];
  pauseReason?: Maybe<Scalars["String"]["output"]>;
  pausedBy?: Maybe<Scalars["String"]["output"]>;
  subsystem: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type AutomationJobType = {
  __typename?: "AutomationJobType";
  createdAt: Scalars["DateTime"]["output"];
  errorMessage?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["UUID"]["output"];
  jobType: Scalars["String"]["output"];
  maxRetries: Scalars["Int"]["output"];
  payload?: Maybe<Scalars["String"]["output"]>;
  retryCount: Scalars["Int"]["output"];
  status: Scalars["String"]["output"];
  updatedAt: Scalars["DateTime"]["output"];
};

export type BarcodeVerificationResult = {
  __typename?: "BarcodeVerificationResult";
  isValid: Scalars["Boolean"]["output"];
  matchedBatch: Scalars["String"]["output"];
  matchedSku: Scalars["String"]["output"];
  message: Scalars["String"]["output"];
};

export type BulkPricePreviewItem = {
  __typename?: "BulkPricePreviewItem";
  category?: Maybe<Scalars["String"]["output"]>;
  currentMrp: Scalars["Float"]["output"];
  currentPtr: Scalars["Float"]["output"];
  newMrp: Scalars["Float"]["output"];
  newPtr: Scalars["Float"]["output"];
  packSize: Scalars["String"]["output"];
  productId: Scalars["UUID"]["output"];
  productName: Scalars["String"]["output"];
  projectedMarginPct: Scalars["Float"]["output"];
  warning?: Maybe<Scalars["String"]["output"]>;
};

export type BulkPriceSimulationResult = {
  __typename?: "BulkPriceSimulationResult";
  auditId?: Maybe<Scalars["String"]["output"]>;
  canApply: Scalars["Boolean"]["output"];
  dryRun: Scalars["Boolean"]["output"];
  previewItems: Array<BulkPricePreviewItem>;
  totalAffected: Scalars["Int"]["output"];
  totalMatched: Scalars["Int"]["output"];
  validationWarnings: Array<Scalars["String"]["output"]>;
};

export type ChallanItemType = {
  __typename?: "ChallanItemType";
  freeQuantity: Scalars["Int"]["output"];
  id: Scalars["UUID"]["output"];
  productId: Scalars["UUID"]["output"];
  productName?: Maybe<Scalars["String"]["output"]>;
  quantity: Scalars["Int"]["output"];
  stockBatchId: Scalars["UUID"]["output"];
};

export type ChallanReturnLineInput = {
  productId: Scalars["UUID"]["input"];
  quantity: Scalars["Int"]["input"];
  stockBatchId: Scalars["UUID"]["input"];
};

export type ChallanReturnType = {
  __typename?: "ChallanReturnType";
  challanId: Scalars["UUID"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["UUID"]["output"];
  reason?: Maybe<Scalars["String"]["output"]>;
  returnDate: Scalars["Date"]["output"];
  returnNumber: Scalars["String"]["output"];
};

export type CompleteDeliveryInput = {
  assignmentId: Scalars["UUID"]["input"];
  cashCollected?: Scalars["Float"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  otp: Scalars["String"]["input"];
  paymentReference?: InputMaybe<Scalars["String"]["input"]>;
  proofImageUrl?: InputMaybe<Scalars["String"]["input"]>;
  upiCollected?: Scalars["Float"]["input"];
};

export type CreateChallanInput = {
  orderId: Scalars["UUID"]["input"];
  totalCartons?: Scalars["Int"]["input"];
  transporterName?: InputMaybe<Scalars["String"]["input"]>;
  vehicleNumber?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateChallanReturnInput = {
  challanId: Scalars["UUID"]["input"];
  items: Array<ChallanReturnLineInput>;
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type CreateInvoiceReturnInput = {
  invoiceId: Scalars["UUID"]["input"];
  items: Array<InvoiceReturnLineInput>;
  reason?: InputMaybe<Scalars["String"]["input"]>;
  restockStatus?: Scalars["String"]["input"];
};

export type CreateUserInput = {
  assignedArea?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  fullName: Scalars["String"]["input"];
  gstin?: InputMaybe<Scalars["String"]["input"]>;
  password: Scalars["String"]["input"];
  phone?: InputMaybe<Scalars["String"]["input"]>;
  role: Scalars["String"]["input"];
  shopAddress?: InputMaybe<Scalars["String"]["input"]>;
  shopName?: InputMaybe<Scalars["String"]["input"]>;
  vehicleNumber?: InputMaybe<Scalars["String"]["input"]>;
  vehicleType?: InputMaybe<Scalars["String"]["input"]>;
};

export type DashboardStats = {
  __typename?: "DashboardStats";
  expiringBatchesCount: Scalars["Int"]["output"];
  lowStockCount: Scalars["Int"]["output"];
  outstandingPayments: Scalars["Float"]["output"];
  pendingOrders: Scalars["Int"]["output"];
  todaySales: Scalars["Float"]["output"];
  totalOrders: Scalars["Int"]["output"];
};

export type DeliveryAssignmentType = {
  __typename?: "DeliveryAssignmentType";
  assignedAt: Scalars["DateTime"]["output"];
  cashCollected: Scalars["Float"]["output"];
  deliveredAt?: Maybe<Scalars["DateTime"]["output"]>;
  deliveryBoyId?: Maybe<Scalars["UUID"]["output"]>;
  deliveryBoyName?: Maybe<Scalars["String"]["output"]>;
  deliveryNotes?: Maybe<Scalars["String"]["output"]>;
  deliveryOtp?: Maybe<Scalars["String"]["output"]>;
  failurePhotoUrl?: Maybe<Scalars["String"]["output"]>;
  failureReason?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["UUID"]["output"];
  orderId?: Maybe<Scalars["UUID"]["output"]>;
  orderNumber?: Maybe<Scalars["String"]["output"]>;
  paymentReference?: Maybe<Scalars["String"]["output"]>;
  proofImageUrl?: Maybe<Scalars["String"]["output"]>;
  shopAddress?: Maybe<Scalars["String"]["output"]>;
  shopName?: Maybe<Scalars["String"]["output"]>;
  status: Scalars["String"]["output"];
  upiCollected: Scalars["Float"]["output"];
};

export type DeliveryChallanType = {
  __typename?: "DeliveryChallanType";
  challanDate: Scalars["Date"]["output"];
  challanNumber: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["UUID"]["output"];
  items: Array<ChallanItemType>;
  orderId: Scalars["UUID"]["output"];
  returns: Array<ChallanReturnType>;
  totalCartons: Scalars["Int"]["output"];
  transporterName?: Maybe<Scalars["String"]["output"]>;
  vehicleNumber?: Maybe<Scalars["String"]["output"]>;
};

export type DeliveryRosterType = {
  __typename?: "DeliveryRosterType";
  assignedZone?: Maybe<Scalars["String"]["output"]>;
  deliveryBoyId: Scalars["UUID"]["output"];
  id: Scalars["UUID"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  shiftDate: Scalars["Date"]["output"];
  shiftType: Scalars["String"]["output"];
  status: Scalars["String"]["output"];
};

export type DeliveryShiftSummaryType = {
  __typename?: "DeliveryShiftSummaryType";
  cashCollected: Scalars["Float"]["output"];
  pendingHandover: Scalars["Float"]["output"];
  totalAssigned: Scalars["Int"]["output"];
  totalCollected: Scalars["Float"]["output"];
  totalDelivered: Scalars["Int"]["output"];
  totalFailed: Scalars["Int"]["output"];
  upiCollected: Scalars["Float"]["output"];
};

export type HighRiskApprovalType = {
  __typename?: "HighRiskApprovalType";
  actionType: Scalars["String"]["output"];
  approvedById?: Maybe<Scalars["UUID"]["output"]>;
  approvedByName?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  rejectionReason?: Maybe<Scalars["String"]["output"]>;
  requestedById: Scalars["UUID"]["output"];
  requestedByName: Scalars["String"]["output"];
  status: Scalars["String"]["output"];
  targetId?: Maybe<Scalars["String"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type IntegrationHealthType = {
  __typename?: "IntegrationHealthType";
  activeWorkers: Scalars["Int"]["output"];
  databaseLatencyMs: Scalars["Float"]["output"];
  databaseStatus: Scalars["String"]["output"];
  failedJobsCount: Scalars["Int"]["output"];
  failedNotificationsCount: Scalars["Int"]["output"];
  gstEinvoicePortal: Scalars["String"]["output"];
  gstLatencyMs: Scalars["Float"]["output"];
  redisEventQueue: Scalars["String"]["output"];
  smsDltGateway: Scalars["String"]["output"];
  whatsappApi: Scalars["String"]["output"];
};

export type InvoiceReturnItemType = {
  __typename?: "InvoiceReturnItemType";
  discountPct: Scalars["Float"]["output"];
  id: Scalars["UUID"]["output"];
  productId: Scalars["UUID"]["output"];
  productName?: Maybe<Scalars["String"]["output"]>;
  quantity: Scalars["Int"]["output"];
  rate: Scalars["Float"]["output"];
  stockBatchId: Scalars["UUID"]["output"];
};

export type InvoiceReturnLineInput = {
  discountPct?: Scalars["Float"]["input"];
  productId: Scalars["UUID"]["input"];
  quantity: Scalars["Int"]["input"];
  rate: Scalars["Float"]["input"];
  stockBatchId: Scalars["UUID"]["input"];
};

export type InvoiceReturnType = {
  __typename?: "InvoiceReturnType";
  createdAt: Scalars["DateTime"]["output"];
  creditNoteNo: Scalars["String"]["output"];
  grandRefund: Scalars["Float"]["output"];
  id: Scalars["UUID"]["output"];
  invoiceId: Scalars["UUID"]["output"];
  items: Array<InvoiceReturnItemType>;
  reason?: Maybe<Scalars["String"]["output"]>;
  refundCgst: Scalars["Float"]["output"];
  refundSgst: Scalars["Float"]["output"];
  refundSubtotal: Scalars["Float"]["output"];
  restockStatus: Scalars["String"]["output"];
  returnDate: Scalars["Date"]["output"];
};

export type LedgerRecordType = {
  __typename?: "LedgerRecordType";
  amount: Scalars["Float"]["output"];
  balanceAfter: Scalars["Float"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  description: Scalars["String"]["output"];
  entryType: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  referenceNumber: Scalars["String"]["output"];
  shopkeeperId: Scalars["UUID"]["output"];
  shopkeeperName?: Maybe<Scalars["String"]["output"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  addProduct: ProductType;
  addStockBatch: StockBatchType;
  applyBulkPriceUpdate: BulkPriceSimulationResult;
  assignDelivery: DeliveryAssignmentType;
  assignStaffWorkQueue: UserType;
  assignUserRole: UserType;
  cancelOrder: OrderType;
  completeDeliveryWithOtp: DeliveryAssignmentType;
  completeOrderPicking: Scalars["Boolean"]["output"];
  confirmOrder: OrderType;
  createAutomationJob: AutomationJobType;
  createChallanReturn: ChallanReturnType;
  createDeliveryChallan: DeliveryChallanType;
  createInvoiceReturn: InvoiceReturnType;
  createUser: UserType;
  disputeDelivery: OrderType;
  login: AuthPayload;
  markNotificationAsRead: Scalars["Boolean"]["output"];
  placeOrder: OrderType;
  rateOrder: OrderType;
  reconcileCashHandover: Scalars["Boolean"]["output"];
  recordAdvancePayment: AdvancePaymentType;
  recordStockAdjustment: StockAdjustmentType;
  refreshToken: AuthPayload;
  register: AuthPayload;
  reportDeliveryFailure: DeliveryAssignmentType;
  requestHighRiskApproval: HighRiskApprovalType;
  resolveSupplierReconciliation: SupplierReconciliationItemType;
  retryFailedJob: AutomationJobType;
  reviewHighRiskApproval: HighRiskApprovalType;
  reviewReturnClaim: ReturnClaimType;
  sendRetailerPaymentReminder: Scalars["Boolean"]["output"];
  submitReturnClaim: ReturnClaimType;
  toggleAutomationCircuit: AutomationCircuitType;
  toggleMfaEnforcement: Scalars["Boolean"]["output"];
  triggerUserPasswordReset: Scalars["Boolean"]["output"];
  updateDeliveryStatus: DeliveryAssignmentType;
  updateNotificationPreferences: Scalars["Boolean"]["output"];
  updateOrderStatus: OrderType;
  updateShopkeeperCreditLimit: ShopkeeperProfileType;
  updateShopkeeperKyc: ShopkeeperProfileType;
  verifyPickingLineBarcode: BarcodeVerificationResult;
};

export type MutationAddProductArgs = {
  input: ProductInput;
};

export type MutationAddStockBatchArgs = {
  input: StockBatchInput;
};

export type MutationApplyBulkPriceUpdateArgs = {
  action: Scalars["String"]["input"];
  category?: InputMaybe<Scalars["String"]["input"]>;
  reason: Scalars["String"]["input"];
  value: Scalars["Float"]["input"];
};

export type MutationAssignDeliveryArgs = {
  assignedBy?: InputMaybe<Scalars["UUID"]["input"]>;
  deliveryBoyId: Scalars["UUID"]["input"];
  orderId: Scalars["UUID"]["input"];
};

export type MutationAssignStaffWorkQueueArgs = {
  userId: Scalars["UUID"]["input"];
  workQueue: Scalars["String"]["input"];
};

export type MutationAssignUserRoleArgs = {
  newRole: Scalars["String"]["input"];
  userId: Scalars["UUID"]["input"];
};

export type MutationCancelOrderArgs = {
  orderId: Scalars["UUID"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCompleteDeliveryWithOtpArgs = {
  input: CompleteDeliveryInput;
};

export type MutationCompleteOrderPickingArgs = {
  orderId: Scalars["UUID"]["input"];
};

export type MutationConfirmOrderArgs = {
  orderId: Scalars["UUID"]["input"];
};

export type MutationCreateAutomationJobArgs = {
  jobType: Scalars["String"]["input"];
  payload?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationCreateChallanReturnArgs = {
  input: CreateChallanReturnInput;
};

export type MutationCreateDeliveryChallanArgs = {
  input: CreateChallanInput;
};

export type MutationCreateInvoiceReturnArgs = {
  input: CreateInvoiceReturnInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationDisputeDeliveryArgs = {
  orderId: Scalars["UUID"]["input"];
  reason: Scalars["String"]["input"];
};

export type MutationLoginArgs = {
  email: Scalars["String"]["input"];
  password: Scalars["String"]["input"];
};

export type MutationMarkNotificationAsReadArgs = {
  notificationId: Scalars["UUID"]["input"];
};

export type MutationPlaceOrderArgs = {
  input: PlaceOrderInput;
  shopkeeperId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type MutationRateOrderArgs = {
  input: RateOrderInput;
};

export type MutationReconcileCashHandoverArgs = {
  amountReceived: Scalars["Float"]["input"];
  cashierNotes?: InputMaybe<Scalars["String"]["input"]>;
  deliveryBoyId: Scalars["UUID"]["input"];
};

export type MutationRecordAdvancePaymentArgs = {
  input: RecordAdvancePaymentInput;
};

export type MutationRecordStockAdjustmentArgs = {
  adjustmentType: Scalars["String"]["input"];
  batchId: Scalars["UUID"]["input"];
  evidenceUrl?: InputMaybe<Scalars["String"]["input"]>;
  quantityDelta: Scalars["Int"]["input"];
  reason: Scalars["String"]["input"];
};

export type MutationRefreshTokenArgs = {
  refreshToken: Scalars["String"]["input"];
};

export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type MutationReportDeliveryFailureArgs = {
  input: ReportDeliveryFailureInput;
};

export type MutationRequestHighRiskApprovalArgs = {
  actionType: Scalars["String"]["input"];
  description: Scalars["String"]["input"];
  targetId?: InputMaybe<Scalars["String"]["input"]>;
};

export type MutationResolveSupplierReconciliationArgs = {
  notes?: InputMaybe<Scalars["String"]["input"]>;
  recordId: Scalars["String"]["input"];
  status: Scalars["String"]["input"];
};

export type MutationRetryFailedJobArgs = {
  jobId: Scalars["UUID"]["input"];
};

export type MutationReviewHighRiskApprovalArgs = {
  approve: Scalars["Boolean"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
  requestId: Scalars["UUID"]["input"];
};

export type MutationReviewReturnClaimArgs = {
  input: ReviewReturnRequestInput;
};

export type MutationSendRetailerPaymentReminderArgs = {
  shopkeeperId: Scalars["UUID"]["input"];
};

export type MutationSubmitReturnClaimArgs = {
  input: SubmitReturnRequestInput;
};

export type MutationToggleAutomationCircuitArgs = {
  paused: Scalars["Boolean"]["input"];
  reason?: InputMaybe<Scalars["String"]["input"]>;
  subsystem: Scalars["String"]["input"];
};

export type MutationToggleMfaEnforcementArgs = {
  enable: Scalars["Boolean"]["input"];
};

export type MutationTriggerUserPasswordResetArgs = {
  userId: Scalars["UUID"]["input"];
};

export type MutationUpdateDeliveryStatusArgs = {
  assignmentId: Scalars["UUID"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  proofImageUrl?: InputMaybe<Scalars["String"]["input"]>;
  status: Scalars["String"]["input"];
};

export type MutationUpdateNotificationPreferencesArgs = {
  input: UpdateNotificationPreferencesInput;
};

export type MutationUpdateOrderStatusArgs = {
  orderId: Scalars["UUID"]["input"];
  status: Scalars["String"]["input"];
};

export type MutationUpdateShopkeeperCreditLimitArgs = {
  newLimit: Scalars["Float"]["input"];
  reason: Scalars["String"]["input"];
  shopkeeperId: Scalars["UUID"]["input"];
};

export type MutationUpdateShopkeeperKycArgs = {
  notes?: InputMaybe<Scalars["String"]["input"]>;
  shopkeeperId: Scalars["UUID"]["input"];
  status: Scalars["String"]["input"];
};

export type MutationVerifyPickingLineBarcodeArgs = {
  orderItemId: Scalars["UUID"]["input"];
  scannedBarcode: Scalars["String"]["input"];
};

export type NotificationType = {
  __typename?: "NotificationType";
  category: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["UUID"]["output"];
  isRead: Scalars["Boolean"]["output"];
  message: Scalars["String"]["output"];
  title: Scalars["String"]["output"];
  userId: Scalars["UUID"]["output"];
};

export type OperationsIncidentSummaryType = {
  __typename?: "OperationsIncidentSummaryType";
  activeDeliveryCouriers: Scalars["Int"]["output"];
  activeWarehousePickers: Scalars["Int"]["output"];
  authFailureAttempts24h: Scalars["Int"]["output"];
  avgPickerOrdersLoad: Scalars["Float"]["output"];
  avgRetailerKycReviewMinutes: Scalars["Float"]["output"];
  breachedSlaOrdersCount: Scalars["Int"]["output"];
  criticalAlertsCount: Scalars["Int"]["output"];
  flaggedLatePayersCount: Scalars["Int"]["output"];
  lowStockReplenishmentCount: Scalars["Int"]["output"];
  reportingDataBalanced: Scalars["Boolean"]["output"];
  unresolvedDisputesCount: Scalars["Int"]["output"];
};

export type OrderItemInput = {
  productId: Scalars["UUID"]["input"];
  quantity: Scalars["Int"]["input"];
};

export type OrderType = {
  __typename?: "OrderType";
  confirmedAt?: Maybe<Scalars["DateTime"]["output"]>;
  deliveredAt?: Maybe<Scalars["DateTime"]["output"]>;
  deliveryOtp?: Maybe<Scalars["String"]["output"]>;
  discountAmount: Scalars["Float"]["output"];
  estimatedArrivalWindow?: Maybe<Scalars["String"]["output"]>;
  feedbackText?: Maybe<Scalars["String"]["output"]>;
  gstAmount: Scalars["Float"]["output"];
  id: Scalars["UUID"]["output"];
  itemCount?: Maybe<Scalars["Int"]["output"]>;
  netAmount: Scalars["Float"]["output"];
  orderNumber: Scalars["String"]["output"];
  placedAt?: Maybe<Scalars["DateTime"]["output"]>;
  rating?: Maybe<Scalars["Int"]["output"]>;
  remarks?: Maybe<Scalars["String"]["output"]>;
  status: Scalars["String"]["output"];
  totalAmount: Scalars["Float"]["output"];
};

export type PaginatedOrders = {
  __typename?: "PaginatedOrders";
  hasNextPage: Scalars["Boolean"]["output"];
  items: Array<OrderType>;
  totalCount: Scalars["Int"]["output"];
};

export type PaginatedProducts = {
  __typename?: "PaginatedProducts";
  hasNextPage: Scalars["Boolean"]["output"];
  items: Array<ProductType>;
  totalCount: Scalars["Int"]["output"];
};

export type PlaceOrderInput = {
  items: Array<OrderItemInput>;
  remarks?: InputMaybe<Scalars["String"]["input"]>;
};

export type ProductChangeAuditItemType = {
  __typename?: "ProductChangeAuditItemType";
  category?: Maybe<Scalars["String"]["output"]>;
  changeType: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["String"]["output"];
  newValue: Scalars["String"]["output"];
  oldValue: Scalars["String"]["output"];
  performedBy: Scalars["String"]["output"];
  productName: Scalars["String"]["output"];
};

export type ProductInput = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  composition?: InputMaybe<Scalars["String"]["input"]>;
  defaultCgstRate?: Scalars["Float"]["input"];
  defaultMrp?: InputMaybe<Scalars["Float"]["input"]>;
  defaultSgstRate?: Scalars["Float"]["input"];
  hsnCode?: InputMaybe<Scalars["String"]["input"]>;
  manufacturer?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  packSize: Scalars["String"]["input"];
};

export type ProductType = {
  __typename?: "ProductType";
  availableStock?: Maybe<Scalars["Int"]["output"]>;
  category?: Maybe<Scalars["String"]["output"]>;
  composition?: Maybe<Scalars["String"]["output"]>;
  defaultMrp?: Maybe<Scalars["Float"]["output"]>;
  hsnCode?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["UUID"]["output"];
  manufacturer?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  packSize: Scalars["String"]["output"];
};

export type Query = {
  __typename?: "Query";
  accountAuditLogs: Array<AccountAuditLogType>;
  advancePayments: Array<AdvancePaymentType>;
  automationCircuits: Array<AutomationCircuitType>;
  automationJobs: Array<AutomationJobType>;
  dashboardStats: DashboardStats;
  deliveryChallan?: Maybe<DeliveryChallanType>;
  deliveryChallans: Array<DeliveryChallanType>;
  deliveryRosters: Array<DeliveryRosterType>;
  deliveryShiftSummary: DeliveryShiftSummaryType;
  highRiskApprovals: Array<HighRiskApprovalType>;
  integrationHealth: IntegrationHealthType;
  invoiceReturns: Array<InvoiceReturnType>;
  me: UserType;
  myDeliveries: Array<DeliveryAssignmentType>;
  myLedger: Array<LedgerRecordType>;
  notificationPreferences: Scalars["String"]["output"];
  notifications: Array<NotificationType>;
  operationsIncidentSummary: OperationsIncidentSummaryType;
  order: OrderType;
  orders: PaginatedOrders;
  product: ProductType;
  products: PaginatedProducts;
  returnClaims: Array<ReturnClaimType>;
  shopkeepers: Array<ShopkeeperProfileType>;
  simulateBulkPriceUpdate: BulkPriceSimulationResult;
  stockAdjustments: Array<StockAdjustmentType>;
  stockBatches: Array<StockBatchType>;
  superAdminGovernanceOverview: SuperAdminGovernanceOverviewType;
  users: Array<UserType>;
  warehousePickingSlip: WarehousePickingSlipType;
};

export type QueryAccountAuditLogsArgs = {
  userId: Scalars["UUID"]["input"];
};

export type QueryAdvancePaymentsArgs = {
  page?: Scalars["Int"]["input"];
  perPage?: Scalars["Int"]["input"];
  shopkeeperId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type QueryAutomationJobsArgs = {
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryDeliveryChallanArgs = {
  id: Scalars["UUID"]["input"];
};

export type QueryDeliveryChallansArgs = {
  page?: Scalars["Int"]["input"];
  perPage?: Scalars["Int"]["input"];
};

export type QueryDeliveryRostersArgs = {
  deliveryBoyId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type QueryDeliveryShiftSummaryArgs = {
  deliveryBoyId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type QueryHighRiskApprovalsArgs = {
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryInvoiceReturnsArgs = {
  page?: Scalars["Int"]["input"];
  perPage?: Scalars["Int"]["input"];
};

export type QueryMyDeliveriesArgs = {
  deliveryBoyId?: InputMaybe<Scalars["UUID"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryMyLedgerArgs = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
  shopkeeperId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type QueryNotificationsArgs = {
  isRead?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type QueryOrderArgs = {
  id: Scalars["UUID"]["input"];
};

export type QueryOrdersArgs = {
  page?: Scalars["Int"]["input"];
  perPage?: Scalars["Int"]["input"];
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryProductArgs = {
  id: Scalars["UUID"]["input"];
};

export type QueryProductsArgs = {
  category?: InputMaybe<Scalars["String"]["input"]>;
  page?: Scalars["Int"]["input"];
  perPage?: Scalars["Int"]["input"];
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryReturnClaimsArgs = {
  page?: Scalars["Int"]["input"];
  perPage?: Scalars["Int"]["input"];
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryShopkeepersArgs = {
  page?: Scalars["Int"]["input"];
  perPage?: Scalars["Int"]["input"];
  search?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<Scalars["String"]["input"]>;
};

export type QuerySimulateBulkPriceUpdateArgs = {
  action: Scalars["String"]["input"];
  category?: InputMaybe<Scalars["String"]["input"]>;
  value: Scalars["Float"]["input"];
};

export type QueryStockAdjustmentsArgs = {
  batchId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type QueryStockBatchesArgs = {
  productId: Scalars["UUID"]["input"];
};

export type QueryUsersArgs = {
  page?: Scalars["Int"]["input"];
  perPage?: Scalars["Int"]["input"];
  role?: InputMaybe<Scalars["String"]["input"]>;
  search?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryWarehousePickingSlipArgs = {
  orderId: Scalars["UUID"]["input"];
};

export type RateOrderInput = {
  feedback?: InputMaybe<Scalars["String"]["input"]>;
  orderId: Scalars["UUID"]["input"];
  rating: Scalars["Int"]["input"];
};

export type RecordAdvancePaymentInput = {
  amount: Scalars["Float"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  paymentMethod?: Scalars["String"]["input"];
  referenceNo?: InputMaybe<Scalars["String"]["input"]>;
  shopkeeperId: Scalars["UUID"]["input"];
};

export type RegisterInput = {
  area?: InputMaybe<Scalars["String"]["input"]>;
  assignedArea?: InputMaybe<Scalars["String"]["input"]>;
  city?: InputMaybe<Scalars["String"]["input"]>;
  drugLicenseNo?: InputMaybe<Scalars["String"]["input"]>;
  email?: InputMaybe<Scalars["String"]["input"]>;
  fullName: Scalars["String"]["input"];
  gstin?: InputMaybe<Scalars["String"]["input"]>;
  password: Scalars["String"]["input"];
  phone: Scalars["String"]["input"];
  role: Scalars["String"]["input"];
  shopAddress?: InputMaybe<Scalars["String"]["input"]>;
  shopName?: InputMaybe<Scalars["String"]["input"]>;
  vehicleNumber?: InputMaybe<Scalars["String"]["input"]>;
  vehicleType?: InputMaybe<Scalars["String"]["input"]>;
};

export type ReportDeliveryFailureInput = {
  assignmentId: Scalars["UUID"]["input"];
  notes?: InputMaybe<Scalars["String"]["input"]>;
  photoUrl?: InputMaybe<Scalars["String"]["input"]>;
  reason: Scalars["String"]["input"];
};

export type ReturnClaimType = {
  __typename?: "ReturnClaimType";
  batchNumber?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  id: Scalars["UUID"]["output"];
  imageUrl?: Maybe<Scalars["String"]["output"]>;
  productId: Scalars["UUID"]["output"];
  productName?: Maybe<Scalars["String"]["output"]>;
  quantity: Scalars["Int"]["output"];
  reason: Scalars["String"]["output"];
  rejectionReason?: Maybe<Scalars["String"]["output"]>;
  remarks?: Maybe<Scalars["String"]["output"]>;
  requestNumber: Scalars["String"]["output"];
  reviewedBy?: Maybe<Scalars["UUID"]["output"]>;
  shopkeeperId: Scalars["UUID"]["output"];
  shopkeeperName?: Maybe<Scalars["String"]["output"]>;
  status: Scalars["String"]["output"];
  stockBatchId?: Maybe<Scalars["UUID"]["output"]>;
  updatedAt: Scalars["DateTime"]["output"];
};

export type ReviewReturnRequestInput = {
  action: Scalars["String"]["input"];
  rejectionReason?: InputMaybe<Scalars["String"]["input"]>;
  requestId: Scalars["UUID"]["input"];
};

export type ShopkeeperProfileType = {
  __typename?: "ShopkeeperProfileType";
  area?: Maybe<Scalars["String"]["output"]>;
  city?: Maybe<Scalars["String"]["output"]>;
  creditLimit: Scalars["Float"]["output"];
  creditLimitReason?: Maybe<Scalars["String"]["output"]>;
  drugLicenseNo?: Maybe<Scalars["String"]["output"]>;
  email?: Maybe<Scalars["String"]["output"]>;
  gstin?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["UUID"]["output"];
  outstandingBalance: Scalars["Float"]["output"];
  ownerName?: Maybe<Scalars["String"]["output"]>;
  phone?: Maybe<Scalars["String"]["output"]>;
  shopAddress: Scalars["String"]["output"];
  shopName: Scalars["String"]["output"];
  totalOrders?: Maybe<Scalars["Int"]["output"]>;
  userId?: Maybe<Scalars["UUID"]["output"]>;
  verificationNotes?: Maybe<Scalars["String"]["output"]>;
  verificationStatus: Scalars["String"]["output"];
};

export type StockAdjustmentType = {
  __typename?: "StockAdjustmentType";
  adjustedByName: Scalars["String"]["output"];
  adjustmentType: Scalars["String"]["output"];
  batchNumber: Scalars["String"]["output"];
  createdAt: Scalars["DateTime"]["output"];
  evidenceUrl?: Maybe<Scalars["String"]["output"]>;
  id: Scalars["UUID"]["output"];
  isRepeated: Scalars["Boolean"]["output"];
  productName: Scalars["String"]["output"];
  quantityDelta: Scalars["Int"]["output"];
  reason: Scalars["String"]["output"];
  stockBatchId: Scalars["UUID"]["output"];
};

export type StockBatchInput = {
  batchNumber: Scalars["String"]["input"];
  expiryDate: Scalars["Date"]["input"];
  mrp: Scalars["Float"]["input"];
  productId: Scalars["UUID"]["input"];
  purchaseRate: Scalars["Float"]["input"];
  quantityReceived: Scalars["Int"]["input"];
  supplierInvoiceNo?: InputMaybe<Scalars["String"]["input"]>;
};

export type StockBatchType = {
  __typename?: "StockBatchType";
  batchNumber: Scalars["String"]["output"];
  expiryDate: Scalars["Date"]["output"];
  id: Scalars["UUID"]["output"];
  mrp: Scalars["Float"]["output"];
  purchaseRate: Scalars["Float"]["output"];
  quantityAvailable: Scalars["Int"]["output"];
  quantitySold: Scalars["Int"]["output"];
};

export type SubmitReturnRequestInput = {
  imageUrl?: InputMaybe<Scalars["String"]["input"]>;
  productId: Scalars["UUID"]["input"];
  quantity: Scalars["Int"]["input"];
  reason: Scalars["String"]["input"];
  remarks?: InputMaybe<Scalars["String"]["input"]>;
  stockBatchId?: InputMaybe<Scalars["UUID"]["input"]>;
};

export type SuperAdminGovernanceOverviewType = {
  __typename?: "SuperAdminGovernanceOverviewType";
  automationRulesVersion: Scalars["String"]["output"];
  bankReconciledPercentage: Scalars["Float"]["output"];
  catalogChangeHistory: Array<ProductChangeAuditItemType>;
  mfaEnforced: Scalars["Boolean"]["output"];
  pendingExternalSettlementsCount: Scalars["Int"]["output"];
  pendingSupplierInvoicesCount: Scalars["Int"]["output"];
  privilegedAccountsCount: Scalars["Int"]["output"];
  purchaseReconciliationExceptionsCount: Scalars["Int"]["output"];
  supplierDiscrepanciesCount: Scalars["Int"]["output"];
  supplierReconciliations: Array<SupplierReconciliationItemType>;
  unresolvedAuditExceptionsCount: Scalars["Int"]["output"];
  unusualPricingAlertsCount: Scalars["Int"]["output"];
  unusualSigninAlertsCount: Scalars["Int"]["output"];
};

export type SupplierReconciliationItemType = {
  __typename?: "SupplierReconciliationItemType";
  createdAt: Scalars["DateTime"]["output"];
  discrepancyAmount: Scalars["Float"]["output"];
  discrepancyType: Scalars["String"]["output"];
  id: Scalars["String"]["output"];
  invoiceAmount: Scalars["Float"]["output"];
  invoiceNumber: Scalars["String"]["output"];
  notes?: Maybe<Scalars["String"]["output"]>;
  poNumber: Scalars["String"]["output"];
  receivedAmount: Scalars["Float"]["output"];
  status: Scalars["String"]["output"];
  supplierName: Scalars["String"]["output"];
};

export type UpdateNotificationPreferencesInput = {
  inApp: Scalars["Boolean"]["input"];
  sms: Scalars["Boolean"]["input"];
  whatsapp: Scalars["Boolean"]["input"];
};

export type UserType = {
  __typename?: "UserType";
  assignedWorkQueue?: Maybe<Scalars["String"]["output"]>;
  createdAt: Scalars["DateTime"]["output"];
  email?: Maybe<Scalars["String"]["output"]>;
  fullName: Scalars["String"]["output"];
  id: Scalars["UUID"]["output"];
  isActive: Scalars["Boolean"]["output"];
  phone?: Maybe<Scalars["String"]["output"]>;
  role: Scalars["String"]["output"];
};

export type WarehousePickingLineType = {
  __typename?: "WarehousePickingLineType";
  barcode: Scalars["String"]["output"];
  barcodeVerified: Scalars["Boolean"]["output"];
  batchNumber: Scalars["String"]["output"];
  expiryDate: Scalars["String"]["output"];
  isPicked: Scalars["Boolean"]["output"];
  itemId: Scalars["UUID"]["output"];
  packSize: Scalars["String"]["output"];
  productName: Scalars["String"]["output"];
  quantityToPick: Scalars["Int"]["output"];
  rackLocation: Scalars["String"]["output"];
};

export type WarehousePickingSlipType = {
  __typename?: "WarehousePickingSlipType";
  deliveryArea: Scalars["String"]["output"];
  isFullyPicked: Scalars["Boolean"]["output"];
  orderId: Scalars["UUID"]["output"];
  orderNumber: Scalars["String"]["output"];
  pickingLines: Array<WarehousePickingLineType>;
  priority: Scalars["String"]["output"];
  shopkeeperName: Scalars["String"]["output"];
  totalItemsCount: Scalars["Int"]["output"];
};
