"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_DELIVERY_CHALLANS_QUERY,
  CREATE_DELIVERY_CHALLAN_MUTATION,
  GET_INVOICE_RETURNS_QUERY,
  CREATE_INVOICE_RETURN_MUTATION,
  GET_ADVANCE_PAYMENTS_QUERY,
  RECORD_ADVANCE_PAYMENT_MUTATION,
  ORDERS_QUERY,
  USERS_QUERY,
  MY_LEDGER_QUERY,
  RETURN_CLAIMS_QUERY,
  SUBMIT_RETURN_CLAIM_MUTATION,
  REVIEW_RETURN_CLAIM_MUTATION,
  PRODUCTS_QUERY,
} from "@/lib/graphql-queries";
import { useAuth } from "@/hooks/use-auth";
import { SideDrawer } from "@/components/ui/side-drawer";

type ActiveTab =
  "INVOICES" | "CHALLANS" | "RETURNS" | "ADVANCES" | "LEDGER" | "CLAIMS";

interface TaxInvoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerGstin: string;
  customerDl: string;
  subtotal: number;
  totalDiscount: number;
  taxableValue: number;
  sgst: number;
  cgst: number;
  grandTotal: number;
  status: "PAID" | "DELIVERING" | "PENDING";
  lines: Array<{
    name: string;
    pack: string;
    hsn: string;
    batch: string;
    exp: string;
    qty: number;
    free: number;
    rate: number;
    mrp: number;
    dis1: number;
    taxable: number;
    sgst: number;
    cgst: number;
    total: number;
  }>;
}

export default function InvoicesPage() {
  const { user } = useAuth();
  const isAdminOrWarehouse =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "ADMIN" ||
    user?.role === "WAREHOUSE";

  const [activeTab, setActiveTab] = useState<ActiveTab>("INVOICES");
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoice | null>(
    null,
  );

  // SideDrawers state
  const [showChallanDrawer, setShowChallanDrawer] = useState(false);
  const [showReturnDrawer, setShowReturnDrawer] = useState(false);
  const [showAdvanceDrawer, setShowAdvanceDrawer] = useState(false);
  const [showClaimDrawer, setShowClaimDrawer] = useState(false);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);
  const [selectedClaimForReview, setSelectedClaimForReview] =
    useState<any>(null);

  // Filter & Ledger selection
  const [selectedShopkeeperForLedger, setSelectedShopkeeperForLedger] =
    useState<string>("");
  const [claimStatusFilter, setClaimStatusFilter] = useState<string>("ALL");
  const [advanceAllocationFilter, setAdvanceAllocationFilter] = useState<
    "ALL" | "UNALLOCATED" | "SETTLED"
  >("ALL");

  // Success / Error feedback
  const [bannerSuccess, setBannerSuccess] = useState("");
  const [bannerError, setBannerError] = useState("");

  // Apollo Queries
  const { data: challansData, refetch: refetchChallans } = useQuery(
    GET_DELIVERY_CHALLANS_QUERY,
    {
      fetchPolicy: "network-only",
    },
  );
  const { data: returnsData, refetch: refetchReturns } = useQuery(
    GET_INVOICE_RETURNS_QUERY,
    {
      fetchPolicy: "network-only",
    },
  );
  const { data: advancesData, refetch: refetchAdvances } = useQuery(
    GET_ADVANCE_PAYMENTS_QUERY,
    {
      fetchPolicy: "network-only",
    },
  );
  const { data: ordersData } = useQuery(ORDERS_QUERY, {
    variables: { page: 1, perPage: 50 },
    fetchPolicy: "cache-first",
  });
  const { data: usersData } = useQuery(USERS_QUERY, {
    variables: { role: "SHOPKEEPER" },
    fetchPolicy: "cache-first",
  });

  const { data: ledgerData, refetch: refetchLedger } = useQuery(
    MY_LEDGER_QUERY,
    {
      variables: {
        shopkeeperId: selectedShopkeeperForLedger
          ? selectedShopkeeperForLedger
          : undefined,
        limit: 100,
      },
      fetchPolicy: "network-only",
    },
  );

  const { data: claimsData, refetch: refetchClaims } = useQuery(
    RETURN_CLAIMS_QUERY,
    {
      variables: {
        status: claimStatusFilter === "ALL" ? undefined : claimStatusFilter,
        page: 1,
        perPage: 50,
      },
      fetchPolicy: "network-only",
    },
  );

  const { data: productsData } = useQuery(PRODUCTS_QUERY, {
    variables: { page: 1, perPage: 100 },
    fetchPolicy: "cache-first",
  });

  // Apollo Mutations
  const [createChallanMutation, { loading: creatingChallan }] = useMutation(
    CREATE_DELIVERY_CHALLAN_MUTATION,
  );
  const [createReturnMutation, { loading: creatingReturn }] = useMutation(
    CREATE_INVOICE_RETURN_MUTATION,
  );
  const [recordAdvanceMutation, { loading: recordingAdvance }] = useMutation(
    RECORD_ADVANCE_PAYMENT_MUTATION,
  );
  const [submitClaimMutation, { loading: submittingClaim }] = useMutation(
    SUBMIT_RETURN_CLAIM_MUTATION,
  );
  const [reviewClaimMutation, { loading: reviewingClaim }] = useMutation(
    REVIEW_RETURN_CLAIM_MUTATION,
  );

  // Form States
  const [challanForm, setChallanForm] = useState({
    orderId: "",
    transporterName: "Local Express Courier",
    vehicleNumber: "WB-02-AK-4589",
    totalCartons: 2,
  });

  const [returnForm, setReturnForm] = useState({
    invoiceId: "",
    reason: "Damaged packaging / Near expiry",
    restockStatus: "RESTOCKED",
    quantity: 5,
    rate: 100.0,
    discountPct: 0.0,
  });

  const [advanceForm, setAdvanceForm] = useState({
    shopkeeperId: "",
    amount: 5000,
    paymentMethod: "UPI",
    referenceNo: "UPI/32948291039",
    notes: "Advance deposit for monthly wholesale order",
  });

  const [claimForm, setClaimForm] = useState({
    productId: "",
    batchNumber: "",
    quantity: 1,
    reason: "Damaged packaging / Seal Broken",
    remarks: "",
    imageUrl: "",
  });

  const [reviewForm, setReviewForm] = useState({
    action: "APPROVE",
    rejectionReason: "",
  });

  // Static/Fallback Invoices
  const staticInvoices: TaxInvoice[] = [
    {
      id: "inv-1",
      invoiceNumber: "INV-2026-004448",
      orderNumber: "ORD-2026-004448",
      date: "13/10/2026",
      customerName: "Cheap Medical Stores",
      customerAddress: "Main Market, Benachity, Durgapur-13",
      customerGstin: "19AAACC1234D1Z5",
      customerDl: "WB-BUR-20B-10492",
      subtotal: 13626.16,
      totalDiscount: 1490.14,
      taxableValue: 12136.02,
      sgst: 303.4,
      cgst: 303.4,
      grandTotal: 12742.82,
      status: "DELIVERING",
      lines: [
        {
          name: "AZITHRAL 500MG TAB",
          pack: "10S",
          hsn: "30041090",
          batch: "2613000703",
          exp: "12/28",
          qty: 36,
          free: 3,
          rate: 96.56,
          mrp: 126.73,
          dis1: 12.0,
          taxable: 3059.02,
          sgst: 76.48,
          cgst: 76.48,
          total: 3211.97,
        },
        {
          name: "HIFENAC MR TAB",
          pack: "10S",
          hsn: "30049069",
          batch: "2614002301",
          exp: "08/28",
          qty: 20,
          free: 1,
          rate: 72.5,
          mrp: 88.01,
          dis1: 14.0,
          taxable: 1247.0,
          sgst: 31.18,
          cgst: 31.18,
          total: 1309.35,
        },
        {
          name: "PAN D CAP",
          pack: "15S",
          hsn: "30049099",
          batch: "2611004510",
          exp: "05/28",
          qty: 60,
          free: 4,
          rate: 145.0,
          mrp: 199.0,
          dis1: 10.0,
          taxable: 7830.0,
          sgst: 195.75,
          cgst: 195.75,
          total: 8221.5,
        },
      ],
    },
    {
      id: "inv-2",
      invoiceNumber: "INV-2026-000538",
      orderNumber: "ORD-2026-000538",
      date: "13/10/2026",
      customerName: "Gupta Pharmacy & Clinic",
      customerAddress: "A-22 City Centre, Durgapur-16",
      customerGstin: "19BBBDD5678E1Z9",
      customerDl: "WB-BUR-20B-11883",
      subtotal: 8540.0,
      totalDiscount: 1061.0,
      taxableValue: 7479.0,
      sgst: 186.97,
      cgst: 186.97,
      grandTotal: 7852.95,
      status: "PENDING",
      lines: [
        {
          name: "TELMA 40MG TAB",
          pack: "15S",
          hsn: "30049069",
          batch: "2612008920",
          exp: "10/28",
          qty: 40,
          free: 2,
          rate: 110.0,
          mrp: 145.5,
          dis1: 10.0,
          taxable: 3960.0,
          sgst: 99.0,
          cgst: 99.0,
          total: 4158.0,
        },
        {
          name: "MONTEK LC TAB",
          pack: "10S",
          hsn: "30049099",
          batch: "2615003112",
          exp: "11/28",
          qty: 30,
          free: 2,
          rate: 138.0,
          mrp: 185.0,
          dis1: 15.0,
          taxable: 3519.0,
          sgst: 87.97,
          cgst: 87.97,
          total: 3694.95,
        },
      ],
    },
  ];

  // Handlers
  const handleCreateChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSuccess("");
    setBannerError("");

    if (!challanForm.orderId) {
      alert("Please select an Order");
      return;
    }

    try {
      const res = await createChallanMutation({
        variables: {
          input: {
            orderId: challanForm.orderId,
            transporterName: challanForm.transporterName,
            vehicleNumber: challanForm.vehicleNumber,
            totalCartons: Number(challanForm.totalCartons),
          },
        },
      });

      if (res.data?.createDeliveryChallan) {
        setBannerSuccess(
          `Delivery Challan ${res.data.createDeliveryChallan.challanNumber} issued successfully!`,
        );
        setShowChallanDrawer(false);
        refetchChallans();
      }
    } catch (err: unknown) {
      setBannerError(
        err instanceof Error
          ? err.message
          : "Failed to issue delivery challan.",
      );
    }
  };

  const handleCreateReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSuccess("");
    setBannerError("");

    if (!returnForm.invoiceId) {
      alert("Please enter or select an Invoice ID");
      return;
    }

    try {
      const res = await createReturnMutation({
        variables: {
          input: {
            invoiceId: returnForm.invoiceId,
            reason: returnForm.reason,
            restockStatus: returnForm.restockStatus,
            items: [
              {
                productId: "00000000-0000-0000-0000-000000000001",
                stockBatchId: "00000000-0000-0000-0000-000000000001",
                quantity: Number(returnForm.quantity),
                rate: Number(returnForm.rate),
                discountPct: Number(returnForm.discountPct),
              },
            ],
          },
        },
      });

      if (res.data?.createInvoiceReturn) {
        setBannerSuccess(
          `Credit Note ${res.data.createInvoiceReturn.creditNoteNo} issued! Refund: ₹${res.data.createInvoiceReturn.grandRefund}`,
        );
        setShowReturnDrawer(false);
        refetchReturns();
      }
    } catch (err: unknown) {
      setBannerError(
        err instanceof Error ? err.message : "Failed to issue credit note.",
      );
    }
  };

  const handleRecordAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSuccess("");
    setBannerError("");

    if (!advanceForm.shopkeeperId) {
      alert("Please select a Retail Shopkeeper");
      return;
    }

    try {
      const res = await recordAdvanceMutation({
        variables: {
          input: {
            shopkeeperId: advanceForm.shopkeeperId,
            amount: Number(advanceForm.amount),
            paymentMethod: advanceForm.paymentMethod,
            referenceNo: advanceForm.referenceNo,
            notes: advanceForm.notes,
          },
        },
      });

      if (res.data?.recordAdvancePayment) {
        setBannerSuccess(
          `Advance Receipt ${res.data.recordAdvancePayment.receiptNumber} recorded! Ledger balance updated.`,
        );
        setShowAdvanceDrawer(false);
        refetchAdvances();
      }
    } catch (err: unknown) {
      setBannerError(
        err instanceof Error
          ? err.message
          : "Failed to record advance payment.",
      );
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSuccess("");
    setBannerError("");

    if (!claimForm.productId) {
      alert("Please select a medicine/product");
      return;
    }
    if (claimForm.quantity <= 0) {
      alert("Quantity must be at least 1");
      return;
    }

    try {
      const res = await submitClaimMutation({
        variables: {
          input: {
            productId: claimForm.productId,
            quantity: Number(claimForm.quantity),
            reason: claimForm.reason,
            remarks: claimForm.remarks ? claimForm.remarks : null,
            imageUrl: claimForm.imageUrl ? claimForm.imageUrl : null,
          },
        },
      });

      if (res.data?.submitReturnClaim) {
        setBannerSuccess(
          `Return claim ${res.data.submitReturnClaim.requestNumber} submitted! Warehouse team will inspect.`,
        );
        setShowClaimDrawer(false);
        setClaimForm({
          productId: "",
          batchNumber: "",
          quantity: 1,
          reason: "Damaged packaging / Seal Broken",
          remarks: "",
          imageUrl: "",
        });
        refetchClaims();
      }
    } catch (err: unknown) {
      setBannerError(
        err instanceof Error ? err.message : "Failed to submit return claim.",
      );
    }
  };

  const handleReviewClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerSuccess("");
    setBannerError("");

    if (!selectedClaimForReview) return;
    if (reviewForm.action === "REJECT" && !reviewForm.rejectionReason) {
      alert("Please provide reason for rejection.");
      return;
    }

    try {
      const res = await reviewClaimMutation({
        variables: {
          input: {
            requestId: selectedClaimForReview.id,
            action: reviewForm.action,
            rejectionReason:
              reviewForm.action === "REJECT"
                ? reviewForm.rejectionReason
                : null,
          },
        },
      });

      if (res.data?.reviewReturnClaim) {
        setBannerSuccess(
          `Claim status updated to ${res.data.reviewReturnClaim.status}!`,
        );
        setShowReviewDrawer(false);
        setSelectedClaimForReview(null);
        setReviewForm({ action: "APPROVE", rejectionReason: "" });
        refetchClaims();
      }
    } catch (err: unknown) {
      setBannerError(
        err instanceof Error ? err.message : "Failed to review return claim.",
      );
    }
  };

  const fallbackLedger = [
    {
      id: "led-1",
      entryType: "DEBIT",
      amount: 12742.82,
      balanceAfter: 12742.82,
      referenceNumber: "INV-2026-004448",
      description: "Tax invoice delivered (Order ORD-2026-004448)",
      createdAt: "2026-10-13T10:30:00Z",
      shopkeeperName: "Cheap Medical Stores",
    },
    {
      id: "led-2",
      entryType: "CREDIT",
      amount: 5000.0,
      balanceAfter: 7742.82,
      referenceNumber: "ADV-2026-0001",
      description: "Advance deposit via UPI Ref: UPI/32948291039",
      createdAt: "2026-10-14T11:00:00Z",
      shopkeeperName: "Cheap Medical Stores",
    },
    {
      id: "led-3",
      entryType: "CREDIT",
      amount: 500.0,
      balanceAfter: 7242.82,
      referenceNumber: "CN-2026-0001",
      description: "GST Credit note issued for damaged packaging",
      createdAt: "2026-10-15T14:15:00Z",
      shopkeeperName: "Cheap Medical Stores",
    },
    {
      id: "led-4",
      entryType: "CREDIT",
      amount: 7242.82,
      balanceAfter: 0.0,
      referenceNumber: "POD-4819",
      description: "Counter delivery OTP remittance collected in cash",
      createdAt: "2026-10-16T16:45:00Z",
      shopkeeperName: "Cheap Medical Stores",
    },
  ];

  const fallbackClaims = [
    {
      id: "ret-1",
      requestNumber: "RET-2026-0001",
      productName: "AZITHRAL 500MG TAB",
      batchNumber: "2613000703",
      quantity: 5,
      reason: "Damaged packaging / Seal Broken",
      remarks: "2 blisters crushed during courier transit",
      imageUrl: "",
      status: "PENDING",
      rejectionReason: null,
      createdAt: "2026-10-14T09:15:00Z",
      shopkeeperName: "Cheap Medical Stores",
    },
    {
      id: "ret-2",
      requestNumber: "RET-2026-0002",
      productName: "PAN D CAP",
      batchNumber: "2611004510",
      quantity: 10,
      reason: "Near Expiry / Broken Seal",
      remarks: "Batch exp within 45 days, returned for GST reversal",
      imageUrl: "",
      status: "APPROVED",
      rejectionReason: null,
      createdAt: "2026-10-12T14:20:00Z",
      shopkeeperName: "Gupta Pharmacy & Clinic",
    },
  ];

  const deliveryChallans = challansData?.deliveryChallans || [];
  const invoiceReturns = returnsData?.invoiceReturns || [];
  const fallbackAdvances = [
    {
      id: "adv-1",
      receiptNumber: "ADV-2026-0001",
      paidAt: "2026-10-14T11:00:00Z",
      shopkeeperName: "Cheap Medical Stores",
      amount: 15000.0,
      allocatedAmount: 10000.0,
      unallocatedAmount: 5000.0,
      paymentMethod: "UPI",
      referenceNo: "UPI/32948291039",
      notes: "Advance payment for weekly antibiotics stocking",
    },
    {
      id: "adv-2",
      receiptNumber: "ADV-2026-0002",
      paidAt: "2026-10-18T09:30:00Z",
      shopkeeperName: "Cheap Medical Stores",
      amount: 8500.0,
      allocatedAmount: 0.0,
      unallocatedAmount: 8500.0,
      paymentMethod: "BANK_TRANSFER",
      referenceNo: "NEFT/SBIN00482910",
      notes: "Advance deposit for seasonal order reserve",
    },
    {
      id: "adv-3",
      receiptNumber: "ADV-2026-0003",
      paidAt: "2026-10-05T14:00:00Z",
      shopkeeperName: "Gupta Pharmacy & Clinic",
      amount: 12000.0,
      allocatedAmount: 12000.0,
      unallocatedAmount: 0.0,
      paymentMethod: "CASH",
      referenceNo: "CSH-REC-9912",
      notes: "Advance settled against invoice INV-2026-004445",
    },
  ];

  const rawAdvances = advancesData?.advancePayments?.length
    ? advancesData.advancePayments
    : fallbackAdvances;
  const processedAdvances = rawAdvances.map((adv: any) => {
    const allocated =
      typeof adv.allocatedAmount === "number" ? adv.allocatedAmount : 0.0;
    const unallocated =
      typeof adv.unallocatedAmount === "number"
        ? adv.unallocatedAmount
        : Math.max(0, (adv.amount || 0) - allocated);
    const allocationStatus =
      unallocated === 0
        ? "FULLY_ALLOCATED"
        : allocated > 0
          ? "PARTIALLY_ALLOCATED"
          : "UNALLOCATED";
    return {
      ...adv,
      allocatedAmount: allocated,
      unallocatedAmount: unallocated,
      allocationStatus,
    };
  });

  const totalAdvancesDeposited = processedAdvances.reduce(
    (sum: number, a: any) => sum + (a.amount || 0),
    0,
  );
  const totalAdvancesAllocated = processedAdvances.reduce(
    (sum: number, a: any) => sum + (a.allocatedAmount || 0),
    0,
  );
  const totalAdvancesUnallocated = processedAdvances.reduce(
    (sum: number, a: any) => sum + (a.unallocatedAmount || 0),
    0,
  );

  const filteredAdvances = processedAdvances.filter((adv: any) => {
    if (advanceAllocationFilter === "UNALLOCATED")
      return adv.unallocatedAmount > 0;
    if (advanceAllocationFilter === "SETTLED")
      return adv.unallocatedAmount === 0;
    return true;
  });

  const advancePayments = filteredAdvances;
  const availableOrders = ordersData?.orders?.items || [];
  const shopkeepersList = usersData?.users || [];
  const productsList = productsData?.products?.items || [];
  const ledgerEntries = ledgerData?.myLedger?.length
    ? ledgerData.myLedger
    : fallbackLedger;
  const returnClaims = claimsData?.returnClaims?.length
    ? claimsData.returnClaims
    : fallbackClaims;

  const totalLedgerDebits = ledgerEntries
    .filter((e: any) => e.entryType === "DEBIT")
    .reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
  const totalLedgerCredits = ledgerEntries
    .filter((e: any) => e.entryType === "CREDIT")
    .reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
  const currentLedgerBalance =
    ledgerEntries.length > 0 ? ledgerEntries[0].balanceAfter : 0.0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-4)",
          marginBottom: "var(--space-5)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800 }}>
            Invoices, Challans &amp; Returns Hub
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            B2B GST Tax Invoices, Transporter Delivery Challans, Credit Notes,
            Ledger and Returns
          </p>
        </div>

        <div
          style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}
        >
          {activeTab === "CHALLANS" && (
            <button
              className="btn btn-primary"
              onClick={() => setShowChallanDrawer(true)}
            >
              + Issue Delivery Challan
            </button>
          )}
          {activeTab === "RETURNS" && (
            <button
              className="btn btn-primary"
              onClick={() => setShowReturnDrawer(true)}
            >
              + Issue Credit Note
            </button>
          )}
          {activeTab === "ADVANCES" && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAdvanceDrawer(true)}
            >
              + Record Advance Payment
            </button>
          )}
          {activeTab === "CLAIMS" && (
            <button
              className="btn btn-primary"
              onClick={() => setShowClaimDrawer(true)}
            >
              + Raise Return Claim
            </button>
          )}
          {activeTab === "LEDGER" && (
            <button
              className="btn btn-secondary"
              onClick={() => window.print()}
            >
              🖨️ Print Party Statement
            </button>
          )}
        </div>
      </div>

      {bannerSuccess && (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "rgba(16, 185, 129, 0.12)",
            color: "var(--color-primary-800)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-4)",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          ✅ {bannerSuccess}
        </div>
      )}

      {bannerError && (
        <div
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "rgba(239, 68, 68, 0.12)",
            color: "var(--color-error)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-4)",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          ⚠️ {bannerError}
        </div>
      )}

      {/* Tabs Bar */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "var(--space-6)",
          overflowX: "auto",
        }}
      >
        <button
          className={`btn ${activeTab === "INVOICES" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            borderBottom: "none",
          }}
          onClick={() => setActiveTab("INVOICES")}
        >
          📄 GST Tax Invoices ({staticInvoices.length})
        </button>
        <button
          className={`btn ${activeTab === "CHALLANS" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            borderBottom: "none",
          }}
          onClick={() => setActiveTab("CHALLANS")}
        >
          📦 Delivery Challans ({deliveryChallans.length})
        </button>
        <button
          className={`btn ${activeTab === "RETURNS" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            borderBottom: "none",
          }}
          onClick={() => setActiveTab("RETURNS")}
        >
          🔄 Credit Notes &amp; Returns ({invoiceReturns.length})
        </button>
        <button
          className={`btn ${activeTab === "ADVANCES" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            borderBottom: "none",
          }}
          onClick={() => setActiveTab("ADVANCES")}
        >
          💰 Advance Payments ({advancePayments.length})
        </button>
        <button
          className={`btn ${activeTab === "LEDGER" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            borderBottom: "none",
          }}
          onClick={() => setActiveTab("LEDGER")}
        >
          📒 Party Statement &amp; Ledger ({ledgerEntries.length})
        </button>
        <button
          className={`btn ${activeTab === "CLAIMS" ? "btn-primary" : "btn-secondary"}`}
          style={{
            borderRadius: "var(--radius-md) var(--radius-md) 0 0",
            borderBottom: "none",
          }}
          onClick={() => setActiveTab("CLAIMS")}
        >
          🛡️ Return / Damage Claims ({returnClaims.length})
        </button>
      </div>

      {/* TAB 1: GST TAX INVOICES */}
      {activeTab === "INVOICES" && (
        <>
          {/* Summary Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--space-4)",
              marginBottom: "var(--space-6)",
            }}
          >
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                TOTAL INVOICED
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  color: "var(--color-primary-700)",
                }}
              >
                ₹27,004.71
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Current billing cycle
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                SGST OUTPUT (2.5%)
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  color: "var(--color-primary-600)",
                }}
              >
                ₹642.96
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                West Bengal State GST
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                CGST OUTPUT (2.5%)
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  color: "var(--color-primary-600)",
                }}
              >
                ₹642.96
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Central GST
              </p>
            </div>
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                CASH RECEIVED
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  color: "var(--color-success)",
                }}
              >
                ₹6,408.94
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Settled via UPI / NEFT
              </p>
            </div>
          </div>

          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Order Ref</th>
                    <th>Date</th>
                    <th>Billed To (Shopkeeper)</th>
                    <th>GSTIN</th>
                    <th>Taxable (₹)</th>
                    <th>Total GST (₹)</th>
                    <th>Grand Total (₹)</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {staticInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--color-primary-700)",
                          }}
                        >
                          {inv.invoiceNumber}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {inv.orderNumber}
                        </span>
                      </td>
                      <td>{inv.date}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>
                          {inv.customerName}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {inv.customerAddress}
                        </div>
                      </td>
                      <td>
                        <code style={{ fontSize: "0.75rem" }}>
                          {inv.customerGstin}
                        </code>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        ₹{inv.taxableValue.toFixed(2)}
                      </td>
                      <td style={{ color: "var(--color-primary-600)" }}>
                        ₹{(inv.sgst + inv.cgst).toFixed(2)}
                      </td>
                      <td style={{ fontWeight: 800, fontSize: "1rem" }}>
                        ₹{inv.grandTotal.toFixed(2)}
                      </td>
                      <td>
                        {inv.status === "PAID" && (
                          <span className="badge badge-success">✓ Settled</span>
                        )}
                        {inv.status === "DELIVERING" && (
                          <span className="badge badge-info">
                            🚚 In Transit
                          </span>
                        )}
                        {inv.status === "PENDING" && (
                          <span className="badge badge-warning">
                            ⏳ Generated
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                          }}
                          onClick={() => setSelectedInvoice(inv)}
                        >
                          📄 View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: DELIVERY CHALLANS */}
      {activeTab === "CHALLANS" && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Challan #</th>
                  <th>Order Reference</th>
                  <th>Date</th>
                  <th>Transporter</th>
                  <th>Vehicle Number</th>
                  <th>Cartons</th>
                  <th>Packed Batches</th>
                  <th>Returns Logged</th>
                </tr>
              </thead>
              <tbody>
                {deliveryChallans.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: "center",
                        padding: "var(--space-8)",
                        color: "var(--text-muted)",
                      }}
                    >
                      No delivery challans recorded yet. Click{" "}
                      <strong>+ Issue Delivery Challan</strong> to create one
                      for packed orders.
                    </td>
                  </tr>
                ) : (
                  deliveryChallans.map((dc: any) => (
                    <tr key={dc.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--color-primary-700)",
                          }}
                        >
                          {dc.challanNumber}
                        </span>
                      </td>
                      <td>
                        <code style={{ fontSize: "0.8rem" }}>
                          {dc.orderId.slice(0, 8)}...
                        </code>
                      </td>
                      <td>{dc.challanDate}</td>
                      <td style={{ fontWeight: 600 }}>
                        {dc.transporterName || "Internal Fleet"}
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {dc.vehicleNumber || "Two-Wheeler"}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800 }}>
                        📦 {dc.totalCartons} Cartons
                      </td>
                      <td>{dc.items?.length || 0} batches</td>
                      <td>
                        {dc.returns?.length > 0 ? (
                          <span className="badge badge-warning">
                            ⚠️ {dc.returns.length} Return
                          </span>
                        ) : (
                          <span className="badge badge-success">✓ Clear</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INVOICE RETURNS & CREDIT NOTES */}
      {activeTab === "RETURNS" && (
        <div className="card">
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Credit Note #</th>
                  <th>Date</th>
                  <th>Invoice ID</th>
                  <th>Taxable Subtotal</th>
                  <th>SGST Reversal</th>
                  <th>CGST Reversal</th>
                  <th>Grand Refund (₹)</th>
                  <th>Restock Policy</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {invoiceReturns.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: "var(--space-8)",
                        color: "var(--text-muted)",
                      }}
                    >
                      No credit notes issued yet. Use{" "}
                      <strong>+ Issue Credit Note</strong> to reverse GST and
                      adjust retailer balances.
                    </td>
                  </tr>
                ) : (
                  invoiceReturns.map((crn: any) => (
                    <tr key={crn.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "var(--color-error)",
                          }}
                        >
                          {crn.creditNoteNo}
                        </span>
                      </td>
                      <td>{crn.returnDate}</td>
                      <td>
                        <code style={{ fontSize: "0.8rem" }}>
                          {crn.invoiceId.slice(0, 8)}...
                        </code>
                      </td>
                      <td>₹{crn.refundSubtotal.toFixed(2)}</td>
                      <td>₹{crn.refundSgst.toFixed(2)}</td>
                      <td>₹{crn.refundCgst.toFixed(2)}</td>
                      <td
                        style={{
                          fontWeight: 800,
                          color: "var(--color-error)",
                          fontSize: "1rem",
                        }}
                      >
                        -₹{crn.grandRefund.toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`badge ${crn.restockStatus === "RESTOCKED" ? "badge-success" : "badge-warning"}`}
                        >
                          {crn.restockStatus}
                        </span>
                      </td>
                      <td
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {crn.reason || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ADVANCE PAYMENTS & UNALLOCATED RECEIPTS */}
      {activeTab === "ADVANCES" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {/* Unallocated Advance Overview Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                TOTAL ADVANCES DEPOSITED
              </p>
              <p
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--color-primary-700)",
                  margin: "4px 0",
                }}
              >
                ₹{totalAdvancesDeposited.toFixed(2)}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Cumulative funds collected in advance
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                SETTLED AGAINST INVOICES
              </p>
              <p
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  margin: "4px 0",
                }}
              >
                ₹{totalAdvancesAllocated.toFixed(2)}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                Offset against finalized delivery tax invoices
              </p>
            </div>

            <div
              className="card"
              style={{
                padding: "var(--space-4)",
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-success)",
                    fontWeight: 700,
                  }}
                >
                  🟢 UNALLOCATED ADVANCE SURPLUS
                </p>
                <span
                  className="badge badge-success"
                  style={{ fontSize: "0.7rem" }}
                >
                  Available Credit
                </span>
              </div>
              <p
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: "var(--color-success)",
                  margin: "4px 0",
                }}
              >
                ₹{totalAdvancesUnallocated.toFixed(2)}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                Surplus deposit ready for instant deduction on next order
              </p>
            </div>
          </div>

          {/* Table Card with Filter Controls */}
          <div className="card">
            <div
              style={{
                padding: "var(--space-3) var(--space-4)",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "var(--space-2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                  Filter Allocation Status:
                </span>
                <div
                  style={{
                    display: "inline-flex",
                    gap: "4px",
                    background: "rgba(0,0,0,0.04)",
                    padding: "2px",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setAdvanceAllocationFilter("ALL")}
                    style={{
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background:
                        advanceAllocationFilter === "ALL"
                          ? "var(--color-primary-600)"
                          : "transparent",
                      color:
                        advanceAllocationFilter === "ALL"
                          ? "#ffffff"
                          : "var(--text-secondary)",
                    }}
                  >
                    All ({processedAdvances.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvanceAllocationFilter("UNALLOCATED")}
                    style={{
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background:
                        advanceAllocationFilter === "UNALLOCATED"
                          ? "var(--color-success)"
                          : "transparent",
                      color:
                        advanceAllocationFilter === "UNALLOCATED"
                          ? "#ffffff"
                          : "var(--text-secondary)",
                    }}
                  >
                    🟢 Unallocated Surplus (
                    {
                      processedAdvances.filter(
                        (a: any) => a.unallocatedAmount > 0,
                      ).length
                    }
                    )
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdvanceAllocationFilter("SETTLED")}
                    style={{
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      background:
                        advanceAllocationFilter === "SETTLED"
                          ? "var(--color-primary-800)"
                          : "transparent",
                      color:
                        advanceAllocationFilter === "SETTLED"
                          ? "#ffffff"
                          : "var(--text-secondary)",
                    }}
                  >
                    ✓ Fully Settled (
                    {
                      processedAdvances.filter(
                        (a: any) => a.unallocatedAmount === 0,
                      ).length
                    }
                    )
                  </button>
                </div>
              </div>

              {totalAdvancesUnallocated > 0 && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-success)",
                    fontWeight: 600,
                  }}
                >
                  💡 ₹{totalAdvancesUnallocated.toFixed(2)} surplus credit
                  available on account
                </div>
              )}
            </div>

            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Receipt #</th>
                    <th>Date</th>
                    <th>Retail Partner</th>
                    <th>Deposited (₹)</th>
                    <th>Settled (₹)</th>
                    <th>Unallocated Surplus (₹)</th>
                    <th>Allocation Status</th>
                    <th>Mode & Reference</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdvances.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          padding: "var(--space-8)",
                          color: "var(--text-muted)",
                        }}
                      >
                        No advance receipts matching current filter. Click{" "}
                        <strong>+ Record Advance Payment</strong> to credit a
                        retailer ledger.
                      </td>
                    </tr>
                  ) : (
                    filteredAdvances.map((adv: any) => (
                      <tr key={adv.id}>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--color-primary-700)",
                            }}
                          >
                            {adv.receiptNumber}
                          </span>
                        </td>
                        <td>{new Date(adv.paidAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600 }}>
                          {adv.shopkeeperName || "Retail Shopkeeper"}
                        </td>
                        <td style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                          ₹{adv.amount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            color: "var(--text-secondary)",
                            fontSize: "0.9rem",
                          }}
                        >
                          ₹{adv.allocatedAmount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            fontWeight: 800,
                            fontSize: "0.95rem",
                            color:
                              adv.unallocatedAmount > 0
                                ? "var(--color-success)"
                                : "var(--text-muted)",
                          }}
                        >
                          {adv.unallocatedAmount > 0
                            ? `₹${adv.unallocatedAmount.toFixed(2)}`
                            : "₹0.00"}
                        </td>
                        <td>
                          {adv.allocationStatus === "UNALLOCATED" && (
                            <span
                              className="badge badge-success"
                              style={{ fontWeight: 700, fontSize: "0.75rem" }}
                            >
                              🟢 Unallocated Surplus
                            </span>
                          )}
                          {adv.allocationStatus === "PARTIALLY_ALLOCATED" && (
                            <span
                              className="badge badge-warning"
                              style={{ fontWeight: 700, fontSize: "0.75rem" }}
                            >
                              🟡 Partially Allocated
                            </span>
                          )}
                          {adv.allocationStatus === "FULLY_ALLOCATED" && (
                            <span
                              className="badge badge-info"
                              style={{ fontWeight: 600, fontSize: "0.75rem" }}
                            >
                              ✓ Fully Settled
                            </span>
                          )}
                        </td>
                        <td>
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span
                              className="badge badge-info"
                              style={{
                                width: "fit-content",
                                marginBottom: "2px",
                              }}
                            >
                              {adv.paymentMethod}
                            </span>
                            <code style={{ fontSize: "0.75rem" }}>
                              {adv.referenceNo || "—"}
                            </code>
                          </div>
                        </td>
                        <td
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {adv.notes || "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PARTY STATEMENT & RUNNING LEDGER */}
      {activeTab === "LEDGER" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
          }}
        >
          {/* Party Selection & Header Info */}
          <div
            className="card"
            style={{
              padding: "var(--space-4)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                {selectedShopkeeperForLedger
                  ? `Party Ledger: ${shopkeepersList.find((s: any) => s.id === selectedShopkeeperForLedger)?.fullName || "Retailer"}`
                  : "Party Statement & Running Ledger"}
              </h3>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                }}
              >
                Real-time debit/credit statement with running ledger balance
                after every transaction
              </p>
            </div>

            {isAdminOrWarehouse && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                }}
              >
                <label style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Filter by Retailer:
                </label>
                <select
                  className="input"
                  style={{
                    width: "240px",
                    padding: "0.35rem 0.6rem",
                    fontSize: "0.85rem",
                  }}
                  value={selectedShopkeeperForLedger}
                  onChange={(e) =>
                    setSelectedShopkeeperForLedger(e.target.value)
                  }
                >
                  <option value="">All Retail Accounts</option>
                  {shopkeepersList.map((sk: any) => (
                    <option key={sk.id} value={sk.id}>
                      {sk.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Metric Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                OUTSTANDING BALANCE
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  color:
                    currentLedgerBalance > 0
                      ? "var(--color-warning)"
                      : "var(--color-success)",
                }}
              >
                ₹{currentLedgerBalance.toFixed(2)}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {currentLedgerBalance > 0
                  ? "Net payable by retailer"
                  : "Account fully settled"}
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                TOTAL GOODS INVOICED (DEBIT)
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  color: "var(--color-primary-700)",
                }}
              >
                ₹{totalLedgerDebits.toFixed(2)}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Cumulative invoice dispatches
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                SETTLEMENTS &amp; CREDITS (CREDIT)
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  color: "var(--color-success)",
                }}
              >
                ₹{totalLedgerCredits.toFixed(2)}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Payments, Handshake Cash &amp; Credit Notes
              </p>
            </div>

            <div className="card" style={{ padding: "var(--space-4)" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                STATEMENT ENTRIES
              </p>
              <p
                style={{
                  fontSize: "var(--font-size-2xl)",
                  fontWeight: 800,
                  color: "#0284c7",
                }}
              >
                {ledgerEntries.length} Transactions
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Audited chronological ledger
              </p>
            </div>
          </div>

          {/* Statement Table */}
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Retail Pharmacy</th>
                    <th>Type</th>
                    <th>Document / Ref #</th>
                    <th>Description</th>
                    <th>Debit (₹)</th>
                    <th>Credit (₹)</th>
                    <th>Balance After (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerEntries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: "center",
                          padding: "var(--space-8)",
                          color: "var(--text-muted)",
                        }}
                      >
                        No ledger transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    ledgerEntries.map((entry: any) => (
                      <tr key={entry.id}>
                        <td
                          style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}
                        >
                          {new Date(entry.createdAt).toLocaleString()}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {entry.shopkeeperName || "Retail Shopkeeper"}
                        </td>
                        <td>
                          <span
                            className={`badge ${entry.entryType === "DEBIT" ? "badge-danger" : "badge-success"}`}
                            style={{
                              background:
                                entry.entryType === "DEBIT"
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : "rgba(16, 185, 129, 0.15)",
                              color:
                                entry.entryType === "DEBIT"
                                  ? "var(--color-error)"
                                  : "var(--color-success)",
                              fontWeight: 700,
                            }}
                          >
                            {entry.entryType}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: "0.8rem", fontWeight: 700 }}>
                            {entry.referenceNumber || "—"}
                          </code>
                        </td>
                        <td
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {entry.description}
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--color-error)",
                          }}
                        >
                          {entry.entryType === "DEBIT"
                            ? `₹${entry.amount.toFixed(2)}`
                            : "—"}
                        </td>
                        <td
                          style={{
                            fontWeight: 700,
                            color: "var(--color-success)",
                          }}
                        >
                          {entry.entryType === "CREDIT"
                            ? `₹${entry.amount.toFixed(2)}`
                            : "—"}
                        </td>
                        <td style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                          ₹{entry.balanceAfter.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RETURN / DAMAGE CLAIMS */}
      {activeTab === "CLAIMS" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {/* Status Filter Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "var(--space-3)",
            }}
          >
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  className={`btn ${claimStatusFilter === st ? "btn-primary" : "btn-secondary"}`}
                  style={{ padding: "0.3rem 0.75rem", fontSize: "0.8rem" }}
                  onClick={() => setClaimStatusFilter(st)}
                >
                  {st === "ALL" ? "All Claims" : st}
                </button>
              ))}
            </div>

            <p
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                margin: 0,
              }}
            >
              Showing {returnClaims.length} claim(s)
            </p>
          </div>

          {/* Claims Table */}
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Claim #</th>
                    <th>Date</th>
                    <th>Retail Pharmacy</th>
                    <th>Medicine &amp; Batch</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>Remarks</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {returnClaims.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        style={{
                          textAlign: "center",
                          padding: "var(--space-8)",
                          color: "var(--text-muted)",
                        }}
                      >
                        No return claims found for this filter. Use{" "}
                        <strong>+ Raise Return Claim</strong> to report transit
                        damages or near-expiry batches.
                      </td>
                    </tr>
                  ) : (
                    returnClaims.map((claim: any) => (
                      <tr key={claim.id}>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color: "var(--color-primary-700)",
                            }}
                          >
                            {claim.requestNumber}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.8rem" }}>
                          {new Date(claim.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {claim.shopkeeperName || "Retail Shopkeeper"}
                        </td>
                        <td>
                          <div style={{ fontWeight: 700 }}>
                            {claim.productName || "Pharmaceutical Product"}
                          </div>
                          {claim.batchNumber && (
                            <code style={{ fontSize: "0.75rem" }}>
                              Batch: {claim.batchNumber}
                            </code>
                          )}
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {claim.quantity} packs
                        </td>
                        <td
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {claim.reason}
                        </td>
                        <td
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-muted)",
                            maxWidth: "180px",
                          }}
                        >
                          {claim.remarks || "—"}
                          {claim.rejectionReason && (
                            <div
                              style={{
                                color: "var(--color-error)",
                                marginTop: "2px",
                              }}
                            >
                              Reason: {claim.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              claim.status === "APPROVED"
                                ? "badge-success"
                                : claim.status === "REJECTED"
                                  ? "badge-danger"
                                  : "badge-warning"
                            }`}
                          >
                            {claim.status === "PENDING"
                              ? "⏳ PENDING REVIEW"
                              : claim.status === "APPROVED"
                                ? "✅ APPROVED"
                                : "❌ REJECTED"}
                          </span>
                        </td>
                        <td>
                          {claim.status === "PENDING" && isAdminOrWarehouse ? (
                            <button
                              className="btn btn-primary"
                              style={{
                                padding: "0.25rem 0.6rem",
                                fontSize: "0.75rem",
                              }}
                              onClick={() => {
                                setSelectedClaimForReview(claim);
                                setReviewForm({
                                  action: "APPROVE",
                                  rejectionReason: "",
                                });
                                setShowReviewDrawer(true);
                              }}
                            >
                              Inspect &amp; Review
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {claim.status === "APPROVED"
                                ? "Credit Note Issued"
                                : "Review Completed"}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SideDrawer: Create Delivery Challan */}
      <SideDrawer
        isOpen={showChallanDrawer}
        onClose={() => setShowChallanDrawer(false)}
        title="📦 Issue Delivery Challan"
        subtitle="Dispatch packed order units with transporter credentials"
      >
        <form
          onSubmit={handleCreateChallan}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <label className="label">Select Order *</label>
            <select
              className="input"
              required
              value={challanForm.orderId}
              onChange={(e) =>
                setChallanForm({ ...challanForm, orderId: e.target.value })
              }
            >
              <option value="">-- Choose Order to Dispatch --</option>
              {availableOrders.map((ord: any) => (
                <option key={ord.id} value={ord.id}>
                  {ord.orderNumber} (Status: {ord.status}, Net: ₹{ord.netAmount}
                  )
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Transporter / Courier Name</label>
            <input
              className="input"
              placeholder="e.g. BlueDart Express / Local Van"
              value={challanForm.transporterName}
              onChange={(e) =>
                setChallanForm({
                  ...challanForm,
                  transporterName: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="label">Vehicle Registration Number</label>
            <input
              className="input"
              placeholder="e.g. WB-02-AK-4589"
              value={challanForm.vehicleNumber}
              onChange={(e) =>
                setChallanForm({
                  ...challanForm,
                  vehicleNumber: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="label">Total Packed Cartons</label>
            <input
              type="number"
              min={1}
              className="input"
              value={challanForm.totalCartons}
              onChange={(e) =>
                setChallanForm({
                  ...challanForm,
                  totalCartons: Number(e.target.value),
                })
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              marginTop: "var(--space-4)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowChallanDrawer(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creatingChallan}
            >
              {creatingChallan
                ? "Issuing Challan..."
                : "Generate & Dispatch Challan"}
            </button>
          </div>
        </form>
      </SideDrawer>

      {/* SideDrawer: Issue Credit Note */}
      <SideDrawer
        isOpen={showReturnDrawer}
        onClose={() => setShowReturnDrawer(false)}
        title="🔄 Issue GST Credit Note"
        subtitle="Reverse tax on damaged/expired items and adjust retailer ledger"
      >
        <form
          onSubmit={handleCreateReturn}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <label className="label">Invoice Reference / ID *</label>
            <input
              className="input"
              placeholder="Invoice ID or UUID"
              required
              value={returnForm.invoiceId}
              onChange={(e) =>
                setReturnForm({ ...returnForm, invoiceId: e.target.value })
              }
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <label className="label">Returned Units *</label>
              <input
                type="number"
                min={1}
                className="input"
                value={returnForm.quantity}
                onChange={(e) =>
                  setReturnForm({
                    ...returnForm,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="label">Unit Rate (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="input"
                value={returnForm.rate}
                onChange={(e) =>
                  setReturnForm({ ...returnForm, rate: Number(e.target.value) })
                }
              />
            </div>
          </div>

          <div>
            <label className="label">Restock Status</label>
            <select
              className="input"
              value={returnForm.restockStatus}
              onChange={(e) =>
                setReturnForm({ ...returnForm, restockStatus: e.target.value })
              }
            >
              <option value="RESTOCKED">
                Restock (Return to Available Warehouse Inventory)
              </option>
              <option value="QUARANTINED">
                Quarantine (Damaged / Expired / Non-saleable)
              </option>
            </select>
          </div>

          <div>
            <label className="label">Reason for Return</label>
            <textarea
              className="input"
              rows={3}
              value={returnForm.reason}
              onChange={(e) =>
                setReturnForm({ ...returnForm, reason: e.target.value })
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              marginTop: "var(--space-4)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowReturnDrawer(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={creatingReturn}
            >
              {creatingReturn ? "Issuing Credit Note..." : "Issue Credit Note"}
            </button>
          </div>
        </form>
      </SideDrawer>

      {/* SideDrawer: Record Advance Payment */}
      <SideDrawer
        isOpen={showAdvanceDrawer}
        onClose={() => setShowAdvanceDrawer(false)}
        title="💰 Record Advance Payment"
        subtitle="Credit a retail shopkeeper's account balance with deposit receipt"
      >
        <form
          onSubmit={handleRecordAdvance}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <label className="label">Select Retail Shopkeeper *</label>
            <select
              className="input"
              required
              value={advanceForm.shopkeeperId}
              onChange={(e) =>
                setAdvanceForm({ ...advanceForm, shopkeeperId: e.target.value })
              }
            >
              <option value="">-- Choose Retail Partner --</option>
              {shopkeepersList.map((sk: any) => (
                <option key={sk.id} value={sk.id}>
                  {sk.fullName} ({sk.phone || sk.email || "No contact"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Deposit Amount (₹) *</label>
            <input
              type="number"
              min={1}
              step="0.01"
              className="input"
              required
              value={advanceForm.amount}
              onChange={(e) =>
                setAdvanceForm({
                  ...advanceForm,
                  amount: Number(e.target.value),
                })
              }
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <label className="label">Payment Mode</label>
              <select
                className="input"
                value={advanceForm.paymentMethod}
                onChange={(e) =>
                  setAdvanceForm({
                    ...advanceForm,
                    paymentMethod: e.target.value,
                  })
                }
              >
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">NEFT / RTGS</option>
                <option value="CHEQUE">Cheque</option>
                <option value="CASH">Cash</option>
              </select>
            </div>
            <div>
              <label className="label">Reference / UTR / Cheque #</label>
              <input
                className="input"
                placeholder="e.g. UTR-309482910"
                value={advanceForm.referenceNo}
                onChange={(e) =>
                  setAdvanceForm({
                    ...advanceForm,
                    referenceNo: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div>
            <label className="label">Notes / Remarks</label>
            <textarea
              className="input"
              rows={3}
              value={advanceForm.notes}
              onChange={(e) =>
                setAdvanceForm({ ...advanceForm, notes: e.target.value })
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              marginTop: "var(--space-4)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowAdvanceDrawer(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={recordingAdvance}
            >
              {recordingAdvance
                ? "Recording Payment..."
                : "Record & Credit Balance"}
            </button>
          </div>
        </form>
      </SideDrawer>

      {/* SideDrawer: Raise Return Claim */}
      <SideDrawer
        isOpen={showClaimDrawer}
        onClose={() => setShowClaimDrawer(false)}
        title="🛡️ Raise Return / Damage Claim"
        subtitle="Report transit breakage, leakage, wrong batch, or near-expiry medicines"
      >
        <form
          onSubmit={handleSubmitClaim}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <label className="label">Select Medicine / Product *</label>
            <select
              className="input"
              required
              value={claimForm.productId}
              onChange={(e) =>
                setClaimForm({ ...claimForm, productId: e.target.value })
              }
            >
              <option value="">-- Choose Product --</option>
              {productsList.length > 0 ? (
                productsList.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.packSize || "Pack"})
                  </option>
                ))
              ) : (
                <>
                  <option value="00000000-0000-0000-0000-000000000001">
                    AZITHRAL 500MG TAB (10S)
                  </option>
                  <option value="00000000-0000-0000-0000-000000000002">
                    HIFENAC MR TAB (10S)
                  </option>
                  <option value="00000000-0000-0000-0000-000000000003">
                    PAN D CAP (15S)
                  </option>
                  <option value="00000000-0000-0000-0000-000000000004">
                    TELMA 40MG TAB (15S)
                  </option>
                </>
              )}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
            }}
          >
            <div>
              <label className="label">Quantity (Packs) *</label>
              <input
                type="number"
                min={1}
                className="input"
                required
                value={claimForm.quantity}
                onChange={(e) =>
                  setClaimForm({
                    ...claimForm,
                    quantity: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="label">Batch Number (Optional)</label>
              <input
                className="input"
                placeholder="e.g. 2613000703"
                value={claimForm.batchNumber}
                onChange={(e) =>
                  setClaimForm({ ...claimForm, batchNumber: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="label">Reason for Return *</label>
            <select
              className="input"
              value={claimForm.reason}
              onChange={(e) =>
                setClaimForm({ ...claimForm, reason: e.target.value })
              }
            >
              <option value="Damaged packaging / Seal Broken">
                Damaged packaging / Seal Broken
              </option>
              <option value="Breakage / Leakage in transit">
                Breakage / Leakage in transit
              </option>
              <option value="Near Expiry (< 60 Days)">
                Near Expiry (&lt; 60 Days)
              </option>
              <option value="Expired Stock">Expired Stock</option>
              <option value="Wrong Medicine / Batch Received">
                Wrong Medicine / Batch Received
              </option>
              <option value="Quality Concern / Manufacturer Recall">
                Quality Concern / Manufacturer Recall
              </option>
            </select>
          </div>

          <div>
            <label className="label">Detailed Remarks / Observations</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Describe condition of boxes, seal status, or batch expiry details..."
              value={claimForm.remarks}
              onChange={(e) =>
                setClaimForm({ ...claimForm, remarks: e.target.value })
              }
            />
          </div>

          <div>
            <label className="label">Photo Proof URL (Optional)</label>
            <input
              className="input"
              placeholder="https://... photo proof of damage"
              value={claimForm.imageUrl}
              onChange={(e) =>
                setClaimForm({ ...claimForm, imageUrl: e.target.value })
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              marginTop: "var(--space-4)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowClaimDrawer(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingClaim}
            >
              {submittingClaim ? "Submitting..." : "Submit Return Claim"}
            </button>
          </div>
        </form>
      </SideDrawer>

      {/* SideDrawer: Review Return Claim (Warehouse / Admin) */}
      <SideDrawer
        isOpen={showReviewDrawer}
        onClose={() => {
          setShowReviewDrawer(false);
          setSelectedClaimForReview(null);
        }}
        title="🔍 Inspect &amp; Review Claim"
        subtitle={
          selectedClaimForReview
            ? `Claim #${selectedClaimForReview.requestNumber}`
            : ""
        }
      >
        {selectedClaimForReview && (
          <form
            onSubmit={handleReviewClaim}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.25rem",
                }}
              >
                <span>Retailer:</span>
                <strong>
                  {selectedClaimForReview.shopkeeperName || "Retail Shopkeeper"}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.25rem",
                }}
              >
                <span>Product:</span>
                <strong>{selectedClaimForReview.productName}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.25rem",
                }}
              >
                <span>Claimed Qty:</span>
                <strong>{selectedClaimForReview.quantity} packs</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.25rem",
                }}
              >
                <span>Reason:</span>
                <span style={{ color: "var(--color-error)" }}>
                  {selectedClaimForReview.reason}
                </span>
              </div>
              {selectedClaimForReview.remarks && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    borderTop: "1px solid var(--border-color)",
                    paddingTop: "0.5rem",
                  }}
                >
                  <span style={{ color: "var(--text-muted)" }}>Remarks:</span>{" "}
                  {selectedClaimForReview.remarks}
                </div>
              )}
            </div>

            <div>
              <label className="label">Inspection Decision *</label>
              <select
                className="input"
                value={reviewForm.action}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, action: e.target.value })
                }
              >
                <option value="APPROVE">
                  Approve Claim &amp; Authorize GST Credit Note
                </option>
                <option value="REJECT">
                  Reject Claim (Invalid / Physical inspection failed)
                </option>
              </select>
            </div>

            {reviewForm.action === "REJECT" && (
              <div>
                <label className="label">Rejection Reason *</label>
                <textarea
                  className="input"
                  rows={3}
                  required
                  placeholder="Explain why this return claim was rejected..."
                  value={reviewForm.rejectionReason}
                  onChange={(e) =>
                    setReviewForm({
                      ...reviewForm,
                      rejectionReason: e.target.value,
                    })
                  }
                />
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "var(--space-3)",
                marginTop: "var(--space-4)",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowReviewDrawer(false);
                  setSelectedClaimForReview(null);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  background:
                    reviewForm.action === "APPROVE"
                      ? "var(--color-success)"
                      : "var(--color-error)",
                  borderColor:
                    reviewForm.action === "APPROVE"
                      ? "var(--color-success)"
                      : "var(--color-error)",
                }}
                disabled={reviewingClaim}
              >
                {reviewingClaim
                  ? "Saving Decision..."
                  : reviewForm.action === "APPROVE"
                    ? "Approve & Issue Credit"
                    : "Confirm Rejection"}
              </button>
            </div>
          </form>
        )}
      </SideDrawer>
      {selectedInvoice && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "var(--space-4)",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "850px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              padding: "var(--space-8)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "var(--space-4)",
              }}
            >
              <div
                style={{
                  borderBottom: "2px solid var(--color-primary-600)",
                  paddingBottom: "var(--space-2)",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "1.4rem",
                        fontWeight: 800,
                        color: "var(--color-primary-700)",
                      }}
                    >
                      MAA ESWARI PHARMACEUTICALS
                    </h2>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      WHOLESALE MEDICINE DISTRIBUTORS • BENACHITY, DURGAPUR -
                      713213
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      GSTIN: <strong>19BKMPG6092H1ZO</strong> | D.L. No:{" "}
                      <strong>BUR-20B-11422 / 21B-11422</strong> | Phone:
                      9614081313
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span
                      className="badge badge-primary"
                      style={{ fontSize: "0.85rem", padding: "0.3rem 0.6rem" }}
                    >
                      TAX INVOICE
                    </span>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: "1.1rem",
                        marginTop: "0.3rem",
                      }}
                    >
                      {selectedInvoice.invoiceNumber}
                    </p>
                    <p
                      style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}
                    >
                      Date: {selectedInvoice.date}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  marginLeft: "1rem",
                  color: "var(--text-secondary)",
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Billed To / Shipped To Info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "var(--space-4)",
                padding: "var(--space-3)",
                background: "var(--bg-secondary)",
                borderRadius: "var(--radius-md)",
                marginBottom: "var(--space-4)",
                fontSize: "0.8rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    color: "var(--color-primary-700)",
                    textTransform: "uppercase",
                  }}
                >
                  Billed To:
                </p>
                <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {selectedInvoice.customerName}
                </p>
                <p>{selectedInvoice.customerAddress}</p>
                <p>
                  GSTIN: <strong>{selectedInvoice.customerGstin}</strong>
                </p>
                <p>
                  Drug Lic: <strong>{selectedInvoice.customerDl}</strong>
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    color: "var(--color-primary-700)",
                    textTransform: "uppercase",
                  }}
                >
                  Dispatch Details:
                </p>
                <p>
                  Order Reference:{" "}
                  <strong>{selectedInvoice.orderNumber}</strong>
                </p>
                <p>
                  Payment Term: <strong>Credit (15 Days)</strong>
                </p>
                <p>
                  Mode: <strong>Local Delivery Van</strong>
                </p>
                <p>
                  Place of Supply: <strong>West Bengal (19)</strong>
                </p>
              </div>
            </div>

            {/* Line Items Table */}
            <div
              className="table-wrapper"
              style={{ marginBottom: "var(--space-4)" }}
            >
              <table className="table" style={{ fontSize: "0.75rem" }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine Name</th>
                    <th>Pack</th>
                    <th>HSN</th>
                    <th>Batch</th>
                    <th>Exp</th>
                    <th>Qty</th>
                    <th>Free</th>
                    <th>Rate</th>
                    <th>MRP</th>
                    <th>DIS%</th>
                    <th>Taxable</th>
                    <th>SGST</th>
                    <th>CGST</th>
                    <th>Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.lines.map((ln, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: 700 }}>{ln.name}</td>
                      <td>{ln.pack}</td>
                      <td>{ln.hsn}</td>
                      <td>
                        <code>{ln.batch}</code>
                      </td>
                      <td>{ln.exp}</td>
                      <td style={{ fontWeight: 700 }}>{ln.qty}</td>
                      <td>{ln.free > 0 ? `+${ln.free}` : "0"}</td>
                      <td>₹{ln.rate.toFixed(2)}</td>
                      <td>₹{ln.mrp.toFixed(2)}</td>
                      <td>{ln.dis1}%</td>
                      <td>₹{ln.taxable.toFixed(2)}</td>
                      <td>₹{ln.sgst.toFixed(2)}</td>
                      <td>₹{ln.cgst.toFixed(2)}</td>
                      <td
                        style={{
                          fontWeight: 700,
                          color: "var(--color-primary-700)",
                        }}
                      >
                        ₹{ln.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Box */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div
                style={{
                  width: "320px",
                  fontSize: "0.85rem",
                  background: "var(--bg-secondary)",
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span>Gross Value:</span>
                  <span>₹{selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                    color: "var(--color-error)",
                  }}
                >
                  <span>Wholesale Discount:</span>
                  <span>-₹{selectedInvoice.totalDiscount.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                    fontWeight: 600,
                  }}
                >
                  <span>Taxable Amount:</span>
                  <span>₹{selectedInvoice.taxableValue.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span>SGST (2.5%):</span>
                  <span>₹{selectedInvoice.sgst.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>CGST (2.5%):</span>
                  <span>₹{selectedInvoice.cgst.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    borderTop: "2px solid var(--border-color)",
                    paddingTop: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 800,
                    fontSize: "1.1rem",
                    color: "var(--color-primary-700)",
                  }}
                >
                  <span>Grand Total:</span>
                  <span>₹{selectedInvoice.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "var(--space-6)",
              }}
            >
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Certified that the particulars given above are true and correct.
                E. &amp; O.E.
              </p>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => window.print()}
                >
                  🖨️ Print Invoice
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    alert(
                      `Invoice ${selectedInvoice.invoiceNumber} PDF downloaded!`,
                    )
                  }
                >
                  ⬇️ Download GST PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
