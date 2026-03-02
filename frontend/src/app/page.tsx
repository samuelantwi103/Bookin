"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Building, Facility } from "@/lib/types";
import { FACILITY_TYPE_ICONS, FACILITY_TYPE_LABELS } from "@/lib/types";
import { Building2, DoorOpen, Users as UsersIcon } from "lucide-react";

export default function Home() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([api.fetchBuildings(), api.fetchFacilities()])
      .then(([b, f]) => {
        setBuildings(b);
        setFacilities(f);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const facilityCountFor = (buildingId: number) =>
    facilities.filter((f) => f.building?.id === buildingId).length;

  const filteredBuildings = buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.campus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={{ minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <section
        style={{
          paddingTop: "calc(var(--nav-height) + 56px)",
          paddingBottom: 56,
          textAlign: "center",
          background: "linear-gradient(160deg, #001B3D 0%, var(--primary) 50%, #0A4A8A 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative accents */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(207,181,59,0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(207,181,59,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(207,181,59,0.15)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 60,
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "2px solid rgba(207,181,59,0.2)",
          }}
        />
        <div className="container" style={{ position: "relative" }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 18px",
              background: "rgba(207,181,59,0.25)",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.05em",
              marginBottom: 16,
              color: "rgba(255,255,255,0.95)",
              textTransform: "uppercase",
              border: "1px solid rgba(207,181,59,0.3)",
            }}
          >
            University of Ghana
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 5vw, 42px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 14,
              lineHeight: 1.15,
            }}
          >
            Book Campus Facilities
          </h1>
          <p
            style={{
              fontSize: 16,
              maxWidth: 480,
              margin: "0 auto 28px",
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            Reserve lecture halls, labs, and meeting rooms across campus — instantly.
          </p>

          {/* Search */}
          <div
            style={{
              maxWidth: 480,
              margin: "0 auto",
              position: "relative",
            }}
          >
            <svg
              style={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.35,
              }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="input"
              type="text"
              placeholder="Search buildings, e.g. Balme Library..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                paddingLeft: 42,
                height: 48,
                borderRadius: "var(--radius-lg)",
                border: "2px solid rgba(207,181,59,0.3)",
                boxShadow: "var(--shadow-lg)",
                fontSize: 14,
                color: "var(--text)",
              }}
            />
          </div>

          {/* Quick stats */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 40,
              marginTop: 36,
              flexWrap: "wrap",
            }}
          >
            {[
              { value: buildings.length, label: "Buildings", icon: <Building2 size={20} /> },
              { value: facilities.length, label: "Facilities", icon: <DoorOpen size={20} /> },
              {
                value: facilities.reduce((t, f) => t + f.capacity, 0),
                label: "Total Capacity",
                icon: <UsersIcon size={20} />,
              },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                {/* <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div> */}
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                    color: "white",
                  }}
                >
                  {loading ? "—" : s.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gold accent divider */}
      <div style={{ height: 5, background: "linear-gradient(90deg, var(--gold-dark), var(--gold), var(--gold-light), var(--gold), var(--gold-dark))" }} />

      {/* Buildings Grid */}
      <section className="container" style={{ padding: "48px 24px 48px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <h2 className="section-title">Campus Buildings</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Select a building to explore its facilities and make a booking
            </p>
          </div>
          {user && (
            <Link href="/book" className="btn btn-gold">
              Quick Book →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{ height: 200, borderRadius: "var(--radius-lg)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-3">
            {filteredBuildings.map((building, idx) => {
              const count = facilityCountFor(building.id);
              const buildFacilities = facilities.filter(
                (f) => f.building?.id === building.id
              );
              const types = [
                ...new Set(buildFacilities.map((f) => f.type)),
              ];
              const isGold = idx % 2 === 1;

              return (
                <Link href={`/book?building=${building.id}`} key={building.id}>
                  <div className="card card-hover" style={{ height: "100%", borderTop: `4px solid ${isGold ? "var(--gold)" : "var(--primary)"}` }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <span
                          className={`badge ${isGold ? "badge-gold" : "badge-primary"}`}
                          style={{ marginBottom: 8, display: "inline-block" }}
                        >
                          {building.code}
                        </span>
                        <h3
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 18,
                            fontWeight: 700,
                          }}
                        >
                          {building.name}
                        </h3>
                      </div>
                      <div
                        style={{
                          background: isGold ? "var(--gold)" : "var(--primary)",
                          color: isGold ? "var(--primary-dark)" : "white",
                          borderRadius: "var(--radius)",
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 15,
                          fontFamily: "var(--font-display)",
                          flexShrink: 0,
                        }}
                      >
                        {count}
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        marginBottom: 16,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {building.description}
                    </p>

                    {/* Type tags */}
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                        marginBottom: 16,
                      }}
                    >
                      {types.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            background: isGold ? "var(--gold-50)" : "var(--primary-50)",
                            color: isGold ? "var(--gold-dark)" : "var(--primary)",
                            borderRadius: 6,
                            padding: "3px 8px",
                          }}
                        >
                          {FACILITY_TYPE_ICONS[t]} {FACILITY_TYPE_LABELS[t]}
                        </span>
                      ))}
                      {types.length > 3 && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--text-muted)",
                            padding: "3px 4px",
                          }}
                        >
                          +{types.length - 3}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {building.campus}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredBuildings.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><Building2 size={48} /></div>
            <h3>No buildings found</h3>
            <p>Try a different search term</p>
          </div>
        )}
      </section>

      {/* Call to action banner */}
      {user && (
        <section className="container" style={{ padding: "0 24px 48px" }}>
          <div
            className="banner-gold"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
              padding: "28px 32px",
            }}
          >
            <div style={{ position: "relative" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, marginBottom: 4 }}>
                Ready to book?
              </h3>
              <p style={{ fontSize: 14, opacity: 0.8 }}>
                Find the perfect space for your next class, meeting, or study session.
              </p>
            </div>
            <Link href="/book" className="btn btn-primary btn-lg" style={{ position: "relative" }}>
              Book Now →
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          padding: "32px 24px",
          background: "var(--primary-dark)",
          color: "rgba(255,255,255,0.7)",
          textAlign: "center",
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary-dark)",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 12,
            }}
          >
            b
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: "white",
              fontSize: 18,
            }}
          >
            bookin
          </span>
        </div>
        © {new Date().getFullYear()} University of Ghana · Faculty of
        Engineering Sciences
      </footer>
    </main>
  );
}
