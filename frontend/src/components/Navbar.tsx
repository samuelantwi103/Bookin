"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch by only showing user-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const isAdmin = user?.role === "ADMIN";

  const navLink = (href: string, label: string, icon?: string) => {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        style={{
          fontSize: 14,
          fontWeight: active ? 700 : 500,
          color: active ? "var(--primary)" : "var(--text-secondary)",
          transition: "color 0.2s",
          position: "relative" as const,
          paddingBottom: 2,
          borderBottom: active ? "2px solid var(--primary)" : "2px solid transparent",
        }}
      >
        {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
        {label}
      </Link>
    );
  };

  // Role-based navigation items
  const getNavItems = () => {
    if (authLoading || !user) {
      return [];
    }
    if (isAdmin) {
      return [
        // { href: "/", label: "Explore" },
        { href: "/admin", label: "Dashboard" },
        { href: "/bookings", label: "Bookings" },
      ];
    }
    return [
      // { href: "/", label: "Explore" },
      { href: "/bookings", label: "My Bookings" },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "var(--nav-height)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 24px",
          background: theme === "dark" ? "rgba(30,33,48,0.92)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          zIndex: 100,
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            b
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 22,
              color: "var(--primary)",
              letterSpacing: "-0.03em",
            }}
          >
            bookin
          </span>
          {mounted && isAdmin && (
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: "var(--gold)",
                color: "var(--primary-dark)",
                borderRadius: 4,
                padding: "2px 6px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Admin
            </span>
          )}
        </Link>

        {/* Desktop Links */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {navItems.map((item) => navLink(item.href, item.label))}
        </div>

        {/* Right side: user dropdown + hamburger */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "none",
              border: "1px solid var(--border)",
              cursor: "pointer",
              color: "var(--text-secondary)",
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-alt)";
              e.currentTarget.style.color = "var(--gold)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            {theme === "dark" ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {authLoading ? (
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-alt)" }} />
          ) : user ? (
            <div className="user-area" ref={dropdownRef} style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: "var(--radius)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-alt)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <div style={{ textAlign: "right" }} className="hide-mobile">
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", lineHeight: 1.3 }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                    {isAdmin ? "Administrator" : "Student"}
                  </div>
                </div>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--text-muted)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    boxShadow: "var(--shadow-lg)",
                    minWidth: 200,
                    padding: 6,
                    animation: "scaleIn 0.15s ease",
                    zIndex: 200,
                  }}
                >
                  {/* User info in dropdown */}
                  <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{user.email}</div>
                  </div>
                  {/* Mobile-only nav items */}
                  <div className="show-mobile-only" style={{ display: "none" }}>
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        style={{
                          display: "block",
                          padding: "10px 12px",
                          fontSize: 14,
                          fontWeight: pathname === item.href ? 700 : 500,
                          color: pathname === item.href ? "var(--primary)" : "var(--text)",
                          borderRadius: "var(--radius-sm)",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-alt)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }} />
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); logout(); }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      padding: "10px 12px",
                      background: "none",
                      border: "none",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--error)",
                      cursor: "pointer",
                      borderRadius: "var(--radius-sm)",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--error-bg)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}

          {/* Hamburger — mobile only */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span style={menuOpen ? { transform: "rotate(45deg) translateY(7px)" } : {}} />
            <span style={menuOpen ? { opacity: 0 } : {}} />
            <span style={menuOpen ? { transform: "rotate(-45deg) translateY(-7px)" } : {}} />
          </button>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            top: "var(--nav-height)",
            left: 0,
            right: 0,
            bottom: 0,
            background: "var(--surface)",
            zIndex: 99,
            padding: "16px 20px",
            animation: "fadeIn 0.2s ease",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 16px",
                borderRadius: "var(--radius)",
                fontSize: 16,
                fontWeight: pathname === item.href ? 700 : 500,
                color: pathname === item.href ? "var(--primary)" : "var(--text)",
                background: pathname === item.href ? "var(--primary-50)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
          {user && (
            <>
              <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
              <div
                style={{
                  padding: "12px 16px",
                  fontSize: 13,
                  color: "var(--text-muted)",
                }}
              >
                Signed in as <strong style={{ color: "var(--text)" }}>{user.name}</strong>
              </div>
              <button
                onClick={logout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 16px",
                  borderRadius: "var(--radius)",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "var(--error)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
