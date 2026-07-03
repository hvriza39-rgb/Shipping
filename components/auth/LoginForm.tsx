"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Display: a serif with a little warmth (e.g. Fraunces) — set this as --font-display in your root layout.
const DISPLAY = "var(--font-display), Georgia, 'Times New Roman', serif";
// Body: a clean, quiet sans (e.g. Inter) — set as --font-body.
const BODY    = "var(--font-body), system-ui, sans-serif";
// Mono: kept from the manifest/waybill motif (e.g. IBM Plex Mono) — set as --font-mono.
const MONO    = "var(--font-mono), 'Courier New', monospace";

const INK       = "#14181C";
const INK_SOFT  = "#6B7280";
const INK_FAINT = "#9CA3AF";
const ACCENT    = "#2C6E78"; // route teal — the one accent color
const LINE      = "#E4E4E1";
const PAPER     = "#FFFFFF";
const STAMP     = "#B23A2E"; // reserved for errors only
const LEDGER    = "#3F7D5C"; // reserved for the verified banner only

function RegisteredBanner() {
  const searchParams = useSearchParams();
  if (!searchParams.get("registered")) return null;
  return (
    <div style={styles.banner}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", color: LEDGER }}>
        VERIFIED
      </span>
      <span style={{ color: INK_SOFT }}>Account created. Sign in to continue.</span>
    </div>
  );
}

// A quiet nod to the shipping motif — one line, one dot, no chrome.
function RouteLine() {
  return (
    <div style={styles.routeWrap} aria-hidden="true">
      <div style={styles.routeTrack}>
        <div style={styles.routeDot} />
      </div>
      <div style={styles.routeCaption}>TRK-2291 &middot; IN TRANSIT</div>
    </div>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.logo}>
          <div style={styles.logoMark}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={styles.logoText}>SwiftShip</span>
        </div>

        <RouteLine />

        <div style={styles.eyebrow}>Manifest No. 004&ndash;B &nbsp;/&nbsp; Sign In</div>
        <h1 style={styles.heading}>Welcome back.</h1>
        <p style={styles.sub}>
          New here?{" "}
          <Link href="/register" style={styles.link}>Create an account</Link>
        </p>

        <Suspense fallback={null}>
          <RegisteredBanner />
        </Suspense>

        <form onSubmit={handleSubmit} style={styles.fields}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={styles.input}
              onFocus={e => (e.currentTarget.style.borderBottomColor = ACCENT)}
              onBlur={e => (e.currentTarget.style.borderBottomColor = LINE)}
            />
          </div>

          <div style={styles.field}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={styles.label} htmlFor="password">Password</label>
              <Link href="/forgot-password" style={{ ...styles.link, fontSize: 12 }}>Forgot?</Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={styles.input}
              onFocus={e => (e.currentTarget.style.borderBottomColor = ACCENT)}
              onBlur={e => (e.currentTarget.style.borderBottomColor = LINE)}
            />
          </div>

          {error && (
            <div style={styles.error}>
              <span style={{ fontFamily: MONO, fontWeight: 700 }}>Error &mdash;</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: PAPER,
    fontFamily: BODY,
    padding: "48px 24px",
  },
  container: {
    width: "100%",
    maxWidth: 380,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 9, marginBottom: 40,
  },
  logoMark: {
    width: 22, height: 22, background: INK,
    borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    color: INK, fontFamily: MONO, fontWeight: 700, fontSize: 13,
    letterSpacing: "0.04em", textTransform: "uppercase",
  },
  routeWrap: {
    marginBottom: 28,
  },
  routeTrack: {
    position: "relative",
    height: 1,
    background: LINE,
    marginBottom: 8,
  },
  routeDot: {
    position: "absolute",
    top: "50%", left: "62%",
    width: 6, height: 6, borderRadius: "50%",
    background: ACCENT,
    transform: "translate(-50%, -50%)",
  },
  routeCaption: {
    fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em",
    color: INK_FAINT, textTransform: "uppercase",
  },
  eyebrow: {
    fontFamily: MONO, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", color: ACCENT, marginBottom: 14,
  },
  heading: {
    fontFamily: DISPLAY, fontSize: 34, fontWeight: 500, letterSpacing: "-0.01em",
    color: INK, margin: "0 0 10px", lineHeight: 1.1,
  },
  sub: {
    fontFamily: BODY, fontSize: 14, color: INK_SOFT, margin: "0 0 36px",
  },
  banner: {
    display: "flex", alignItems: "baseline", gap: 8,
    fontSize: 13, marginBottom: 24, paddingBottom: 16,
    borderBottom: `1px solid ${LINE}`,
  },
  fields: {
    display: "flex", flexDirection: "column", gap: 24,
  },
  field: {
    display: "flex", flexDirection: "column", gap: 8,
  },
  label: {
    fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", color: INK_SOFT,
  },
  input: {
    padding: "8px 2px", borderRadius: 0,
    border: "none", borderBottom: `1px solid ${LINE}`, fontSize: 15, fontFamily: BODY,
    color: INK, outline: "none", background: "transparent",
    transition: "border-color 0.15s",
  },
  error: {
    fontSize: 13, fontFamily: BODY, color: STAMP,
  },
  button: {
    padding: "13px", background: INK, color: "#fff",
    border: "none", borderRadius: 3, fontSize: 14, fontWeight: 600, fontFamily: BODY,
    cursor: "pointer", marginTop: 8, letterSpacing: "0.01em",
    transition: "opacity 0.15s",
  },
  buttonDisabled: {
    opacity: 0.5, cursor: "not-allowed",
  },
  link: {
    color: ACCENT, fontWeight: 600, textDecoration: "none",
  },
};
