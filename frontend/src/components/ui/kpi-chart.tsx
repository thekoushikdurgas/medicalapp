"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Package, Truck, FileCheck, ArrowRight } from "lucide-react";

// ── 1. Interactive Trend Area Chart ──────────────────────────────

interface DataPoint {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  title?: string;
  subtitle?: string;
  data: DataPoint[];
  color?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  height?: number;
}

export function TrendAreaChart({
  title = "Revenue & Sales Trajectory",
  subtitle = "Last 7 days performance (GST-compliant wholesale)",
  data,
  color = "#059669",
  valuePrefix = "₹",
  valueSuffix = "",
  height = 220,
}: TrendAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 600;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y =
      paddingTop + (1 - (d.value - minVal) / range) * (height - paddingTop - paddingBottom);
    return { x, y, ...d };
  });

  // Construct smooth bezier curve path
  const linePath = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x},${curr.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (curr.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (curr.x - prev.x) / 2;
    const cy2 = curr.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${curr.x},${curr.y}`;
  }, "");

  const areaPath = `${linePath} L ${points[points.length - 1].x},${
    height - paddingBottom
  } L ${points[0].x},${height - paddingBottom} Z`;

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div
      className="card stagger-in"
      style={{
        padding: "var(--space-6)",
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "var(--space-4)",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: 700,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
                display: "inline-block",
              }}
            />
            {title}
          </h3>
          {subtitle && (
            <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
              {subtitle}
            </p>
          )}
        </div>

        {activePoint && (
          <div
            style={{
              textAlign: "right",
              background: "var(--bg-secondary)",
              padding: "4px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
            }}
          >
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{activePoint.label}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: color }}>
              {valuePrefix}
              {activePoint.value.toLocaleString("en-IN")}
              {valueSuffix}
            </div>
          </div>
        )}
      </div>

      <div style={{ width: "100%", position: "relative" }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", overflow: "visible" }}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.35" />
              <stop offset="95%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = paddingTop + pct * (height - paddingTop - paddingBottom);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="var(--border-color)"
                strokeDasharray="4 4"
                strokeWidth="1"
                opacity="0.6"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#grad-${color})`} />

          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points & Interactive hits */}
          {points.map((p, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill="var(--bg-primary)"
                  stroke={color}
                  strokeWidth={isHovered ? 3 : 2}
                  style={{
                    transition: "all 150ms ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={18}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                <text
                  x={p.x}
                  y={height - 10}
                  textAnchor="middle"
                  fill={isHovered ? "var(--text-primary)" : "var(--text-muted)"}
                  fontSize="11"
                  fontWeight={isHovered ? 700 : 500}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── 2. Order Fulfillment Flow Graph ──────────────────────────────

export type FlowStep = "PLACED" | "CONFIRMED" | "PICKING" | "DISPATCHED" | "DELIVERED";

interface OrderFlowTimelineProps {
  currentStep: FlowStep;
  orderNumber?: string;
  orderDate?: string;
}

const FLOW_STEPS: { key: FlowStep; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: "PLACED", label: "Order Placed", icon: <Clock size={16} />, desc: "Shopkeeper placed via portal" },
  { key: "CONFIRMED", label: "Confirmed", icon: <FileCheck size={16} />, desc: "Credit & GST check passed" },
  { key: "PICKING", label: "Warehouse Picking", icon: <Package size={16} />, desc: "FEFO batch allocation" },
  { key: "DISPATCHED", label: "Dispatched", icon: <Truck size={16} />, desc: "Assigned to delivery agent" },
  { key: "DELIVERED", label: "Delivered", icon: <CheckCircle2 size={16} />, desc: "OTP verification complete" },
];

export function OrderFlowTimeline({
  currentStep,
  orderNumber = "ORD-2026-004448",
  orderDate = "Today, 11:30 AM",
}: OrderFlowTimelineProps) {
  const currentIndex = FLOW_STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div
      className="card"
      style={{
        padding: "var(--space-6)",
        background: "var(--bg-primary)",
        width: "100%",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--space-6)",
          flexWrap: "wrap",
          gap: "var(--space-2)",
        }}
      >
        <div>
          <h3
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: 700,
              color: "var(--text-primary)",
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span>Fulfillment Pipeline Flow</span>
            <span className="badge badge-primary">{orderNumber}</span>
          </h3>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)", marginTop: "2px" }}>
            Real-time live status tracking • {orderDate}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          minWidth: "620px",
          position: "relative",
          padding: "var(--space-2) 0",
        }}
      >
        {FLOW_STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isFuture = idx > currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  width: "120px",
                  zIndex: 2,
                }}
              >
                <div
                  className={`icon-animate ${isCurrent ? "icon-pulse" : ""}`}
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-2)",
                    background: isDone
                      ? "var(--color-primary-600)"
                      : isCurrent
                      ? "var(--color-primary-50)"
                      : "var(--color-gray-100)",
                    color: isDone
                      ? "#ffffff"
                      : isCurrent
                      ? "var(--color-primary-700)"
                      : "var(--text-muted)",
                    border: isCurrent
                      ? "2px solid var(--color-primary-600)"
                      : isDone
                      ? "none"
                      : "1px solid var(--border-color)",
                    boxShadow: isCurrent ? "0 0 0 4px var(--color-primary-100)" : "none",
                    transition: "all var(--transition-base)",
                  }}
                >
                  {isDone ? <CheckCircle2 size={18} /> : step.icon}
                </div>

                <div
                  style={{
                    fontSize: "var(--font-size-xs)",
                    fontWeight: isCurrent ? 700 : isDone ? 600 : 500,
                    color: isCurrent
                      ? "var(--color-primary-700)"
                      : isDone
                      ? "var(--text-primary)"
                      : "var(--text-muted)",
                    marginBottom: "2px",
                  }}
                >
                  {step.label}
                </div>

                <div
                  style={{
                    fontSize: "0.68rem",
                    color: "var(--text-muted)",
                    lineHeight: 1.2,
                  }}
                >
                  {step.desc}
                </div>
              </div>

              {/* Step connector arrow/bar */}
              {idx < FLOW_STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    marginTop: "1.375rem",
                    background: idx < currentIndex ? "var(--color-primary-600)" : "var(--border-color)",
                    transition: "background var(--transition-slow)",
                    position: "relative",
                  }}
                >
                  {idx === currentIndex - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "-5px",
                        color: "var(--color-primary-600)",
                      }}
                    >
                      <ArrowRight size={12} />
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export default TrendAreaChart;
