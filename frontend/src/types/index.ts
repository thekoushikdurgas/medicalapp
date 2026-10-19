/**
 * Shared TypeScript types for the Pharmacy Fantasy frontend.
 */

export type UserRole =
  "SUPER_ADMIN" | "ADMIN" | "WAREHOUSE" | "DELIVERY" | "SHOPKEEPER";

export type OrderStatus =
  | "DRAFT"
  | "PLACED"
  | "CONFIRMED"
  | "PICKING"
  | "PACKED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED";

export type DeliveryStatus =
  "ASSIGNED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  composition: string | null;
  manufacturer: string | null;
  packSize: string;
  hsnCode: string | null;
  category: string | null;
  defaultMrp: number | null;
  availableStock: number | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  gstAmount: number;
  netAmount: number;
  placedAt: string | null;
  confirmedAt: string | null;
  deliveredAt: string | null;
  remarks: string | null;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  todaySales: number;
  lowStockCount: number;
  expiringBatchesCount: number;
  outstandingPayments: number;
}
