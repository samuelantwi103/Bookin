"use client";

import type { AvailabilitySlot } from "@/lib/types";

interface AvailabilityGridProps {
  slots: AvailabilitySlot[];
  onSlotSelect: (slot: AvailabilitySlot) => void;
  selectedSlot: AvailabilitySlot | null;
}

export default function AvailabilityGrid({ slots, onSlotSelect, selectedSlot }: AvailabilityGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 12,
      }}
    >
      {slots.map((slot, i) => {
        const isSelected =
          selectedSlot?.startTime === slot.startTime &&
          selectedSlot?.endTime === slot.endTime;

        return (
          <div
            key={i}
            onClick={() => slot.available && onSlotSelect(slot)}
            style={{
              padding: "14px 12px",
              borderRadius: "var(--radius)",
              border: `1.5px solid ${
                isSelected
                  ? "var(--primary)"
                  : slot.available
                  ? "var(--border)"
                  : "transparent"
              }`,
              background: !slot.available
                ? "var(--bg-alt)"
                : isSelected
                ? "rgba(0,45,95,0.06)"
                : "var(--surface)",
              cursor: slot.available ? "pointer" : "not-allowed",
              textAlign: "center",
              opacity: slot.available ? 1 : 0.4,
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {slot.startTime.substring(0, 5)} – {slot.endTime.substring(0, 5)}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                marginTop: 4,
                color: slot.available ? "var(--success)" : "var(--error)",
              }}
            >
              {slot.available ? "AVAILABLE" : "BOOKED"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
