"use client";

import { useState, useEffect, Suspense, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import CargoSea from "@/components/CargoSea";

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:          { label: "Pending",          color: "var(--status-pending-text)",    bg: "var(--status-pending-bg)",    dot: "var(--status-pending-dot)"    },
  CONFIRMED:        { label: "Confirmed",        color: "var(--status-confirmed-text)",  bg: "var(--status-confirmed-bg)",  dot: "var(--status-confirmed-dot)"  },
  PICKED_UP:        { label: "Picked Up",        color: "var(--status-picked-text)",     bg: "var(--status-picked-bg)",     dot: "var(--status-picked-dot)"     },
  IN_TRANSIT:       { label: "In Transit",       color: "var(--status-transit-text)",    bg: "var(--status-transit-bg)",    dot: "var(--status-transit-dot)"    },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "var(--status-ofd-text)",        bg: "var(--status-ofd-bg)",        dot: "var(--status-ofd-dot)"        },
  DELIVERED:        { label: "Delivered",        color: "var(--status-delivered-text)",  bg: "var(--status-delivered-bg)",  dot: "var(--status-delivered-dot)"  },
  FAILED:           { label: "Failed",           color: "var(--status-failed-text)",     bg: "var(--status-failed-bg)",     dot: "var(--status-failed-dot)"     },
  RETURNED:         { label: "Returned",         color: "var(--status-neutral-text)",    bg: "var(--status-neutral-bg)",    dot: "var(--status-neutral-dot)"    },
  CANCELLED:        { label: "Cancelled",        color: "var(--status-neutral-text)",    bg: "var(--status-neutral-bg)",    dot: "var(--status-neutral-dot)"    },
};

const STATUS_ORDER = ["PENDING", "CONFIRMED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];

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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: "var(--radius-pill)", fontSize: 12, fontWeight: 600, color: m.color, background: m.bg }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot }} />
      {m.label}
    </span>
  );
}

/** Route + progress visual. Marker position comes from the real status. */
function RouteProgress({ shipment }: { shipment: ShipmentResult }) {
  const { status, origin, destination, estimatedDelivery, deliveredAt } = shipment;
  const isBad   = status === "FAILED" || status === "CANCELLED" || status === "RETURNED";
  const idx     = STATUS_ORDER.indexOf(status);
  const lastIdx = STATUS_ORDER.length - 1;

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
  const eyebrow = { fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 } as const;
  const city    = { fontSize: 20, fontWeight: 600, color: "var(--color-heading)", fontFamily: "var(--font-display)" } as const;

  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, gap: 16 }}>
        <div>
          <div style={eyebrow}>From</div>
          <div style={city}>{origin.city}</div>
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{origin.state}, {origin.country}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={eyebrow}>To</div>
          <div style={city}>{destination.city}</div>
          <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{destination.state}, {destination.country}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: isBad ? "var(--status-failed-text)" : "var(--color-muted)", marginTop: 4 }}>
            {destinationNote}
          </div>
        </div>
      </div>

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
          {STATUS_ORDER.map((s, i) => {
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
          boxShadow: `0 0 0 4px ${isBad ? "rgba(201,72,58,0.18)" : "rgba(192,101,74,0.2)"}`,
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

      <div className="route-step-labels" style={{ display: "grid", gridTemplateColumns: `repeat(${STATUS_ORDER.length}, 1fr)` }}>
        {STATUS_ORDER.map((s, i) => {
          const passed = !isBad && i <= idx;
          const align = i === 0 ? "left" : i === STATUS_ORDER.length - 1 ? "right" : "center";
          return (
            <div key={s} style={{ textAlign: align }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: passed ? "var(--color-primary)" : "var(--color-subtle)" }}>
                {STATUS_META[s]?.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrackingContent() {
  const searchParams = useSearchParams();
  // landing page links with ?n=, older links use ?q=
  const initial = searchParams.get("n") ?? searchParams.get("q") ?? "";
  const [input, setInput]     = useState(initial);
  const [result, setResult]   = useState<ShipmentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

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
      setError("Couldn't reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initial) search(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    search(input);
  };

  const eyebrow = { fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.08em", textTransform: "uppercase" } as const;

  return (
    <div className="tp">
      <style>{CSS}</style>

      <div className="tp-scene" aria-hidden="true"><CargoSea /></div>

      <nav className="tp-nav">
        <Link href="/" className="tp-brand">SwiftShip</Link>
        <div className="tp-nav-r">
          <Link href="/login">Sign in</Link>
          <Link href="/register" className="tp-btn tp-rust">Get started</Link>
        </div>
      </nav>

      <main className="tp-main">
        <div className="tp-hero">
          <div className="tp-chip"><span /> En route, real time</div>
          <h1>Track your<br />package.</h1>
          <p>Enter your tracking number to get a live update.</p>

          <form onSubmit={handleSubmit} className="tp-form">
            <input
              className="tracker-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. SHP-M3A2K1-XQRP"
              aria-label="Tracking number"
            />
            <button type="submit" disabled={loading} className="tp-btn tp-ink">
              {loading ? "Searching…" : "Track"}
            </button>
          </form>
        </div>

        {error && <div className="tp-error">{error}</div>}

        {result && (
          <div className="tp-panel">
            <div style={{ padding: "22px 26px", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--color-primary-dark)", fontWeight: 700, marginBottom: 4 }}>{result.trackingNumber}</div>
                <div style={{ fontSize: 12, color: "var(--color-subtle)" }}>Booked {fmtDate(result.createdAt)}</div>
              </div>
              <StatusBadge status={result.status} />
            </div>

            <div style={{ padding: 26 }}>
              <RouteProgress shipment={result} />

              <div style={{ display: "flex", marginBottom: 22, border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {[
                  { label: "Service", value: result.serviceType },
                  { label: "Weight",  value: `${result.weightKg} kg` },
                  { label: "Parcels", value: result.parcels.length > 0 ? `${result.parcels.length} parcel${result.parcels.length > 1 ? "s" : ""}` : "1 parcel" },
                  ...(result.carrierName ? [{ label: "Carrier", value: result.carrierName }] : []),
                ].map(({ label, value }, i, arr) => (
                  <div key={label} style={{ flex: 1, padding: "12px 14px", borderRight: i < arr.length - 1 ? "1px solid var(--color-border)" : "none" }}>
                    <div style={{ ...eyebrow, fontSize: 9, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>{value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ ...eyebrow, marginBottom: 14 }}>History</div>
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
                        <div style={{ fontSize: 11, color: "var(--color-subtle)", marginTop: 3 }}>{fmtDate(evt.createdAt)} · {fmtTime(evt.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                {result.trackingEvents.length === 0 && (
                  <div style={{ fontSize: 13, color: "var(--color-subtle)", textAlign: "center", padding: "16px 0" }}>No events yet.</div>
                )}
              </div>
            </div>

            <div style={{ padding: "16px 26px", borderTop: "1px solid var(--color-border-light)", background: "var(--color-surface-alt)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontSize: 13, color: "var(--color-muted)" }}>Want to manage your shipments?</div>
              <Link href="/register" style={{ fontSize: 13, fontWeight: 700, color: "var(--color-primary-dark)", textDecoration: "none" }}>
                Create an account &rarr;
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={null}>
      <TrackingContent />
    </Suspense>
  );
}

const CSS = `
.tp{position:relative;min-height:100vh;font-family:var(--font-body),system-ui,sans-serif;color:var(--color-ink)}
.tp a{text-decoration:none}
.tp-scene{position:fixed;inset:0;z-index:0;background:#DCE5EE;overflow:hidden}
.tp-scene .bg-skyline{width:100%;height:100%;display:block}
.tp-nav{position:fixed;top:12px;left:16px;right:16px;z-index:50;height:54px;padding:0 10px 0 24px;display:flex;align-items:center;justify-content:space-between;
  background:rgba(255,255,255,.55);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.6);border-radius:999px}
.tp-brand{font-family:var(--font-display),'Arial Narrow',sans-serif;font-weight:600;font-size:24px;color:var(--color-ink)}
.tp-nav-r{display:flex;align-items:center;gap:4px}
.tp-nav-r a{font-size:14px;font-weight:500;padding:8px 14px;color:#2F4558;border-radius:999px}
.tp-nav-r a:hover{background:rgba(255,255,255,.6)}
.tp-nav-r a.tp-btn{color:#fff;padding:9px 20px}
.tp-btn{display:inline-block;font-weight:600;font-size:15px;border-radius:999px;padding:12px 26px;border:0;cursor:pointer;font-family:inherit;color:#fff;white-space:nowrap}
.tp-rust{background:var(--color-primary)}.tp-rust:hover{background:var(--color-primary-dark)}
.tp-ink{background:var(--color-ink)}.tp-ink:hover{background:#1b4060}
.tp-btn:disabled{opacity:.6;cursor:not-allowed}
.tp a:focus-visible,.tp button:focus-visible,.tp input:focus-visible{outline:2px solid var(--color-accent-teal);outline-offset:2px}
.tp-main{position:relative;z-index:1;max-width:700px;margin:0 auto;padding:110px 20px 64px}
.tp-hero{margin-bottom:28px}
.tp-chip{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.72);backdrop-filter:blur(12px);
  font:500 11px var(--font-mono),monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--color-primary-dark);margin-bottom:18px}
.tp-chip span{width:7px;height:7px;border-radius:50%;background:var(--color-primary);box-shadow:0 0 0 3px rgba(192,101,74,.22)}
.tp-hero h1{font-family:var(--font-display),'Arial Narrow',sans-serif;font-weight:600;font-size:clamp(46px,9vw,80px);line-height:1;color:var(--color-ink);margin:0 0 18px}
.tp-hero p{display:inline-block;font-size:17px;line-height:1.6;color:var(--color-ink);margin:0 0 22px;padding:12px 20px;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);border-radius:22px}
.tp-form{display:flex;max-width:540px;padding:6px;background:rgba(255,255,255,.88);border-radius:999px;box-shadow:0 14px 36px rgba(16,40,60,.16)}
.tp-form input{flex:1;min-width:0;padding:10px 18px;font:14px var(--font-mono),monospace;letter-spacing:.02em;border:0;background:transparent;color:var(--color-ink)}
.tp-form input:focus-visible{outline:none}
.tp-error{background:rgba(247,224,219,.92);backdrop-filter:blur(10px);border:1px solid var(--color-error-border);border-radius:var(--radius-lg);padding:14px 20px;color:var(--color-error-text);font-size:14px;font-weight:500}
.tp-panel{background:rgba(255,255,255,.88);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.8);border-radius:var(--radius-xl);overflow:hidden;box-shadow:var(--shadow-lg)}
@media(max-width:560px){.tp-nav{left:10px;right:10px;padding-left:18px}.tp-nav-r a:not(.tp-btn){display:none}.tp-main{padding-top:100px}}
`;
