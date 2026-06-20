"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
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
        <div style={styles.logo}>
          <div style={styles.logoMark}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={styles.logoText}>SwiftShip</span>
        </div>

        <div style={styles.panelBody}>
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
                    width: 10, height: 10, borderRadius: "50%", flexShrink: 0, marginTop: 3,
                    background: step.done ? "#fff" : "rgba(255,255,255,0.25)",
                    border: step.done ? "none" : "1.5px solid rgba(255,255,255,0.35)",
                  }} />
                  {i < arr.length - 1 && (
                    <div style={{ width: 1.5, flex: 1, minHeight: 18, background: "rgba(255,255,255,0.2)" }} />
                  )}
                </div>
                <div style={{ paddingBottom: 14 }}>
                  <div style={{
                    fontSize: 13, fontWeight: step.done ? 600 : 400,
                    color: step.done ? "#fff" : "rgba(255,255,255,0.45)",
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
          <h1 style={styles.formHeading}>Sign in</h1>
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
              <div style={styles.error}>{error}</div>
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
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  panel: {
    width: 420, flexShrink: 0,
    background: "#2563EB",
    padding: "40px 44px",
    display: "flex", flexDirection: "column",
    position: "sticky", top: 0, height: "100vh",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: "auto",
  },
  logoMark: {
    width: 32, height: 32, background: "rgba(255,255,255,0.15)",
    borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: {
    color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em",
  },
  panelBody: {
    marginBottom: 60,
  },
  panelHeading: {
    color: "#fff", fontSize: 28, fontWeight: 800,
    letterSpacing: "-0.04em", lineHeight: 1.2,
    margin: "0 0 14px",
  },
  panelSub: {
    color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6,
    margin: "0 0 36px",
  },
  timeline: {
    paddingLeft: 4,
  },
  form: {
    flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
    background: "#fff", padding: "40px 24px",
  },
  formInner: {
    width: "100%", maxWidth: 380,
  },
  formHeading: {
    fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em",
    color: "#101828", margin: "0 0 6px",
  },
  formSub: {
    fontSize: 14, color: "#667085", margin: "0 0 32px",
  },
  fields: {
    display: "flex", flexDirection: "column", gap: 18,
  },
  field: {
    display: "flex", flexDirection: "column", gap: 6,
  },
  label: {
    fontSize: 13, fontWeight: 600, color: "#374151",
  },
  input: {
    padding: "10px 13px", borderRadius: 8,
    border: "1.5px solid #E4E7EC", fontSize: 14,
    color: "#101828", outline: "none", background: "#fff",
    transition: "border-color 0.15s",
  },
  inputFocus: {
    padding: "10px 13px", borderRadius: 8,
    border: "1.5px solid #2563EB", fontSize: 14,
    color: "#101828", outline: "none", background: "#fff",
  },
  error: {
    background: "#FEF2F2", color: "#B91C1C",
    border: "1px solid #FECACA", borderRadius: 8,
    padding: "10px 13px", fontSize: 13, fontWeight: 500,
  },
  button: {
    padding: "11px", background: "#2563EB", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
    cursor: "pointer", marginTop: 4, letterSpacing: "-0.01em",
  },
  buttonDisabled: {
    opacity: 0.6, cursor: "not-allowed",
  },
  link: {
    color: "#2563EB", fontWeight: 600, textDecoration: "none",
  },
};
