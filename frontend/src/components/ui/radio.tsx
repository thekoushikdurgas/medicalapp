"use client";

import React from "react";

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
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
          type="radio"
          id={inputId}
          className={`radio ${className}`}
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
    );
  }
);

Radio.displayName = "Radio";
export default Radio;
