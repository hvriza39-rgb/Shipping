'use client';
import { useState, useEffect } from "react";

type ShipmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED";

type ServiceType = "STANDARD" | "EXPRESS" | "OVERNIGHT" | "FREIGHT";

interface Courier {
  id: string;
  name: string;
}

interface TrackingEvent {
  status: ShipmentStatus;
  note: string;
  location: string | null;
  createdAt: string;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface AddressSummary {
  city: string;
  state: string;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  customer: Customer;
  origin: AddressSummary;
  destination: AddressSummary;
  serviceType: ServiceType;
  status: ShipmentStatus;
  courierId: string | null;
  weightKg: number;
  description?: string;
  declaredValue?: number;
  createdAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  trackingEvents: TrackingEvent[];
}

const COURIERS: Courier[] = [
  { id: "c1", name: "Marcus Reed" },
  { id: "c2", name: "Priya Nair" },
  { id: "c3", name: "Tyler Brooks" },
  { id: "c4", name: "Sandra Osei" },
];

const STATUS_META: Record<ShipmentStatus, { label: string; color: string; bg: string; dot: string }> = {
  PENDING:          { label: "Pending",           color: "#B45309", bg: "#FEF3C7", dot: "#F59E0B" },
  CONFIRMED:        { label: "Confirmed",          color: "#1D4ED8", bg: "#DBEAFE", dot: "#3B82F6" },
  PICKED_UP:        { label: "Picked Up",          color: "#6D28D9", bg: "#EDE9FE", dot: "#8B5CF6" },
  IN_TRANSIT:       { label: "In Transit",         color: "#0369A1", bg: "#E0F2FE", dot: "#0EA5E9" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",   color: "#C2410C", bg: "#FFEDD5", dot: "#F97316" },
  DELIVERED:        { label: "Delivered",          color: "#15803D", bg: "#DCFCE7", dot: "#22C55E" },
  FAILED:           { label: "Failed",             color: "#B91C1C", bg: "#FEE2E2", dot: "#EF4444" },
  RETURNED:         { label: "Returned",           color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" },
  CANCELLED:        { label: "Cancelled",          color: "#374151", bg: "#F3F4F6", dot: "#9CA3AF" },
};

const STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING:          ["CONFIRMED", "CANCELLED"],
  CONFIRMED:        ["PICKED_UP", "CANCELLED"],
  PICKED_UP:        ["IN_TRANSIT"],
  IN_TRANSIT:       ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  FAILED:           ["RETURNED"],
  DELIVERED:        [],
  RETURNED:         [],
  CANCELLED:        [],
};

const SERVICE_META: Record<ServiceType, { label: string; color: string; bg: string }> = {
  STANDARD:  { label: "Standard",  color: "#374151", bg: "#F9FAFB" },
  EXPRESS:   { label: "Express",   color: "#1D4ED8", bg: "#DBEAFE" },
  OVERNIGHT: { label: "Overnight", color: "#7C3AED", bg: "#EDE9FE" },
  FREIGHT:   { label: "Freight",   color: "#B45309", bg: "#FEF3C7" },
};

const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: "s1", trackingNumber: "SHP-M3A2K1-XQRP",
    customer: { name: "John Cavanaugh", email: "john@cavanaugh.com", phone: "+1 212-555-0142" },
    origin: { city: "New York", state: "NY" }, destination: { city: "Los Angeles", state: "CA" },
    serviceType: "EXPRESS", status: "PENDING", courierId: null,
    weightKg: 2.4, description: "Electronics — laptop and accessories", declaredValue: 1200,
    createdAt: "2026-06-19T08:30:00Z", estimatedDelivery: "2026-06-22",
    trackingEvents: [
      { status: "PENDING", note: "Shipment created and awaiting confirmation", location: null, createdAt: "2026-06-19T08:30:00Z" },
    ],
  },
  {
    id: "s2", trackingNumber: "SHP-N7B3L2-YWMQ",
    customer: { name: "Sarah Okonkwo", email: "sarah@okonkwo.co", phone: "+1 312-555-0198" },
    origin: { city: "Chicago", state: "IL" }, destination: { city: "Miami", state: "FL" },
    serviceType: "STANDARD", status: "IN_TRANSIT", courierId: "c2",
    weightKg: 5.1, description: "Clothing and personal items", declaredValue: 300,
    createdAt: "2026-06-17T14:20:00Z", estimatedDelivery: "2026-06-23",
    trackingEvents: [
      { status: "PENDING",    note: "Shipment created",              location: null,           createdAt: "2026-06-17T14:20:00Z" },
      { status: "CONFIRMED",  note: "Courier assigned",              location: "Chicago, IL",  createdAt: "2026-06-17T16:00:00Z" },
      { status: "PICKED_UP",  note: "Package picked up from sender", location: "Chicago, IL",  createdAt: "2026-06-18T09:00:00Z" },
      { status: "IN_TRANSIT", note: "Package in transit",            location: "Nashville, TN",createdAt: "2026-06-19T11:30:00Z" },
    ],
  },
  {
    id: "s3", trackingNumber: "SHP-P9C4M3-ZTLV",
    customer: { name: "David Mercer", email: "d.mercer@outlook.com", phone: "+1 415-555-0167" },
    origin: { city: "San Francisco", state: "CA" }, destination: { city: "Seattle", state: "WA" },
    serviceType: "OVERNIGHT", status: "PENDING", courierId: null,
    weightKg: 0.8, description: "Legal documents", declaredValue: 50,
    createdAt: "2026-06-20T07:15:00Z", estimatedDelivery: "2026-06-21",
    trackingEvents: [
      { status: "PENDING", note: "Shipment created", location: null, createdAt: "2026-06-20T07:15:00Z" },
    ],
  },
  {
    id: "s4", trackingNumber: "SHP-Q2D5N4-ABKX",
    customer: { name: "Maria Gonzalez", email: "mgonzalez@gmail.com", phone: "+1 713-555-0123" },
    origin: { city: "Houston", state: "TX" }, destination: { city: "Atlanta", state: "GA" },
    serviceType: "STANDARD", status: "DELIVERED", courierId: "c1",
    weightKg: 3.6, description: "Home goods", declaredValue: 180,
    createdAt: "2026-06-15T10:00:00Z", estimatedDelivery: "2026-06-19",
    trackingEvents: [
      { status: "PENDING",          note: "Shipment created",          location: null,          createdAt: "2026-06-15T10:00:00Z" },
      { status: "CONFIRMED",        note: "Confirmed",                 location: "Houston, TX", createdAt: "2026-06-15T12:00:00Z" },
      { status: "PICKED_UP",        note: "Picked up",                 location: "Houston, TX", createdAt: "2026-06-16T08:00:00Z" },
      { status: "IN_TRANSIT",       note: "In transit",                location: "Baton Rouge, LA", createdAt: "2026-06-17T10:00:00Z" },
      { status: "OUT_FOR_DELIVERY", note: "Out for delivery",          location: "Atlanta, GA", createdAt: "2026-06-19T07:30:00Z" },
      { status: "DELIVERED",        note: "Delivered to recipient",    location: "Atlanta, GA", createdAt: "2026-06-19T14:22:00Z" },
    ],
  },
  {
    id: "s5", trackingNumber: "SHP-R8E6O5-CVNP",
    customer: { name: "James Wu", email: "james.wu@techco.com", phone: "+1 206-555-0189" },
    origin: { city: "Seattle", state: "WA" }, destination: { city: "Denver", state: "CO" },
    serviceType: "FREIGHT", status: "CONFIRMED", courierId: "c3",
    weightKg: 48.2, description: "Industrial equipment parts", declaredValue: 4500,
    createdAt: "2026-06-19T13:00:00Z", estimatedDelivery: "2026-06-25",
    trackingEvents: [
      { status: "PENDING",   note: "Shipment created",                    location: null,          createdAt: "2026-06-19T13:00:00Z" },
      { status: "CONFIRMED", note: "Courier assigned, awaiting pickup",   location: "Seattle, WA", createdAt: "2026-06-19T15:30:00Z" },
    ],
  },
  {
    id: "s6", trackingNumber: "SHP-S5F7P6-DWQR",
    customer: { name: "Amara Diallo", email: "amara@diallo.net", phone: "+1 404-555-0156" },
    origin: { city: "Atlanta", state: "GA" }, destination: { city: "Boston", state: "MA" },
    serviceType: "EXPRESS", status: "OUT_FOR_DELIVERY", courierId: "c4",
    weightKg: 1.2, description: "Gift — fragile glassware", declaredValue: 220,
    createdAt: "2026-06-18T09:00:00Z", estimatedDelivery: "2026-06-20",
    trackingEvents: [
      { status: "PENDING",          note: "Shipment created", location: null,           createdAt: "2026-06-18T09:00:00Z" },
      { status: "CONFIRMED",        note: "Confirmed",        location: "Atlanta, GA",  createdAt: "2026-06-18T10:00:00Z" },
      { status: "PICKED_UP",        note: "Picked up",        location: "Atlanta, GA",  createdAt: "2026-06-18T14:00:00Z" },
      { status: "IN_TRANSIT",       note: "In transit",       location: "Charlotte, NC",createdAt: "2026-06-19T08:00:00Z" },
      { status: "OUT_FOR_DELIVERY", note: "Out for delivery", location: "Boston, MA",   createdAt: "2026-06-20T07:00:00Z" },
    ],
  },
  {
    id: "s7", trackingNumber: "SHP-T1G8Q7-EXMS",
    customer: { name: "Robert Patel", email: "rpatel@company.com", phone: "+1 617-555-0134" },
    origin: { city: "Boston", state: "MA" }, destination: { city: "Phoenix", state: "AZ" },
    serviceType: "STANDARD", status: "FAILED", courierId: "c1",
    weightKg: 7.3, description: "Medical supplies", declaredValue: 800,
    createdAt: "2026-06-14T11:00:00Z", estimatedDelivery: "2026-06-19",
    trackingEvents: [
      { status: "PENDING",    note: "Shipment created",                           location: null,             createdAt: "2026-06-14T11:00:00Z" },
      { status: "CONFIRMED",  note: "Confirmed",                                  location: "Boston, MA",     createdAt: "2026-06-14T13:00:00Z" },
      { status: "PICKED_UP",  note: "Picked up",                                  location: "Boston, MA",     createdAt: "2026-06-15T09:00:00Z" },
      { status: "IN_TRANSIT", note: "In transit",                                 location: "Philadelphia, PA",createdAt: "2026-06-16T11:00:00Z" },
      { status: "FAILED",     note: "Delivery failed — recipient not available",  location: "Phoenix, AZ",    createdAt: "2026-06-19T15:00:00Z" },
    ],
  },
];

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function courierName(id: string | null): string | null {
  return COURIERS.find(c => c.id === id)?.name ?? null;
}

function StatusBadge({ status }: { status: ShipmentStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, letterSpacing: "0.02em",
      color: m.color, background: m.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: number; sub: string; accent?: string }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12,
      padding: "20px 24px", flex: 1, minWidth: 0,
    }}>
      <div style={{ fontSize: 12, color: "#667085", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color: accent ?? "#101828", lineHeight: 1, marginBottom: 4, letterSpacing: "-0.03em" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#9CA3AF" }}>{sub}</div>
    </div>
  );
}

const FILTERS: ("ALL" | ShipmentStatus)[] = ["ALL", "PENDING", "CONFIRMED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"];

export default function AdminDashboard() {
  const [shipments, setShipments]           = useState<Shipment[]>(MOCK_SHIPMENTS);
  const [activeFilter, setActiveFilter]     = useState<"ALL" | ShipmentStatus>("ALL");
  const [search, setSearch]                 = useState("");
  const [drawer, setDrawer]                 = useState<string | null>(null);
  const [statusPopover, setStatusPopover]   = useState<string | null>(null);
  const [courierPopover, setCourierPopover] = useState<string | null>(null);

  useEffect(() => {
    const close = () => { setStatusPopover(null); setCourierPopover(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const updateStatus = (id: string, next: ShipmentStatus) => {
    setShipments(prev => prev.map(s => {
      if (s.id !== id) return s;
      return {
        ...s, status: next,
        ...(next === "DELIVERED" ? { deliveredAt: new Date().toISOString() } : {}),
        trackingEvents: [...s.trackingEvents, {
          status: next,
          note: `Status updated to ${STATUS_META[next].label}`,
          location: null,
          createdAt: new Date().toISOString(),
        }],
      };
    }));
    setStatusPopover(null);
  };

  const assignCourier = (id: string, cid: string) => {
    setShipments(prev => prev.map(s => {
      if (s.id !== id) return s;
      const autoConfirm = s.status === "PENDING";
      const newStatus: ShipmentStatus = autoConfirm ? "CONFIRMED" : s.status;
      const newEvents   = [...s.trackingEvents];
      if (autoConfirm) {
        newEvents.push({ status: "CONFIRMED", note: `Courier assigned: ${courierName(cid)}`, location: null, createdAt: new Date().toISOString() });
      }
      return { ...s, courierId: cid, status: newStatus, trackingEvents: newEvents };
    }));
    setCourierPopover(null);
  };

  const unassign = (id: string) => {
    setShipments(prev => prev.map(s => s.id !== id ? s : { ...s, courierId: null }));
    setCourierPopover(null);
  };

  const pending    = shipments.filter(s => s.status === "PENDING").length;
  const inTransit  = shipments.filter(s => ["CONFIRMED","PICKED_UP","IN_TRANSIT","OUT_FOR_DELIVERY"].includes(s.status)).length;
  const delivered  = shipments.filter(s => s.status === "DELIVERED").length;
  const unassigned = shipments.filter(s => !s.courierId && !["DELIVERED","CANCELLED","RETURNED"].includes(s.status)).length;

  const filtered = shipments.filter(s => {
    const okStatus = activeFilter === "ALL" || s.status === activeFilter;
    const q = search.toLowerCase();
    const okSearch = !q
      || s.trackingNumber.toLowerCase().includes(q)
      || s.customer.name.toLowerCase().includes(q)
      || s.origin.city.toLowerCase().includes(q)
      || s.destination.city.toLowerCase().includes(q);
    return okStatus && okSearch;
  });

  const drawerShip = drawer ? shipments.find(s => s.id === drawer) : null;

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#F8F9FB", color: "#101828" }}>

      {/* NAV */}
      <nav style={{
        background: "#fff", borderBottom: "1px solid #E4E7EC",
        padding: "0 28px", height: 54,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#2563EB", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em" }}>SwiftShip</span>
          <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginLeft: 2 }}>Admin</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search shipments or customers…"
              style={{ padding: "7px 12px 7px 30px", borderRadius: 8, border: "1px solid #E4E7EC", fontSize: 13, width: 230, outline: "none", background: "#F8F9FB", color: "#101828" }}
            />
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#2563EB", fontSize: 13 }}>A</div>
        </div>
      </nav>

      <div style={{ padding: "28px 28px", maxWidth: 1280, margin: "0 auto" }}>

        {/* HEADING */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em" }}>Operations</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9CA3AF" }}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* STAT CARDS */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Awaiting Action" value={pending}   sub="Need confirmation"  accent="#B45309" />
          <StatCard label="In Transit"      value={inTransit} sub="Active deliveries"  accent="#0369A1" />
          <StatCard label="Delivered"       value={delivered} sub="Completed"          accent="#15803D" />
          <StatCard label="Unassigned"      value={unassigned} sub="No courier yet"    accent="#DC2626" />
        </div>

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {FILTERS.map(f => {
            const active = activeFilter === f;
            const m = f !== "ALL" ? STATUS_META[f] : null;
            const count = f === "ALL" ? shipments.length : shipments.filter(s => s.status === f).length;
            return (
              <button key={f} onClick={() => setActiveFilter(f)} style={{
                padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: "pointer", outline: "none",
                background: active ? (m?.bg ?? "#EFF6FF") : "#fff",
                color: active ? (m?.color ?? "#2563EB") : "#667085",
                border: `1.5px solid ${active ? (m?.dot ?? "#2563EB") : "#E4E7EC"}`,
              }}>
                {f === "ALL" ? "All" : STATUS_META[f].label}
                <span style={{ marginLeft: 5, opacity: 0.65 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* TABLE */}
        <div style={{ background: "#fff", border: "1px solid #E4E7EC", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E4E7EC" }}>
                  {["Tracking #", "Customer", "Route", "Service", "Weight", "Status", "Courier", ""].map((h, i) => (
                    <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 56, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>No shipments match your filters.</td></tr>
                )}
                {filtered.map((s, i) => {
                  const cn = courierName(s.courierId);
                  const transitions = STATUS_TRANSITIONS[s.status];
                  const isStatusOpen  = statusPopover === s.id;
                  const isCourierOpen = courierPopover === s.id;
                  const isDrawerOpen  = drawer === s.id;

                  return (
                    <tr key={s.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #F2F4F7" : "none", background: isDrawerOpen ? "#FAFBFF" : "transparent" }}>

                      {/* Tracking # */}
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          onClick={() => setDrawer(isDrawerOpen ? null : s.id)}
                          style={{ fontFamily: "monospace", fontSize: 12, color: "#2563EB", fontWeight: 700, letterSpacing: "0.02em", cursor: "pointer" }}
                        >
                          {s.trackingNumber}
                        </span>
                        <div style={{ fontSize: 11, color: "#C0C7D0", marginTop: 2 }}>{fmtDate(s.createdAt)}</div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: "13px 16px" }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{s.customer.name}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>{s.customer.email}</div>
                      </td>

                      {/* Route */}
                      <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{s.origin.city}, {s.origin.state}</span>
                        <span style={{ color: "#D1D5DB", margin: "0 6px" }}>→</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{s.destination.city}, {s.destination.state}</span>
                      </td>

                      {/* Service */}
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: SERVICE_META[s.serviceType].color, background: SERVICE_META[s.serviceType].bg, padding: "3px 8px", borderRadius: 6 }}>
                          {SERVICE_META[s.serviceType].label}
                        </span>
                      </td>

                      {/* Weight */}
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{s.weightKg} kg</td>

                      {/* Status popover */}
                      <td style={{ padding: "13px 16px", position: "relative" }}>
                        <div style={{ display: "inline-block", position: "relative" }}>
                          <button
                            onClick={e => { e.stopPropagation(); setStatusPopover(isStatusOpen ? null : s.id); setCourierPopover(null); }}
                            style={{ background: "none", border: "none", padding: 0, cursor: transitions.length > 0 ? "pointer" : "default", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <StatusBadge status={s.status} />
                            {transitions.length > 0 && <span style={{ fontSize: 10, color: "#9CA3AF" }}>▾</span>}
                          </button>
                          {isStatusOpen && transitions.length > 0 && (
                            <div onClick={e => e.stopPropagation()} style={{
                              position: "absolute", top: "calc(100% + 6px)", left: 0,
                              background: "#fff", border: "1px solid #E4E7EC", borderRadius: 10,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 100, padding: 6, minWidth: 168,
                            }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", padding: "4px 8px 6px", textTransform: "uppercase" }}>Move to</div>
                              {transitions.map(t => (
                                <button key={t} onClick={() => updateStatus(s.id, t)} style={{
                                  display: "flex", alignItems: "center", gap: 8, width: "100%",
                                  padding: "8px 10px", background: "none", border: "none", cursor: "pointer",
                                  borderRadius: 7, fontSize: 13, fontWeight: 500, color: "#101828", textAlign: "left",
                                }}
                                  onMouseEnter={e => e.currentTarget.style.background = "#F8F9FB"}
                                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                                >
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_META[t].dot, flexShrink: 0 }} />
                                  {STATUS_META[t].label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Courier popover */}
                      <td style={{ padding: "13px 16px", position: "relative" }}>
                        <div style={{ display: "inline-block", position: "relative" }}>
                          <button
                            onClick={e => { e.stopPropagation(); setCourierPopover(isCourierOpen ? null : s.id); setStatusPopover(null); }}
                            style={{
                              padding: "5px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                              background: cn ? "#F0FDF4" : "#FFF7ED",
                              color: cn ? "#15803D" : "#C2410C",
                              border: `1px solid ${cn ? "#BBF7D0" : "#FED7AA"}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cn ?? "Unassigned"} ▾
                          </button>
                          {isCourierOpen && (
                            <div onClick={e => e.stopPropagation()} style={{
                              position: "absolute", top: "calc(100% + 6px)", left: 0,
                              background: "#fff", border: "1px solid #E4E7EC", borderRadius: 10,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 100, padding: 6, minWidth: 175,
                            }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", padding: "4px 8px 6px", textTransform: "uppercase" }}>Assign Courier</div>
                              {COURIERS.map(c => (
                                <button key={c.id} onClick={() => assignCourier(s.id, c.id)} style={{
                                  display: "flex", alignItems: "center", justifyContent: "space-between",
                                  width: "100%", padding: "8px 10px", background: "none", border: "none",
                                  cursor: "pointer", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "#101828", textAlign: "left",
                                }}
                                  onMouseEnter={e => e.currentTarget.style.background = "#F8F9FB"}
                                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                                >
                                  {c.name}
                                  {s.courierId === c.id && <span style={{ color: "#16A34A", fontSize: 15 }}>✓</span>}
                                </button>
                              ))}
                              {s.courierId && (
                                <>
                                  <div style={{ borderTop: "1px solid #F2F4F7", margin: "4px 0" }} />
                                  <button onClick={() => unassign(s.id)} style={{
                                    width: "100%", padding: "8px 10px", background: "none", border: "none",
                                    cursor: "pointer", borderRadius: 7, fontSize: 12, fontWeight: 500, color: "#EF4444", textAlign: "left",
                                  }}
                                    onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                                  >
                                    Remove assignment
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* View button */}
                      <td style={{ padding: "13px 16px" }}>
                        <button onClick={() => setDrawer(isDrawerOpen ? null : s.id)} style={{
                          padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: "pointer",
                          background: isDrawerOpen ? "#EFF6FF" : "#F8F9FB",
                          color: isDrawerOpen ? "#2563EB" : "#374151",
                          border: `1px solid ${isDrawerOpen ? "#BFDBFE" : "#E4E7EC"}`,
                        }}>
                          {isDrawerOpen ? "Close" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 10, textAlign: "right" }}>
          {filtered.length} of {shipments.length} shipments
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {drawerShip && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none" }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(16,24,40,0.18)", pointerEvents: "all" }}
            onClick={() => setDrawer(null)}
          />
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 440,
            background: "#fff", borderLeft: "1px solid #E4E7EC",
            overflowY: "auto", pointerEvents: "all",
            boxShadow: "-10px 0 40px rgba(0,0,0,0.08)",
          }}>
            {/* Drawer header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #E4E7EC", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "#2563EB", fontWeight: 700, letterSpacing: "0.03em" }}>{drawerShip.trackingNumber}</div>
                  <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4, letterSpacing: "-0.03em" }}>{drawerShip.customer.name}</div>
                </div>
                <button onClick={() => setDrawer(null)} style={{ background: "#F8F9FB", border: "1px solid #E4E7EC", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#374151" }}>✕</button>
              </div>
              <div style={{ marginTop: 10 }}><StatusBadge status={drawerShip.status} /></div>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {/* Info grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  ["Email",          drawerShip.customer.email],
                  ["Phone",          drawerShip.customer.phone],
                  ["Service",        SERVICE_META[drawerShip.serviceType].label],
                  ["Weight",         `${drawerShip.weightKg} kg`],
                  ["Declared Value", drawerShip.declaredValue ? `$${drawerShip.declaredValue.toLocaleString()}` : "—"],
                  ["Created",        fmtDate(drawerShip.createdAt)],
                  ["Est. Delivery",  drawerShip.estimatedDelivery ? fmtDate(drawerShip.estimatedDelivery) : "—"],
                  ["Courier",        courierName(drawerShip.courierId) ?? "Unassigned"],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: "#F8F9FB", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* Route */}
              <div style={{ background: "#F8F9FB", borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>From</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2, letterSpacing: "-0.02em" }}>{drawerShip.origin.city}</div>
                  <div style={{ fontSize: 12, color: "#667085" }}>{drawerShip.origin.state}</div>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 1, background: "#E4E7EC" }} />
                  <span style={{ color: "#9CA3AF", fontSize: 16 }}>✈</span>
                  <div style={{ flex: 1, height: 1, background: "#E4E7EC" }} />
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>To</div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2, letterSpacing: "-0.02em" }}>{drawerShip.destination.city}</div>
                  <div style={{ fontSize: 12, color: "#667085" }}>{drawerShip.destination.state}</div>
                </div>
              </div>

              {/* Contents */}
              {drawerShip.description && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Contents</div>
                  <div style={{ fontSize: 13, color: "#374151", background: "#F8F9FB", borderRadius: 8, padding: "10px 12px" }}>{drawerShip.description}</div>
                </div>
              )}

              {/* Tracking Timeline */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14 }}>Tracking History</div>
                {[...drawerShip.trackingEvents].reverse().map((evt, i, arr) => {
                  const m = STATUS_META[evt.status];
                  const isLatest = i === 0;
                  return (
                    <div key={i} style={{ display: "flex", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 18, flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: isLatest ? m.dot : "#D1D5DB", marginTop: 3, flexShrink: 0, zIndex: 1 }} />
                        {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: "#F2F4F7", minHeight: 20 }} />}
                      </div>
                      <div style={{ paddingBottom: 16, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: isLatest ? m.color : "#374151" }}>{STATUS_META[evt.status].label}</div>
                        {evt.location && <div style={{ fontSize: 12, color: "#667085", marginTop: 1 }}>{evt.location}</div>}
                        {evt.note && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>{evt.note}</div>}
                        <div style={{ fontSize: 11, color: "#C0C7D0", marginTop: 3 }}>{fmtDate(evt.createdAt)} · {fmtTime(evt.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
