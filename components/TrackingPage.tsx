"use client";

import { useState, useEffect, type FormEvent } from "react";
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

/**
 * Unified route + progress visual — replaces the old separate stepper,
 * flat route line, and "Delivered" banner. The marker position is computed
 * from the actual status, so it reflects real progress rather than sitting
 * on a static plane icon.
 */
function RouteProgress({ shipment }: { shipment: ShipmentResult }) {
  const { status, origin, destination, estimatedDelivery, deliveredAt } = shipment;
  const isBad  = status === "FAILED" || status === "CANCELLED" || status === "RETURNED";
  const idx     = STATUS_ORDER.indexOf(status);
  const lastIdx = STATUS_ORDER.length - 1;

  // For failed/cancelled/returned shipments, the line still shows how far it
  // got — conventionally treated as "made it to out-for-delivery" — but in
  // the failed color, with no pulsing marker since nothing is still moving.
  const percent = isBad
    ? (STATUS_ORDER.indexOf("OUT_FOR_DELIVERY") / lastIdx) * 100
    : idx >= 0 ? (idx / lastIdx) * 100 : 0;

  const destinationNote =
    status === "DELIVERED" && deliveredAt ? `Delivered ${fmtDate(deliveredAt)}` :
    status === "FAILED"     ? "Delivery attempt failed" :
    status === "RETURNED"   ? "Returned to sender" :
    status === "CANCELLED"  ? "Shipment cancelled" :
    estimatedDelivery        ? `Est. ${fmtDate(estimatedDelivery)}` :
    "Estimate pending";

  const lineColor = isBad ? "var(--status-failed-dot)" : "var(--color-primary)";

  return (
    <div style={{ marginBottom: 26 }}>
      {/* From / To */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>From</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-heading)", fontFamily: "var(--font-display)" }}>{origin.city}</div>
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{origin.state}, {origin.country}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>To</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--color-heading)", fontFamily: "var(--font-display)" }}>{destination.city}</div>
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{destination.state}, {destination.country}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: isBad ? "var(--status-failed-text)" : "var(--color-muted)", marginTop: 4 }}>
            {destinationNote}
          </div>
        </div>
      </div>

      {/* Route line */}
      <div style={{ position: "relative", height: 24, marginBottom: 6 }}>
        <div style={{
          position: "absolute", top: "50%", left: 0, right: 0, height: 2, transform: "translateY(-50%)",
          backgroundImage: "linear-gradient(to right, var(--color-border) 0 6px, transparent 6px 12px)",
          backgroundSize: "12px 2px", backgroundRepeat: "repeat-x",
        }} />
        <div style={{
          position: "absolute", top: "50%", left: 0, height: 2, transform: "translateY(-50%)",
          width: `${percent}%`, background: lineColor, transition: "width 0.4s ease",
        }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {STATUS_ORDER.map((s) => {
            const i = STATUS_ORDER.indexOf(s);
            const passed = !isBad && i <= idx;
            return (
              <div key={s} style={{
                width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                background: passed ? "var(--color-primary)" : "var(--color-surface)",
                border: `2px solid ${passed ? "var(--color-primary)" : "var(--color-border)"}`,
              }} />
            );
          })}
        </div>
        <div style={{
          position: "absolute", top: "50%", left: `${percent}%`, width: 16, height: 16,
          transform: "translate(-50%, -50%)", borderRadius: "50%", background: lineColor,
          boxShadow: `0 0 0 4px ${isBad ? "rgba(201,72,58,0.18)" : "rgba(255,106,44,0.18)"}`,
          transition: "left 0.4s ease",
        }}>
          {!isBad && status !== "DELIVERED" && (
            <span className="route-marker-pulse" style={{
              position: "absolute", inset: 0, borderRadius: "50%", background: lineColor,
              animation: "pulse 1.8s ease-out infinite",
            }} />
          )}
        </div>
      </div>

      {/* Step labels — hidden on narrow screens via globals.css */}
      <div className="route-step-labels" style={{ display: "grid", gridTemplateColumns: `repeat(${STATUS_ORDER.length}, 1fr)` }}>
        {STATUS_ORDER.map((s, i) => {
          const passed = !isBad && i <= idx;
          const align = i === 0 ? "left" : i === STATUS_ORDER.length - 1 ? "right" : "center";
          return (
            <div key={s} style={{ textAlign: align as any }}>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.02em", color: passed ? "var(--color-primary)" : "var(--color-subtle)" }}>
                {STATUS_META[s]?.label}
              </span>
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
        setError(data.error ?? "No shipment matches that tracking number.");
        return;
      }
      setResult(data);
    } catch {
      setError("Couldn't reach the server — try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setQuery(input);
    search(input);
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* Nav */}
      <nav style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", borderBottom: "1px solid var(--color-nav-border)", background: "var(--color-nav-bg)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "var(--color-primary)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--color-ink)", letterSpacing: "-0.02em" }}>SwiftShip</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/login" className="nav-link" style={{ fontSize: 13, fontWeight: 500, color: "var(--color-nav-text)", textDecoration: "none", padding: "6px 12px" }}>Sign in</Link>
          <Link href="/register" className="btn-p" style={{ fontSize: 13, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "6px 14px", background: "var(--color-primary)", borderRadius: "var(--radius-sm)" }}>Get started</Link>
        </div>
      </nav>

      {/* Hero search */}
      <div style={{ padding: "64px 24px 48px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 500,
          color: "var(--color-primary-dark)", letterSpacing: "0.06em", marginBottom: 16,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-primary)", boxShadow: "0 0 0 3px rgba(255,106,44,0.18)" }} />
          EN ROUTE — REAL TIME
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--color-heading)", letterSpacing: "-0.03em", margin: "0 0 10px" }}>
          Track your package
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-muted)", margin: "0 0 32px" }}>
          Enter your tracking number to get a real-time update.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, maxWidth: 540, margin: "0 auto" }}>
          <input
            className="tracker-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. SHP-M3A2K1-XQRP"
            style={{
              flex: 1, padding: "13px 18px", borderRadius: "var(--radius-md)",
              border: "1.5px solid var(--color-border)", background: "var(--color-surface)",
              color: "var(--color-ink)", fontSize: 14, outline: "none", fontFamily: "var(--font-mono)",
              letterSpacing: "0.02em",
            }}
            onFocus={(e) => { e.currentTarget.style.border = "1.5px solid var(--color-primary)"; }}
            onBlur={(e)  => { e.currentTarget.style.border = "1.5px solid var(--color-border)"; }}
          />
          <button type="submit" disabled={loading} className="btn-p" style={{
            padding: "13px 24px", borderRadius: "var(--radius-md)", border: "none",
            background: loading ? "var(--color-primary-border)" : "var(--color-primary)",
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

              {/* Unified route + progress */}
              <RouteProgress shipment={result} />

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
