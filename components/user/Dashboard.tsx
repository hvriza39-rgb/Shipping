"use client";

import Link from "next/link";

const DISPLAY = "var(--font-display), 'Arial Narrow', sans-serif";
const BODY    = "var(--font-body), system-ui, sans-serif";
const MONO    = "var(--font-mono), 'Courier New', monospace";

const INK          = "#1C2B3A";
const INK_SOFT     = "#4B5A68";
const PAPER        = "#F2ECDD";
const PAPER_LIGHT  = "#FBF8EF";
const PAPER_LINE   = "#D8CBAA";
const STAMP        = "#B23A2E";
const ROUTE        = "#2C6E78";
const LEDGER_GREEN = "#3F7D5C";
const KRAFT        = "#9C7A3C";

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING:          { label: "Pending",          color: KRAFT },
  CONFIRMED:        { label: "Confirmed",         color: INK_SOFT },
  PICKED_UP:        { label: "Picked Up",         color: "#6B5E8C" },
  IN_TRANSIT:       { label: "In Transit",        color: ROUTE },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",  color: "#B2632A" },
  DELIVERED:        { label: "Delivered",         color: LEDGER_GREEN },
  FAILED:           { label: "Failed",            color: STAMP },
  RETURNED:         { label: "Returned",          color: "#6B6358" },
  CANCELLED:        { label: "Cancelled",         color: "#8A8478" },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META["PENDING"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
      borderRadius: 3, fontFamily: MONO, fontSize: 10.5, fontWeight: 700,
      letterSpacing: "0.04em", textTransform: "uppercase",
      color: m.color, border: `1.5px solid ${m.color}`, background: `${m.color}0F`,
    }}>
      {m.label}
    </span>
  );
}

function StatCard({ index, label, value, accent }: { index: string; label: string; value: number; accent: string }) {
  return (
    <div style={{ flex: 1, minWidth: 160, background: PAPER_LIGHT, border: `1.5px solid ${PAPER_LINE}`, borderRadius: 4, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontFamily: MONO, fontSize: 10, color: PAPER_LINE, fontWeight: 700 }}>{index}</div>
      </div>
      <div style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 700, color: accent, letterSpacing: "0.005em", lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
    <div style={{ padding: "36px 36px", maxWidth: 1100, margin: "0 auto", background: PAPER, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 30, flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ROUTE, marginBottom: 8 }}>
            Dashboard
          </div>
          <h1 style={{ margin: 0, fontFamily: DISPLAY, fontSize: 26, fontWeight: 700, letterSpacing: "0.005em", color: INK }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ margin: "6px 0 0", fontFamily: MONO, fontSize: 12, color: INK_SOFT }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/book" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: INK, color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: BODY,
          textDecoration: "none", padding: "11px 18px", borderRadius: 3,
          letterSpacing: "0.01em",
        }}>
          <span style={{ fontFamily: MONO, fontWeight: 700 }}>+</span>
          Book shipment
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard index="01" label="Total Shipments" value={stats.total} accent={INK} />
        <StatCard index="02" label="Active" value={stats.active} accent={ROUTE} />
        <StatCard index="03" label="Delivered" value={stats.delivered} accent={LEDGER_GREEN} />
        <StatCard index="04" label="Pending" value={stats.pending} accent={KRAFT} />
      </div>

      {/* Recent shipments */}
      <div style={{ background: "#fff", border: `1.5px solid ${PAPER_LINE}`, borderRadius: 4, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px dashed ${PAPER_LINE}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 700, color: INK, letterSpacing: "0.005em", textTransform: "uppercase" }}>Recent Shipments</div>
          <Link href="/shipments" style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: ROUTE, textDecoration: "none", textTransform: "uppercase" }}>View all &rarr;</Link>
        </div>

        {shipments.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={INK_SOFT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 14 }}>
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
            <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: INK, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.005em" }}>No shipments yet</div>
            <div style={{ fontFamily: BODY, fontSize: 13, color: INK_SOFT, marginBottom: 22 }}>Once you book a shipment, it&apos;ll show up here as a line item.</div>
            <Link href="/book" style={{ background: STAMP, color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: BODY, textDecoration: "none", padding: "10px 20px", borderRadius: 3 }}>
              Book a shipment
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px dashed ${PAPER_LINE}` }}>
                  {["Tracking #", "Route", "Service", "Status", "Date", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontFamily: MONO, fontSize: 10, fontWeight: 700, color: INK_SOFT, letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < shipments.length - 1 ? `1px dashed ${PAPER_LINE}` : "none" }}>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontFamily: MONO, fontSize: 11, color: ROUTE, fontWeight: 700 }}>{s.trackingNumber}</span>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: INK }}>{s.origin.city}, {s.origin.state}</span>
                      <span style={{ color: PAPER_LINE, margin: "0 6px" }}>&#8594;</span>
                      <span style={{ fontFamily: BODY, fontSize: 13, fontWeight: 500, color: INK }}>{s.destination.city}, {s.destination.state}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: INK_SOFT, border: `1.5px solid ${PAPER_LINE}`, padding: "3px 8px", borderRadius: 3 }}>{s.serviceType}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ padding: "13px 16px", fontFamily: MONO, fontSize: 11.5, color: INK_SOFT, whiteSpace: "nowrap" }}>
                      {fmtDate(s.createdAt)}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <Link href={`/shipments/${s.id}`} style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: ROUTE, textDecoration: "none", textTransform: "uppercase" }}>View &rarr;</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        {[
          { href: "/book",      code: "01", label: "Book a Shipment",   desc: "Send a new package" },
          { href: "/track",     code: "02", label: "Track a Package",   desc: "Enter a tracking number" },
          { href: "/invoices",  code: "03", label: "View Invoices",     desc: "Download receipts" },
        ].map((card) => (
          <Link key={card.href} href={card.href} style={{
            flex: 1, minWidth: 200, background: "#fff", border: `1.5px solid ${PAPER_LINE}`, borderRadius: 4,
            padding: "16px 18px", textDecoration: "none", display: "block",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = INK; e.currentTarget.style.boxShadow = "0 4px 16px rgba(28,43,58,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = PAPER_LINE; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{
              width: 26, height: 26, border: `1.5px solid ${INK}`, borderRadius: 3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: MONO, fontSize: 11, fontWeight: 700, color: INK, marginBottom: 12,
            }}>
              {card.code}
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 14, fontWeight: 700, color: INK, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.005em" }}>{card.label}</div>
            <div style={{ fontFamily: BODY, fontSize: 12, color: INK_SOFT }}>{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
