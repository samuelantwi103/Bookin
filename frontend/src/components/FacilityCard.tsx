"use client";

import type { Facility } from "@/lib/types";
import { FACILITY_TYPE_LABELS, FACILITY_TYPE_ICONS } from "@/lib/types";

interface FacilityCardProps {
  facility: Facility;
  onSelect: (id: number) => void;
  selected?: boolean;
}

export default function FacilityCard({ facility, onSelect, selected }: FacilityCardProps) {
  return (
    <div
      className="card card-hover"
      onClick={() => onSelect(facility.id)}
      style={{
        cursor: "pointer",
        borderColor: selected ? "var(--primary)" : "var(--border)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>{FACILITY_TYPE_ICONS[facility.type]}</span>
          <span className="badge badge-info">{FACILITY_TYPE_LABELS[facility.type]}</span>
        </div>

        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          {facility.name}
        </h3>

        <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
          📍 {facility.location}
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--text-muted)" }}>
          <span>👥 {facility.capacity}</span>
          {facility.floor && <span>Floor {facility.floor}</span>}
          {facility.roomNumber && <span>Room {facility.roomNumber}</span>}
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>
        View Availability →
      </div>
    </div>
  );
}
