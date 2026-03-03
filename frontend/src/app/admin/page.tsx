"use client";

import React, { useEffect, useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import ConfirmModal from "@/components/ConfirmModal";
import FormModal from "@/components/FormModal";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Building, Facility, User, Booking, FacilityType } from "@/lib/types";
import { FACILITY_TYPE_LABELS, FACILITY_TYPE_ICONS } from "@/lib/types";
import Link from "next/link";
import { Building2, DoorOpen, Calendar, Users, BarChart3, Lock, Check, X, Clock, CheckCircle2, XCircle, Star, Crown } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type Tab = "campus" | "users" | "analytics";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("campus");
  const { user, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();
  const accentText = theme === "dark" ? "var(--primary-readable)" : "var(--primary)";
  const accentMuted = theme === "dark" ? "var(--primary-readable)" : "var(--primary-dark)";

  // Load cached data from localStorage
  const loadCachedData = () => {
    if (typeof window === 'undefined') return { buildings: [], facilities: [], users: [], bookings: [] };
    try {
      const cached = localStorage.getItem('admin-dashboard-cache');
      if (cached) {
        const data = JSON.parse(cached);
        const cacheTime = localStorage.getItem('admin-dashboard-cache-time');
        // Use cache if less than 5 minutes old
        if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
          return data;
        }
      }
    } catch (e) {
      console.error('Failed to load cached data:', e);
    }
    return { buildings: [], facilities: [], users: [], bookings: [] };
  };

  const initialCache = loadCachedData();

  // Global data for stats
  const [buildings, setBuildings] = useState<Building[]>(initialCache.buildings);
  const [facilities, setFacilities] = useState<Facility[]>(initialCache.facilities);
  const [users, setUsers] = useState<User[]>(initialCache.users);
  const [bookings, setBookings] = useState<Booking[]>(initialCache.bookings);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      Promise.all([
        api.fetchBuildings(),
        api.fetchFacilities(),
        api.fetchUsers(),
        api.fetchBookings(),
      ]).then(([b, f, u, bk]) => {
        setBuildings(b);
        setFacilities(f);
        setUsers(u);
        setBookings(bk);
        setStatsLoading(false);
        
        // Cache the data
        try {
          localStorage.setItem('admin-dashboard-cache', JSON.stringify({ buildings: b, facilities: f, users: u, bookings: bk }));
          localStorage.setItem('admin-dashboard-cache-time', Date.now().toString());
        } catch (e) {
          console.error('Failed to cache data:', e);
        }
      }).catch(() => setStatsLoading(false));
    }
  }, [user]);

  const stats = useMemo(() => {
    const activeBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
    const totalCapacity = facilities.reduce((s, f) => s + f.capacity, 0);
    return { activeBookings, totalCapacity };
  }, [bookings, facilities]);

  if (authLoading) {
    return (
      <main>
        <Navbar />
        <div className="page container">
          <div className="skeleton" style={{ height: 120, borderRadius: "var(--radius-lg)", marginBottom: 24 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius)" }} />)}
          </div>
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </main>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <main>
        <Navbar />
        <div className="page container" style={{ textAlign: "center", paddingTop: 200 }}>
          <div className="empty-state">
            <div className="empty-state-icon"><Lock size={48} /></div>
            <h3>Admin access required</h3>
            <p style={{ marginBottom: 24 }}>Sign in as an administrator to access this page.</p>
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
        {/* Header Banner */}
        <div
          className="banner-blue"
          style={{ marginBottom: 28, padding: "28px 32px", position: "relative", overflow: "hidden" }}
        >
          <div style={{ position: "absolute", top: -30, right: -30, width: 140, height: 140, borderRadius: "50%", background: "rgba(207,181,59,0.15)" }} />
          <div style={{ position: "absolute", bottom: -20, right: 80, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "relative" }}>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 14, opacity: 0.85 }}>
              Manage campus infrastructure, users, and monitor bookings
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
          <div className="stat-card" style={{ background: "var(--primary-50)", border: "1px solid var(--primary-100)" }}>
            <div className="stat-icon" style={{ background: "var(--primary)", color: "white" }}><Building2 size={20} /></div>
            <div>
              <div className="stat-value" style={{ color: accentText }}>
                {buildings.length}
              </div>
              <div className="stat-label" style={{ color: "var(--text-secondary)" }}>Buildings</div>
            </div>
          </div>
          <div className="stat-card" style={{ background: "var(--gold-50)", border: "1px solid var(--gold-100)" }}>
            <div className="stat-icon" style={{ background: "var(--gold)", color: "var(--primary-dark)" }}><DoorOpen size={20} /></div>
            <div>
              <div className="stat-value" style={{ color: accentMuted }}>
                {facilities.length}
              </div>
              <div className="stat-label" style={{ color: "var(--text-secondary)" }}>Facilities</div>
            </div>
          </div>
          <div className="stat-card" style={{ background: "var(--primary-50)", border: "1px solid var(--primary-100)" }}>
            <div className="stat-icon" style={{ background: "var(--primary)", color: "white" }}><Calendar size={20} /></div>
            <div>
              <div className="stat-value" style={{ color: accentText }}>
                {stats.activeBookings}
              </div>
              <div className="stat-label" style={{ color: "var(--text-secondary)" }}>Active Bookings</div>
            </div>
          </div>
          <div className="stat-card" style={{ background: "var(--gold-50)", border: "1px solid var(--gold-100)" }}>
            <div className="stat-icon" style={{ background: "var(--gold)", color: "var(--primary-dark)" }}><Users size={20} /></div>
            <div>
              <div className="stat-value" style={{ color: accentMuted }}>
                {users.length}
              </div>
              <div className="stat-label" style={{ color: "var(--text-secondary)" }}>Users</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === "campus" ? "active" : ""}`} onClick={() => setTab("campus")}>
            <Building2 size={16} style={{ marginRight: 6 }} /> Campus & Facilities
          </button>
          <button className={`tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>
            <BarChart3 size={16} style={{ marginRight: 6 }} /> Analytics
          </button>
          <button className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>
            <Users size={16} style={{ marginRight: 6 }} /> Users
          </button>
        </div>

        {tab === "campus" && (
          <CampusTab
            onDataChange={() => {
              api.fetchBuildings().then(setBuildings);
              api.fetchFacilities().then(setFacilities);
            }}
          />
        )}
        {tab === "analytics" && (
          <AnalyticsTab
            bookings={bookings}
            facilities={facilities}
            buildings={buildings}
            users={users}
            loading={statsLoading}
          />
        )}
        {tab === "users" && (
          <UsersTab
            onDataChange={() => api.fetchUsers().then(setUsers)}
          />
        )}
      </div>
    </main>
  );
}

/* ─── Unified Campus Tab (Buildings + Facilities) ─── */
function CampusTab({ onDataChange }: { onDataChange: () => void }) {
  const { theme } = useTheme();
  const accentText = theme === "dark" ? "var(--primary-readable)" : "var(--primary)";
  const accentMuted = theme === "dark" ? "var(--primary-readable)" : "var(--primary-dark)";
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Building Modal
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [submittingBuilding, setSubmittingBuilding] = useState(false);
  const blankBuilding = { name: "", code: "", campus: "", description: "" };
  const [buildingForm, setBuildingForm] = useState(blankBuilding);

  // Facility Modal
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [submittingFacility, setSubmittingFacility] = useState(false);
  const [facilityParentId, setFacilityParentId] = useState<number | null>(null);
  const blankFacility = {
    name: "", buildingId: 0, type: "LECTURE_HALL" as FacilityType,
    location: "", capacity: "", floor: "", roomNumber: "", description: "", amenities: "",
  };
  const [facilityForm, setFacilityForm] = useState(blankFacility);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: "building" | "facility"; id: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { reload(); }, []);

  const reload = () => {
    setLoadingData(true);
    Promise.all([api.fetchBuildings(), api.fetchFacilities()])
      .then(([b, f]) => { setBuildings(b); setFacilities(f); onDataChange(); })
      .finally(() => setLoadingData(false));
  };

  const facilitiesFor = (buildingId: number) =>
    facilities.filter((f) => f.building?.id === buildingId);

  const filtered = buildings.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.code.toLowerCase().includes(search.toLowerCase()) ||
    b.campus.toLowerCase().includes(search.toLowerCase())
  );

  // Building CRUD
  const openBuildingCreate = () => {
    setEditingBuilding(null);
    setBuildingForm(blankBuilding);
    setShowBuildingModal(true);
  };
  const openBuildingEdit = (b: Building) => {
    setEditingBuilding(b);
    setBuildingForm({ name: b.name, code: b.code, campus: b.campus, description: b.description });
    setShowBuildingModal(true);
  };
  const handleBuildingSubmit = async () => {
    setError(null);
    setSubmittingBuilding(true);
    try {
      if (editingBuilding) {
        await api.updateBuilding(editingBuilding.id, buildingForm);
      } else {
        const created = await api.createBuilding(buildingForm);
        setExpandedId(created.id);
      }
      setShowBuildingModal(false);
      setBuildingForm(blankBuilding);
      setEditingBuilding(null);
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmittingBuilding(false);
    }
  };

  // Facility CRUD
  const openFacilityCreate = (buildingId?: number) => {
    setEditingFacility(null);
    setFacilityParentId(buildingId ?? null);
    setFacilityForm({ ...blankFacility, buildingId: buildingId ?? 0 });
    setShowFacilityModal(true);
  };
  const openFacilityEdit = (f: Facility) => {
    setEditingFacility(f);
    setFacilityForm({
      name: f.name,
      buildingId: f.building?.id ?? 0,
      type: f.type,
      location: f.location,
      capacity: String(f.capacity),
      floor: f.floor || "",
      roomNumber: f.roomNumber || "",
      description: f.description || "",
      amenities: f.amenities || "",
    });
    setShowFacilityModal(true);
  };
  const handleFacilitySubmit = async () => {
    setError(null);
    setSubmittingFacility(true);
    const payload = {
      name: facilityForm.name,
      building: { id: Number(facilityForm.buildingId) },
      type: facilityForm.type,
      location: facilityForm.location,
      capacity: Number(facilityForm.capacity),
      floor: facilityForm.floor || undefined,
      roomNumber: facilityForm.roomNumber || undefined,
      description: facilityForm.description || undefined,
      amenities: facilityForm.amenities || undefined,
    };
    try {
      if (editingFacility) {
        await api.updateFacility(editingFacility.id, payload);
      } else {
        await api.createFacility(payload);
        setExpandedId(Number(facilityForm.buildingId));
      }
      setShowFacilityModal(false);
      setFacilityForm(blankFacility);
      setEditingFacility(null);
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmittingFacility(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "building") {
        await api.deleteBuilding(deleteTarget.id);
      } else {
        await api.deleteFacility(deleteTarget.id);
      }
      setDeleteTarget(null);
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 200px" }}>
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input"
              placeholder="Search buildings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
            />
          </div>
          <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {buildings.length} buildings · {facilities.length} facilities
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-gold btn-sm" onClick={openBuildingCreate}>
            + Building
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => openFacilityCreate()}>
            + Facility
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: "var(--error-bg)", color: "var(--error)", borderRadius: "var(--radius)", marginBottom: 16, fontSize: 13 }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: "right", background: "none", border: "none", color: "var(--error)", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Buildings list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((b) => {
          const bFacilities = facilitiesFor(b.id);
          const isExpanded = expandedId === b.id;
          const totalCap = bFacilities.reduce((s, f) => s + f.capacity, 0);
          return (
            <div key={b.id} className="card" style={{ padding: 0, overflow: "hidden", borderLeft: "4px solid var(--primary)" }}>
              {/* Building row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 20px",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onClick={() => setExpandedId(isExpanded ? null : b.id)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "var(--radius)",
                      background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 13,
                      fontFamily: "var(--font-display)",
                      flexShrink: 0,
                    }}
                  >
                    {b.code.substring(0, 3)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)", fontFamily: "var(--font-display)" }}>{b.name}</div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span>{b.campus}</span>
                      <span style={{ color: "var(--border)" }}>·</span>
                      <span style={{ color: accentText, fontWeight: 600 }}>{bFacilities.length} room{bFacilities.length !== 1 ? "s" : ""}</span>
                      <span style={{ color: "var(--border)" }}>·</span>
                      <span style={{ color: accentMuted, fontWeight: 600 }}>{totalCap} seats</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); openBuildingEdit(b); }} style={{ fontSize: 12 }}>Edit</button>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget({ type: "building", id: b.id }); }} style={{ color: "var(--error)", fontSize: 12 }}>Delete</button>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", marginLeft: 4 }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Expanded facilities */}
              {isExpanded && (
                <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg)" }}>
                  {/* Gold accent bar */}
                  <div style={{ height: 3, background: "linear-gradient(90deg, var(--gold), var(--gold-light), transparent)" }} />
                  {bFacilities.length === 0 ? (
                    <div style={{ padding: "24px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                        No facilities in this building yet
                      </div>
                      <button className="btn btn-gold btn-sm" onClick={() => openFacilityCreate(b.id)}>
                        + Add First Facility
                      </button>
                    </div>
                  ) : (
                    <>
                      {bFacilities.map((f) => (
                        <div
                          key={f.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 20px 12px 56px",
                            borderBottom: "1px solid var(--border)",
                            fontSize: 13,
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 18 }}>{FACILITY_TYPE_ICONS[f.type]}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                              <div style={{ color: "var(--text-muted)", fontSize: 12, display: "flex", gap: 8 }}>
                                <span className="badge badge-gold" style={{ fontSize: 10, padding: "1px 6px" }}>{FACILITY_TYPE_LABELS[f.type]}</span>
                                <span>{f.capacity} seats</span>
                                {f.roomNumber && <span>· Room {f.roomNumber}</span>}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openFacilityEdit(f)} style={{ fontSize: 12 }}>Edit</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget({ type: "facility", id: f.id })} style={{ color: "var(--error)", fontSize: 12 }}>Delete</button>
                          </div>
                        </div>
                      ))}
                      {/* Add facility inline */}
                      <div style={{ padding: "10px 20px 10px 56px" }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openFacilityCreate(b.id)}
                          style={{ color: accentMuted, fontWeight: 600 }}
                        >
                          + Add Facility to {b.name}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Building2 size={48} /></div>
          <h3>{search ? "No buildings match your search" : "No buildings yet"}</h3>
          <p>{search ? "Try a different search term" : "Add your first building to get started"}</p>
          {!search && (
            <button className="btn btn-gold" onClick={openBuildingCreate} style={{ marginTop: 16 }}>
              + Add Building
            </button>
          )}
        </div>
      )}

      {/* Building Form Modal */}
      <FormModal
        open={showBuildingModal}
        title={editingBuilding ? "Edit Building" : "New Building"}
        onClose={() => { setShowBuildingModal(false); setEditingBuilding(null); setBuildingForm(blankBuilding); }}
        onSubmit={handleBuildingSubmit}
        submitLabel={editingBuilding ? "Save Changes" : "Create Building"}
        submitVariant="gold"
        accent="gold"
        submitting={submittingBuilding}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field">
            <label className="label">Building Name</label>
            <input className="input" required value={buildingForm.name} onChange={(e) => setBuildingForm({ ...buildingForm, name: e.target.value })} placeholder="e.g. Balme Library" />
          </div>
          <div className="field">
            <label className="label">Code</label>
            <input className="input" required value={buildingForm.code} onChange={(e) => setBuildingForm({ ...buildingForm, code: e.target.value })} placeholder="e.g. BLB" />
          </div>
        </div>
        <div className="field">
          <label className="label">Campus</label>
          <input className="input" required value={buildingForm.campus} onChange={(e) => setBuildingForm({ ...buildingForm, campus: e.target.value })} placeholder="e.g. Main Campus, Legon" />
        </div>
        <div className="field">
          <label className="label">Description</label>
          <input className="input" required value={buildingForm.description} onChange={(e) => setBuildingForm({ ...buildingForm, description: e.target.value })} placeholder="Brief description of the building" />
        </div>
      </FormModal>

      {/* Facility Form Modal */}
      <FormModal
        open={showFacilityModal}
        title={editingFacility ? "Edit Facility" : "New Facility"}
        onClose={() => { setShowFacilityModal(false); setEditingFacility(null); setFacilityForm(blankFacility); }}
        onSubmit={handleFacilitySubmit}
        submitLabel={editingFacility ? "Save Changes" : "Create Facility"}
        accent="blue"
        submitting={submittingFacility}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="field">
            <label className="label">Facility Name</label>
            <input className="input" required value={facilityForm.name} onChange={(e) => setFacilityForm({ ...facilityForm, name: e.target.value })} placeholder="e.g. Room 101" />
          </div>
          <div className="field">
            <label className="label">Building</label>
            <select className="input select" required value={facilityForm.buildingId} onChange={(e) => setFacilityForm({ ...facilityForm, buildingId: Number(e.target.value) })}>
              <option value={0}>Select building…</option>
              {buildings.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Type</label>
            <select className="input select" value={facilityForm.type} onChange={(e) => setFacilityForm({ ...facilityForm, type: e.target.value as FacilityType })}>
              {Object.entries(FACILITY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{FACILITY_TYPE_ICONS[k as FacilityType]} {v}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label">Location</label>
            <input className="input" required value={facilityForm.location} onChange={(e) => setFacilityForm({ ...facilityForm, location: e.target.value })} placeholder="e.g. Ground Floor, East Wing" />
          </div>
          <div className="field">
            <label className="label">Capacity</label>
            <input className="input" type="number" required value={facilityForm.capacity} onChange={(e) => setFacilityForm({ ...facilityForm, capacity: e.target.value })} placeholder="e.g. 120" />
          </div>
          <div className="field">
            <label className="label">Floor</label>
            <input className="input" value={facilityForm.floor} onChange={(e) => setFacilityForm({ ...facilityForm, floor: e.target.value })} placeholder="e.g. 2nd Floor" />
          </div>
          <div className="field">
            <label className="label">Room Number</label>
            <input className="input" value={facilityForm.roomNumber} onChange={(e) => setFacilityForm({ ...facilityForm, roomNumber: e.target.value })} placeholder="e.g. 101" />
          </div>
          <div className="field">
            <label className="label">Amenities</label>
            <input className="input" value={facilityForm.amenities} onChange={(e) => setFacilityForm({ ...facilityForm, amenities: e.target.value })} placeholder="WiFi, Projector, AC..." />
          </div>
        </div>
        <div className="field">
          <label className="label">Description</label>
          <input className="input" value={facilityForm.description} onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })} placeholder="Optional description" />
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteTarget !== null}
        title={deleteTarget?.type === "building" ? "Delete Building" : "Delete Facility"}
        message={
          deleteTarget?.type === "building"
            ? "Are you sure you want to delete this building? All facilities inside it may also be affected. This action cannot be undone."
            : "Are you sure you want to delete this facility? Any existing bookings for it will be affected."
        }
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirming={deleting}
      />
    </div>
  );
}

/* ─── Analytics Tab ─── */
function AnalyticsTab({
  bookings,
  facilities,
  buildings,
  users,
  loading,
}: {
  bookings: Booking[];
  facilities: Facility[];
  buildings: Building[];
  users: User[];
  loading: boolean;
}) {
  const { theme } = useTheme();
  const accentText = theme === "dark" ? "var(--primary-readable)" : "var(--primary)";
  const accentMuted = theme === "dark" ? "var(--primary-readable)" : "var(--primary-dark)";
  const chartBar = theme === "dark" ? "var(--gold)" : "var(--primary)";
  const chartBar50 = theme === "dark" ? "var(--gold-50)" : "var(--primary-50)";
  const chartBar100 = theme === "dark" ? "var(--gold-100)" : "var(--primary-100)";
  const chartText = theme === "dark" ? "var(--gold-dark)" : "var(--primary)";
  const analytics = useMemo(() => {
    if (loading || bookings.length === 0) return null;

    const confirmed = bookings.filter((b) => b.status === "CONFIRMED");
    const today = new Date();

    // ── 7-day booking activity ──
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayBookings = bookings.filter((b) => b.date === dateStr);
      return {
        label: d.toLocaleDateString("en-GB", { weekday: "short" }),
        date: dateStr,
        total: dayBookings.length,
        confirmed: dayBookings.filter((b) => b.status === "CONFIRMED").length,
        cancelled: dayBookings.filter((b) => b.status === "CANCELLED").length,
      };
    });
    const maxDay = Math.max(...last7.map((d) => d.total), 1);

    // ── Peak hours heatmap ──
    const hourGrid: number[][] = Array.from({ length: 7 }, () => Array(14).fill(0)); // 7 days × 14 hours (7am-9pm)
    confirmed.forEach((b) => {
      const d = new Date(b.date + "T00:00");
      const dow = d.getDay(); // 0=Sun
      const hour = parseInt(b.startTime.split(":")[0], 10);
      if (hour >= 7 && hour <= 20) {
        hourGrid[dow][hour - 7]++;
      }
    });
    const maxHeat = Math.max(...hourGrid.flat(), 1);

    // ── Facility type distribution ──
    const typeMap: Record<string, number> = {};
    bookings.forEach((b) => {
      const t = b.facility.type;
      typeMap[t] = (typeMap[t] || 0) + 1;
    });
    const typeDist = Object.entries(typeMap)
      .sort(([, a], [, b]) => b - a)
      .map(([type, count]) => ({
        type: type as import("@/lib/types").FacilityType,
        count,
        pct: Math.round((count / bookings.length) * 100),
      }));

    // ── Building utilization ──
    const buildingUtil = buildings.map((bld) => {
      const bFacs = facilities.filter((f) => f.building?.id === bld.id);
      const bBookings = confirmed.filter((b) => b.facility.building?.id === bld.id);
      const totalCapacity = bFacs.reduce((s, f) => s + f.capacity, 0);
      // Hours booked
      const hoursBooked = bBookings.reduce((s, b) => {
        const [sh, sm] = b.startTime.split(":").map(Number);
        const [eh, em] = b.endTime.split(":").map(Number);
        return s + (eh + em / 60) - (sh + sm / 60);
      }, 0);
      return {
        building: bld,
        facilityCount: bFacs.length,
        bookingCount: bBookings.length,
        totalCapacity,
        hoursBooked: Math.round(hoursBooked * 10) / 10,
      };
    }).sort((a, b) => b.bookingCount - a.bookingCount);
    const maxBldBookings = Math.max(...buildingUtil.map((b) => b.bookingCount), 1);

    // ── Top bookers ──
    const userBookingMap: Record<number, { user: User; count: number }> = {};
    confirmed.forEach((b) => {
      if (!userBookingMap[b.user.id]) userBookingMap[b.user.id] = { user: b.user, count: 0 };
      userBookingMap[b.user.id].count++;
    });
    const topBookers = Object.values(userBookingMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const maxBooker = topBookers[0]?.count || 1;

    // ── Upcoming vs past ──
    const todayStr = today.toISOString().split("T")[0];
    const upcoming = confirmed.filter((b) => b.date >= todayStr).length;
    const past = confirmed.filter((b) => b.date < todayStr).length;

    // ── Total hours ──
    const totalHours = confirmed.reduce((s, b) => {
      const [sh, sm] = b.startTime.split(":").map(Number);
      const [eh, em] = b.endTime.split(":").map(Number);
      return s + (eh + em / 60) - (sh + sm / 60);
    }, 0);

    return { last7, maxDay, hourGrid, maxHeat, typeDist, buildingUtil, maxBldBookings, topBookers, maxBooker, upcoming, past, totalHours };
  }, [bookings, facilities, buildings, users, loading]);

  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const heatColor = (val: number, max: number) => {
    if (val === 0) return "var(--bg-alt)";
    const ratio = val / max;
    if (ratio < 0.33) return chartBar50;
    if (ratio < 0.66) return chartBar100;
    return chartBar;
  };
  const heatText = (val: number, max: number) => {
    if (val === 0) return "var(--text-muted)";
    return val / max >= 0.66 ? (theme === "dark" ? "var(--primary-dark)" : "white") : chartText;
  };

  if (loading || !analytics) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 250 }} />)}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Row 1: Summary stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        {[
          { icon: <Calendar size={18} />, label: "Total Bookings", value: bookings.length, color: accentText },
          { icon: <CheckCircle2 size={18} />, label: "Confirmed", value: bookings.filter((b) => b.status === "CONFIRMED").length, color: "var(--success)" },
          { icon: <Clock size={18} />, label: "Upcoming", value: analytics.upcoming, color: "var(--gold)" },
          { icon: <Clock size={18} />, label: "Hours Booked", value: Math.round(analytics.totalHours), color: accentText },
          { icon: <XCircle size={18} />, label: "Cancelled", value: bookings.filter((b) => b.status === "CANCELLED").length, color: "var(--error)" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "14px 16px", textAlign: "center", borderTop: `3px solid ${s.color}` }}>
            <div style={{ marginBottom: 4, display: "flex", justifyContent: "center", color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Row 2: 7-day bar chart + Peak hours heatmap */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        {/* 7-Day Booking Activity */}
        <div className="card" style={{ borderTop: "3px solid var(--primary)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            7-Day Booking Activity
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Bookings over the past week</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
            {analytics.last7.map((d) => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: accentText }}>{d.total || ""}</div>
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 1 }}>
                  {d.confirmed > 0 && (
                    <div
                      style={{
                        height: Math.max((d.confirmed / analytics.maxDay) * 100, 4),
                        background: chartBar,
                        borderRadius: "4px 4px 0 0",
                        transition: "height 0.4s ease",
                      }}
                    />
                  )}
                  {d.cancelled > 0 && (
                    <div
                      style={{
                        height: Math.max((d.cancelled / analytics.maxDay) * 100, 4),
                        background: "var(--error)",
                        borderRadius: d.confirmed > 0 ? 0 : "4px 4px 0 0",
                        transition: "height 0.4s ease",
                      }}
                    />
                  )}
                  {d.total === 0 && (
                    <div style={{ height: 4, background: "var(--bg-alt)", borderRadius: 4 }} />
                  )}
                </div>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 500 }}>{d.label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: "var(--text-muted)" }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: chartBar, marginRight: 4 }} />Confirmed</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: "var(--error)", marginRight: 4 }} />Cancelled</span>
          </div>
        </div>

        {/* Peak Hours Heatmap */}
        <div className="card" style={{ borderTop: "3px solid var(--gold)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Peak Hours Heatmap
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>Confirmed bookings by day & hour</p>
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px repeat(14, 1fr)", gap: 2, minWidth: 420 }}>
              {/* Header row */}
              <div />
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} style={{ fontSize: 9, textAlign: "center", color: "var(--text-muted)", fontWeight: 500, padding: "2px 0" }}>
                  {(i + 7).toString().padStart(2, "0")}
                </div>
              ))}
              {/* Data rows */}
              {DOW.map((day, di) => (
                <React.Fragment key={di}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                    {day}
                  </div>
                  {analytics.hourGrid[di].map((val, hi) => (
                    <div
                      key={`${di}-${hi}`}
                      title={`${DOW[di]} ${hi + 7}:00 — ${val} booking${val !== 1 ? "s" : ""}`}
                      style={{
                        aspectRatio: "1",
                        borderRadius: 3,
                        background: heatColor(val, analytics.maxHeat),
                        color: heatText(val, analytics.maxHeat),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 8,
                        fontWeight: 700,
                        cursor: "default",
                        transition: "background 0.3s",
                      }}
                    >
                      {val > 0 ? val : ""}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, fontSize: 10, color: "var(--text-muted)", alignItems: "center" }}>
            <span>Less</span>
            {[0, 0.2, 0.5, 0.8, 1].map((r, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: r === 0 ? "var(--bg-alt)" : r < 0.4 ? chartBar50 : r < 0.7 ? chartBar100 : chartBar }} />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Row 3: Facility type distribution + Building utilization */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        {/* Facility Type Distribution */}
        <div className="card" style={{ borderTop: "3px solid var(--gold)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Bookings by Facility Type
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Distribution across room types</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analytics.typeDist.map((t, i) => (
              <div key={t.type}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>
                    {FACILITY_TYPE_ICONS[t.type]} {FACILITY_TYPE_LABELS[t.type]}
                  </span>
                  <span style={{ color: "var(--text-muted)", fontWeight: 700, fontSize: 12 }}>
                    {t.count} ({t.pct}%)
                  </span>
                </div>
                <div style={{ height: 8, background: "var(--bg-alt)", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${t.pct}%`,
                      background: i % 2 === 0 ? "var(--primary)" : "var(--gold)",
                      borderRadius: 4,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Building Utilization */}
        <div className="card" style={{ borderTop: "3px solid var(--primary)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Building Utilization
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Ranked by booking volume</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {analytics.buildingUtil.map((bu, i) => {
              const pct = Math.round((bu.bookingCount / analytics.maxBldBookings) * 100);
              return (
                <div key={bu.building.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: i === 0 ? "var(--gold)" : chartBar50,
                          color: i === 0 ? "var(--primary-dark)" : chartText,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 10,
                          fontWeight: 800,
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        #{i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{bu.building.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {bu.facilityCount} rooms · {bu.hoursBooked}h booked
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 15, fontFamily: "var(--font-display)", color: accentText }}>
                      {bu.bookingCount}
                    </div>
                  </div>
                  <div style={{ height: 6, background: "var(--bg-alt)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: i === 0 ? "linear-gradient(90deg, var(--gold-dark), var(--gold))" : chartBar,
                        borderRadius: 3,
                        transition: "width 0.6s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 4: Top Bookers + Recent Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        {/* Top Bookers */}
        <div className="card" style={{ borderTop: "3px solid var(--gold)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Most Active Users
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Top bookers by confirmed reservations</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {analytics.topBookers.map((tb, i) => (
              <div key={tb.user.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: i === 0 ? "var(--gold)" : i === 1 ? chartBar : chartBar50,
                    color: i < 2 ? (i === 0 ? "var(--primary-dark)" : (theme === "dark" ? "var(--primary-dark)" : "white")) : chartText,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {i === 0 ? <Crown size={14} /> : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tb.user.name}</div>
                  <div style={{ height: 4, background: "var(--bg-alt)", borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(tb.count / analytics.maxBooker) * 100}%`, background: i === 0 ? "var(--gold)" : chartBar, borderRadius: 2, transition: "width 0.6s" }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: accentMuted, fontFamily: "var(--font-display)" }}>
                  {tb.count}
                </div>
              </div>
            ))}
            {analytics.topBookers.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No booking data yet</div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" style={{ borderTop: "3px solid var(--primary)" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
            Recent Activity
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>Latest booking transactions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {bookings.slice(0, 8).map((b, i) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: i < 7 ? "1px solid var(--border)" : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ fontSize: 16 }}>{FACILITY_TYPE_ICONS[b.facility.type]}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {b.facility.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    {b.user.name} · {new Date(b.date + "T00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <span
                  className={`badge ${b.status === "CONFIRMED" ? "badge-success" : b.status === "CANCELLED" ? "badge-error" : "badge-warning"}`}
                  style={{ fontSize: 10, padding: "2px 6px", display: "flex", alignItems: "center", gap: 4 }}
                >
                  {b.status === "CONFIRMED" ? <Check size={12} /> : b.status === "CANCELLED" ? <X size={12} /> : <Clock size={12} />}
                </span>
              </div>
            ))}
            {bookings.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No bookings yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Users Tab ─── */
function UsersTab({ onDataChange }: { onDataChange: () => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const blank = { name: "", email: "", role: "USER" as "USER" | "ADMIN" };
  const [form, setForm] = useState(blank);

  useEffect(() => { reload(); }, []);

  const reload = () => {
    setLoadingUsers(true);
    api.fetchUsers()
      .then((u) => { setUsers(u); onDataChange(); })
      .finally(() => setLoadingUsers(false));
  };

  const openCreate = () => { setEditing(null); setForm(blank); setShowModal(true); };
  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      if (editing) {
        await api.updateUser(editing.id, form);
      } else {
        await api.createUser(form);
      }
      setShowModal(false);
      setForm(blank);
      setEditing(null);
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(true);
    try {
      await api.deleteUser(id);
      setDeleteTarget(null);
      reload();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "1 1 200px" }}>
          <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 320 }}>
            <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.4 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36, height: 38, fontSize: 13 }}
            />
          </div>
          <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {users.length} users
          </span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>
          + Add User
        </button>
      </div>

      {error && (
        <div style={{ padding: 12, background: "var(--error-bg)", color: "var(--error)", borderRadius: "var(--radius)", marginBottom: 16, fontSize: 13 }}>
          {error}
          <button onClick={() => setError(null)} style={{ float: "right", background: "none", border: "none", color: "var(--error)", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>×</button>
        </div>
      )}

      {/* Table */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: u.role === "ADMIN" ? "var(--gold)" : "var(--primary)",
                        color: u.role === "ADMIN" ? "var(--primary-dark)" : "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600 }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ fontSize: 13, color: "var(--text-secondary)" }}>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === "ADMIN" ? "badge-gold" : "badge-primary"}`} style={{ display: "flex", alignItems: "center", gap: 4, width: "fit-content" }}>
                    {u.role === "ADMIN" && <Crown size={12} />} {u.role === "ADMIN" ? "Admin" : "User"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} style={{ fontSize: 12 }}>Edit</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setDeleteTarget(u.id)} style={{ color: "var(--error)", fontSize: 12 }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Users size={48} /></div>
          <h3>{search ? "No users match your search" : "No users yet"}</h3>
          <p>{search ? "Try a different search term" : "Add your first user to get started"}</p>
        </div>
      )}

      {/* User Form Modal */}
      <FormModal
        open={showModal}
        title={editing ? "Edit User" : "New User"}
        onClose={() => { setShowModal(false); setEditing(null); setForm(blank); }}
        onSubmit={handleSubmit}
        submitLabel={editing ? "Save Changes" : "Create User"}
        accent="blue"
        submitting={submitting}
      >
        <div className="field">
          <label className="label">Full Name</label>
          <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kofi Mensah" />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. kofi@ug.edu.gh" />
        </div>
        <div className="field">
          <label className="label">Role</label>
          <select className="input select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "USER" | "ADMIN" })}>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </FormModal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete User"
        message="Are you sure you want to delete this user? Their booking history will also be removed."
        confirmLabel="Yes, Delete"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        confirming={deleting}
      />
    </div>
  );
}
