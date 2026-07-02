"use client";

import Link from "next/link";

/**
 * Rebuilt to share the exact design system used on the tracking page:
 * --color-* / --font-* CSS variables, var(--radius-*) corners, the same
 * dotted StatusBadge, dashed-vs-solid divider logic, and var(--shadow-lg)
 * surfaces. No more standalone hex palette or mono-everywhere labeling.
 */

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

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META["PENDING"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px",
      borderRadius: "var(--radius-xl)", fontSize: 12, fontWeight: 600,
      color: m.color, background: m.bg, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot }} />
      {m.label}
    </span>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Stat cards are grouped in one bordered strip with internal dividers
 * (matching the "package info strip" pattern from the tracking page)
 * instead of four separate boxes each carrying their own border + a
 * meaningless 01/02/03/04 index — this isn't a sequence, so numbering
 * it implied an order that wasn't real.
 */
function StatStrip({ stats }: { stats: { total: number; active: number; delivered: number; pending: number } }) {
  const items = [
    { label: "Total shipments", value: stats.total,     color: "var(--color-heading)" },
    { label: "Active",          value: stats.active,    color: "var(--color-primary)" },
    { label: "Delivered",       value: stats.delivered, color: "var(--status-delivered-dot)" },
    { label: "Pending",         value: stats.pending,   color: "var(--status-pending-dot)" },
  ];
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--color-surface)",
      boxShadow: "var(--shadow-lg)", marginBottom: 28,
    }}>
      {items.map((it, i) => (
        <div key={it.label} style={{
          flex: "1 1 160px", padding: "18px 22px",
          borderRight: i < items.length - 1 ? "1px solid var(--color-border)" : "none",
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 10 }}>
            {it.label}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: it.color, letterSpacing: "-0.02em", lineHeight: 1 }}>
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  user: { name: string };
  shipments: {
    id: string; trackingNumber: string; status: string; serviceType: string; createdAt: string;
    origin: { city: string; state: string };
    destination: { city: string; state: string };
  }[];
  stats: { total: number; delivered: number; active: number; pending: number };
}

export default function Dashboard({ user, shipments, stats }: Props) {
  const firstName = user.name.split(" ")[0];
  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-bg)" }}>

      {/* Nav — identical to tracking page so the two feel like one product */}
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
          <Link href="/track" className="nav-link" style={{ fontSize: 13, fontWeight: 500, color: "var(--color-nav-text)", textDecoration: "none", padding: "6px 12px" }}>Track a package</Link>
          <Link href="/account" className="nav-link" style={{ fontSize: 13, fontWeight: 500, color: "var(--color-nav-text)", textDecoration: "none", padding: "6px 12px" }}>Account</Link>
        </div>
      </nav>

      <div style={{ padding: "40px 32px 64px", maxWidth: 1000, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em", color: "var(--color-heading)" }}>
              {greeting}, {firstName}.
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--color-muted)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <Link href="/book" className="btn-p" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: 13,
            textDecoration: "none", padding: "11px 20px", borderRadius: "var(--radius-md)",
          }}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
            Book shipment
          </Link>
        </div>

        {/* Stats */}
        <StatStrip stats={stats} />

        {/* Recent shipments */}
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-lg)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--color-heading)", letterSpacing: "-0.01em" }}>
              Recent shipments
            </div>
            <Link href="/shipments" style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", textDecoration: "none" }}>
              View all &rarr;
            </Link>
          </div>

          {shipments.length === 0 ? (
            <div style={{ padding: "56px 20px", textAlign: "center" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 14 }}>
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
                <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              </svg>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--color-heading)", marginBottom: 7 }}>
                No shipments yet
              </div>
              <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 22 }}>
                Once you book a shipment, it&apos;ll show up here.
              </div>
              <Link href="/book" className="btn-p" style={{ background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", padding: "10px 20px", borderRadius: "var(--radius-md)" }}>
                Book a shipment
              </Link>
            </div>
          ) : (
            <div>
              {/* Card-row layout instead of a wide table — nothing gets clipped
                  on narrow viewports, and route/status/date stack cleanly. */}
              {shipments.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/shipments/${s.id}`}
                  className="shipment-row"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                    padding: "16px 22px", textDecoration: "none",
                    borderBottom: i < shipments.length - 1 ? "1px solid var(--color-border-light)" : "none",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--color-primary)", marginBottom: 4 }}>
                      {s.trackingNumber}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-heading)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {s.origin.city}, {s.origin.state}
                      <span style={{ color: "var(--color-subtle)", margin: "0 8px" }}>&rarr;</span>
                      {s.destination.city}, {s.destination.state}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-subtle)", display: "none" }} className="shipment-service">
                      {s.serviceType}
                    </span>
                    <StatusBadge status={s.status} />
                    <span style={{ fontSize: 12, color: "var(--color-subtle)", minWidth: 52, textAlign: "right" }}>
                      {fmtDate(s.createdAt)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
          {[
            { href: "/book",     label: "Book a shipment", desc: "Send a new package",       icon: "M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3M9 11h14v10H9zM12 21a1 1 0 1 0 2 0M20 21a1 1 0 1 0 2 0" },
            { href: "/track",    label: "Track a package", desc: "Enter a tracking number",  icon: "M11 4a7 7 0 1 0 4.9 12.1L20 20" },
            { href: "/invoices", label: "View invoices",   desc: "Download receipts",        icon: "M6 2h9l5 5v15H6zM15 2v5h5M9 13h6M9 17h6" },
          ].map((card) => (
            <Link key={card.href} href={card.href} className="quick-action-card" style={{
              flex: "1 1 220px", background: "var(--color-surface)", border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)", padding: "18px 20px", textDecoration: "none", display: "block",
              transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "var(--color-primary-bg, rgba(255,106,44,0.1))",
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--color-heading)", marginBottom: 3 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{card.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .shipment-row:hover { background: var(--color-surface-alt); }
        .quick-action-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-lg); transform: translateY(-1px); }
        @media (min-width: 640px) {
          .shipment-service { display: inline-block !important; }
        }
      `}</style>
    </div>
  );
}
