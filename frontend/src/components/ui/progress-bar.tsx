"use client";

import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "error" | "info" | string;
  showPercentage?: boolean;
  striped?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  size = "md",
  color = "primary",
  showPercentage = true,
  striped = false,
  animated = true,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightMap = {
    sm: "4px",
    md: "8px",
    lg: "12px",
  };

  const colorStyle = (() => {
    switch (color) {
      case "success":
        return "linear-gradient(90deg, #10b981, #34d399)";
      case "warning":
        return "linear-gradient(90deg, #f59e0b, #fbbf24)";
      case "error":
        return "linear-gradient(90deg, #ef4444, #f87171)";
      case "info":
        return "linear-gradient(90deg, #3b82f6, #60a5fa)";
      case "primary":
      default:
        return color.startsWith("#") || color.startsWith("var")
          ? color
          : "linear-gradient(90deg, var(--color-primary-600), var(--color-primary-400))";
    }
  })();

  return (
    <div
      className={`progress-wrapper ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || "Progress"}
      style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.35rem" }}
    >
      {(label || showPercentage) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "var(--font-size-xs)",
            color: "var(--text-secondary)",
            fontWeight: 500,
          }}
        >
          {label && <span>{label}</span>}
          {showPercentage && (
            <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
              {sublabel ? `${sublabel} (${percentage}%)` : `${percentage}%`}
            </span>
          )}
        </div>
      )}

      <div
        className="progress-bar"
        style={{
          height: heightMap[size],
          background: "var(--color-gray-200)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          className="progress-bar-fill"
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: colorStyle,
            borderRadius: "var(--radius-full)",
            transition: "width 800ms cubic-bezier(0.16, 1, 0.3, 1)",
            backgroundImage: striped
              ? "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)"
              : undefined,
            backgroundSize: striped ? "1rem 1rem" : undefined,
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
