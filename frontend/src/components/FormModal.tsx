"use client";

import { useEffect, useCallback } from "react";

interface FormModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  submitVariant?: "primary" | "gold";
  submitting?: boolean;
  children: React.ReactNode;
  /** Optional accent color bar at top of modal */
  accent?: "blue" | "gold";
}

export default function FormModal({
  open,
  title,
  onClose,
  onSubmit,
  submitLabel = "Save",
  submitVariant = "primary",
  submitting = false,
  children,
  accent = "blue",
}: FormModalProps) {
  const handleEsc = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, handleEsc]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Accent strip */}
        <div
          style={{
            height: 4,
            borderRadius: "20px 20px 0 0",
            background:
              accent === "gold"
                ? "linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light))"
                : "linear-gradient(90deg, var(--primary-dark), var(--primary), var(--primary-light))",
          }}
        />

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} type="button">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(e);
          }}
        >
          <div className="modal-body">{children}</div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`btn ${submitVariant === "gold" ? "btn-gold" : "btn-primary"}`}
              disabled={submitting}
            >
              {submitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
