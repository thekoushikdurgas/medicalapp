"use client";

import React from "react";
import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`empty-state ${className}`}>
      <div
        className="empty-state-icon icon-bounce"
        style={{
          width: 56,
          height: 56,
          borderRadius: "var(--radius-xl)",
          background: "var(--color-gray-100)",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "var(--space-3)",
        }}
      >
        {icon || <PackageOpen size={28} />}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
          style={{ marginTop: "var(--space-4)" }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
