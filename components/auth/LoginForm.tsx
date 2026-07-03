"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function RegisteredBanner() {
  const searchParams = useSearchParams();
  if (!searchParams.get("registered")) return null;
  return (
    <div style={styles.banner}>
      <span style={styles.bannerLabel}>VERIFIED</span>
      <span style={{ color: "var(--color-muted)" }}>Account created. Sign in to continue.</span>
    </div>
  );
}

// Quiet nod to the shipping motif — a route line with a single position marker.
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
      <div style={styles.card}>
        <div className="h-title" style={styles.logo}>
          <div style={styles.logoMark}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={styles.logoText}>SwiftShip</span>
        </div>

        <div className="h-sub">
          <RouteLine />
        </div>

        <div className="h-sub" style={styles.eyebrow}> Sign In</div>
        <h1 className="h-title" style={styles.heading}>Welcome back.</h1>
        <p className="h-sub" style={styles.sub}>
          New here?{" "}
          <Link href="/register" className="foot-link" style={styles.link}>Create an account</Link>
        </p>

        <Suspense fallback={null}>
          <RegisteredBanner />
        </Suspense>

        <form onSubmit={handleSubmit} className="h-cta" style={styles.fields}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="tracker-input"
              style={styles.input}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--color-accent-teal)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          <div style={styles.field}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <label style={styles.label} htmlFor="password">Password</label>
              <Link href="/forgot-password" className="foot-link" style={{ ...styles.link, fontSize: 12 }}>Forgot?</Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="tracker-input"
              style={styles.input}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--color-accent-teal)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          {error && (
            <div style={styles.error}>
              <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>Error &mdash;</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-p"
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
    background: "var(--color-bg)",
    fontFamily: "var(--font-sans)",
    padding: "48px 24px",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "var(--color-surface)",
    border: "1px solid var(--color-border-light)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    padding: "40px 36px 36px",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 9, marginBottom: 36,
  },
  logoMark: {
    width: 22, height: 22, background: "var(--color-ink)",
    borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  logoText: {
    color: "var(--color-ink)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
    letterSpacing: "0.04em", textTransform: "uppercase",
  },
  routeWrap: {
    marginBottom: 26,
  },
  routeTrack: {
    position: "relative",
    height: 1,
    background: "var(--color-border)",
    marginBottom: 8,
  },
  routeDot: {
    position: "absolute",
    top: "50%", left: "62%",
    width: 6, height: 6, borderRadius: "50%",
    background: "var(--status-transit-dot)",
    transform: "translate(-50%, -50%)",
  },
  routeCaption: {
    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em",
    color: "var(--color-subtle)", textTransform: "uppercase",
  },
  eyebrow: {
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--color-accent-teal)", marginBottom: 14,
  },
  heading: {
    fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, letterSpacing: "-0.01em",
    color: "var(--color-heading)", margin: "0 0 10px", lineHeight: 1.12,
  },
  sub: {
    fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-muted)", margin: "0 0 32px",
  },
  banner: {
    display: "flex", alignItems: "baseline", gap: 8,
    fontSize: 13, marginBottom: 24, padding: "10px 14px",
    background: "var(--color-success-bg)",
    border: "1px solid var(--color-success-border)",
    borderRadius: "var(--radius-sm)",
  },
  bannerLabel: {
    fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 11, letterSpacing: "0.06em",
    color: "var(--color-success-text)",
  },
  fields: {
    display: "flex", flexDirection: "column", gap: 20,
  },
  field: {
    display: "flex", flexDirection: "column", gap: 7,
  },
  label: {
    fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", color: "var(--color-muted)",
  },
  input: {
    padding: "11px 13px", borderRadius: "var(--radius-sm)",
    border: "1px solid var(--color-border)", fontSize: 15, fontFamily: "var(--font-sans)",
    color: "var(--color-ink)", outline: "none", background: "var(--color-surface)",
    transition: "border-color 0.15s",
  },
  error: {
    fontSize: 13, fontFamily: "var(--font-sans)", color: "var(--color-error-text)",
    background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)",
    borderRadius: "var(--radius-sm)", padding: "10px 13px",
  },
  button: {
    padding: "13px", background: "var(--color-primary)", color: "#fff",
    border: "none", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600,
    fontFamily: "var(--font-sans)", cursor: "pointer", marginTop: 6, letterSpacing: "0.01em",
  },
  buttonDisabled: {
    opacity: 0.5, cursor: "not-allowed",
  },
  link: {
    color: "var(--color-accent-teal)", fontWeight: 600, textDecoration: "none",
  },
};
