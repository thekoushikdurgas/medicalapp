"use client";

import React, { useEffect } from "react";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function SideDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: SideDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="side-drawer-backdrop" onClick={onClose}>
      <div className="side-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="side-drawer-header">
          <div>
            <h3
              style={{
                fontSize: "var(--font-size-lg)",
                fontWeight: 700,
                margin: 0,
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  margin: "2px 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              padding: "4px 10px",
              fontSize: "16px",
              borderRadius: "var(--radius-full)",
            }}
            aria-label="Close panel"
          >
            ✕
          </button>
        </div>

        <div className="side-drawer-body">{children}</div>

        {footer && <div className="side-drawer-footer">{footer}</div>}
      </div>
    </div>
  );
}
