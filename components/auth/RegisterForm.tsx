"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  const inputStyle: React.CSSProperties = {
    padding: "10px 13px", borderRadius: 8,
    border: "1.5px solid #E4E7EC", fontSize: 14,
    color: "#101828", outline: "none", background: "#fff",
  };

  const focusStyle: React.CSSProperties = { ...inputStyle, border: "1.5px solid #2563EB" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left panel */}
      <div style={{ width: 420, flexShrink: 0, background: "#2563EB", padding: "40px 44px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "auto" }}>
          <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em" }}>SwiftShip</span>
        </div>

        <div style={{ marginBottom: 60 }}>
          <h2 style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.2, margin: "0 0 14px" }}>
            Ship smarter,<br />track everything.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Create your free account and start booking shipments in minutes.
          </p>

          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { icon: "📦", text: "Book shipments in seconds" },
              { icon: "📍", text: "Real-time tracking updates" },
              { icon: "🧾", text: "Digital invoices and history" },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{icon}</span>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.04em", color: "#101828", margin: "0 0 6px" }}>Create account</h1>
          <p style={{ fontSize: 14, color: "#667085", margin: "0 0 32px" }}>
            Already have one?{" "}
            <Link href="/login" style={{ color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Full name</label>
                <input value={form.name} onChange={set("name")} required placeholder="Jane Doe" style={inputStyle}
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Email address</label>
              <input type="email" value={form.email} onChange={set("email")} required placeholder="you@example.com" style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Phone <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span></label>
              <input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 555-000-0000" style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Password</label>
              <input type="password" value={form.password} onChange={set("password")} required placeholder="Min. 8 characters" style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Confirm password</label>
              <input type="password" value={form.confirm} onChange={set("confirm")} required placeholder="••••••••" style={inputStyle}
                onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                onBlur={e => Object.assign(e.currentTarget.style, inputStyle)} />
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 13px", fontSize: 13, fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              padding: "11px", background: loading ? "#93C5FD" : "#2563EB",
              color: "#fff", border: "none", borderRadius: 8, fontSize: 14,
              fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              marginTop: 4, letterSpacing: "-0.01em",
            }}>
              {loading ? "Creating account…" : "Create account"}
            </button>

            <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", margin: 0 }}>
              By registering you agree to our{" "}
              <Link href="/terms" style={{ color: "#2563EB", textDecoration: "none" }}>Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" style={{ color: "#2563EB", textDecoration: "none" }}>Privacy Policy</Link>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
