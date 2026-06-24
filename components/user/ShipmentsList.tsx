"use client";

import { useState } from "react";
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

const SERVICE_META: Record<string, { label: string; color: string; bg: string }> = {
  STANDARD:  { label: "Standard",  color: "var(--service-standard-text)",  bg: "var(--service-standard-bg)"  },
  EXPRESS:   { label: "Express",   color: "var(--service-express-text)",   bg: "var(--service-express-bg)"   },
  OVERNIGHT: { label: "Overnight", color: "var(--service-overnight-text)", bg: "var(--service-overnight-bg)" },
  FREIGHT:   { label: "Freight",   color: "var(--service-freight-text)",   bg: "var(--service-freight-bg)"   },
};

const FILTERS = ["ALL", "PENDING", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "CANCELLED"];

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META["PENDING"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: "var(--radius-xl)", fontSize: 11, fontWeight: 600, color: m.color, background: m.bg }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot }} />
      {m.label}
    </span>
  );
}

interface Shipment {
  id: string; trackingNumber: string; status: string; serviceType: string;
  weightKg: number; createdAt: string; estimatedDelivery: string | null; deliveredAt: string | null;
  origin:      { city: string; state: string };
  destination: { city: string; state: string };
  invoice:     { total: number; status: string } | null;
  _count:      { trackingEvents: number };
}

export default function ShipmentsList({ shipments }: { shipments: Shipment[] }) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = shipments.filter((s) => {
    const okStatus = filter === "ALL" || s.status === filter ||
      (filter === "IN_TRANSIT" && ["CONFIRMED", "PICKED_UP", "IN_TRANSIT"].includes(s.status));
    const q = search.toLowerCase();
    const okSearch = !q
      || s.trackingNumber.toLowerCase().includes(q)
      || s.origin.city.toLowerCase().includes(q)
      || s.destination.city.toLowerCase().includes(q);
    return okStatus && okSearch;
  });

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-ink)" }}>My Shipments</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-subtle)" }}>{shipments.length} shipment{shipments.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link href="/book" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: "var(--radius-md)", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Book Shipment
        </Link>
      </div>

      {/* Filters + search */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const active = filter === f;
            const count  = f === "ALL" ? shipments.length
              : f === "IN_TRANSIT" ? shipments.filter((s) => ["CONFIRMED", "PICKED_UP", "IN_TRANSIT"].includes(s.status)).length
              : shipments.filter((s) => s.status === f).length;
            const m = f !== "ALL" ? STATUS_META[f] : null;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: "5px 12px", borderRadius: "var(--radius-xl)", fontSize: 12, fontWeight: 600,
                cursor: "pointer", border: `1.5px solid ${active ? (m?.dot ?? "var(--color-primary)") : "var(--color-border)"}`,
                background: active ? (m?.bg ?? "var(--color-primary-light)") : "var(--color-surface)",
                color: active ? (m?.color ?? "var(--color-primary)") : "var(--color-muted)",
              }}>
                {f === "ALL" ? "All" : f === "IN_TRANSIT" ? "In Transit" : STATUS_META[f]?.label ?? f}
                <span style={{ marginLeft: 5, opacity: 0.65 }}>{count}</span>
              </button>
            );
          })}
        </div>
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shipments…"
            style={{ padding: "7px 12px 7px 30px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", fontSize: 13, width: 200, outline: "none", background: "var(--color-surface)", color: "var(--color-heading)", fontFamily: "var(--font-sans)" }}
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-heading)", marginBottom: 6 }}>
            {search || filter !== "ALL" ? "No shipments match your filters" : "No shipments yet"}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-subtle)", marginBottom: 20 }}>
            {search || filter !== "ALL" ? "Try adjusting your search or filter." : "Book your first shipment to get started."}
          </div>
          {!search && filter === "ALL" && (
            <Link href="/book" style={{ background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", padding: "10px 20px", borderRadius: "var(--radius-sm)" }}>
              Book a shipment
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((s) => {
            const svc = SERVICE_META[s.serviceType] ?? SERVICE_META["STANDARD"];
            return (
              <Link key={s.id} href={`/shipments/${s.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, transition: "border-color 0.15s, box-shadow 0.15s", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--color-primary-border)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--color-border)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  {/* Status dot */}
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: STATUS_META[s.status]?.dot ?? "var(--color-subtle)", flexShrink: 0 }} />

                  {/* Tracking + date */}
                  <div style={{ minWidth: 180, flexShrink: 0 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-primary)", fontWeight: 700, marginBottom: 2 }}>{s.trackingNumber}</div>
                    <div style={{ fontSize: 11, color: "var(--color-subtle)" }}>{fmtDate(s.createdAt)}</div>
                  </div>

                  {/* Route */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>
                      {s.origin.city}, {s.origin.state}
                      <span style={{ color: "var(--color-border)", margin: "0 8px" }}>&#8594;</span>
                      {s.destination.city}, {s.destination.state}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--color-subtle)", marginTop: 2 }}>
                      {s.weightKg} kg
                      {s.estimatedDelivery && ` · Est. ${fmtDate(s.estimatedDelivery)}`}
                      {s.deliveredAt && ` · Delivered ${fmtDate(s.deliveredAt)}`}
                    </div>
                  </div>

                  {/* Service badge */}
                  <span style={{ fontSize: 11, fontWeight: 700, color: svc.color, background: svc.bg, padding: "3px 8px", borderRadius: "var(--radius-sm)", flexShrink: 0 }}>
                    {svc.label}
                  </span>

                  {/* Invoice */}
                  {s.invoice && (
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--color-heading)" }}>${s.invoice.total.toFixed(2)}</div>
                      <div style={{ fontSize: 10, color: s.invoice.status === "PAID" ? "var(--status-delivered-text)" : "var(--status-pending-text)", fontWeight: 600, marginTop: 1 }}>{s.invoice.status}</div>
                    </div>
                  )}

                  {/* Status */}
                  <div style={{ flexShrink: 0 }}>
                    <StatusBadge status={s.status} />
                  </div>

                  {/* Chevron */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-subtle)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <polyline points="9,18 15,12 9,6"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
    }
