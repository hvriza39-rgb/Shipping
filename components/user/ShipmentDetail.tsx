"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────

interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface TrackingEvent {
  id: string;
  status: string;
  location: string | null;
  note: string | null;
  createdAt: string;
}

interface Invoice {
  id: string;
  amount: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface Parcel {
  id: string;
  label: string | null;
  weightKg: number;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  contents: string | null;
}

interface Courier {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  status: string;
  serviceType: string;
  weightKg: number;
  lengthCm: number | null;
  widthCm: number | null;
  heightCm: number | null;
  description: string | null;
  declaredValue: number | null;
  carrierName: string | null;
  carrierTrackingId: string | null;
  quotedPrice: number | null;
  finalPrice: number | null;
  notes: string | null;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
  origin: Address;
  destination: Address;
  trackingEvents: TrackingEvent[];
  parcels: Parcel[];
  courier: Courier | null;
  invoice: Invoice | null;
}

// ─── Helpers ──────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:          { label: "Pending",          color: "#B45309", bg: "#FEF3C7", dot: "#F59E0B" },
  CONFIRMED:        { label: "Confirmed",        color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  PICKED_UP:        { label: "Picked Up",        color: "#6D28D9", bg: "#EDE9FE", dot: "#8B5CF6" },
  IN_TRANSIT:       { label: "In Transit",       color: "#0369A1", bg: "#E0F2FE", dot: "#0EA5E9" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "#C2410C", bg: "#FFEDD5", dot: "#F97316" },
  DELIVERED:        { label: "Delivered",        color: "#15803D", bg: "#DCFCE7", dot: "#22C55E" },
  FAILED:           { label: "Failed",           color: "#B91C1C", bg: "#FEE2E2", dot: "#EF4444" },
  RETURNED:         { label: "Returned",         color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" },
  CANCELLED:        { label: "Cancelled",        color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" },
};

const SERVICE_META: Record<string, { label: string; color: string; bg: string }> = {
  STANDARD:  { label: "Standard",  color: "#374151", bg: "#F9FAFB" },
  EXPRESS:   { label: "Express",   color: "#1D4ED8", bg: "#DBEAFE" },
  OVERNIGHT: { label: "Overnight", color: "#7C3AED", bg: "#EDE9FE" },
  FREIGHT:   { label: "Freight",   color: "#B45309", bg: "#FEF3C7" },
};

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META["PENDING"];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: m.color, background: m.bg, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

// ─── Booked Banner ────────────────────────────────────

function BookedBanner({ trackingNumber }: { trackingNumber: string }) {
  const params = useSearchParams();
  if (!params.get("booked")) return null;
  return (
    <div style={{ background: "#DCFCE7", border: "1px solid #BBF7D0", borderRadius: 8, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontSize: 20 }}>🎉</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#15803D" }}>Shipment booked successfully!</div>
        <div style={{ fontSize: 12, color: "#15803D", opacity: 0.8, marginTop: 2 }}>
          Your tracking number is <span style={{ fontFamily: "monospace", fontWeight: 700 }}>{trackingNumber}</span>.
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────

export default function ShipmentDetail({ shipment }: { shipment: Shipment }) {
  const svc = SERVICE_META[shipment.serviceType] || SERVICE_META["STANDARD"];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0, flexWrap: "wrap" }}>
          <Link href="/shipments" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "#9CA3AF", textDecoration: "none", flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
            Shipments
          </Link>
          <span style={{ color: "#E4E7EC", fontSize: 16, flexShrink: 0 }}>/</span>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: "#2563EB", fontWeight: 700, overflowWrap: "anywhere" }}>{shipment.trackingNumber}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <StatusBadge status={shipment.status} />
          <Link
            href={`/receipt/${shipment.id}`}
            target="_blank"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "1.5px solid #E4E7EC", background: "#fff", fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none", whiteSpace: "nowrap" }}
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

      {/* Main content grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20, minWidth: 0 }}>

          {/* Route card */}
          <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E7EC" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>Route</div>
            </div>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>From</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#101828", letterSpacing: "-0.02em" }}>{shipment.origin.city}</div>
                  <div style={{ fontSize: 13, color: "#9CA3AF" }}>{shipment.origin.state}, {shipment.origin.country}</div>
                </div>

                <div style={{ flex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 90 }}>
                  <div style={{ fontSize: 20 }}>✈</div>
                  <div style={{ width: "100%", height: 2, background: "#E4E7EC", position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, #2563EB ${shipment.status === "DELIVERED" ? "100%" : shipment.status === "IN_TRANSIT" ? "60%" : shipment.status === "OUT_FOR_DELIVERY" ? "85%" : shipment.status === "PICKED_UP" ? "40%" : shipment.status === "CONFIRMED" ? "20%" : "5%"}, #E4E7EC 0%)` }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, textAlign: "center" }}>
                    {shipment.estimatedDelivery ? `Est. ${fmtDate(shipment.estimatedDelivery)}` : "No estimate yet"}
                  </div>
                </div>

                <div style={{ flex: 1, textAlign: "right", minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>To</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#101828", letterSpacing: "-0.02em" }}>{shipment.destination.city}</div>
                  <div style={{ fontSize: 13, color: "#9CA3AF" }}>{shipment.destination.state}, {shipment.destination.country}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tracking timeline */}
          <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E7EC" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>Tracking History</div>
            </div>
            <div style={{ padding: "20px" }}>
              {shipment.trackingEvents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#9CA3AF", fontSize: 13 }}>No tracking events yet.</div>
              ) : (
                [...shipment.trackingEvents].reverse().map((evt, i, arr) => {
                  const m = STATUS_META[evt.status] || STATUS_META["PENDING"];
                  const latest = i === 0;
                  return (
                    <div key={evt.id} style={{ display: "flex", gap: 14 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 18, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: latest ? m.dot : "#E4E7EC", marginTop: 3, flexShrink: 0 }} />
                        {i < arr.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: "#F2F4F7" }} />}
                      </div>
                      <div style={{ paddingBottom: 18, flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: latest ? m.color : "#374151" }}>{m.label}</div>
                        {evt.location && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{evt.location}</div>}
                        {evt.note && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{evt.note}</div>}
                        <div style={{ fontSize: 11, color: "#C0C7D0", marginTop: 4 }}>{fmtDate(evt.createdAt)} · {fmtTime(evt.createdAt)}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Package details */}
          <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E7EC" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>Package Details</div>
            </div>
            <div style={{ padding: "4px 20px 12px" }}>
              {[
                { label: "Service", value: <span style={{ color: svc.color, background: svc.bg, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{svc.label}</span> },
                { label: "Weight", value: `${shipment.weightKg} kg` },
                { label: "Dimensions", value: shipment.lengthCm ? `${shipment.lengthCm} × ${shipment.widthCm} × ${shipment.heightCm} cm` : null },
                { label: "Contents", value: shipment.description },
                { label: "Declared Value", value: shipment.declaredValue ? `$${shipment.declaredValue.toLocaleString()}` : null },
                { label: "Notes", value: shipment.notes },
              ].map(({ label, value }) => value ? (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "9px 0", borderBottom: "1px solid #F2F4F7" }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500, flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 600, textAlign: "right" }}>{value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { title: "Origin Address", addr: shipment.origin },
              { title: "Destination Address", addr: shipment.destination },
            ].map(({ title, addr }) => (
              <div key={title} style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E7EC" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>{title}</div>
                </div>
                <div style={{ padding: "14px 20px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#101828", marginBottom: 6 }}>{addr.fullName}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.7 }}>
                    {addr.phone}<br />
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                    {addr.city}, {addr.state} {addr.zip}<br />
                    {addr.country}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>

          {/* Shipment info */}
          <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E7EC" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>Shipment Info</div>
            </div>
            <div style={{ padding: "4px 20px 12px" }}>
              {[
                { label: "Created", value: fmtDate(shipment.createdAt) },
                { label: "Est. Delivery", value: shipment.estimatedDelivery ? fmtDate(shipment.estimatedDelivery) : null },
                { label: "Delivered At", value: shipment.deliveredAt ? fmtDate(shipment.deliveredAt) : null },
              ].map(({ label, value }) => value ? (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F2F4F7" }}>
                  <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>{value}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Courier */}
          <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E7EC" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>Courier</div>
            </div>
            <div style={{ padding: "16px 20px" }}>
              {shipment.courier ? (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#101828", marginBottom: 6 }}>{shipment.courier.name}</div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>{shipment.courier.email}</div>
                  {shipment.courier.phone && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{shipment.courier.phone}</div>}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#9CA3AF", fontStyle: "italic" }}>Not yet assigned</div>
              )}
            </div>
          </div>

          {/* Invoice */}
          {shipment.invoice && (
            <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E7EC" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>Invoice</div>
              </div>
              <div style={{ padding: "4px 20px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "2px solid #E4E7EC" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Total</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#2563EB" }}>${shipment.invoice.total.toFixed(2)}</span>
                </div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, color: shipment.invoice.status === "PAID" ? "#15803D" : "#B45309", background: shipment.invoice.status === "PAID" ? "#DCFCE7" : "#FEF3C7" }}>
                    {shipment.invoice.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Parcels */}
          {shipment.parcels.length > 0 && (
            <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #E4E7EC" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase" }}>Parcels ({shipment.parcels.length})</div>
              </div>
              <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {shipment.parcels.map((p, i) => (
                  <div key={p.id} style={{ background: "#F8F9FB", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{p.label ?? `Parcel ${i + 1}`}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.weightKg} kg{p.lengthCm ? ` · ${p.lengthCm}×${p.widthCm}×${p.heightCm} cm` : ""}</div>
                    {p.contents && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{p.contents}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          [style*="grid-template-columns: 1fr 340px"] { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          div[style*="padding: 32px 36px"] { padding: 20px 16px !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
