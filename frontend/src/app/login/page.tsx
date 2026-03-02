"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await api.login(email);
      login(user);
    } catch {
      setError("Account not found. Try samuel@ug.edu.gh or admin@ug.edu.gh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexWrap: "wrap" as const,
        background: "var(--bg)",
      }}
    >
      {/* Left panel — branding */}
      <div
        style={{
          flex: "1 1 400px",
          minHeight: 360,
          background: "linear-gradient(160deg, #001B3D 0%, var(--primary) 50%, var(--primary-light) 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px 24px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            border: "2px solid rgba(207,181,59,0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 120,
            right: 120,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(207,181,59,0.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(207,181,59,0.15)",
          }}
        />

        <div style={{ position: "relative", textAlign: "center", maxWidth: 360 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 24,
              color: "var(--primary-dark)",
            }}
          >
            b
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              marginBottom: 12,
            }}
          >
            bookin
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 1.7 }}>
            Reserve lecture halls, labs, and meeting rooms across the University
            of Ghana campus.
          </p>

          <div
            style={{
              marginTop: 48,
              display: "flex",
              gap: 40,
              justifyContent: "center",
            }}
          >
            {[
              { n: "10", label: "Buildings" },
              { n: "25+", label: "Rooms" },
              { n: "24/7", label: "Access" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 2, color: "var(--gold-light)" }}>{s.n}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div
        style={{
          flex: "1 1 400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            Welcome back
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              marginBottom: 32,
            }}
          >
            Sign in with your campus email
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label">Campus Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ug.edu.gh"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-lg"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

            {error && (
              <div
                style={{
                  padding: 12,
                  background: "var(--error-bg)",
                  color: "var(--error)",
                  borderRadius: "var(--radius)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {error}
              </div>
            )}
          </form>

          <div
            style={{
              marginTop: 40,
              padding: 16,
              background: "var(--gold-50)",
              borderRadius: "var(--radius)",
              fontSize: 13,
              color: "var(--text-secondary)",
              border: "1px solid var(--gold-100)",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--gold-dark)" }}>Demo accounts</div>
            <div>
              <code style={{ color: "var(--primary)", fontWeight: 600 }}>samuel@ug.edu.gh</code>{" "}
              — Student
            </div>
            <div>
              <code style={{ color: "var(--gold-dark)", fontWeight: 600 }}>admin@ug.edu.gh</code>{" "}
              — Admin
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
