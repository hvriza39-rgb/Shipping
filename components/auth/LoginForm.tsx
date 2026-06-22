"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const DISPLAY = "var(--font-display), 'Arial Narrow', sans-serif";
const BODY    = "var(--font-body), system-ui, sans-serif";
const MONO    = "var(--font-mono), 'Courier New', monospace";

const INK          = "#1C2B3A";
const INK_SOFT     = "#4B5A68";
const NIGHT        = "#14181C";
const STAMP        = "#B23A2E";
const ROUTE        = "#2C6E78";
const LEDGER_GREEN = "#3F7D5C";
const PAPER_LIGHT  = "#FBF8EF";
const PAPER_LINE   = "#D8CBAA";

function RegisteredBanner() {
  const searchParams = useSearchParams();
  if (!searchParams.get("registered")) return null;
  return (
    <div style={{
      background: "rgba(63,125,92,0.07)", color: LEDGER_GREEN, border: `1.5px solid ${LEDGER_GREEN}`,
      borderRadius: 3, padding: "10px 13px", fontSize: 13, fontWeight: 500, marginBottom: 22,
      fontFamily: BODY, display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em" }}>VERIFIED &mdash;</span>
      Account created. Sign in to continue.
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
      {/* Left panel */}
      <div style={styles.panel}>
        <div style={styles.barcode} />

        <div style={styles.logo}>
          <div style={styles.logoMark}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={styles.logoText}>SwiftShip</span>
        </div>

        <div style={styles.panelBody}>
          <div style={styles.eyebrow}>Manifest &mdash; Account Access</div>
          <h2 style={styles.panelHeading}>Every package,<br />accounted for.</h2>
          <p style={styles.panelSub}>Real-time tracking, seamless booking, and full visibility from pickup to delivery.</p>

          {/* Mini tracking timeline */}
          <div style={styles.timeline}>
            {[
              { label: "Order Placed",      done: true  },
              { label: "Picked Up",         done: true  },
              { label: "In Transit",        done: true  },
              { label: "Out for Delivery",  done: false },
              { label: "Delivered",         done: false },
            ].map((step, i, arr) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 18, flexShrink: 0 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                    background: step.done ? LEDGER_GREEN : "transparent",
                    border: step.done ? "none" : "1.5px solid rgba(255,255,255,0.3)",
                  }} />
                  {i < arr.length - 1 && (
                    <div style={{ width: 1.5, flex: 1, minHeight: 18, background: "rgba(255,255,255,0.15)" }} />
                  )}
                </div>
                <div style={{ paddingBottom: 14 }}>
                  <div style={{
                    fontFamily: MONO, fontSize: 12, fontWeight: step.done ? 600 : 400,
                    letterSpacing: "0.02em",
                    color: step.done ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)",
                  }}>
                    {step.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={styles.form}>
        <div style={styles.formInner}>
          <div style={styles.formEyebrow}>Sign in</div>
          <h1 style={styles.formHeading}>Access your account</h1>
          <p style={styles.formSub}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={styles.link}>Create one</Link>
          </p>

          <form onSubmit={handleSubmit} style={styles.fields}>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={styles.input}
                onFocus={e => Object.assign(e.currentTarget.style, styles.inputFocus)}
                onBlur={e => Object.assign(e.currentTarget.style, styles.input)}
              />
            </div>

            <div style={styles.field}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={styles.label}>Password</label>
                <Link href="/forgot-password" style={{ ...styles.link, fontSize: 12 }}>Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={styles.input}
                onFocus={e => Object.assign(e.currentTarget.style, styles.inputFocus)}
                onBlur={e => Object.assign(e.currentTarget.style, styles.input)}
              />
            </div>

            {error && (
              <div style={styles.error}>
                <span style={{ fontFamily: MONO, fontWeight: 700 }}>ERROR &mdash;</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex", minHeight: "100vh",
    fontFamily: BODY,
  },
  panel: {
    width: 420, flexShrink: 0,
    background: NIGHT,
    padding: "0 44px 40px",
    display: "flex", flexDirection: "column",
    position: "sticky", top: 0, height: "100vh",
  },
  barcode: {
    height: 16, margin: "22px 0 26px", width: "100%",
    backgroundImage: "repeating-linear-gradient(90deg, #fff 0px, #fff 2px, transparent 2px, transparent 5px, #fff 5px, #fff 6px, transparent 6px, transparent 11px, #fff 11px, #fff 14px, transparent 14px, transparent 18px)",
    opacity: 0.18,
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: "auto",
  },
  logoMark: {
    width: 30, height: 30, background: STAMP,
    borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: {
    color: "#fff", fontFamily: DISPLAY, fontWeight: 700, fontSize: 17,
    letterSpacing: "0.01em", textTransform: "uppercase",
  },
  panelBody: {
    marginBottom: 56,
  },
  eyebrow: {
    fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16,
  },
  panelHeading: {
    color: "#fff", fontFamily: DISPLAY, fontSize: 30, fontWeight: 700,
    letterSpacing: "0.005em", lineHeight: 1.15, textTransform: "uppercase",
    margin: "0 0 14px",
  },
  panelSub: {
    color: "rgba(255,255,255,0.55)", fontFamily: BODY, fontSize: 14, lineHeight: 1.6,
    margin: "0 0 36px",
  },
  timeline: {
    paddingLeft: 4,
  },
  form: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    background: PAPER_LIGHT, padding: "40px 24px",
  },
  formInner: {
    width: "100%", maxWidth: 380,
  },
  formEyebrow: {
    fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
    textTransform: "uppercase", color: ROUTE, marginBottom: 12,
  },
  formHeading: {
    fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, letterSpacing: "0.005em",
    color: INK, margin: "0 0 8px", textTransform: "uppercase",
  },
  formSub: {
    fontFamily: BODY, fontSize: 14, color: INK_SOFT, margin: "0 0 32px",
  },
  fields: {
    display: "flex", flexDirection: "column", gap: 18,
  },
  field: {
    display: "flex", flexDirection: "column", gap: 6,
  },
  label: {
    fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", color: INK_SOFT,
  },
  input: {
    padding: "10px 13px", borderRadius: 3,
    border: `1.5px solid ${PAPER_LINE}`, fontSize: 14, fontFamily: BODY,
    color: INK, outline: "none", background: "#fff",
    transition: "border-color 0.15s",
  },
  inputFocus: {
    padding: "10px 13px", borderRadius: 3,
    border: `1.5px solid ${ROUTE}`, fontSize: 14, fontFamily: BODY,
    color: INK, outline: "none", background: "#fff",
  },
  error: {
    background: "rgba(178,58,46,0.06)", color: STAMP,
    border: `1.5px solid ${STAMP}`, borderRadius: 3,
    padding: "10px 13px", fontSize: 13, fontWeight: 500, fontFamily: BODY,
  },
  button: {
    padding: "12px", background: INK, color: "#fff",
    border: "none", borderRadius: 3, fontSize: 14, fontWeight: 700, fontFamily: BODY,
    cursor: "pointer", marginTop: 4, letterSpacing: "0.01em",
  },
  buttonDisabled: {
    opacity: 0.55, cursor: "not-allowed",
  },
  link: {
    color: ROUTE, fontWeight: 600, textDecoration: "none",
  },
};
