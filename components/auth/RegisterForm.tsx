"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Quiet nod to the shipping motif — matches the login page's route line.
function RouteLine() {
  return (
    <div style={styles.routeWrap} aria-hidden="true">
      <div style={styles.routeTrack}>
        <div style={styles.routeDot} />
      </div>
      <div style={styles.routeCaption}>NEW ACCOUNT &middot; PENDING</div>
    </div>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm]       = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name:     form.name,
        email:    form.email,
        phone:    form.phone,
        password: form.password,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/login?registered=1");
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

        <div className="h-sub" style={styles.eyebrow}>New Manifest &nbsp;/&nbsp; Create Account</div>
        <h1 className="h-title" style={styles.heading}>Get started.</h1>
        <p className="h-sub" style={styles.sub}>
          Already have an account?{" "}
          <Link href="/login" className="foot-link" style={styles.link}>Sign in</Link>
        </p>

        <form onSubmit={handleSubmit} className="h-cta" style={styles.fields}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="name">Full name</label>
            <input
              id="name"
              value={form.name}
              onChange={set("name")}
              required
              placeholder="Jane Doe"
              className="tracker-input"
              style={styles.input}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--color-accent-teal)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={set("email")}
              required
              placeholder="you@example.com"
              className="tracker-input"
              style={styles.input}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--color-accent-teal)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="phone">
              Phone <span style={{ color: "var(--color-placeholder)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+1 555-000-0000"
              className="tracker-input"
              style={styles.input}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--color-accent-teal)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={set("password")}
              required
              placeholder="Min. 8 characters"
              className="tracker-input"
              style={styles.input}
              onFocus={e => (e.currentTarget.style.borderColor = "var(--color-accent-teal)")}
              onBlur={e => (e.currentTarget.style.borderColor = "var(--color-border)")}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={form.confirm}
              onChange={set("confirm")}
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
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p style={styles.terms}>
            By registering you agree to our{" "}
            <Link href="/terms" className="foot-link" style={styles.termsLink}>Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="foot-link" style={styles.termsLink}>Privacy Policy</Link>.
          </p>
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
    maxWidth: 440,
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
    top: "50%", left: "12%",
    width: 6, height: 6, borderRadius: "50%",
    background: "var(--status-pending-dot)",
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
  fields: {
    display: "flex", flexDirection: "column", gap: 18,
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
  terms: {
    fontSize: 12, color: "var(--color-subtle)", textAlign: "center", margin: "4px 0 0",
    fontFamily: "var(--font-sans)",
  },
  termsLink: {
    color: "var(--color-accent-teal)", textDecoration: "none",
  },
};
