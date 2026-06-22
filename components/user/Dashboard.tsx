"use client";

import Link from "next/link";

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:          { label: "Pending",          color: "#B45309", bg: "#FEF3C7", dot: "#F59E0B" },
  CONFIRMED:        { label: "Confirmed",         color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  PICKED_UP:        { label: "Picked Up",         color: "#6D28D9", bg: "#EDE9FE", dot: "#8B5CF6" },
  IN_TRANSIT:       { label: "In Transit",        color: "#0369A1", bg: "#E0F2FE", dot: "#0EA5E9" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",  color: "#C2410C", bg: "#FFEDD5", dot: "#F97316" },
  DELIVERED:        { label: "Delivered",         color: "#15803D", bg: "#DCFCE7", dot: "#22C55E" },
  FAILED:           { label: "Failed",            color: "#B91C1C", bg: "#FEE2E2", dot: "#EF4444" },
  RETURNED:         { label: "Returned",          color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" },
  CANCELLED:        { label: "Cancelled",         color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" },
};

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] ?? STATUS_META["PENDING"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, color: m.color, background: m.bg }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: m.dot }} />
      {m.label}
    </span>
  );
}

function StatCard({ label, value, accent, icon }: { label: string; value: number; accent: string; icon: React.ReactNode }) {
  return (
    <div style={{ flex: 1, minWidth: 160, background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#667085", fontWeight: 600, letterSpacing: "0.03em" }}>{label}</div>
        <div style={{ color: accent, opacity: 0.7 }}>{icon}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent, letterSpacing: "-0.04em", lineHeight: 1 }}>{value}</div>
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
    <div style={{ padding: "36px 36px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#0C1421" }}>
            {greeting}, {firstName}.
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9CA3AF" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <Link href="/book" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: 13,
          textDecoration: "none", padding: "10px 18px", borderRadius: 9,
          letterSpacing: "-0.01em",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Book shipment
        </Link>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap" }}>
        <StatCard label="Total Shipments" value={stats.total} accent="#0C1421"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>}
        />
        <StatCard label="Active" value={stats.active} accent="#0369A1"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>}
        />
        <StatCard label="Delivered" value={stats.delivered} accent="#15803D"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>}
        />
        <StatCard label="Pending" value={stats.pending} accent="#B45309"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>}
        />
      </div>

      {/* Recent shipments */}
      <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #F2F4F7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0C1421" }}>Recent Shipments</div>
          <Link href="/shipments" style={{ fontSize: 12, fontWeight: 600, color: "#2563EB", textDecoration: "none" }}>View all</Link>
        </div>

        {shipments.length === 0 ? (
          <div style={{ padding: "56px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 6 }}>No shipments yet</div>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>Book your first shipment to get started.</div>
            <Link href="/book" style={{ background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none", padding: "10px 20px", borderRadius: 8 }}>
              Book a shipment
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #F2F4F7" }}>
                  {["Tracking #", "Route", "Service", "Status", "Date", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shipments.map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: i < shipments.length - 1 ? "1px solid #F9FAFB" : "none" }}>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "#2563EB", fontWeight: 700 }}>{s.trackingNumber}</span>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#101828" }}>{s.origin.city}, {s.origin.state}</span>
                      <span style={{ color: "#D1D5DB", margin: "0 6px" }}>&#8594;</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#101828" }}>{s.destination.city}, {s.destination.state}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", background: "#F3F4F6", padding: "3px 8px", borderRadius: 6 }}>{s.serviceType}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                      {fmtDate(s.createdAt)}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <Link href={`/shipments/${s.id}`} style={{ fontSize: 12, fontWeight: 600, color: "#2563EB", textDecoration: "none" }}>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {[
          { href: "/book",      label: "Book a Shipment",   desc: "Send a new package",            icon: "📦" },
          { href: "/track",     label: "Track a Package",   desc: "Enter a tracking number",        icon: "📍" },
          { href: "/invoices",  label: "View Invoices",     desc: "Download receipts",              icon: "🧾" },
        ].map((card) => (
          <Link key={card.href} href={card.href} style={{
            flex: 1, background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12,
            padding: "18px 20px", textDecoration: "none", display: "block",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#BFDBFE"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(37,99,235,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E4E7EC"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{ fontSize: 22, marginBottom: 10 }}>{card.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0C1421", marginBottom: 3 }}>{card.label}</div>
            <div style={{ fontSize: 12, color: "#9CA3AF" }}>{card.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
