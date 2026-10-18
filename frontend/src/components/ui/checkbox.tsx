"use client";

import React from "react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = "", id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        <label
          htmlFor={inputId}
          style={{
            display: "inline-flex",
            alignItems: "flex-start",
            gap: "var(--space-3)",
            cursor: props.disabled ? "not-allowed" : "pointer",
            userSelect: "none",
            opacity: props.disabled ? 0.6 : 1,
          }}
        >
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={`checkbox ${className}`}
            style={{ marginTop: "0.2rem" }}
            {...props}
          />
          {(label || description) && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {label && (
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                  }}
                >
                  {label}
                </span>
              )}
              {description && (
                <span style={{ fontSize: "var(--font-size-xs)", color: "var(--text-muted)" }}>
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && (
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-error)" }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
