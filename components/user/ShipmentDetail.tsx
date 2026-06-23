"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────

interface Address {
  id: string; fullName: string; phone: string;
  line1: string; line2: string | null;
  city: string; state: string; zip: string; country: string;
}

interface TrackingEvent {
  id: string; status: string; location: string | null;
  note: string | null; createdAt: string;
}

interface Shipment {
  id: string; trackingNumber: string; status: string; serviceType: string;
  weightKg: number; lengthCm: number | null; widthCm: number | null; heightCm: number | null;
  description: string | null; declaredValue: number | null;
  carrierName: string | null; carrierTrackingId: string | null;
  quotedPrice: number | null; finalPrice: number | null;
  notes: string | null; estimatedDelivery: string | null; deliveredAt: string | null;
  createdAt: string; updatedAt: string;
  origin: Address; destination: Address;
  trackingEvents: TrackingEvent[];
  parcels: { id: string; label: string | null; weightKg: number; lengthCm: number | null; widthCm: number | null; heightCm: number | null; contents: string | null }[];
  courier: { id: string; name: string; email: string; phone: string | null } | null;
  invoice: { id: string; amount: number; tax: number; total: number; status: string; dueDate: string | null; paidAt: string | null; createdAt: string } | null;
}

// ─── Helpers ─────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:          { label: "Pending",          color: "var(--status-pending-text)",   bg: "var(--status-pending-bg)",   dot: "var(--status-pending-dot)"   },
  CONFIRMED:        { label: "Confirmed",         color: "var(--status-confirmed-text)", bg: "var(--status-confirmed-bg)", dot: "var(--status-confirmed-dot)" },
  PICKED_UP:        { label: "Picked Up",         color: "var(--status-picked-text)",   bg: "var(--status-picked-bg)",   dot: "var(--status-picked-dot)"   },
  IN_TRANSIT:       { label: "In Transit",        color: "var(--status-transit-text)",  bg: "var(--status-transit-bg)",  dot: "var(--status-transit-dot)"  },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",  color: "var(--status-ofd-text)",      bg: "var(--status-ofd-bg)",      dot: "var(--status-ofd-dot)"      },
  DELIVERED:        { label: "Delivered",         color: "var(--status-delivered-text)",bg: "var(--status-delivered-bg)",dot: "var(--status-delivered-dot)" },
  FAILED:           { label: "Failed",            color: "var(--status-failed-text)",   bg: "var(--status-failed-bg)",   dot: "var(--status-failed-dot)"   },
  RETURNED:         { label: "Returned",          color: "var(--status-neutral-text)",  bg: "var(--status-neutral-bg)",  dot: "var(--status-neutral-dot)"  },
  CANCELLED:        { label: "Cancelled",         color: "var(--status-neutral-text)",  bg: "var(--status-neutral-bg)",  dot: "var(--status-neutral-dot)"  },
};

const SERVICE_META: Record<string, { label: string; color: string; bg: string }> = {
  STANDARD:  { label: "Standard",  color: "var(--service-standard-text)",  bg: "var(--service-standard-bg)"  },
  EXPRESS:   { label: "Express",   color: "var(--service-express-text)",   bg: "var(--service-express-bg)"   },
  OVERNIGHT: { label: "Overnight", color: "var(--service-overnight-text)", bg: "var(--service-overnight-bg)" },
  FREIGHT:   { label: "Freight",   color: "var(--service-freight-text)",   bg: "var(--service-freight-bg)"   },
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
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

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--color-border-light)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase" }}>{title}</div>
      {action}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid var(--color-border-light)" }}>
      <span style={{ fontSize: 12, color: "var(--color-muted)", fontWeight: 500, flexShrink: 0, marginRight: 12 }}>{label}</span>
      <span style={{ fontSize: 13, color: "var(--color-heading)", fontWeight: 600, textAlign: "right" }}>{value ?? "—"}</span>
    </div>
  );
}

// ─── Booked Banner ───────────────────────────────────

function BookedBanner({ trackingNumber }: { trackingNumber: string }) {
  const params = useSearchParams();
  if (!params.get("booked")) return null;
  return (
    <div style={{ background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-md)", padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 20 }}>🎉</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-success-text)" }}>Shipment booked successfully!</div>
        <div style={{ fontSize: 12, color: "var(--color-success-text)", opacity: 0.8, marginTop: 2 }}>
          Your tracking number is <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{trackingNumber}</span>.
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────

export default function ShipmentDetail({ shipment }: { shipment: Shipment }) {
  const svc = SERVICE_META[shipment.serviceType] ?? SERVICE_META["STANDARD"];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto", fontFamily: "var(--font-sans)" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/shipments" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--color-muted)", textDecoration: "none" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Shipments
          </Link>
          <span style={{ color: "var(--color-border)", fontSize: 16 }}>/</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-primary)", fontWeight: 700 }}>{shipment.trackingNumber}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge status={shipment.status} />
          <Link
            href={`/receipt/${shipment.id}`}
            target="_blank"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", fontSize: 12, fontWeight: 600, color: "var(--color-body)", textDecoration: "none" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6,9 6,2 18,2 18,9"/><path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print Receipt
          </Link>
        </div>
      </div>

      {/* Booked banner */}
      <Suspense fallback={null}>
        <BookedBanner trackingNumber={shipment.trackingNumber} />
      </Suspense>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Route card */}
          <Card>
            <CardHeader title="Route" />
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>From</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.02em" }}>{shipment.origin.city}</div>
                  <div style={{ fontSize: 13, color: "var(--color-muted)" }}>{shipment.origin.state}, {shipment.origin.country}</div>
                </div>

                <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 20 }}>✈</div>
                  <div style={{ width: "100%", height: 2, background: "var(--color-border-light)", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, var(--color-primary) ${shipment.status === "DELIVERED" ? "100%" : shipment.status === "IN_TRANSIT" ? "60%" : shipment.status === "OUT_FOR_DELIVERY" ? "85%" : shipment.status === "PICKED_UP" ? "40%" : shipment.status === "CONFIRMED" ? "20%" : "5%"}, var(--color-border-light) 0%)` }} />
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-subtle)", fontWeight: 500 }}>
                    {shipment.estimatedDelivery ? `Est. ${fmtDate(shipment.estimatedDelivery)}` : "No estimate yet"}
                  </div>
                </div>

                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>To</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-ink)", letterSpacing: "-0.02em" }}>{shipment.destination.city}</div>
                  <div style={{ fontSize: 13, color: "var(--color-muted)" }}>{shipment.destination.state}, {shipment.destination.country}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Tracking timeline */}
          <Card>
            <CardHeader title="Tracking History" />
            <div style={{ padding: "20px" }}>
              {shipment.trackingEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-subtle)", fontSize: 13 }}>No tracking events yet.</div>
              ) : (
                [...shipment.trackingEvents].reverse().map((evt, i, arr) => {
                  const m      = STATUS_META[evt.status] ?? STATUS_META["PENDING"];
                  const latest = i === 0;
                  return (
                    <div key={evt.id} style={{ display: "flex", gap: 14 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 18, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: latest ? m.dot : "var(--color-border)", marginTop: 3, flexShrink: 0 }} />
                        {i < arr.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: "var(--color-border-light)" }} />}
                      </div>
                      <div style={{ paddingBottom: 18, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: latest ? m.color : "var(--color-heading)" }}>{m.label}</div>
                        {evt.location && <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{evt.location}</div>}
                        {evt.note     && <div style={{ fontSize: 12, color: "var(--color-subtle)", marginTop: 2 }}>{evt.note}</div>}
                        <div style={{ fontSize: 11, color: "var(--color-placeholder)", marginTop: 4 }}>{fmtDate(evt.createdAt)} · {fmtTime(evt.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Package details */}
          <Card>
            <CardHeader title="Package Details" />
            <div style={{ padding: "4px 20px 12px" }}>
              <InfoRow label="Service"        value={<span style={{ color: svc.color, background: svc.bg, padding: "2px 8px", borderRadius: "var(--radius-sm)", fontSize: 11, fontWeight: 700 }}>{svc.label}</span>} />
              <InfoRow label="Weight"         value={`${shipment.weightKg} kg`} />
              <InfoRow label="Dimensions"     value={shipment.lengthCm ? `${shipment.lengthCm} × ${shipment.widthCm} × ${shipment.heightCm} cm` : null} />
              <InfoRow label="Contents"       value={shipment.description} />
              <InfoRow label="Declared Value" value={shipment.declaredValue ? `$${shipment.declaredValue.toLocaleString()}` : null} />
              {shipment.carrierName && <InfoRow label="Carrier" value={shipment.carrierName} />}
              {shipment.carrierTrackingId && <InfoRow label="Carrier Tracking" value={<span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{shipment.carrierTrackingId}</span>} />}
              {shipment.notes && <InfoRow label="Notes" value={shipment.notes} />}
            </div>
          </Card>

          {/* Addresses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { title: "Origin Address",      addr: shipment.origin },
              { title: "Destination Address", addr: shipment.destination },
            ].map(({ title, addr }) => (
              <Card key={title}>
                <CardHeader title={title} />
                <div style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)", marginBottom: 6 }}>{addr.fullName}</div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.7 }}>
                    {addr.phone}<br />
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                    {addr.city}, {addr.state} {addr.zip}<br />
                    {addr.country}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Shipment info */}
          <Card>
            <CardHeader title="Shipment Info" />
            <div style={{ padding: "4px 20px 12px" }}>
              <InfoRow label="Created"          value={fmtDate(shipment.createdAt)} />
              <InfoRow label="Est. Delivery"    value={shipment.estimatedDelivery ? fmtDate(shipment.estimatedDelivery) : null} />
              {shipment.deliveredAt && <InfoRow label="Delivered At" value={fmtDate(shipment.deliveredAt)} />}
            </div>
          </Card>

          {/* Courier */}
          <Card>
            <CardHeader title="Courier" />
            <div style={{ padding: "16px 20px" }}>
              {shipment.courier ? (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)", marginBottom: 6 }}>{shipment.courier.name}</div>
                  <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{shipment.courier.email}</div>
                  {shipment.courier.phone && <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>{shipment.courier.phone}</div>}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "var(--color-subtle)", fontStyle: "italic" }}>Not yet assigned</div>
              )}
            </div>
          </Card>

          {/* Invoice */}
          {shipment.invoice && (
            <Card>
              <CardHeader title="Invoice" />
              <div style={{ padding: "4px 20px 12px" }}>
                <InfoRow label="Subtotal" value={`$${shipment.invoice.amount.toFixed(2)}`} />
                <InfoRow label="Tax"      value={`$${shipment.invoice.tax.toFixed(2)}`} />
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "2px solid var(--color-border)" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>Total</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "var(--color-primary)" }}>${shipment.invoice.total.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-xl)",
                    color: shipment.invoice.status === "PAID" ? "var(--status-delivered-text)" : "var(--status-pending-text)",
                    background: shipment.invoice.status === "PAID" ? "var(--status-delivered-bg)" : "var(--status-pending-bg)",
                  }}>
                    {shipment.invoice.status}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Parcels */}
          {shipment.parcels.length > 0 && (
            <Card>
              <CardHeader title={`Parcels (${shipment.parcels.length})`} />
              <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {shipment.parcels.map((p, i) => (
                  <div key={p.id} style={{ background: "var(--color-surface-alt)", borderRadius: "var(--radius-sm)", padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--color-heading)", marginBottom: 4 }}>{p.label ?? `Parcel ${i + 1}`}</div>
                    <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{p.weightKg} kg{p.lengthCm ? ` · ${p.lengthCm}×${p.widthCm}×${p.heightCm} cm` : ""}</div>
                    {p.contents && <div style={{ fontSize: 11, color: "var(--color-subtle)", marginTop: 2 }}>{p.contents}</div>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader title="Actions" />
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href={`/receipt/${shipment.id}`}
                target="_blank"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: "var(--radius-sm)", background: "var(--color-primary)", color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6,9 6,2 18,2 18,9"/><path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
                  <rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print Receipt
              </Link>
              <Link
                href={`/track?q=${shipment.trackingNumber}`}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-body)", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>
                </svg>
                Track publicly
              </Link>
              {["PENDING", "CONFIRMED"].includes(shipment.status) && (
                <button
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-error-border)", background: "var(--color-error-bg)", color: "var(--color-error-text)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                  onClick={() => { if (confirm("Cancel this shipment?")) { /* wire up cancel API */ }}}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  Cancel Shipment
                </button>
              )}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
