"use client";

import { useState } from "react";

interface User {
  id: string; name: string; email: string;
  phone: string | null; role: string; createdAt: string;
  _count: { shipments: number };
}

const inp: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: "var(--radius-sm)",
  border: "1.5px solid var(--color-border)", fontSize: 14,
  color: "var(--color-heading)", outline: "none",
  background: "var(--color-surface)", fontFamily: "inherit",
};
const inpFocus: React.CSSProperties = { ...inp, border: "1.5px solid var(--color-primary)" };

function Field({ label, value, onChange, type = "text", disabled = false }: {
  label: string; value: string; onChange?: (v: string) => void;
  type?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-body)" }}>{label}</label>
      <input
        type={type} value={value} disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={disabled ? { ...inp, background: "var(--color-surface-alt)", color: "var(--color-subtle)", cursor: "not-allowed" } : focused ? inpFocus : inp}
      />
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function ProfilePage({ user }: { user: User }) {
  const [name, setName]       = useState(user.name);
  const [phone, setPhone]     = useState(user.phone ?? "");
  const [saving, setSaving]   = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  const [curPw, setCurPw]     = useState("");
  const [newPw, setNewPw]     = useState("");
  const [confPw, setConfPw]   = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const saveProfile = async () => {
    setSaving(true); setSuccess(false); setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: phone || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to save.");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    setPwError(""); setPwSuccess(false);
    if (newPw !== confPw) { setPwError("Passwords do not match."); return; }
    if (newPw.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    setPwSaving(true);
    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed to change password.");
      setPwSuccess(true);
      setCurPw(""); setNewPw(""); setConfPw("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (e: any) { setPwError(e.message); }
    finally { setPwSaving(false); }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 680, margin: "0 auto", fontFamily: "var(--font-sans)" }}>

      <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-ink)" }}>Profile</h1>

      {/* Avatar + meta */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: "var(--color-primary)", flexShrink: 0 }}>
          {initials}
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.02em" }}>{name}</div>
          <div style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 2 }}>{user.email}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--color-primary)", background: "var(--color-primary-light)", padding: "2px 8px", borderRadius: "var(--radius-xl)" }}>
              {user.role}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-subtle)" }}>
              {user._count.shipments} shipment{user._count.shipments !== 1 ? "s" : ""}
            </span>
            <span style={{ fontSize: 11, color: "var(--color-subtle)" }}>
              Member since {fmtDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", marginBottom: 20 }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--color-border-light)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>Personal Information</div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <Field label="Full name"      value={name}  onChange={setName}  />
          <Field label="Email address"  value={user.email} disabled />
          <Field label="Phone"          value={phone} onChange={setPhone} type="tel" />

          {error   && <div style={{ background: "var(--color-error-bg)", color: "var(--color-error-text)", border: "1px solid var(--color-error-border)", borderRadius: "var(--radius-sm)", padding: "10px 13px", fontSize: 13, marginBottom: 14 }}>{error}</div>}
          {success && <div style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-sm)", padding: "10px 13px", fontSize: 13, marginBottom: 14 }}>Profile updated successfully.</div>}

          <button onClick={saveProfile} disabled={saving} style={{ padding: "10px 22px", borderRadius: "var(--radius-sm)", border: "none", background: saving ? "#93C5FD" : "var(--color-primary)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--color-border-light)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>Change Password</div>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <Field label="Current password" value={curPw}  onChange={setCurPw}  type="password" />
          <Field label="New password"     value={newPw}  onChange={setNewPw}  type="password" />
          <Field label="Confirm password" value={confPw} onChange={setConfPw} type="password" />

          {pwError   && <div style={{ background: "var(--color-error-bg)", color: "var(--color-error-text)", border: "1px solid var(--color-error-border)", borderRadius: "var(--radius-sm)", padding: "10px 13px", fontSize: 13, marginBottom: 14 }}>{pwError}</div>}
          {pwSuccess && <div style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-sm)", padding: "10px 13px", fontSize: 13, marginBottom: 14 }}>Password changed successfully.</div>}

          <button onClick={changePassword} disabled={pwSaving} style={{ padding: "10px 22px", borderRadius: "var(--radius-sm)", border: "none", background: pwSaving ? "#93C5FD" : "var(--color-primary)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: pwSaving ? "not-allowed" : "pointer" }}>
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
  }
