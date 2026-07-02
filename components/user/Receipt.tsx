"use client";

import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

interface Address {
  fullName: string; phone: string;
  line1: string; line2: string | null;
  city: string; state: string; zip: string; country: string;
}

interface Shipment {
  id: string; trackingNumber: string; status: string; serviceType: string;
  weightKg: number; description: string | null; declaredValue: number | null;
  estimatedDelivery: string | null; deliveredAt: string | null; createdAt: string;
  origin: Address; destination: Address;
  invoice: { total: number; status: string } | null;
}

const SERVICE_LABELS: Record<string, string> = {
  STANDARD: "Standard", EXPRESS: "Express", OVERNIGHT: "Overnight", FREIGHT: "Freight",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", CONFIRMED: "Confirmed", PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit", OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered", FAILED: "Failed", RETURNED: "Returned", CANCELLED: "Cancelled",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function Receipt({ shipment }: { shipment: Shipment }) {
  const barcodeRef = useRef<SVGSVGElement>(null);
  const trackingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/track?q=${shipment.trackingNumber}`;

  useEffect(() => {
    import("jsbarcode").then(({ default: JsBarcode }) => {
      if (barcodeRef.current) {
        JsBarcode(barcodeRef.current, shipment.trackingNumber, {
          format:       "CODE128",
          width:        2.2,
          height:       72,
          displayValue: true,
          fontSize:     13,
          margin:       10,
          background:   "#ffffff",
          lineColor:    "#0C1421",
          fontOptions:  "bold",
        });
      }
    });
  }, [shipment.trackingNumber]);

  return (
    <div style={{ fontFamily: "var(--font-sans)", minHeight: "100vh", background: "var(--color-bg)", padding: "32px 24px" }}>

      {/* Controls — hidden on print */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, maxWidth: 720, margin: "0 auto 24px" }}>
        <Link href={`/shipments/${shipment.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: "var(--radius-sm)", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", fontSize: 13, fontWeight: 600, color: "var(--color-body)", textDecoration: "none" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15,18 9,12 15,6"/>
          </svg>
          Back
        </Link>
        <button
          onClick={() => window.print()}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: "var(--radius-sm)", background: "var(--color-primary)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6,9 6,2 18,2 18,9"/><path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print
        </button>
      </div>

      {/* Receipt card */}
      <div style={{ maxWidth: 720, margin: "0 auto", background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-md)" }}>

        {/* Header */}
        <div style={{ background: "var(--color-ink)", padding: "28px 36px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, background: "var(--color-primary)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
                <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              </svg>
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#fff", letterSpacing: "-0.02em" }}>SwiftShip</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Shipment Receipt</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{fmtDate(shipment.createdAt)}</div>
          </div>
        </div>

        <div style={{ padding: "28px 36px" }}>

          {/* Tracking number */}
          <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>Tracking Number</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 800, color: "var(--color-primary)", letterSpacing: "0.04em" }}>{shipment.trackingNumber}</div>
          </div>

          {/* Barcode + QR */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Barcode</div>
              <svg ref={barcodeRef} style={{ maxWidth: "100%" }} />
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "var(--color-border)" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.08em", textTransform: "uppercase" }}>QR Code</div>
              <QRCodeSVG value={trackingUrl} size={110} bgColor="#ffffff" fgColor="#0C1421" level="M" />
              <div style={{ fontSize: 9, color: "var(--color-subtle)", textAlign: "center", maxWidth: 110, wordBreak: "break-all" }}>Scan to track</div>
            </div>
          </div>

          {/* Addresses */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
            {[
              { label: "From",  addr: shipment.origin      },
              { label: "To",    addr: shipment.destination  },
            ].map(({ label, addr }) => (
              <div key={label}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)", marginBottom: 4 }}>{addr.fullName}</div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", lineHeight: 1.7 }}>
                  {addr.phone}<br />
                  {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}<br />
                  {addr.city}, {addr.state} {addr.zip}<br />
                  {addr.country}
                </div>
              </div>
            ))}
          </div>

          {/* Package summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--color-border)" }}>
            {[
              { label: "Service",   value: SERVICE_LABELS[shipment.serviceType] ?? shipment.serviceType },
              { label: "Weight",    value: `${shipment.weightKg} kg` },
              { label: "Value",     value: shipment.declaredValue ? `$${shipment.declaredValue.toLocaleString()}` : "—" },
              { label: "Status",    value: STATUS_LABELS[shipment.status] ?? shipment.status },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: "0 16px", borderRight: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Est delivery + invoice */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Est. Delivery</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--color-heading)" }}>
                {shipment.estimatedDelivery ? fmtDate(shipment.estimatedDelivery) : "To be confirmed"}
              </div>
            </div>
            {shipment.invoice && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Amount</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "var(--color-primary)" }}>${shipment.invoice.total.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: "var(--color-subtle)", marginTop: 2 }}>{shipment.invoice.status}</div>
              </div>
            )}
          </div>

          {/* Description */}
          {shipment.description && (
            <div style={{ background: "var(--color-surface-alt)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--color-subtle)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Contents</div>
              <div style={{ fontSize: 13, color: "var(--color-body)" }}>{shipment.description}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, color: "var(--color-subtle)" }}>
              This receipt confirms your shipment with SwiftShip.
            </div>
            <div style={{ fontSize: 11, color: "var(--color-subtle)", fontFamily: "var(--font-mono)" }}>
              #{shipment.id.slice(0, 8).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
