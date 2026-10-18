"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  XCircle,
  FileCheck,
  Sparkles,
} from "lucide-react";

export type StatusType =
  | "DELIVERED"
  | "DISPATCHED"
  | "PICKING"
  | "CONFIRMED"
  | "PLACED"
  | "CANCELLED"
  | "PENDING"
  | "PAID"
  | "OVERDUE"
  | "HIGH"
  | "NORMAL"
  | "LOW"
  | "ACTIVE"
  | "INACTIVE"
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export function StatusBadge({
  status,
  label,
  className = "",
  showIcon = true,
}: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  let badgeClass = "badge-neutral";
  let icon = <Sparkles size={12} className="icon-animate" />;
  let displayLabel = label || status;

  switch (norm) {
    case "DELIVERED":
    case "PAID":
    case "ACTIVE":
      badgeClass = "badge-success";
      icon = <CheckCircle2 size={12} className="icon-pulse" />;
      break;

    case "DISPATCHED":
      badgeClass = "badge-info";
      icon = <Truck size={12} className="icon-bounce" />;
      break;

    case "PICKING":
      badgeClass = "badge-warning";
      icon = <Package size={12} className="icon-pulse" />;
      break;

    case "CONFIRMED":
      badgeClass = "badge-primary";
      icon = <FileCheck size={12} className="icon-animate" />;
      break;

    case "PLACED":
    case "PENDING":
      badgeClass = "badge-neutral";
      icon = <Clock size={12} className="icon-animate" />;
      break;

    case "CANCELLED":
    case "OVERDUE":
    case "HIGH":
      badgeClass = "badge-error";
      icon = <AlertTriangle size={12} className="icon-bounce" />;
      break;

    case "INACTIVE":
      badgeClass = "badge-neutral";
      icon = <XCircle size={12} />;
      break;

    case "NORMAL":
      badgeClass = "badge-info";
      icon = <Sparkles size={12} />;
      break;

    case "LOW":
      badgeClass = "badge-neutral";
      icon = <Clock size={12} />;
      break;
  }

  return (
    <span
      className={`badge ${badgeClass} ${className}`}
      role="status"
      aria-label={`Status: ${displayLabel}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        transition: "all var(--transition-fast)",
      }}
    >
      {showIcon && icon}
      <span style={{ textTransform: "capitalize", letterSpacing: "0.02em" }}>
        {displayLabel}
      </span>
    </span>
  );
}

export default StatusBadge;
