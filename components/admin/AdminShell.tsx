"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: "/admin/shipments",
    label: "Shipments",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      </svg>
    ),
  },
  {
    href: "/admin/customers",
    label: "Customers",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: "/admin/pricing",
    label: "Quotes & Pricing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

interface Props {
  children: React.ReactNode;
  user: { name: string; email: string };
}

export default function AdminShell({ children, user }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  // Close the mobile drawer whenever the route changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-sans)" }}>

      {/* Mobile top bar — hidden on desktop */}
      <div className="mobile-topbar">
        <button aria-label="Open menu" onClick={() => setOpen(true)} style={styles.iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={styles.logoMarkSmall}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={styles.logoTextSmall}>SwiftShip</span>
        </div>
        <div style={{ width: 20 }} aria-hidden="true" />
      </div>

      {/* Backdrop — mobile only, shown while drawer is open */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <div style={{ display: "flex" }}>
        {/* SIDEBAR */}
        <aside className={`sidebar${open ? " sidebar-open" : ""}`} style={styles.sidebar}>
          <div style={styles.logoRow}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={styles.logoMark}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                    <rect x="9" y="11" width="14" height="10" rx="2"/>
                    <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  </svg>
                </div>
                <span style={styles.logoText}>SwiftShip</span>
              </div>
              <div style={styles.consoleLabel}>Admin Console</div>
            </div>
            <button aria-label="Close menu" className="close-btn" onClick={() => setOpen(false)} style={styles.iconBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "12px 10px" }}>
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link"
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px", borderRadius: "var(--radius-sm)", marginBottom: 2,
                    textDecoration: "none", fontSize: 13, fontWeight: active ? 700 : 500,
                    color: active ? "var(--color-primary)" : "var(--color-body)",
                    background: active ? "var(--color-accent-teal-light)" : "transparent",
                    transition: "background 0.12s, color 0.12s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--color-surface-alt)"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ color: active ? "var(--color-primary)" : "var(--color-subtle)", flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User + logout */}
          <div style={{ padding: "12px 10px 16px", borderTop: "1px solid var(--color-border-light)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: "var(--radius-sm)", marginBottom: 4 }}>
              <div style={styles.avatar}>{initials}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-subtle)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: "var(--radius-sm)", border: "none", background: "transparent",
                fontSize: 13, fontWeight: 500, color: "var(--color-error-text)", cursor: "pointer", textAlign: "left",
                fontFamily: "var(--font-sans)", transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-error-bg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-content" style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
          {children}
        </main>
      </div>

      <style jsx>{`
        .mobile-topbar {
          display: none;
        }
        .overlay {
          display: none;
        }
        .close-btn {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--color-surface);
            border-bottom: 1px solid var(--color-border-light);
            position: sticky;
            top: 0;
            z-index: 30;
          }
          .sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            transform: translateX(-100%);
            z-index: 50;
            box-shadow: var(--shadow-lg);
          }
          .sidebar-open {
            transform: translateX(0);
          }
          .close-btn {
            display: inline-flex !important;
          }
          .overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(20, 24, 28, 0.45);
            z-index: 45;
          }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: 228, flexShrink: 0, background: "var(--color-sidebar-bg)",
    borderRight: "1px solid var(--color-sidebar-border)",
    display: "flex", flexDirection: "column",
    position: "sticky", top: 0, height: "100vh", overflowY: "auto",
    transition: "transform 0.25s ease",
  },
  logoRow: {
    display: "flex", alignItems: "flex-start", justifyContent: "space-between",
    padding: "20px 20px 16px", borderBottom: "1px solid var(--color-border-light)",
  },
  logoMark: {
    width: 28, height: 28, background: "var(--color-ink)", borderRadius: "var(--radius-sm)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  logoText: {
    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "var(--color-ink)",
    letterSpacing: "0.02em", textTransform: "uppercase",
  },
  consoleLabel: {
    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--color-accent-teal)", marginTop: 10,
  },
  logoMarkSmall: {
    width: 24, height: 24, background: "var(--color-ink)", borderRadius: "var(--radius-sm)",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  logoTextSmall: {
    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "var(--color-ink)",
    letterSpacing: "0.02em", textTransform: "uppercase",
  },
  iconBtn: {
    background: "transparent", border: "none", padding: 4, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  avatar: {
    width: 30, height: 30, borderRadius: "50%", background: "var(--color-accent-teal-light)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11, color: "var(--color-accent-teal)",
    flexShrink: 0,
  },
};
