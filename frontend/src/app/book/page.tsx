"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/ConfirmModal";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Building, Facility, AvailabilitySlot } from "@/lib/types";
import { FACILITY_TYPE_LABELS, FACILITY_TYPE_ICONS } from "@/lib/types";
import Link from "next/link";
import { Lock, Calendar, Building2 as BuildingIcon } from "lucide-react";

function BookContent() {
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();

  // Data
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  // Wizard state
  const [step, setStep] = useState(1);
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot[]>([]);
  const [purpose, setPurpose] = useState("");

  // UI
  const [loading, setLoading] = useState(true);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    api.fetchBuildings().then((b) => {
      setBuildings(b);
      setLoading(false);
      const preselected = searchParams.get("building");
      if (preselected) {
        const id = parseInt(preselected, 10);
        if (!isNaN(id)) {
          setSelectedBuilding(id);
          setStep(2);
          loadFacilities(id);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFacilities = async (buildingId: number) => {
    setFacilitiesLoading(true);
    try {
      const facs = await api.fetchFacilities(buildingId);
      setFacilities(facs);
    } finally {
      setFacilitiesLoading(false);
    }
  };

  const loadSlots = async (facilityId: number, date: string) => {
    setSlotsLoading(true);
    try {
      const s = await api.fetchAvailability(facilityId, date);
      setSlots(s);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBuildingSelect = (id: number) => {
    setSelectedBuilding(id);
    setSelectedFacility(null);
    setSelectedSlots([]);
    setStep(2);
    loadFacilities(id);
  };

  const handleFacilitySelect = (id: number) => {
    setSelectedFacility(id);
    setSelectedSlots([]);
    setStep(3);
    loadSlots(id, selectedDate);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedSlots([]);
    if (selectedFacility) loadSlots(selectedFacility, date);
  };

  // Multi-slot selection: only allow consecutive available slots
  const handleSlotToggle = (slot: AvailabilitySlot, slotIndex: number) => {
    if (!slot.available) return;

    const isSelected = selectedSlots.some(
      (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
    );

    if (isSelected) {
      // Only allow deselecting from edges (first or last)
      const sortedIndices = selectedSlots
        .map((s) => slots.findIndex((sl) => sl.startTime === s.startTime))
        .sort((a, b) => a - b);
      const myIdx = slots.findIndex((s) => s.startTime === slot.startTime);
      if (myIdx === sortedIndices[0] || myIdx === sortedIndices[sortedIndices.length - 1]) {
        setSelectedSlots(selectedSlots.filter(
          (s) => !(s.startTime === slot.startTime && s.endTime === slot.endTime)
        ));
      }
      return;
    }

    // Adding a new slot — must be adjacent to existing selection
    if (selectedSlots.length === 0) {
      setSelectedSlots([slot]);
      return;
    }

    const selectedIndices = selectedSlots
      .map((s) => slots.findIndex((sl) => sl.startTime === s.startTime))
      .sort((a, b) => a - b);
    const minIdx = selectedIndices[0];
    const maxIdx = selectedIndices[selectedIndices.length - 1];

    if (slotIndex === minIdx - 1 || slotIndex === maxIdx + 1) {
      // Check all slots in the range are available
      const newMin = Math.min(minIdx, slotIndex);
      const newMax = Math.max(maxIdx, slotIndex);
      const allAvailable = slots.slice(newMin, newMax + 1).every((s) => s.available);
      if (allAvailable) {
        setSelectedSlots(slots.slice(newMin, newMax + 1));
      }
    }
  };

  const handleProceedToConfirm = () => {
    if (selectedSlots.length > 0) {
      setStep(4);
    }
  };

  const getTimeRange = () => {
    if (selectedSlots.length === 0) return { start: "", end: "" };
    const sorted = [...selectedSlots].sort((a, b) => a.startTime.localeCompare(b.startTime));
    return {
      start: sorted[0].startTime.substring(0, 5),
      end: sorted[sorted.length - 1].endTime.substring(0, 5),
    };
  };

  const handleConfirm = async () => {
    if (!user || !selectedFacility || selectedSlots.length === 0) return;
    setSubmitting(true);
    setError(null);
    setShowConfirm(false);
    const range = getTimeRange();
    try {
      await api.createBooking({
        facilityId: selectedFacility,
        userId: user.id,
        date: selectedDate,
        startTime: range.start,
        endTime: range.end,
        status: "CONFIRMED",
        purpose: purpose || undefined,
      });
      setSuccess("Booking confirmed! You can view it in My Bookings.");
      setStep(1);
      setSelectedBuilding(null);
      setSelectedFacility(null);
      setSelectedSlots([]);
      setPurpose("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const currentBuilding = buildings.find((b) => b.id === selectedBuilding);
  const currentFacility = facilities.find((f) => f.id === selectedFacility);
  const timeRange = getTimeRange();

  if (authLoading) {
    return (
      <main>
        <Navbar />
        <div className="page container">
          <div className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)", marginBottom: 24 }} />
          <div className="skeleton" style={{ height: 40, maxWidth: 500, marginBottom: 24 }} />
          <div className="grid grid-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <Navbar />
        <div className="page container" style={{ textAlign: "center", paddingTop: 200 }}>
          <div className="empty-state">
            <div className="empty-state-icon"><Lock size={48} /></div>
            <h3>Sign in required</h3>
            <p style={{ marginBottom: 24 }}>
              You need to sign in to book a facility.
            </p>
            <Link href="/login" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="page container">
        {/* Header banner */}
        <div
          className="banner-blue"
          style={{ marginBottom: 24, padding: "28px 32px" }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(20px, 4vw, 28px)",
              fontWeight: 800,
              color: "white",
              marginBottom: 4,
              position: "relative",
            }}
          >
            Book a Facility
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", position: "relative" }}>
            Follow the steps below to reserve a room on campus
          </p>
        </div>

        {/* Messages */}
        {success && (
          <div
            style={{
              padding: 16,
              background: "var(--success-bg)",
              color: "var(--success)",
              borderRadius: "var(--radius)",
              marginBottom: 24,
              fontWeight: 600,
              fontSize: 14,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>✓ {success}</span>
            <Link href="/bookings" className="btn btn-sm btn-primary">
              View Bookings
            </Link>
          </div>
        )}
        {error && (
          <div
            style={{
              padding: 16,
              background: "var(--error-bg)",
              color: "var(--error)",
              borderRadius: "var(--radius)",
              marginBottom: 24,
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Steps */}
        <div className="steps">
          {["Building", "Room", "Date & Time", "Confirm"].map((label, i) => {
            const num = i + 1;
            const isActive = step === num;
            const isCompleted = step > num;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center" }}>
                <div
                  className={`step ${isActive ? "active" : ""} ${
                    isCompleted ? "completed" : ""
                  }`}
                  style={{ cursor: isCompleted ? "pointer" : "default" }}
                  onClick={() => isCompleted && setStep(num)}
                >
                  <div className="step-number">
                    {isCompleted ? "✓" : num}
                  </div>
                  <span className="step-label">{label}</span>
                </div>
                {i < 3 && (
                  <div
                    className={`step-divider ${isCompleted ? "completed" : ""} ${
                      isActive ? "active" : ""
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1: Building */}
        {step === 1 && (
          <section>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                marginBottom: 20,
              }}
            >
              Select a Building
            </h2>
            {loading ? (
              <div className="grid grid-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 120 }} />
                ))}
              </div>
            ) : (
              <div className="grid grid-3">
                {buildings.map((b) => (
                  <div
                    key={b.id}
                    className="card card-hover"
                    onClick={() => handleBuildingSelect(b.id)}
                    style={{
                      cursor: "pointer",
                      borderColor:
                        selectedBuilding === b.id
                          ? "var(--primary)"
                          : "var(--border)",
                      borderTop: selectedBuilding === b.id
                        ? "3px solid var(--gold)"
                        : "3px solid var(--primary)",
                    }}
                  >
                    <span className="badge badge-primary">{b.code}</span>
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        fontFamily: "var(--font-display)",
                        margin: "8px 0 4px",
                      }}
                    >
                      {b.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                      }}
                    >
                      {b.campus}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 2: Room */}
        {step === 2 && currentBuilding && (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>
                ← Back
              </button>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                }}
              >
                {currentBuilding.name} — Choose a Room
              </h2>
            </div>
            {facilitiesLoading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 180, borderRadius: "var(--radius)" }} />
                ))}
              </div>
            ) : facilities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><BuildingIcon size={48} /></div>
                <h3>No facilities found</h3>
                <p>This building has no bookable rooms yet.</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {facilities.map((f) => (
                  <div
                    key={f.id}
                    className="card card-hover"
                    onClick={() => handleFacilitySelect(f.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 24,
                            marginBottom: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40,
                            height: 40,
                            borderRadius: "var(--radius)",
                            background: "var(--primary-50)",
                          }}
                        >
                          {FACILITY_TYPE_ICONS[f.type]}
                        </span>
                        <h3
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
                            fontFamily: "var(--font-display)",
                            marginBottom: 4,
                          }}
                        >
                          {f.name}
                        </h3>
                        <span className="badge badge-gold" style={{ marginBottom: 8 }}>
                          {FACILITY_TYPE_LABELS[f.type]}
                        </span>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: 13,
                          color: "var(--text-muted)",
                        }}
                      >
                        {f.floor && <div>Floor {f.floor}</div>}
                        {f.roomNumber && <div>Room {f.roomNumber}</div>}
                      </div>
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        display: "flex",
                        gap: 16,
                        fontSize: 13,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span>{f.capacity} seats</span>
                      <span style={{ opacity: 0.6 }}>·</span>
                      <span>{f.location}</span>
                    </div>
                    {f.amenities && (
                      <div
                        style={{
                          marginTop: 8,
                          fontSize: 12,
                          color: "var(--text-muted)",
                        }}
                      >
                        {f.amenities}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 3: Date & Time */}
        {step === 3 && currentFacility && (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>
                ← Back
              </button>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                }}
              >
                {currentFacility.name} — Pick Date & Time
              </h2>
            </div>

            {/* Date picker */}
            <div className="field" style={{ maxWidth: 300 }}>
              <label className="label">Date</label>
              <input
                className="input"
                type="date"
                value={selectedDate}
                min={today}
                max={maxDate}
                onChange={(e) => handleDateChange(e.target.value)}
              />
            </div>

            {/* Time slots */}
            {slotsLoading ? (
              <div className="grid grid-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 72 }} />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon"><Calendar size={48} /></div>
                <h3>No slots available</h3>
                <p>Try picking a different date.</p>
              </div>
            ) : (
              <>
                {selectedSlots.length > 0 && (
                  <div
                    style={{
                      padding: "14px 18px",
                      background: "linear-gradient(135deg, var(--gold-50) 0%, var(--gold-100) 100%)",
                      border: "2px solid var(--gold)",
                      borderRadius: "var(--radius)",
                      marginBottom: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: 14, color: "var(--primary-dark)", fontWeight: 700 }}>
                      ✨ {selectedSlots.length} slot{selectedSlots.length > 1 ? "s" : ""} selected: {timeRange.start} – {timeRange.end}
                    </div>
                    <button
                      className="btn btn-gold btn-sm"
                      onClick={handleProceedToConfirm}
                    >
                      Continue →
                    </button>
                  </div>
                )}
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                  Click to select time slots. Select multiple consecutive slots for longer bookings.
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                    gap: 12,
                  }}
                >
                  {slots.map((slot, i) => {
                    const isSelected = selectedSlots.some(
                      (s) => s.startTime === slot.startTime && s.endTime === slot.endTime
                    );
                    return (
                      <div
                        key={i}
                        onClick={() => handleSlotToggle(slot, i)}
                        style={{
                          padding: "14px 12px",
                          borderRadius: "var(--radius)",
                          border: `2px solid ${
                            isSelected
                              ? "var(--primary)"
                              : slot.available
                              ? "var(--border)"
                              : "transparent"
                          }`,
                          background: !slot.available
                            ? "var(--bg-alt)"
                            : isSelected
                            ? "var(--primary-50)"
                            : "var(--surface)",
                          cursor: slot.available ? "pointer" : "not-allowed",
                          textAlign: "center",
                          opacity: slot.available ? 1 : 0.4,
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                          {slot.startTime.substring(0, 5)} –{" "}
                          {slot.endTime.substring(0, 5)}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            marginTop: 4,
                            color: isSelected
                              ? "var(--primary)"
                              : slot.available
                              ? "var(--success)"
                              : "var(--error)",
                          }}
                        >
                          {isSelected ? "SELECTED" : slot.available ? "AVAILABLE" : "BOOKED"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        )}

        {/* Step 4: Confirm */}
        {step === 4 && currentBuilding && currentFacility && selectedSlots.length > 0 && (
          <section>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep(3)}>
                ← Back
              </button>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                }}
              >
                Review & Confirm
              </h2>
            </div>

            <div className="card" style={{ maxWidth: 560, borderTop: "4px solid var(--gold)" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px 32px",
                  marginBottom: 24,
                }}
              >
                <div>
                  <div className="label">Building</div>
                  <div style={{ fontWeight: 600 }}>{currentBuilding.name}</div>
                </div>
                <div>
                  <div className="label">Room</div>
                  <div style={{ fontWeight: 600 }}>{currentFacility.name}</div>
                </div>
                <div>
                  <div className="label">Date</div>
                  <div style={{ fontWeight: 600 }}>
                    {new Date(selectedDate + "T00:00").toLocaleDateString("en-GB", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <div className="label">Time</div>
                  <div style={{ fontWeight: 600 }}>
                    {timeRange.start} – {timeRange.end}
                    {selectedSlots.length > 1 && (
                      <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>
                        ({selectedSlots.length} slots)
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="label">Type</div>
                  <div style={{ fontWeight: 600 }}>
                    {FACILITY_TYPE_ICONS[currentFacility.type]}{" "}
                    {FACILITY_TYPE_LABELS[currentFacility.type]}
                  </div>
                </div>
                <div>
                  <div className="label">Capacity</div>
                  <div style={{ fontWeight: 600 }}>
                    {currentFacility.capacity} seats
                  </div>
                </div>
              </div>

              <div className="field">
                <label className="label">Purpose (optional)</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g. Study group session, Team meeting..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button
                  className="btn btn-gold btn-lg"
                  onClick={() => setShowConfirm(true)}
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  {submitting ? "Booking..." : "Confirm Booking"}
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setStep(1);
                    setSelectedBuilding(null);
                    setSelectedFacility(null);
                    setSelectedSlots([]);
                    setPurpose("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Confirmation modal */}
            <ConfirmModal
              open={showConfirm}
              title="Confirm Your Booking"
              message={`You are about to book ${currentFacility.name} at ${currentBuilding.name} on ${new Date(selectedDate + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} from ${timeRange.start} to ${timeRange.end}. This action cannot be easily undone.`}
              confirmLabel={submitting ? "Booking..." : "Yes, Book Now"}
              variant="info"
              onConfirm={handleConfirm}
              onCancel={() => setShowConfirm(false)}
            />
          </section>
        )}
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <main>
          <Navbar />
          <div className="page container">
            <div className="skeleton" style={{ height: 400, maxWidth: 800 }} />
          </div>
        </main>
      }
    >
      <BookContent />
    </Suspense>
  );
}
