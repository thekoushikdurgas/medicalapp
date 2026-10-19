"use client";

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  onClick?: () => void;
}

export function StatCard({
  icon,
  label,
  value,
  color = "var(--color-primary-600)",
  sub,
  trend,
  onClick,
}: StatCardProps) {
  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: "var(--space-5)",
        borderTop: `3px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition:
          "transform var(--transition-fast), box-shadow var(--transition-fast)",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "var(--space-3)",
            gap: "var(--space-2)",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.25rem",
              }}
            >
              {label}
            </p>
            <div
              style={{
                fontSize: "var(--font-size-2xl)",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {value}
            </div>
          </div>

          <div
            className="icon-animate"
            style={{
              width: "2.75rem",
              height: "2.75rem",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: color,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-2)",
          marginTop: "var(--space-3)",
          paddingTop: "var(--space-2)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        {sub && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              margin: 0,
            }}
          >
            {sub}
          </p>
        )}

        {trend && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "2px 6px",
              borderRadius: "var(--radius-full)",
              background: trend.isNeutral
                ? "var(--color-gray-100)"
                : trend.isPositive
                  ? "rgba(16, 185, 129, 0.12)"
                  : "rgba(239, 68, 68, 0.12)",
              color: trend.isNeutral
                ? "var(--text-secondary)"
                : trend.isPositive
                  ? "var(--color-success)"
                  : "var(--color-error)",
            }}
          >
            {trend.isNeutral ? (
              <Minus size={12} />
            ) : trend.isPositive ? (
              <TrendingUp size={12} className="icon-bounce" />
            ) : (
              <TrendingDown size={12} className="icon-bounce" />
            )}
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;
