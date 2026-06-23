"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:          { label: "Pending",          color: "var(--status-pending-text)",    bg: "var(--status-pending-bg)",    dot: "var(--status-pending-dot)"    },
  CONFIRMED:        { label: "Confirmed",         color: "var(--status-confirmed-text)",  bg: "var(--status-confirmed-bg)",  dot: "var(--status-confirmed-dot)"  },
  PICKED_UP:        { label: "Picked Up",         color: "var(--status-picked-text)",    bg: "var(--status-picked-bg)",    dot: "var(--status-picked-dot)"    },
  IN_TRANSIT:       { label: "In Transit",        color: "var(--status-transit-text)",   bg: "var(--status-transit-bg)",   dot: "var(--status-transit-dot)"   },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",  color: "var(--status-ofd-text)",       bg: "var(--status-ofd-bg)",       dot: "var(--status-ofd-dot)"       },
  DELIVERED:        { label: "Delivered",         color: "var(--status-delivered-text)", bg: "var(--status-delivered-bg)", dot: "var(--status-delivered-dot)" },
  FAILED:           { label: "Failed",            color: "var(--status-failed-text)",    bg: "var(--status-failed-bg)",    dot: "var(--status-failed-dot)"    },
  RETURNED:         { label: "Returned",          color: "var(--status-neutral-text)",   bg: "var(--status-neutral-bg)",   dot: "var(--status-neutral-dot)"   },
  CANCELLED:        { label: "Cancelled",         color: "var(--status-neutral-text)",   bg: "var(--status-neutral-bg)",   dot: "var(--status-neutral-dot)"   },
};

const STATUS_ORDER = [
  "PENDING", "CONFIRMED", "PICKED_UP",
  "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED",
];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

interface TrackingEvent {
  id: string; status: string; location: string | null;
  note: string | null; createdAt: string;
}

interface ShipmentResult {
  trackingNumber: string; status: string; serviceType: string;
  estimatedDelivery: string | null; deliveredAt: string | null; createdAt: string;
  weightKg: number; description: string | null;
  carrierName: string | null; carrierTrackingId: string | null;
  origin:      { city: string; state: string; country: string };
  destination: { city: string; state: string; country: string };
  trackingEvents: TrackingEvent[];
  parcels: { id: string; label: string | null; weightKg: number }[];
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META["PENDING"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: "var(--radius-xl)", fontSize: 12, fontWeight: 600, color: m.color, background: m.bg }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot }} />
      {m.label}
    </span>
  );
}

function ProgressBar({ status }: { status: string }) {
  const idx      = STATUS_ORDER.indexOf(status);
  const isFailed = status === "FAILED" || status === "CANCELLED" || status === "RETURNED";
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        {STATUS_ORDER.map((s, i) => {
          const done   = !isFailed && i <= idx;
          const active = !isFailed && i === idx;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STATUS_ORDER.length - 1 ? 1 : undefined }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isFailed ? "var(--status-failed-bg)" : done ? "var(--color-primary)" : "var(--color-border)",
                  border: active ? "2.5px solid var(--color-primary)" : "none",
                  flexShrink: 0,
                }}>
                  {done && !active && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  )}
                  {active && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)" }} />}
                  {isFailed && i === 0 && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--status-failed-text)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: done ? "var(--color-primary)" : "var(--color-subtle)", whiteSpace: "nowrap", letterSpacing: "0.03em" }}>
                  {STATUS_META[s]?.label.split(" ")[0]}
                </span>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div style={{ flex: 1, height: 2.5, background: !isFailed && i < idx ? "var(--color-primary)" : "var(--color-border)", margin: "0 4px", marginBottom: 22, borderRadius: 2, transition: "background 0.3s" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackingPage() {
  const searchParams  = useSearchParams();
  const [query, setQuery]     = useState(searchParams.get("q") ?? "");
  const [input, setInput]     = useState(searchParams.get("q") ?? "");
  const [result, setResult]   = useState<ShipmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (query) search(query);
  }, []);

  const search = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res  = await fetch(`/api/tracking/${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No shipment found.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(input);
    search(input);
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-ink)" }}>

      {/* Nav */}
      <nav style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "var(--color-primary)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "-0.02em" }}>SwiftShip</span>
        </Link>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/login"    style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.5)", textDecoration: "none", padding: "6px 12px" }}>Sign in</Link>
          <Link href="/register" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "6px 14px", background: "var(--color-primary)", borderRadius: "var(--radius-sm)" }}>Get started</Link>
        </div>
      </nav>

      {/* Hero search */}
      <div style={{ padding: "64px 24px 48px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 10px" }}>
          Track your package
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", margin: "0 0 32px" }}>
          Enter your tracking number to get a real-time update.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 540, margin: "0 auto" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. SHP-M3A2K1-XQRP"
            style={{
              flex: 1, padding: "13px 18px", borderRadius: "var(--radius-md)",
              border: "1.5px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)",
              color: "#fff", fontSize: 14, outline: "none", fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
            onFocus={(e) => { e.currentTarget.style.border = "1.5px solid var(--color-primary)"; }}
            onBlur={(e)  => { e.currentTarget.style.border = "1.5px solid rgba(255,255,255,0.12)"; }}
          />
          <button type="submit" disabled={loading} style={{
            padding: "13px 24px", borderRadius: "var(--radius-md)", border: "none",
            background: loading ? "#93C5FD" : "var(--color-primary)",
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}>
            {loading ? "Searching…" : "Track"}
          </button>
        </form>
      </div>

      {/* Result */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 64px" }}>

        {error && (
          <div style={{ background: "var(--color-error-bg)", border: "1px solid var(--color-error-border)", borderRadius: "var(--radius-md)", padding: "14px 18px", color: "var(--color-error-text)", fontSize: 13, fontWeight: 500, textAlign: "center" }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: "var(--color-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-border)", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>

            {/* Result header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--color-primary)", fontWeight: 700, marginBottom: 4 }}>{result.trackingNumber}</div>
                <div style={{ fontSize: 12, color: "var(--color-subtle)" }}>Booked {fmtDate(result.createdAt)}</div>
              </div>
              <StatusBadge status={result.status} />
            </div>

            <div style={{ padding: "24px" }}>

              {/* Progress bar */}
              <ProgressBar status={result.status} />

              {/* Route */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, background: "var(--color-surface-alt)", borderRadius: "var(--radius-md)", padding: "16px 20px", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>From</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-ink)" }}>{result.origin.city}</div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{result.origin.state}, {result.origin.country}</div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 18 }}>&#9992;</div>
                  <div style={{ width: "100%", height: 2, background: "var(--color-border)" }} />
                  {result.estimatedDelivery && (
                    <div style={{ fontSize: 10, color: "var(--color-subtle)", fontWeight: 500 }}>Est. {fmtDate(result.estimatedDelivery)}</div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>To</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "var(--color-ink)" }}>{result.destination.city}</div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{result.destination.state}, {result.destination.country}</div>
                </div>
              </div>

              {/* Package info strip */}
              <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {[
                  { label: "Service", value: result.serviceType },
                  { label: "Weight",  value: `${result.weightKg} kg` },
                  { label: "Parcels", value: result.parcels.length > 0 ? `${result.parcels.length} parcel${result.parcels.length > 1 ? "s" : ""}` : "1 parcel" },
                  ...(result.carrierName ? [{ label: "Carrier", value: result.carrierName }] : []),
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ flex: 1, padding: "12px 14px", borderRight: i < arr.length - 1 ? "1px solid var(--color-border)" : "none", background: "var(--color-surface)" }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Delivered banner */}
              {result.status === "DELIVERED" && result.deliveredAt && (
                <div style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>&#10003;</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-success-text)" }}>
                    Delivered on {fmtDate(result.deliveredAt)}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>History</div>
                {[...result.trackingEvents].reverse().map((evt, i, arr) => {
                  const m      = STATUS_META[evt.status] ?? STATUS_META["PENDING"];
                  const latest = i === 0;
                  return (
                    <div key={evt.id} style={{ display: "flex", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 16, flexShrink: 0 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: latest ? m.dot : "var(--color-border)", marginTop: 3, flexShrink: 0 }} />
                        {i < arr.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 18, background: "var(--color-border-light)" }} />}
                      </div>
                      <div style={{ paddingBottom: 16, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: latest ? m.color : "var(--color-heading)" }}>{m.label}</div>
                        {evt.location && <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{evt.location}</div>}
                        {evt.note     && <div style={{ fontSize: 12, color: "var(--color-subtle)", marginTop: 1 }}>{evt.note}</div>}
                        <div style={{ fontSize: 11, color: "var(--color-placeholder)", marginTop: 3 }}>{fmtDate(evt.createdAt)} · {fmtTime(evt.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                {result.trackingEvents.length === 0 && (
                  <div style={{ fontSize: 13, color: "var(--color-subtle)", textAlign: "center", padding: "16px 0" }}>No events yet.</div>
                )}
              </div>
            </div>

            {/* CTA footer */}
            <div style={{ padding: "14px 24px", borderTop: "1px solid var(--color-border-light)", background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 12, color: "var(--color-subtle)" }}>Want to manage your shipments?</div>
              <Link href="/register" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>
                Create an account &#8594;
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
