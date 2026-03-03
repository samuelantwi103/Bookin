"use client";

import { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/ConfirmModal";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import type { Booking } from "@/lib/types";
import { BOOKING_STATUS_LABELS, FACILITY_TYPE_ICONS, FACILITY_TYPE_LABELS } from "@/lib/types";
import { Lock, Calendar, Star, Building2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function Bookings() {
  // Load cached bookings from localStorage
  const loadCachedBookings = () => {
    if (typeof window === 'undefined') return [];
    try {
      const cached = localStorage.getItem('user-bookings-cache');
      if (cached) {
        const data = JSON.parse(cached);
        const cacheTime = localStorage.getItem('user-bookings-cache-time');
        // Use cache if less than 3 minutes old
        if (cacheTime && Date.now() - parseInt(cacheTime) < 3 * 60 * 1000) {
          return data;
        }
      }
    } catch (e) {
      console.error('Failed to load cached bookings:', e);
    }
    return [];
  };

  const [bookings, setBookings] = useState<Booking[]>(loadCachedBookings());
  const [filter, setFilter] = useState<"all" | "CONFIRMED" | "CANCELLED" | "PENDING">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approveTarget, setApproveTarget] = useState<number | null>(null);
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const accentText = theme === "dark" ? "var(--gold)" : "var(--primary)";
  const accentMuted = theme === "dark" ? "var(--gold)" : "var(--primary-dark)";

  useEffect(() => {
    if (user) loadBookings();
  }, [user]);

  const loadBookings = async () => {
    try {
      const data = user?.role === "ADMIN"
        ? await api.fetchBookings()
        : await api.fetchBookings(user!.id);
      const sortedData = data.sort((a: Booking, b: Booking) => b.id - a.id);
      setBookings(sortedData);
      
      // Cache the bookings
      try {
        localStorage.setItem('user-bookings-cache', JSON.stringify(sortedData));
        localStorage.setItem('user-bookings-cache-time', Date.now().toString());
      } catch (e) {
        console.error('Failed to cache bookings:', e);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    setCanceling(true);
    try {
      await api.cancelBooking(id);
      setCancelTarget(null);
      loadBookings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cancel failed");
      setCancelTarget(null);
    } finally {
      setCanceling(false);
    }
  };

  const handleApprove = async (id: number) => {
    setApproving(true);
    try {
      await api.approveBooking(id);
      setApproveTarget(null);
      loadBookings();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Approve failed");
      setApproveTarget(null);
    } finally {
      setApproving(false);
    }
  };

  const displayed = filter === "all"
    ? bookings
    : bookings.filter((b) => b.status === filter);

  const badgeClass = (s: string) =>
    s === "CONFIRMED" ? "badge-success" : s === "CANCELLED" ? "badge-error" : "badge-warning";

  if (authLoading) {
    return (
      <main>
        <Navbar />
        <div className="page container">
          <div className="skeleton" style={{ height: 100, borderRadius: "var(--radius-lg)", marginBottom: 24 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60 }} />)}
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
            <p style={{ marginBottom: 24 }}>Sign in to view your bookings.</p>
            <Link href="/login" className="btn btn-primary">Sign In</Link>
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
          style={{ marginBottom: 24, padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}
        >
          <div style={{ position: "relative" }}>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px, 4vw, 26px)",
                fontWeight: 800,
                marginBottom: 4,
                color: "white",
              }}
            >
              {user.role === "ADMIN" ? "All Bookings" : "My Bookings"}
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>
              {user.role === "ADMIN"
                ? "Manage all campus facility reservations"
                : "Track and manage your facility reservations"}
            </p>
          </div>
          <Link href="/book" className="btn btn-gold" style={{ position: "relative" }}>
            + New Booking
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Total", value: bookings.length, color: accentText },
            { label: "Confirmed", value: bookings.filter(b => b.status === "CONFIRMED").length, color: "var(--success)" },
            { label: "Pending", value: bookings.filter(b => b.status === "PENDING").length, color: "var(--gold)" },
            { label: "Cancelled", value: bookings.filter(b => b.status === "CANCELLED").length, color: "var(--error)" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center", borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)", color: s.color }}>{loading ? "—" : s.value}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Personal Insights */}
        {!loading && bookings.length > 0 && <PersonalInsights bookings={bookings} isAdmin={user.role === "ADMIN"} />}

        {/* Filters */}
        <div className="tabs">
          {(["all", "CONFIRMED", "PENDING", "CANCELLED"] as const).map((f) => (
            <button
              key={f}
              className={`tab ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : BOOKING_STATUS_LABELS[f]}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  background: filter === f ? "var(--gold)" : "var(--bg-alt)",
                  color: filter === f ? accentMuted : "var(--text-muted)",
                  borderRadius: 99,
                  padding: "1px 7px",
                  fontWeight: 700,
                }}
              >
                {f === "all" ? bookings.length : bookings.filter((b) => b.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ padding: 12, background: "var(--error-bg)", color: "var(--error)", borderRadius: "var(--radius)", marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80 }} />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Calendar size={48} /></div>
            <h3>No bookings yet</h3>
            <p>When you book a facility, it will appear here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Facility</th>
                  {user.role === "ADMIN" && <th>User</th>}
                  <th>Date</th>
                  <th>Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>
                          {FACILITY_TYPE_ICONS[b.facility.type]}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {b.facility.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {b.facility.building?.name || b.facility.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    {user.role === "ADMIN" && (
                      <td style={{ fontSize: 13 }}>{b.user.name}</td>
                    )}
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {new Date(b.date + "T00:00").toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ fontSize: 13, whiteSpace: "nowrap" }}>
                      {b.startTime.substring(0, 5)} – {b.endTime.substring(0, 5)}
                    </td>
                    <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {b.purpose || "—"}
                    </td>
                    <td>
                      <span className={`badge ${badgeClass(b.status)}`}>
                        {BOOKING_STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        {user.role === "ADMIN" && b.status === "PENDING" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--success)", fontSize: 12 }}
                            onClick={() => setApproveTarget(b.id)}
                          >
                            Approve
                          </button>
                        )}
                        {b.status !== "CANCELLED" && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--error)", fontSize: 12 }}
                            onClick={() => setCancelTarget(b.id)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Cancel confirmation modal */}
        <ConfirmModal
          open={cancelTarget !== null}
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be undone."
          confirmLabel="Yes, Cancel It"
          cancelLabel="Keep Booking"
          variant="danger"
          onConfirm={() => cancelTarget && handleCancel(cancelTarget)}
          onCancel={() => setCancelTarget(null)}
          confirming={canceling}
        />

        {/* Approve confirmation modal */}
        <ConfirmModal
          open={approveTarget !== null}
          title="Approve Booking"
          message="Are you sure you want to approve this booking? The status will be changed to Confirmed."
          confirmLabel="Yes, Approve"
          cancelLabel="Not Yet"
          variant="info"
          onConfirm={() => approveTarget && handleApprove(approveTarget)}
          onCancel={() => setApproveTarget(null)}
          confirming={approving}
        />
      </div>
    </main>
  );
}

/* ─── Personal Insights Component ─── */
function PersonalInsights({ bookings, isAdmin }: { bookings: Booking[]; isAdmin: boolean }) {
  const { theme } = useTheme();
  const accentMuted = theme === "dark" ? "var(--primary-readable)" : "var(--primary-dark)";
  const accentText = theme === "dark" ? "var(--primary-readable)" : "var(--primary)";
  const insights = useMemo(() => {
    const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
    const today = new Date().toISOString().split("T")[0];
    const upcoming = confirmed.filter((b) => b.date >= today).sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

    // Total hours
    const totalHours = confirmed.reduce((s, b) => {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      return s + (eh + em / 60) - (sh + sm / 60);
    }, 0);

    // Favorite facility
    const facMap: Record<string, { name: string; type: string; count: number }> = {};
    confirmed.forEach((b) => {
      const key = b.facility.name;
      if (!facMap[key]) facMap[key] = { name: b.facility.name, type: b.facility.type, count: 0 };
      facMap[key].count++;
    });
    const favFacility = Object.values(facMap).sort((a, b) => b.count - a.count)[0];

    // Favorite building
    const bldMap: Record<string, { name: string; count: number }> = {};
    confirmed.forEach((b) => {
      const name = b.facility.building?.name || "Unknown";
      if (!bldMap[name]) bldMap[name] = { name, count: 0 };
      bldMap[name].count++;
    });
    const favBuilding = Object.values(bldMap).sort((a, b) => b.count - a.count)[0];

    // Weekly activity (last 7 days)
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const ds = d.toISOString().split("T")[0];
      return {
        label: d.toLocaleDateString("en-GB", { weekday: "narrow" }),
        count: bookings.filter((b) => b.date === ds).length,
      };
    });
    const maxWeek = Math.max(...last7.map((d) => d.count), 1);

    // Busiest day of week
    const dowCounts = [0, 0, 0, 0, 0, 0, 0];
    confirmed.forEach((b) => {
      const d = new Date(b.date + "T00:00");
      dowCounts[d.getDay()]++;
    });
    const busiestDow = dowCounts.indexOf(Math.max(...dowCounts));
    const dowLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return { upcoming, totalHours: Math.round(totalHours * 10) / 10, favFacility, favBuilding, last7, maxWeek, busiestDay: dowLabels[busiestDow] };
  }, [bookings]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
      {/* Left — Usage Overview */}
      <div className="card" style={{ borderTop: "3px solid var(--gold)", padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
          {isAdmin ? "Platform Overview" : "Your Usage"}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ textAlign: "center", padding: 12, background: "var(--gold-50)", borderRadius: "var(--radius)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: accentMuted }}>
              {insights.totalHours}h
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Hours Booked</div>
          </div>
          <div style={{ textAlign: "center", padding: 12, background: "var(--primary-50)", borderRadius: "var(--radius)" }}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: accentText }}>
              {insights.upcoming.length}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>Upcoming</div>
          </div>
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {insights.favFacility && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                <Star size={14} /> Favorite Room
              </span>
              <span style={{ fontWeight: 600 }}>
                {FACILITY_TYPE_ICONS[insights.favFacility.type as keyof typeof FACILITY_TYPE_ICONS]} {insights.favFacility.name}
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>({insights.favFacility.count}×)</span>
              </span>
            </div>
          )}
          {insights.favBuilding && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center" }}>
              <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
                <Building2 size={14} /> Top Building
              </span>
              <span style={{ fontWeight: 600 }}>
                {insights.favBuilding.name}
                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: 4 }}>({insights.favBuilding.count}×)</span>
              </span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, alignItems: "center" }}>
            <span style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={14} /> Busiest Day
            </span>
            <span style={{ fontWeight: 600 }}>{insights.busiestDay}</span>
          </div>
        </div>
      </div>

      {/* Right — Weekly Activity + Next Up */}
      <div className="card" style={{ borderTop: "3px solid var(--primary)", padding: "20px 24px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
          This Week
        </h3>
        {/* Mini bar chart */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginBottom: 16 }}>
          {insights.last7.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div
                style={{
                  width: "100%",
                  height: Math.max((d.count / insights.maxWeek) * 44, d.count > 0 ? 6 : 3),
                  background: d.count > 0 ? "var(--primary)" : "var(--bg-alt)",
                  borderRadius: 3,
                  transition: "height 0.4s ease",
                }}
              />
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{d.label}</div>
            </div>
          ))}
        </div>
        {/* Next upcoming */}
        {insights.upcoming.length > 0 ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Next Up
            </div>
            {insights.upcoming.slice(0, 3).map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border)",
                  fontSize: 13,
                }}
              >
                <span style={{ fontSize: 16 }}>{FACILITY_TYPE_ICONS[b.facility.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.facility.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {new Date(b.date + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {b.startTime.substring(0, 5)}–{b.endTime.substring(0, 5)}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "8px 0", fontSize: 13, color: "var(--text-muted)" }}>
            No upcoming bookings
          </div>
        )}
      </div>
    </div>
  );
}
