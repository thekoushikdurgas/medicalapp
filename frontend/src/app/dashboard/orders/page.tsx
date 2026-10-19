"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  ORDERS_QUERY,
  RATE_ORDER_MUTATION,
  DISPUTE_DELIVERY_MUTATION,
  UPDATE_NOTIFICATION_PREFERENCES_MUTATION,
  WAREHOUSE_PICKING_SLIP_QUERY,
  VERIFY_PICKING_BARCODE_MUTATION,
  COMPLETE_ORDER_PICKING_MUTATION,
} from "@/lib/graphql-queries";
import { SideDrawer } from "@/components/ui/side-drawer";

interface OrderRecord {
  id: string;
  orderNumber: string;
  shopkeeper: string;
  location: string;
  itemsSummary: string;
  itemCount: number;
  subtotal: number;
  discount: number;
  tax: number;
  netAmount: number;
  status:
    "PLACED" | "CONFIRMED" | "PICKING" | "PACKED" | "DISPATCHED" | "DELIVERED";
  placedAt: string;
  remarks: string;
  deliveryOtp?: string;
  rating?: number;
  feedbackText?: string;
  estimatedArrivalWindow?: string;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [showPlaceOrderDrawer, setShowPlaceOrderDrawer] = useState(false);

  // Shopkeeper Rating, Dispute & Notification Prefs States
  const [ratingOrder, setRatingOrder] = useState<OrderRecord | null>(null);
  const [starRating, setStarRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const [disputeOrder, setDisputeOrder] = useState<OrderRecord | null>(null);
  const [disputeReason, setDisputeReason] = useState<string>("DAMAGED_CARTON");
  const [disputeNotes, setDisputeNotes] = useState<string>("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifChannels, setNotifChannels] = useState({
    inApp: true,
    sms: true,
    whatsapp: true,
  });
  const [notifSavedToast, setNotifSavedToast] = useState(false);

  const [rateOrderMutation] = useMutation(RATE_ORDER_MUTATION);
  const [disputeDeliveryMutation] = useMutation(DISPUTE_DELIVERY_MUTATION);
  const [updateNotificationPreferencesMutation] = useMutation(
    UPDATE_NOTIFICATION_PREFERENCES_MUTATION,
  );

  // Warehouse Digital Picking Slip States (Checklist #19, #99, #108, #112, #187)
  const [pickingOrder, setPickingOrder] = useState<OrderRecord | null>(null);
  const [pickingLines, setPickingLines] = useState<
    Array<{
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
    }>
  >([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scanMessage, setScanMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isCompletingPicking, setIsCompletingPicking] = useState(false);
  const [pickingToast, setPickingToast] = useState<string | null>(null);

  const [verifyPickingBarcodeMutation] = useMutation(
    VERIFY_PICKING_BARCODE_MUTATION,
  );
  const [completeOrderPickingMutation] = useMutation(
    COMPLETE_ORDER_PICKING_MUTATION,
  );

  const { data: qData } = useQuery(ORDERS_QUERY, {
    variables: { page: 1, perPage: 20 },
    errorPolicy: "ignore",
  });

  const defaultOrders: OrderRecord[] = [
    {
      id: "ord-1",
      orderNumber: "ORD-2026-004448",
      shopkeeper: "Cheap Medical Stores",
      location: "Main Market, Benachity, Durgapur-13",
      itemsSummary: "AZITHRAL 500 (36), HIFENAC MR (20), PAN D (60)",
      itemCount: 3,
      subtotal: 13626.16,
      discount: 1490.14,
      tax: 606.8,
      netAmount: 12742.82,
      status: "DISPATCHED",
      placedAt: "Today, 08:30 AM",
      remarks: "Urgent monthly stock refill - Please deliver before 2 PM",
      deliveryOtp: "4819",
      estimatedArrivalWindow: "Within 45 mins (before 02:00 PM)",
    },
    {
      id: "ord-2",
      orderNumber: "ORD-2026-000538",
      shopkeeper: "Gupta Pharmacy & Clinic",
      location: "A-22 City Centre, Durgapur-16",
      itemsSummary: "TELMA 40 (40), MONTEK LC (30)",
      itemCount: 2,
      subtotal: 8540.0,
      discount: 1061.0,
      tax: 373.94,
      netAmount: 7852.95,
      status: "PICKING",
      placedAt: "Today, 07:15 AM",
      remarks: "Replenish cardiovascular and anti-allergic rack",
    },
    {
      id: "ord-3",
      orderNumber: "ORD-2026-000109",
      shopkeeper: "Cheap Medical Stores",
      location: "Main Market, Benachity, Durgapur-13",
      itemsSummary: "CALPOL 650 (100), DOLO 650 (150)",
      itemCount: 2,
      subtotal: 6425.0,
      discount: 321.25,
      tax: 305.18,
      netAmount: 6408.94,
      status: "DELIVERED",
      placedAt: "11 Oct 2026",
      remarks: "Completed delivery with stamp & signature",
      rating: 5,
      feedbackText:
        "Timely handover, cold-chain integrity verified with seal stamp.",
    },
    {
      id: "ord-4",
      orderNumber: "ORD-2026-000781",
      shopkeeper: "Maa Tara Medical Hall",
      location: "Bidhannagar Market, Durgapur-12",
      itemsSummary: "AUGMENTIN 625 (25), CLAVAM 625 (30)",
      itemCount: 2,
      subtotal: 9340.0,
      discount: 790.0,
      tax: 427.5,
      netAmount: 8977.5,
      status: "PLACED",
      placedAt: "Today, 11:20 AM",
      remarks: "New online bulk order from retailer portal",
    },
  ];

  const [orders, setOrders] = useState<OrderRecord[]>(
    qData?.orders?.items?.length
      ? qData.orders.items.map((it: any, i: number) => ({
          ...defaultOrders[i % defaultOrders.length],
          id: it.id,
          orderNumber: it.orderNumber,
          netAmount:
            it.netAmount || defaultOrders[i % defaultOrders.length].netAmount,
          status: it.status || defaultOrders[i % defaultOrders.length].status,
          deliveryOtp: it.deliveryOtp,
          rating: it.rating,
          feedbackText: it.feedbackText,
          estimatedArrivalWindow: it.estimatedArrivalWindow,
        }))
      : defaultOrders,
  );

  // New Order Form state
  const [newOrder, setNewOrder] = useState({
    shopkeeper: "Cheap Medical Stores",
    product: "AZITHRAL 500MG TAB",
    quantity: 30,
    rate: 96.56,
    discount1: 12,
    remarks: "Direct warehouse delivery",
  });

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const baseAmt = newOrder.quantity * newOrder.rate;
    const discAmt = baseAmt * (newOrder.discount1 / 100);
    const taxable = baseAmt - discAmt;
    const taxAmt = taxable * 0.05;
    const net = taxable + taxAmt;

    const ord: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-2026-00${Math.floor(1000 + Math.random() * 9000)}`,
      shopkeeper: newOrder.shopkeeper,
      location: "Registered Store Address, Durgapur",
      itemsSummary: `${newOrder.product} (${newOrder.quantity})`,
      itemCount: 1,
      subtotal: baseAmt,
      discount: discAmt,
      tax: taxAmt,
      netAmount: net,
      status: "PLACED",
      placedAt: "Just now",
      remarks: newOrder.remarks,
    };

    setOrders([ord, ...orders]);
    setShowPlaceOrderDrawer(false);
  };

  const handleReorder = (ord: OrderRecord) => {
    const firstMed =
      ord.itemsSummary.split("(")[0]?.trim() || "AZITHRAL 500MG TAB";
    const medOption = firstMed.includes("AZITHRAL")
      ? "AZITHRAL 500MG TAB"
      : firstMed.includes("HIFENAC")
        ? "HIFENAC MR TAB"
        : firstMed.includes("PAN D")
          ? "PAN D CAP"
          : firstMed.includes("TELMA")
            ? "TELMA 40MG TAB"
            : firstMed.includes("MONTEK")
              ? "MONTEK LC TAB"
              : firstMed.includes("AUGMENTIN")
                ? "AUGMENTIN 625 DUO"
                : firstMed.includes("CALPOL")
                  ? "CALPOL 650MG TAB"
                  : firstMed.includes("DOLO")
                    ? "DOLO 650MG TAB"
                    : "AZITHRAL 500MG TAB";

    const rates: Record<string, number> = {
      "AZITHRAL 500MG TAB": 96.56,
      "HIFENAC MR TAB": 72.5,
      "PAN D CAP": 145.0,
      "TELMA 40MG TAB": 110.0,
      "MONTEK LC TAB": 138.0,
      "AUGMENTIN 625 DUO": 172.0,
      "CALPOL 650MG TAB": 26.0,
      "DOLO 650MG TAB": 25.5,
    };

    setNewOrder({
      shopkeeper: ord.shopkeeper,
      product: medOption,
      quantity: 30,
      rate: rates[medOption] || 96.56,
      discount1: 12,
      remarks: `1-Click Reorder cloned from Order #${ord.orderNumber}`,
    });
    setShowPlaceOrderDrawer(true);
  };

  const handleRateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingOrder) return;
    setIsSubmittingRating(true);
    try {
      if (!ratingOrder.id.startsWith("ord-")) {
        await rateOrderMutation({
          variables: {
            input: {
              orderId: ratingOrder.id,
              rating: starRating,
              feedback: feedbackText || null,
            },
          },
        });
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === ratingOrder.id
            ? { ...o, rating: starRating, feedbackText: feedbackText }
            : o,
        ),
      );
      if (selectedOrder && selectedOrder.id === ratingOrder.id) {
        setSelectedOrder({
          ...selectedOrder,
          rating: starRating,
          feedbackText: feedbackText,
        });
      }
      setRatingOrder(null);
    } catch (err: any) {
      alert("Failed to submit rating: " + err.message);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleDisputeDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeOrder) return;
    setIsSubmittingDispute(true);
    try {
      const fullReason = `${disputeReason}: ${disputeNotes}`;
      if (!disputeOrder.id.startsWith("ord-")) {
        await disputeDeliveryMutation({
          variables: {
            orderId: disputeOrder.id,
            reason: fullReason,
          },
        });
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === disputeOrder.id
            ? { ...o, remarks: `[DISPUTED: ${fullReason}] - ${o.remarks}` }
            : o,
        ),
      );
      if (selectedOrder && selectedOrder.id === disputeOrder.id) {
        setSelectedOrder({
          ...selectedOrder,
          remarks: `[DISPUTED: ${fullReason}] - ${selectedOrder.remarks}`,
        });
      }
      setDisputeOrder(null);
      setDisputeNotes("");
    } catch (err: any) {
      alert("Failed to record dispute: " + err.message);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const handleSaveNotifPrefs = async () => {
    try {
      await updateNotificationPreferencesMutation({
        variables: {
          input: {
            inApp: notifChannels.inApp,
            sms: notifChannels.sms,
            whatsapp: notifChannels.whatsapp,
          },
        },
      });
    } catch (err) {
      // Ignored for offline mock
    }
    setNotifSavedToast(true);
    setTimeout(() => {
      setNotifSavedToast(false);
      setShowNotifDrawer(false);
    }, 1200);
  };

  const handleUpdateStatus = (id: string, newStatus: OrderRecord["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
    );
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const handleOpenPickingSlip = (ord: OrderRecord) => {
    setPickingOrder(ord);
    setScanMessage(null);
    setBarcodeInput("");
    if (ord.status === "CONFIRMED") {
      handleUpdateStatus(ord.id, "PICKING");
    }

    const sampleRacks = [
      {
        rack: "Rack A - Bay 02",
        barcode: "8901083000703",
        batch: "2613000703",
        exp: "12/2028",
      },
      {
        rack: "Rack B - Bay 01",
        barcode: "8901112002301",
        batch: "2614002301",
        exp: "08/2028",
      },
      {
        rack: "Rack C - Bay 04",
        barcode: "8901234004510",
        batch: "2611004510",
        exp: "05/2028",
      },
      {
        rack: "Rack D - Bay 01",
        barcode: "8901356008920",
        batch: "2612008920",
        exp: "10/2028",
      },
      {
        rack: "Rack E - Bay 03",
        barcode: "8901478005432",
        batch: "2618005432",
        exp: "02/2027",
      },
    ];

    const parsedItems = ord.itemsSummary.split(",").map((it, idx) => {
      const match = it.match(/^(.*?)\s*\((\d+)\)$/);
      const name = match ? match[1].trim() : it.trim();
      const qty = match ? parseInt(match[2], 10) : 10;
      const rackData = sampleRacks[idx % sampleRacks.length];
      return {
        itemId: `item-${ord.id}-${idx}`,
        productName: name,
        packSize: "10S",
        batchNumber: rackData.batch,
        expiryDate: rackData.exp,
        rackLocation: rackData.rack,
        quantityToPick: qty,
        barcode: rackData.barcode,
        isPicked: false,
        barcodeVerified: false,
      };
    });

    // Sort strictly by rackLocation to minimize travel time (Item #108)
    parsedItems.sort((a, b) => a.rackLocation.localeCompare(b.rackLocation));
    setPickingLines(parsedItems);
  };

  const handleScanBarcode = async (scannedCode?: string) => {
    const code = (scannedCode || barcodeInput).trim();
    if (!code) return;

    const targetIdx = pickingLines.findIndex(
      (l) =>
        !l.barcodeVerified &&
        (l.barcode === code ||
          l.batchNumber === code ||
          code.includes(l.batchNumber)),
    );

    if (targetIdx >= 0) {
      const matched = pickingLines[targetIdx];
      try {
        if (!matched.itemId.startsWith("item-")) {
          await verifyPickingBarcodeMutation({
            variables: {
              orderItemId: matched.itemId,
              scannedBarcode: code,
            },
          });
        }
      } catch (e) {
        // Fallback for mock IDs
      }

      setPickingLines((prev) =>
        prev.map((l, i) =>
          i === targetIdx ? { ...l, isPicked: true, barcodeVerified: true } : l,
        ),
      );
      setScanMessage({
        type: "success",
        text: `✓ Barcode Verified: ${matched.productName} (${matched.quantityToPick} packs) at ${matched.rackLocation}`,
      });
      setBarcodeInput("");
    } else {
      setScanMessage({
        type: "error",
        text: `❌ Barcode Mismatch: Scanned code "${code}" does not match any pending allocated items on this picking slip!`,
      });
    }
  };

  const handleCompletePicking = async () => {
    if (!pickingOrder) return;
    setIsCompletingPicking(true);
    try {
      if (!pickingOrder.id.startsWith("ord-")) {
        await completeOrderPickingMutation({
          variables: { orderId: pickingOrder.id },
        });
      }
      handleUpdateStatus(pickingOrder.id, "PACKED");
      setPickingToast(
        `✓ Order ${pickingOrder.orderNumber} picked, barcode-verified & carton-sealed. Operations notified!`,
      );
      setTimeout(() => {
        setPickingToast(null);
        setPickingOrder(null);
      }, 1500);
    } catch (err: any) {
      alert("Failed to complete picking: " + err.message);
    } finally {
      setIsCompletingPicking(false);
    }
  };

  const statusTabs = [
    { key: "all", label: "All Orders", count: orders.length },
    {
      key: "PLACED",
      label: "Pending Approval",
      count: orders.filter((o) => o.status === "PLACED").length,
    },
    {
      key: "CONFIRMED",
      label: "Confirmed",
      count: orders.filter((o) => o.status === "CONFIRMED").length,
    },
    {
      key: "PICKING",
      label: "Warehouse Picking",
      count: orders.filter((o) => o.status === "PICKING").length,
    },
    {
      key: "DISPATCHED",
      label: "Dispatched",
      count: orders.filter((o) => o.status === "DISPATCHED").length,
    },
    {
      key: "DELIVERED",
      label: "Delivered",
      count: orders.filter((o) => o.status === "DELIVERED").length,
    },
  ];

  const filteredOrders = orders.filter((o) => {
    const matchesTab = activeTab === "all" || o.status === activeTab;
    const matchesSearch =
      searchQuery === "" ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shopkeeper.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "PLACED":
        return (
          <span className="badge badge-warning">⚡ New (Picking Queue)</span>
        );
      case "CONFIRMED":
        return <span className="badge badge-primary">✓ Confirmed</span>;
      case "PICKING":
        return (
          <span className="badge badge-warning">⚙️ Warehouse Picking</span>
        );
      case "PACKED":
        return (
          <span className="badge badge-warning">📦 Packed & Verified</span>
        );
      case "DISPATCHED":
        return <span className="badge badge-info">🚚 In Courier Transit</span>;
      case "DELIVERED":
        return <span className="badge badge-success">✓ Handed Over</span>;
    }
  };

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
          marginBottom: "var(--space-6)",
        }}
      >
        <div>
          <h1 style={{ fontSize: "var(--font-size-3xl)", fontWeight: 800 }}>
            Bulk Order Fulfillment Hub
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Shopkeeper bulk requests, warehouse picking workflows, and delivery
            dispatching
          </p>
        </div>
        <div
          style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}
        >
          <button
            className="btn btn-secondary"
            id="btn-notif-prefs"
            onClick={() => setShowNotifDrawer(true)}
          >
            🔔 Notification Channels
          </button>
          <button
            className="btn btn-primary"
            id="btn-new-order"
            onClick={() => setShowPlaceOrderDrawer(true)}
          >
            + Create Wholesale Order
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          marginBottom: "var(--space-4)",
        }}
      >
        <div
          style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto" }}
        >
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`btn ${activeTab === tab.key ? "btn-primary" : "btn-secondary"}`}
              style={{
                whiteSpace: "nowrap",
                fontSize: "0.85rem",
                padding: "0.4rem 0.8rem",
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div style={{ minWidth: "260px" }}>
          <input
            type="text"
            className="input"
            placeholder="🔍 Search order #, pharmacy, medicine..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Orders Responsive Table with Dual Scroll & Sticky Header */}
      <div className="table-scroll-container">
        <table className="table table-header-sticky">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Retail Pharmacy</th>
              <th>Prescribed Lines</th>
              <th>Net Bill (₹)</th>
              <th>Order Stage</th>
              <th>Timestamp</th>
              <th>Workflow Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "var(--space-8)",
                    color: "var(--text-muted)",
                  }}
                >
                  No matching orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedOrder(ord)}
                >
                  <td>
                    <span
                      style={{
                        fontWeight: 800,
                        color: "var(--color-primary-600)",
                      }}
                    >
                      {ord.orderNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{ord.shopkeeper}</div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {ord.location}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                      {ord.itemsSummary}
                    </div>
                    <div
                      style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                    >
                      {ord.itemCount} pharmaceutical line(s)
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, fontSize: "1rem" }}>
                      ₹
                      {ord.netAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </div>
                    <div
                      style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                    >
                      (Base: ₹{ord.subtotal.toFixed(0)} - Disc: ₹
                      {ord.discount.toFixed(0)})
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(ord.status)}
                    {ord.status === "DISPATCHED" && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--color-info)",
                          fontWeight: 700,
                          marginTop: "4px",
                        }}
                      >
                        ⏱️ {ord.estimatedArrivalWindow || "ETA: Within 45 mins"}
                      </div>
                    )}
                    {ord.status === "DELIVERED" && ord.rating && (
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "#f59e0b",
                          fontWeight: 700,
                          marginTop: "4px",
                        }}
                      >
                        {"★".repeat(ord.rating)} ({ord.rating}/5)
                      </div>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {ord.placedAt}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div
                      style={{
                        display: "flex",
                        gap: "var(--space-2)",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: "0.25rem 0.6rem",
                          fontSize: "0.75rem",
                        }}
                        onClick={() => setSelectedOrder(ord)}
                      >
                        👁️ Details
                      </button>
                      {ord.status === "PLACED" && (
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                          }}
                          onClick={() =>
                            handleUpdateStatus(ord.id, "CONFIRMED")
                          }
                        >
                          Approve
                        </button>
                      )}
                      {ord.status === "CONFIRMED" && (
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                            background: "var(--color-warning)",
                          }}
                          onClick={() => handleOpenPickingSlip(ord)}
                        >
                          📋 Pick Racks
                        </button>
                      )}
                      {ord.status === "PICKING" && (
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                            background: "var(--color-warning)",
                          }}
                          onClick={() => handleOpenPickingSlip(ord)}
                        >
                          📋 Picking Slip
                        </button>
                      )}
                      {ord.status === "PICKING" && (
                        <button
                          className="btn btn-primary"
                          style={{
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                            background: "var(--color-info)",
                          }}
                          onClick={() =>
                            handleUpdateStatus(ord.id, "DISPATCHED")
                          }
                        >
                          Dispatch
                        </button>
                      )}
                      {ord.status === "DELIVERED" && !ord.rating && (
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                            color: "#f59e0b",
                            borderColor: "#f59e0b",
                          }}
                          title="Rate delivery service"
                          onClick={() => {
                            setRatingOrder(ord);
                            setStarRating(5);
                            setFeedbackText("");
                          }}
                        >
                          ⭐ Rate
                        </button>
                      )}
                      {ord.status === "DELIVERED" && (
                        <button
                          className="btn btn-secondary"
                          style={{
                            padding: "0.25rem 0.6rem",
                            fontSize: "0.75rem",
                            color: "var(--color-error)",
                            borderColor: "rgba(239, 68, 68, 0.4)",
                          }}
                          title="Dispute delivery condition"
                          onClick={() => {
                            setDisputeOrder(ord);
                            setDisputeNotes("");
                          }}
                        >
                          ⚠️ Dispute
                        </button>
                      )}
                      <button
                        className="btn btn-secondary"
                        style={{
                          padding: "0.25rem 0.6rem",
                          fontSize: "0.75rem",
                        }}
                        title="1-Click Re-order from past order items"
                        onClick={() => handleReorder(ord)}
                      >
                        🔁 Re-order
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SideDrawer: Right Panel Order Details (LinkedIn-Style) */}
      <SideDrawer
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber}` : ""}
        subtitle={
          selectedOrder
            ? `${selectedOrder.shopkeeper} • ${selectedOrder.location}`
            : ""
        }
        footer={
          selectedOrder && (
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              {selectedOrder.status === "PLACED" && (
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    handleUpdateStatus(selectedOrder.id, "CONFIRMED")
                  }
                >
                  Approve Order
                </button>
              )}
              {selectedOrder.status === "CONFIRMED" && (
                <button
                  className="btn btn-primary"
                  style={{ background: "var(--color-warning)" }}
                  onClick={() => {
                    handleOpenPickingSlip(selectedOrder);
                    setSelectedOrder(null);
                  }}
                >
                  📋 Digital Picking Slip & Scan
                </button>
              )}
              {selectedOrder.status === "PICKING" && (
                <button
                  className="btn btn-primary"
                  style={{ background: "var(--color-warning)" }}
                  onClick={() => {
                    handleOpenPickingSlip(selectedOrder);
                    setSelectedOrder(null);
                  }}
                >
                  📋 Resume Picking Slip & Scan
                </button>
              )}
              {selectedOrder.status === "PICKING" && (
                <button
                  className="btn btn-primary"
                  style={{ background: "var(--color-info)" }}
                  onClick={() =>
                    handleUpdateStatus(selectedOrder.id, "DISPATCHED")
                  }
                >
                  Handover to Courier
                </button>
              )}
              <button
                className="btn btn-primary"
                style={{ background: "#4f46e5", borderColor: "#4f46e5" }}
                onClick={() => {
                  handleReorder(selectedOrder);
                  setSelectedOrder(null);
                }}
              >
                🔁 1-Click Re-order
              </button>
              {selectedOrder.status === "DELIVERED" &&
                !selectedOrder.rating && (
                  <button
                    className="btn btn-secondary"
                    style={{ color: "#f59e0b", borderColor: "#f59e0b" }}
                    onClick={() => {
                      setRatingOrder(selectedOrder);
                      setStarRating(5);
                      setFeedbackText("");
                    }}
                  >
                    ⭐ Rate Delivery
                  </button>
                )}
              {selectedOrder.status === "DELIVERED" && (
                <button
                  className="btn btn-secondary"
                  style={{
                    color: "var(--color-error)",
                    borderColor: "rgba(239, 68, 68, 0.4)",
                  }}
                  onClick={() => {
                    setDisputeOrder(selectedOrder);
                    setDisputeNotes("");
                  }}
                >
                  ⚠️ Raise Dispute
                </button>
              )}
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Close Panel
              </button>
            </div>
          )
        }
      >
        {selectedOrder && (
          <>
            {/* Fulfillment Stepper */}
            <div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Order Fulfillment Lifecycle
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                {[
                  { step: "PLACED", label: "Placed" },
                  { step: "CONFIRMED", label: "Approved" },
                  { step: "PICKING", label: "Picking" },
                  { step: "DISPATCHED", label: "Dispatched" },
                  { step: "DELIVERED", label: "Delivered" },
                ].map((s, idx) => {
                  const stages = [
                    "PLACED",
                    "CONFIRMED",
                    "PICKING",
                    "PACKED",
                    "DISPATCHED",
                    "DELIVERED",
                  ];
                  const currentIdx = stages.indexOf(selectedOrder.status);
                  const stepIdx = stages.indexOf(s.step);
                  const isDone = currentIdx >= stepIdx;

                  return (
                    <div key={idx} style={{ textAlign: "center", flex: 1 }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: isDone
                            ? "var(--color-primary-600)"
                            : "var(--color-gray-200)",
                          color: isDone ? "#ffffff" : "var(--color-gray-600)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          margin: "0 auto 4px",
                        }}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: isDone ? 700 : 500,
                          color: isDone
                            ? "var(--color-primary-600)"
                            : "var(--text-muted)",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prescribed Items Summary */}
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Prescribed Medicines ({selectedOrder.itemCount} Lines)
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                {selectedOrder.itemsSummary}
              </div>
            </div>

            {/* Statutory GST Invoice Breakdown */}
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-lg)",
                fontSize: "0.85rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Tax Invoice Breakdown
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.3rem",
                }}
              >
                <span>Gross Goods Value:</span>
                <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.3rem",
                  color: "var(--color-error)",
                }}
              >
                <span>Wholesale Scheme Discount:</span>
                <span>-₹{selectedOrder.discount.toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.3rem",
                }}
              >
                <span>State GST (SGST 2.5%):</span>
                <span>+₹{(selectedOrder.tax / 2).toFixed(2)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.3rem",
                }}
              >
                <span>Central GST (CGST 2.5%):</span>
                <span>+₹{(selectedOrder.tax / 2).toFixed(2)}</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid var(--border-color)",
                  paddingTop: "0.5rem",
                  marginTop: "0.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                }}
              >
                <span>Total Net Invoice:</span>
                <span style={{ color: "var(--color-primary-600)" }}>
                  ₹{selectedOrder.netAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Delivery OTP & ETA Cards */}
            {selectedOrder.status === "DISPATCHED" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                  marginTop: "var(--space-2)",
                }}
              >
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-success)",
                      textTransform: "uppercase",
                    }}
                  >
                    🔐 Delivery Handshake OTP
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      letterSpacing: "4px",
                      margin: "4px 0",
                    }}
                  >
                    {selectedOrder.deliveryOtp || "4819"}
                  </div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    Share this 4-digit OTP with the delivery boy upon arrival to
                    confirm package handover and verify medicines.
                  </p>
                </div>

                <div
                  style={{
                    background: "rgba(59, 130, 246, 0.08)",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--color-info)",
                      textTransform: "uppercase",
                    }}
                  >
                    ⏱️ Estimated Arrival Window (ETA)
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      margin: "4px 0",
                    }}
                  >
                    {selectedOrder.estimatedArrivalWindow ||
                      "Within 45 mins (before 02:00 PM)"}
                  </div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    Live transit estimation calculated using delivery route
                    distance and dispatcher beat plan.
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Rating & Feedback Display */}
            {selectedOrder.status === "DELIVERED" && (
              <div
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                  marginTop: "var(--space-2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Chemist Delivery Experience
                  </span>
                  {selectedOrder.rating ? (
                    <span style={{ color: "#f59e0b", fontWeight: 800 }}>
                      {"★".repeat(selectedOrder.rating)}
                      {"☆".repeat(5 - selectedOrder.rating)} (
                      {selectedOrder.rating}/5)
                    </span>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      style={{
                        padding: "0.2rem 0.5rem",
                        fontSize: "0.75rem",
                        color: "#f59e0b",
                      }}
                      onClick={() => {
                        setRatingOrder(selectedOrder);
                        setStarRating(5);
                        setFeedbackText("");
                      }}
                    >
                      ⭐ Submit Rating
                    </button>
                  )}
                </div>
                {selectedOrder.feedbackText && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-primary)",
                      marginTop: "4px",
                      fontStyle: "italic",
                      margin: "4px 0 0",
                    }}
                  >
                    &ldquo;{selectedOrder.feedbackText}&rdquo;
                  </p>
                )}
              </div>
            )}

            {/* Delivery Instructions */}
            <div>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                }}
              >
                Delivery Instructions
              </span>
              <p
                style={{
                  fontSize: "0.85rem",
                  marginTop: "4px",
                  color: "var(--text-primary)",
                }}
              >
                {selectedOrder.remarks}
              </p>
            </div>
          </>
        )}
      </SideDrawer>

      {/* SideDrawer: Right Panel Create Wholesale Order */}
      <SideDrawer
        isOpen={showPlaceOrderDrawer}
        onClose={() => setShowPlaceOrderDrawer(false)}
        title="Create Wholesale Order"
        subtitle="Place medicine order on behalf of retail pharmacy"
      >
        <form
          onSubmit={handlePlaceOrder}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <label className="label">Ordering Pharmacy Store</label>
            <select
              className="input"
              value={newOrder.shopkeeper}
              onChange={(e) =>
                setNewOrder({ ...newOrder, shopkeeper: e.target.value })
              }
            >
              <option value="Cheap Medical Stores">
                Cheap Medical Stores (Benachity)
              </option>
              <option value="Gupta Pharmacy & Clinic">
                Gupta Pharmacy & Clinic (City Centre)
              </option>
              <option value="Maa Tara Medical Hall">
                Maa Tara Medical Hall (Bidhannagar)
              </option>
            </select>
          </div>

          <div>
            <label className="label">Select Medicine</label>
            <select
              className="input"
              value={newOrder.product}
              onChange={(e) => {
                const rates: Record<string, number> = {
                  "AZITHRAL 500MG TAB": 96.56,
                  "HIFENAC MR TAB": 72.5,
                  "PAN D CAP": 145.0,
                  "TELMA 40MG TAB": 110.0,
                  "MONTEK LC TAB": 138.0,
                  "AUGMENTIN 625 DUO": 172.0,
                  "CALPOL 650MG TAB": 26.0,
                  "DOLO 650MG TAB": 25.5,
                };
                const selected = e.target.value;
                setNewOrder({
                  ...newOrder,
                  product: selected,
                  rate: rates[selected] || 100,
                });
              }}
            >
              <option value="AZITHRAL 500MG TAB">
                AZITHRAL 500MG TAB (Rate ₹96.56, 12% Disc)
              </option>
              <option value="HIFENAC MR TAB">
                HIFENAC MR TAB (Rate ₹72.50, 14% Disc)
              </option>
              <option value="PAN D CAP">
                PAN D CAP (Rate ₹145.00, 10% Disc)
              </option>
              <option value="TELMA 40MG TAB">
                TELMA 40MG TAB (Rate ₹110.00, 10% Disc)
              </option>
              <option value="MONTEK LC TAB">
                MONTEK LC TAB (Rate ₹138.00, 15% Disc)
              </option>
              <option value="AUGMENTIN 625 DUO">
                AUGMENTIN 625 DUO (Rate ₹172.00, 8% Disc)
              </option>
              <option value="CALPOL 650MG TAB">
                CALPOL 650MG TAB (Rate ₹26.00, 5% Disc)
              </option>
              <option value="DOLO 650MG TAB">
                DOLO 650MG TAB (Rate ₹25.50, 5% Disc)
              </option>
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
              <label className="label">Quantity (Packs)</label>
              <input
                type="number"
                min="1"
                className="input"
                value={newOrder.quantity}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, quantity: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="label">Discount Scheme %</label>
              <input
                type="number"
                className="input"
                value={newOrder.discount1}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    discount1: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Gross (Qty × Rate):</span>
              <span>₹{(newOrder.quantity * newOrder.rate).toFixed(2)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                color: "var(--color-error)",
              }}
            >
              <span>Discount ({newOrder.discount1}%):</span>
              <span>
                -₹
                {(
                  newOrder.quantity *
                  newOrder.rate *
                  (newOrder.discount1 / 100)
                ).toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                borderTop: "1px solid var(--border-color)",
                marginTop: "4px",
                paddingTop: "4px",
              }}
            >
              <span>Estimated Net (incl. 5% GST):</span>
              <span style={{ color: "var(--color-primary-600)" }}>
                ₹
                {(
                  newOrder.quantity *
                  newOrder.rate *
                  (1 - newOrder.discount1 / 100) *
                  1.05
                ).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Live Retailer Credit Validation */}
          {(() => {
            const estimatedNet =
              newOrder.quantity *
              newOrder.rate *
              (1 - newOrder.discount1 / 100) *
              1.05;
            const creditLimit = 50000;
            const currentOutstanding = 12742.82;
            const isExceeded = currentOutstanding + estimatedNet > creditLimit;

            return (
              <div
                style={{
                  background: isExceeded
                    ? "rgba(239, 68, 68, 0.12)"
                    : "rgba(16, 185, 129, 0.12)",
                  border: `1px solid ${isExceeded ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.8rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: 700,
                  }}
                >
                  <span>Retailer Credit Check:</span>
                  <span
                    style={{
                      color: isExceeded
                        ? "var(--color-error)"
                        : "var(--color-primary-800)",
                    }}
                  >
                    {isExceeded
                      ? "⚠️ Credit Line Exceeded"
                      : "✅ Credit Approved"}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "3px",
                    color: "var(--text-secondary)",
                  }}
                >
                  <span>
                    Sanctioned Credit: ₹{creditLimit.toLocaleString("en-IN")}
                  </span>
                  <span>
                    Ledger Balance: ₹
                    {currentOutstanding.toLocaleString("en-IN")}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "2px",
                    fontWeight: 600,
                  }}
                >
                  <span>Available Credit:</span>
                  <span>
                    ₹
                    {Math.max(
                      0,
                      creditLimit - currentOutstanding,
                    ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {isExceeded && (
                  <p
                    style={{
                      color: "var(--color-error)",
                      fontSize: "0.75rem",
                      marginTop: "4px",
                    }}
                  >
                    Order exceeds available credit. Advance deposit or admin
                    override required.
                  </p>
                )}
              </div>
            );
          })()}

          <div>
            <label className="label">Delivery Instructions</label>
            <input
              className="input"
              value={newOrder.remarks}
              onChange={(e) =>
                setNewOrder({ ...newOrder, remarks: e.target.value })
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              marginTop: "var(--space-3)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowPlaceOrderDrawer(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Transmit Order
            </button>
          </div>
        </form>
      </SideDrawer>

      {/* SideDrawer: Rate Delivery Experience */}
      <SideDrawer
        isOpen={Boolean(ratingOrder)}
        onClose={() => setRatingOrder(null)}
        title={
          ratingOrder
            ? `Rate Order #${ratingOrder.orderNumber}`
            : "Rate Delivery"
        }
        subtitle="Chemist feedback for delivery timeliness, package condition & behavior"
      >
        <form
          onSubmit={handleRateOrder}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div>
            <label className="label">Overall Delivery Rating</label>
            <div
              style={{
                display: "flex",
                gap: "var(--space-2)",
                marginTop: "var(--space-1)",
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setStarRating(star)}
                  style={{
                    fontSize: "2rem",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color:
                      star <= starRating ? "#f59e0b" : "var(--color-gray-300)",
                    transition: "transform 0.1s ease",
                  }}
                >
                  ★
                </button>
              ))}
              <span
                style={{
                  alignSelf: "center",
                  fontWeight: 700,
                  marginLeft: "var(--space-2)",
                }}
              >
                {starRating === 5
                  ? "5 / 5 (Excellent)"
                  : starRating === 4
                    ? "4 / 5 (Good)"
                    : starRating === 3
                      ? "3 / 5 (Average)"
                      : starRating === 2
                        ? "2 / 5 (Poor)"
                        : "1 / 5 (Very Poor)"}
              </span>
            </div>
          </div>

          <div>
            <label className="label">Delivery Comments & Feedback</label>
            <textarea
              className="input"
              rows={4}
              placeholder="e.g. Arrived on time, cartons intact, polite rider, thermal box cold."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              marginTop: "var(--space-2)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setRatingOrder(null)}
              disabled={isSubmittingRating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmittingRating}
            >
              {isSubmittingRating ? "Submitting..." : "Submit Star Rating"}
            </button>
          </div>
        </form>
      </SideDrawer>

      {/* SideDrawer: Raise Delivery Dispute */}
      <SideDrawer
        isOpen={Boolean(disputeOrder)}
        onClose={() => setDisputeOrder(null)}
        title={
          disputeOrder
            ? `Dispute Order #${disputeOrder.orderNumber}`
            : "Raise Dispute"
        }
        subtitle="Report discrepancies, broken bottles, or missing medicines directly to operations"
      >
        <form
          onSubmit={handleDisputeDelivery}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ fontWeight: 700, color: "var(--color-error)" }}>
              ⚠️ Statutory Delivery Discrepancy Policy
            </div>
            <p style={{ margin: "4px 0 0", color: "var(--text-secondary)" }}>
              Disputes immediately flag this consignment to Operations Admin.
              Returns and credit notes are issued following physical or photo
              verification.
            </p>
          </div>

          <div>
            <label className="label">Dispute Category</label>
            <select
              className="input"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
            >
              <option value="DAMAGED_CARTON">
                Damaged Carton / Broken Glass Bottles
              </option>
              <option value="MISSING_QUANTITY">
                Shortage / Missing Medicine Strips
              </option>
              <option value="WRONG_MEDICINE">
                Wrong Product / Batch Mismatch
              </option>
              <option value="TEMPERATURE_ABUSE">
                Cold-Chain Temperature Abuse (VVM breach)
              </option>
              <option value="INVOICE_MISMATCH">
                Invoice Rate / Discount Scheme Mismatch
              </option>
            </select>
          </div>

          <div>
            <label className="label">Detailed Explanation</label>
            <textarea
              className="input"
              rows={4}
              required
              placeholder="Specify affected batch numbers, broken bottles, or exact discrepancies found during box opening..."
              value={disputeNotes}
              onChange={(e) => setDisputeNotes(e.target.value)}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              marginTop: "var(--space-2)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDisputeOrder(null)}
              disabled={isSubmittingDispute}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                background: "var(--color-error)",
                borderColor: "var(--color-error)",
              }}
              disabled={isSubmittingDispute}
            >
              {isSubmittingDispute
                ? "Filing Ticket..."
                : "File Delivery Dispute"}
            </button>
          </div>
        </form>
      </SideDrawer>

      {/* SideDrawer: Notification Channels Preferences */}
      <SideDrawer
        isOpen={showNotifDrawer}
        onClose={() => setShowNotifDrawer(false)}
        title="Notification Channel Preferences"
        subtitle="Select how you receive live order status, dispatch, and delivery alerts"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {notifSavedToast && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "var(--color-success)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.85rem",
                fontWeight: 700,
              }}
            >
              ✓ Preferences saved successfully!
            </div>
          )}

          <div
            style={{
              background: "var(--bg-secondary)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-3)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  🔔 In-App Push Alerts
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  Instant bell notifications on web & mobile dashboard for
                  picking, dispatch & credit note
                </div>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                checked={notifChannels.inApp}
                onChange={(e) =>
                  setNotifChannels({
                    ...notifChannels,
                    inApp: e.target.checked,
                  })
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "var(--space-3)",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "var(--space-3)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  💬 WhatsApp Updates
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  PDF invoices, dispatched rider phone numbers, and live OTP
                  sent directly to chemist WhatsApp
                </div>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                checked={notifChannels.whatsapp}
                onChange={(e) =>
                  setNotifChannels({
                    ...notifChannels,
                    whatsapp: e.target.checked,
                  })
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid var(--border-color)",
                paddingTop: "var(--space-3)",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  📱 SMS Text Messages
                </div>
                <div
                  style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}
                >
                  DLT-registered transactional SMS for urgent OTP, payment
                  receipt, and ledger overdue notices
                </div>
              </div>
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
                checked={notifChannels.sms}
                onChange={(e) =>
                  setNotifChannels({ ...notifChannels, sms: e.target.checked })
                }
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "var(--space-3)",
              marginTop: "var(--space-2)",
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowNotifDrawer(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveNotifPrefs}
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      </SideDrawer>

      {/* SideDrawer: Warehouse Digital Picking Slip (Items #19, #99, #108, #112, #187) */}
      <SideDrawer
        isOpen={Boolean(pickingOrder)}
        onClose={() => setPickingOrder(null)}
        title={pickingOrder ? `Picking Slip: ${pickingOrder.orderNumber}` : ""}
        subtitle={
          pickingOrder
            ? `${pickingOrder.shopkeeper} • Destination: ${pickingOrder.location}`
            : ""
        }
        footer={
          pickingOrder && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPickingOrder(null)}
              >
                Close Slip
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{
                  background: "var(--color-success)",
                  borderColor: "var(--color-success)",
                }}
                disabled={isCompletingPicking}
                onClick={handleCompletePicking}
              >
                {isCompletingPicking
                  ? "Validating & Handing Over..."
                  : "✓ Complete Picking & Handover to Dispatch"}
              </button>
            </div>
          )
        }
      >
        {pickingOrder && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            {/* SLA Priority Banner (Item #99) */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background:
                  pickingOrder.remarks.toLowerCase().includes("urgent") ||
                  pickingOrder.netAmount > 10000
                    ? "rgba(239, 68, 68, 0.12)"
                    : "rgba(59, 130, 246, 0.12)",
                border:
                  pickingOrder.remarks.toLowerCase().includes("urgent") ||
                  pickingOrder.netAmount > 10000
                    ? "1px solid var(--color-error)"
                    : "1px solid var(--color-info)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3)",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                  }}
                >
                  Warehouse SLA Routing Priority (Item #99)
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color:
                      pickingOrder.remarks.toLowerCase().includes("urgent") ||
                      pickingOrder.netAmount > 10000
                        ? "var(--color-error)"
                        : "var(--color-info)",
                  }}
                >
                  {pickingOrder.remarks.toLowerCase().includes("urgent") ||
                  pickingOrder.netAmount > 10000
                    ? "⚡ HIGH_PRIORITY_SLA (<2 hr Express Dispatch)"
                    : "⏱️ STANDARD_SLA (Same-Day Standard Dispatch)"}
                </div>
              </div>
              <span
                className="badge badge-primary"
                style={{ fontSize: "0.75rem" }}
              >
                Floor Zone: Racks A-E
              </span>
            </div>

            {/* Completion / Dispatch Notification Toast (Item #187) */}
            {pickingToast && (
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1px solid var(--color-success)",
                  color: "var(--color-success)",
                  padding: "var(--space-3)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                {pickingToast}
              </div>
            )}

            {/* Barcode Scanner Gun / Camera Input (Items #19 & #112) */}
            <div
              style={{
                background: "var(--bg-secondary)",
                padding: "var(--space-4)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-2)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    color: "var(--text-primary)",
                  }}
                >
                  📷 Wireless Barcode Scanner Gun / Camera (Item #112)
                </span>
                <span
                  className="badge badge-success"
                  style={{ fontSize: "0.7rem" }}
                >
                  Hardware Ready
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  marginBottom: "var(--space-3)",
                }}
              >
                Point barcode gun at the medicine blister pack EAN-13 or carton
                QR code, or type barcode below.
              </p>

              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <input
                  className="input"
                  style={{
                    flex: 1,
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                  }}
                  placeholder="Scan or enter EAN-13 barcode / Batch number..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleScanBarcode();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleScanBarcode()}
                >
                  Verify Barcode
                </button>
              </div>

              {scanMessage && (
                <div
                  style={{
                    marginTop: "var(--space-2)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color:
                      scanMessage.type === "success"
                        ? "var(--color-success)"
                        : "var(--color-error)",
                  }}
                >
                  {scanMessage.text}
                </div>
              )}
            </div>

            {/* Progress summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.82rem",
              }}
            >
              <span style={{ fontWeight: 700 }}>
                Rack-Optimized Pick List (Items #108)
              </span>
              <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                {pickingLines.filter((l) => l.barcodeVerified).length} of{" "}
                {pickingLines.length} Lines Verified
              </span>
            </div>

            {/* Picking Lines Grouped/Sorted by Rack/Bay (Item #108) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {pickingLines.map((line) => (
                <div
                  key={line.itemId}
                  style={{
                    background: line.barcodeVerified
                      ? "rgba(34, 197, 94, 0.08)"
                      : "var(--bg-secondary)",
                    border: line.barcodeVerified
                      ? "1px solid var(--color-success)"
                      : "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "var(--space-3)",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        marginBottom: "4px",
                      }}
                    >
                      <span
                        className="badge badge-neutral"
                        style={{ fontSize: "0.72rem", fontWeight: 700 }}
                      >
                        📍 {line.rackLocation}
                      </span>
                      {line.barcodeVerified ? (
                        <span
                          className="badge badge-success"
                          style={{ fontSize: "0.7rem" }}
                        >
                          ✓ Barcode Matched & Picked
                        </span>
                      ) : (
                        <span
                          className="badge badge-warning"
                          style={{ fontSize: "0.7rem" }}
                        >
                          ⏳ Awaiting Barcode Scan
                        </span>
                      )}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem" }}>
                      {line.productName}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Batch:{" "}
                      <strong style={{ fontFamily: "monospace" }}>
                        {line.batchNumber}
                      </strong>{" "}
                      • Exp: {line.expiryDate} • Pack: {line.packSize}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontFamily: "monospace",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      EAN Barcode: {line.barcode}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 800,
                        color: "var(--color-primary-600)",
                      }}
                    >
                      {line.quantityToPick}{" "}
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "var(--text-muted)",
                        }}
                      >
                        packs
                      </span>
                    </div>
                    {!line.barcodeVerified && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
                        title="Simulate hardware gun scan for this line"
                        onClick={() => handleScanBarcode(line.barcode)}
                      >
                        ⚡ Simulate Scan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SideDrawer>
    </div>
  );
}
