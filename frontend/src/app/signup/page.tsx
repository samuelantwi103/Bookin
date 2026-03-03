"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function Signup() {
  const { theme } = useTheme();
  const accentText = theme === "dark" ? "var(--primary-readable)" : "var(--primary)";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const user = await api.signup(name, email, password);
      login(user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message.includes("already") ? "Email already registered" : message);
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
            Join thousands of students and staff booking facilities across the University
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
                <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--font-display)", marginBottom: 2, color: "white" }}>{s.n}</div>
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
            Create your account
          </h2>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: 15,
              marginBottom: 32,
            }}
          >
            Sign up to start booking facilities
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label">Full Name</label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                autoFocus
              />
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label">Campus Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ug.edu.gh"
                required
              />
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="field" style={{ marginBottom: 0 }}>
              <label className="label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    padding: 4,
                    display: "flex",
                    alignItems: "center",
                  }}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gold btn-lg"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Creating account…" : "Sign Up"}
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

            <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: accentText, fontWeight: 600 }}>
                Sign in
              </Link>
            </div>
          </form>

          <div
            style={{
              marginTop: 32,
              padding: 12,
              background: "var(--bg-alt)",
              borderRadius: "var(--radius)",
              fontSize: 12,
              color: "var(--text-muted)",
              textAlign: "center",
            }}
          >
            By signing up, you agree to our Terms of Service and Privacy Policy
          </div>
        </div>
      </div>
    </main>
  );
}
