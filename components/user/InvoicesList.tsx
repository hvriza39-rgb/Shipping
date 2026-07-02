"use client";

import { useState } from "react";
import Link from "next/link";

interface Invoice {
  id: string; amount: number; tax: number; total: number;
  status: string; dueDate: string | null; paidAt: string | null; createdAt: string;
  shipment: {
    id: string; trackingNumber: string; serviceType: string;
    origin:      { city: string; state: string };
    destination: { city: string; state: string };
  };
}

const INVOICE_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:    { label: "Draft",    color: "var(--color-muted)",            bg: "var(--color-surface-alt)"     },
  SENT:     { label: "Sent",     color: "var(--status-confirmed-text)",  bg: "var(--status-confirmed-bg)"   },
  PAID:     { label: "Paid",     color: "var(--status-delivered-text)",  bg: "var(--status-delivered-bg)"   },
  OVERDUE:  { label: "Overdue",  color: "var(--status-failed-text)",     bg: "var(--status-failed-bg)"      },
  VOID:     { label: "Void",     color: "var(--status-neutral-text)",    bg: "var(--status-neutral-bg)"     },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function InvoiceBadge({ status }: { status: string }) {
  const m = INVOICE_STATUS[status] ?? INVOICE_STATUS["DRAFT"];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: m.color, background: m.bg, padding: "3px 10px", borderRadius: "var(--radius-xl)", whiteSpace: "nowrap" }}>
      {m.label}
    </span>
  );
}

// Small icon-only receipt/download link, reused in both the table and mobile card layouts
function ReceiptLink({ shipmentId }: { shipmentId: string }) {
  return (
    <Link
      href={`/receipt/${shipmentId}`}
      target="_blank"
      title="View / download receipt"
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600,
        color: "var(--color-primary)", textDecoration: "none", whiteSpace: "nowrap",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
      Receipt
    </Link>
  );
}

export default function InvoicesList({ invoices }: { invoices: Invoice[] }) {
  const [filter, setFilter] = useState("ALL");

  const filtered = invoices.filter((inv) => filter === "ALL" || inv.status === filter);

  const totalPaid    = invoices.filter((i) => i.status === "PAID").reduce((a, i) => a + i.total, 0);
  const totalPending = invoices.filter((i) => ["SENT", "DRAFT"].includes(i.status)).reduce((a, i) => a + i.total, 0);
  const totalOverdue = invoices.filter((i) => i.status === "OVERDUE").reduce((a, i) => a + i.total, 0);

  return (
    <div className="invoices-page" style={{ padding: "32px 36px", maxWidth: 1000, margin: "0 auto", fontFamily: "var(--font-sans)" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--color-ink)" }}>Invoices</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-subtle)" }}>{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Summary cards */}
      <div className="invoice-summary-grid" style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        {[
          { label: "Total Paid",    value: totalPaid,    color: "var(--status-delivered-text)", bg: "var(--status-delivered-bg)" },
          { label: "Pending",       value: totalPending, color: "var(--status-pending-text)",   bg: "var(--status-pending-bg)"   },
          { label: "Overdue",       value: totalOverdue, color: "var(--status-failed-text)",    bg: "var(--status-failed-bg)"    },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ flex: 1, minWidth: 160, background: bg, borderRadius: "var(--radius-lg)", padding: "16px 20px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color, letterSpacing: "-0.04em" }}>${value.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {["ALL", "DRAFT", "SENT", "PAID", "OVERDUE", "VOID"].map((f) => {
          const active = filter === f;
          const m = INVOICE_STATUS[f];
          const count = f === "ALL" ? invoices.length : invoices.filter((i) => i.status === f).length;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "5px 12px", borderRadius: "var(--radius-xl)", fontSize: 12, fontWeight: 600,
              cursor: "pointer",
              border: `1.5px solid ${active ? (m?.color ?? "var(--color-primary)") : "var(--color-border)"}`,
              background: active ? (m?.bg ?? "var(--color-primary-light)") : "var(--color-surface)",
              color: active ? (m?.color ?? "var(--color-primary)") : "var(--color-muted)",
              whiteSpace: "nowrap",
            }}>
              {f === "ALL" ? "All" : INVOICE_STATUS[f]?.label ?? f}
              <span style={{ marginLeft: 5, opacity: 0.65 }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "64px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🧾</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-heading)", marginBottom: 6 }}>No invoices yet</div>
          <div style={{ fontSize: 13, color: "var(--color-subtle)" }}>Invoices are generated when a shipment is confirmed.</div>
        </div>
      ) : (
        <>
          {/* Table — desktop only */}
          <div className="invoices-table" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                    {["Invoice", "Shipment", "Route", "Amount", "Status", "Date", ""].map((h, i) => (
                      <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, i) => (
                    <tr key={inv.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-primary)", fontWeight: 700 }}>#{inv.id.slice(0, 8).toUpperCase()}</div>
                        {inv.dueDate && <div style={{ fontSize: 11, color: "var(--color-subtle)", marginTop: 2 }}>Due {fmtDate(inv.dueDate)}</div>}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-muted)", fontWeight: 600 }}>{inv.shipment.trackingNumber}</div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--color-heading)", whiteSpace: "nowrap" }}>
                        {inv.shipment.origin.city}, {inv.shipment.origin.state}
                        <span style={{ color: "var(--color-border)", margin: "0 6px" }}>&#8594;</span>
                        {inv.shipment.destination.city}, {inv.shipment.destination.state}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--color-heading)" }}>${inv.total.toFixed(2)}</div>
                        {inv.tax > 0 && <div style={{ fontSize: 11, color: "var(--color-subtle)", marginTop: 1 }}>incl. ${inv.tax.toFixed(2)} tax</div>}
                      </td>
                      <td style={{ padding: "14px 16px" }}><InvoiceBadge status={inv.status} /></td>
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--color-subtle)", whiteSpace: "nowrap" }}>
                        {inv.paidAt ? `Paid ${fmtDate(inv.paidAt)}` : fmtDate(inv.createdAt)}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <ReceiptLink shipmentId={inv.shipment.id} />
                          <Link href={`/shipments/${inv.shipment.id}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted)", textDecoration: "none", whiteSpace: "nowrap" }}>View</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cards — mobile only */}
          <div className="invoices-cards" style={{ display: "none", flexDirection: "column", gap: 10 }}>
            {filtered.map((inv) => (
              <div key={inv.id} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-primary)", fontWeight: 700 }}>
                    #{inv.id.slice(0, 8).toUpperCase()}
                  </span>
                  <InvoiceBadge status={inv.status} />
                </div>

                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-muted)", fontWeight: 600, marginBottom: 6 }}>
                  {inv.shipment.trackingNumber}
                </div>

                <div style={{ fontSize: 13, color: "var(--color-heading)", marginBottom: 8 }}>
                  {inv.shipment.origin.city}, {inv.shipment.origin.state}
                  <span style={{ color: "var(--color-border)", margin: "0 8px" }}>&#8594;</span>
                  {inv.shipment.destination.city}, {inv.shipment.destination.state}
                </div>

                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "var(--color-heading)" }}>${inv.total.toFixed(2)}</div>
                    {inv.tax > 0 && <div style={{ fontSize: 11, color: "var(--color-subtle)" }}>incl. ${inv.tax.toFixed(2)} tax</div>}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-subtle)", textAlign: "right" }}>
                    {inv.dueDate && <div>Due {fmtDate(inv.dueDate)}</div>}
                    <div>{inv.paidAt ? `Paid ${fmtDate(inv.paidAt)}` : fmtDate(inv.createdAt)}</div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--color-border-light)" }}>
                  <ReceiptLink shipmentId={inv.shipment.id} />
                  <Link href={`/shipments/${inv.shipment.id}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--color-muted)", textDecoration: "none" }}>View shipment</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style jsx>{`
        @media (max-width: 700px) {
          .invoices-page { padding: 20px 16px !important; }
          .invoices-table { display: none; }
          .invoices-cards { display: flex !important; }
          .invoice-summary-grid > div { flex: 1 1 calc(50% - 6px); min-width: calc(50% - 6px); }
        }
      `}</style>
    </div>
  );
}
