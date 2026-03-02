"use client";

import { useEffect, useRef } from "react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

const VARIANT_CONFIG = {
  danger: { icon: "⚠️", bg: "var(--error-bg)", color: "var(--error)", btnClass: "btn-danger" },
  warning: { icon: "⚡", bg: "var(--warning-bg)", color: "var(--warning)", btnClass: "btn-gold" },
  info: { icon: "ℹ️", bg: "var(--info-bg)", color: "var(--info)", btnClass: "btn-primary" },
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "info",
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const config = VARIANT_CONFIG[variant];

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      // Focus trap
      dialogRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onCancel();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="confirm-dialog" ref={dialogRef} tabIndex={-1}>
        <div
          className="confirm-icon"
          style={{ background: config.bg, color: config.color }}
        >
          {config.icon}
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        {children}
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`btn ${config.btnClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
