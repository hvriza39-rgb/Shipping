'use client';
import { useState, useEffect, useCallback } from "react";
import type { ShipmentStatus, ServiceType } from "@prisma/client";
import { STATUS_TRANSITIONS } from "@/lib/shipment-status";

interface CustomerInfo {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

interface CourierInfo {
  id: string;
  name: string;
  email: string;
}

interface AddressSummary {
  city: string;
  state: string;
  country: string;
}

interface AddressFull extends AddressSummary {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  zip: string;
}

interface TrackingEvent {
  id: string;
  status: ShipmentStatus;
  location: string | null;
  note: string | null;
  createdAt: string;
}

interface ShipmentListItem {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  serviceType: ServiceType;
  weightKg: number;
  description: string | null;
  declaredValue: number | null;
  createdAt: string;
  estimatedDelivery: string | null;
  deliveredAt: string | null;
  courierId: string | null;
  customer: CustomerInfo;
  courier: CourierInfo | null;
  origin: AddressSummary;
  destination: AddressSummary;
  invoice: { status: string; total: number } | null;
  _count: { trackingEvents: number; parcels: number };
}

interface ShipmentDetail extends Omit<ShipmentListItem, "origin" | "destination"> {
  origin: AddressFull;
  destination: AddressFull;
  trackingEvents: TrackingEvent[];
}

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

const SERVICE_META: Record<ServiceType, { label: string; color: string; bg: string }> = {
  STANDARD:  { label: "Standard",  color: "#374151", bg: "#F9FAFB" },
  EXPRESS:   { label: "Express",   color: "#1D4ED8", bg: "#DBEAFE" },
  OVERNIGHT: { label: "Overnight", color: "#7C3AED", bg: "#EDE9FE" },
  FREIGHT:   { label: "Freight",   color: "#B45309", bg: "#FEF3C7" },
};

const FILTERS: ("ALL" | ShipmentStatus)[] = ["ALL", "PENDING", "CONFIRMED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"];

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(d: string | Date): string {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
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

export default function AdminDashboard() {
  const [shipments, setShipments]   = useState<ShipmentListItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const [activeFilter, setActiveFilter] = useState<"ALL" | ShipmentStatus>("ALL");
  const [search, setSearch]             = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage]                 = useState(1);
  const [pages, setPages]               = useState(1);

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount]     = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);

  const [couriers, setCouriers] = useState<CourierInfo[]>([]);

  const [drawer, setDrawer]               = useState<string | null>(null);
  const [drawerDetail, setDrawerDetail]   = useState<ShipmentDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [statusPopover, setStatusPopover]   = useState<string | null>(null);
  const [courierPopover, setCourierPopover] = useState<string | null>(null);

  const [locationModal, setLocationModal] = useState<string | null>(null);
  const [locForm, setLocForm] = useState<{ status: ShipmentStatus | ""; location: string; note: string }>({
    status: "", location: "", note: "",
  });
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [activeFilter]);

  useEffect(() => {
    const close = () => { setStatusPopover(null); setCourierPopover(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "ALL") params.set("status", activeFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/shipments?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load shipments");
      const data = await res.json();
      setShipments(data.shipments);
      setPages(data.pages || 1);
    } catch (e: any) {
      setError(e.message ?? "Failed to load shipments");
    } finally {
      setLoading(false);
    }
  }, [activeFilter, debouncedSearch, page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/shipments/stats");
      if (!res.ok) return;
      const data = await res.json();
      setStatusCounts(data.byStatus ?? {});
      setTotalCount(data.total ?? 0);
      setUnassignedCount(data.unassigned ?? 0);
    } catch {
      // stats are non-critical to core function; fail silently
    }
  }, []);

  const fetchCouriers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users?role=COURIER");
      if (!res.ok) return;
      const data = await res.json();
      setCouriers(data.users ?? []);
    } catch {
      // courier list failing shouldn't break the rest of the page
    }
  }, []);

  const fetchShipmentDetail = useCallback(async (id: string) => {
    setDrawerLoading(true);
    try {
      const res = await fetch(`/api/admin/shipments/${id}`);
      if (!res.ok) throw new Error("Failed to load shipment");
      setDrawerDetail(await res.json());
    } catch {
      setDrawerDetail(null);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchCouriers(); }, [fetchCouriers]);
  useEffect(() => {
    if (drawer) fetchShipmentDetail(drawer);
    else setDrawerDetail(null);
  }, [drawer, fetchShipmentDetail]);

  const refreshAll = async (id?: string) => {
    await Promise.all([fetchShipments(), fetchStats()]);
    if (id && drawer === id) fetchShipmentDetail(id);
  };

  const updateStatus = async (id: string, next: ShipmentStatus) => {
    setStatusPopover(null);
    try {
      const res = await fetch(`/api/admin/shipments/${id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update status");
      await refreshAll(id);
    } catch (e: any) {
      setError(e.message ?? "Failed to update status");
    }
  };

  const assignCourier = async (id: string, courierId: string | null) => {
    setCourierPopover(null);
    try {
      const res = await fetch(`/api/admin/shipments/${id}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courierId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to assign courier");
      await refreshAll(id);
    } catch (e: any) {
      setError(e.message ?? "Failed to assign courier");
    }
  };

  const unassign = (id: string) => assignCourier(id, null);

  const pushTrackingEvent = async (id: string) => {
    if (!locForm.status) return;
    setLocLoading(true);
    setLocError("");
    try {
      const res = await fetch(`/api/admin/shipments/${id}/tracking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status:   locForm.status,
          location: locForm.location || null,
          note:     locForm.note    || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update.");

      setLocationModal(null);
      setLocForm({ status: "", location: "", note: "" });
      await refreshAll();
    } catch (e: any) {
      setLocError(e.message ?? "Failed to update.");
    } finally {
      setLocLoading(false);
    }
  };

  const pending   = statusCounts.PENDING ?? 0;
  const inTransit = (statusCounts.CONFIRMED ?? 0) + (statusCounts.PICKED_UP ?? 0)
                  + (statusCounts.IN_TRANSIT ?? 0) + (statusCounts.OUT_FOR_DELIVERY ?? 0);
  const delivered = statusCounts.DELIVERED ?? 0;

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
          <a href="/admin/users" style={{
            fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none",
            padding: "6px 12px", borderRadius: 7, border: "1px solid #E4E7EC", background: "#F8F9FB",
          }}>
            Users
          </a>
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

        {error && (
          <div style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* STAT CARDS */}
        <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard label="Awaiting Action" value={pending}         sub="Need confirmation"  accent="#B45309" />
          <StatCard label="In Transit"      value={inTransit}       sub="Active deliveries"  accent="#0369A1" />
          <StatCard label="Delivered"       value={delivered}       sub="Completed"          accent="#15803D" />
          <StatCard label="Unassigned"      value={unassignedCount} sub="No courier yet"     accent="#DC2626" />
        </div>

        {/* FILTER TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {FILTERS.map(f => {
            const active = activeFilter === f;
            const m = f !== "ALL" ? STATUS_META[f] : null;
            const count = f === "ALL" ? totalCount : (statusCounts[f] ?? 0);
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
                {loading && (
                  <tr><td colSpan={8} style={{ padding: 56, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>Loading shipments…</td></tr>
                )}
                {!loading && shipments.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 56, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>No shipments match your filters.</td></tr>
                )}
                {!loading && shipments.map((s, i) => {
                  const transitions = STATUS_TRANSITIONS[s.status];
                  const isStatusOpen  = statusPopover === s.id;
                  const isCourierOpen = courierPopover === s.id;
                  const isDrawerOpen  = drawer === s.id;

                  return (
                    <tr key={s.id} style={{ borderBottom: i < shipments.length - 1 ? "1px solid #F2F4F7" : "none", background: isDrawerOpen ? "#FAFBFF" : "transparent" }}>

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
                              background: s.courier ? "#F0FDF4" : "#FFF7ED",
                              color: s.courier ? "#15803D" : "#C2410C",
                              border: `1px solid ${s.courier ? "#BBF7D0" : "#FED7AA"}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {s.courier?.name ?? "Unassigned"} ▾
                          </button>
                          {isCourierOpen && (
                            <div onClick={e => e.stopPropagation()} style={{
                              position: "absolute", top: "calc(100% + 6px)", left: 0,
                              background: "#fff", border: "1px solid #E4E7EC", borderRadius: 10,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.10)", zIndex: 100, padding: 6, minWidth: 175,
                            }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", padding: "4px 8px 6px", textTransform: "uppercase" }}>Assign Courier</div>
                              {couriers.length === 0 && (
                                <div style={{ padding: "8px 10px", fontSize: 12, color: "#9CA3AF" }}>No couriers found</div>
                              )}
                              {couriers.map(c => (
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

                      {/* Actions */}
                      <td style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => {
                          setLocForm({ status: s.status, location: "", note: "" });
                          setLocError("");
                          setLocationModal(s.id);
                          setDrawer(null);
                        }} style={{
                          padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: "pointer",
                          background: "#FEF3C7", color: "#B45309", border: "1px solid #FDE68A",
                        }}>
                          Update
                        </button>
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

        {/* PAGINATION */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>
            {totalCount === 0 ? "0 shipments" : `Page ${page} of ${pages} · ${totalCount} total`}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 7, border: "1px solid #E4E7EC", background: "#fff", color: page <= 1 ? "#D1D5DB" : "#374151", cursor: page <= 1 ? "default" : "pointer" }}
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page >= pages}
              style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 7, border: "1px solid #E4E7EC", background: "#fff", color: page >= pages ? "#D1D5DB" : "#374151", cursor: page >= pages ? "default" : "pointer" }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {drawer && (
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
            {drawerLoading && (
              <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>Loading…</div>
            )}

            {!drawerLoading && drawerDetail && (
              <>
                {/* Drawer header */}
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #E4E7EC", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#2563EB", fontWeight: 700, letterSpacing: "0.03em" }}>{drawerDetail.trackingNumber}</div>
                      <div style={{ fontSize: 19, fontWeight: 800, marginTop: 4, letterSpacing: "-0.03em" }}>{drawerDetail.customer.name}</div>
                    </div>
                    <button onClick={() => setDrawer(null)} style={{ background: "#F8F9FB", border: "1px solid #E4E7EC", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#374151" }}>✕</button>
                  </div>
                  <div style={{ marginTop: 10 }}><StatusBadge status={drawerDetail.status} /></div>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  {/* Info grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[
                      ["Email",          drawerDetail.customer.email],
                      ["Phone",          drawerDetail.customer.phone ?? "—"],
                      ["Service",        SERVICE_META[drawerDetail.serviceType].label],
                      ["Weight",         `${drawerDetail.weightKg} kg`],
                      ["Declared Value", drawerDetail.declaredValue ? `$${drawerDetail.declaredValue.toLocaleString()}` : "—"],
                      ["Created",        fmtDate(drawerDetail.createdAt)],
                      ["Est. Delivery",  drawerDetail.estimatedDelivery ? fmtDate(drawerDetail.estimatedDelivery) : "—"],
                      ["Courier",        drawerDetail.courier?.name ?? "Unassigned"],
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
                      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2, letterSpacing: "-0.02em" }}>{drawerDetail.origin.city}</div>
                      <div style={{ fontSize: 12, color: "#667085" }}>{drawerDetail.origin.state}</div>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 1, background: "#E4E7EC" }} />
                      <span style={{ color: "#9CA3AF", fontSize: 16 }}>✈</span>
                      <div style={{ flex: 1, height: 1, background: "#E4E7EC" }} />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>To</div>
                      <div style={{ fontSize: 15, fontWeight: 800, marginTop: 2, letterSpacing: "-0.02em" }}>{drawerDetail.destination.city}</div>
                      <div style={{ fontSize: 12, color: "#667085" }}>{drawerDetail.destination.state}</div>
                    </div>
                  </div>

                  {/* Contents */}
                  {drawerDetail.description && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}>Contents</div>
                      <div style={{ fontSize: 13, color: "#374151", background: "#F8F9FB", borderRadius: 8, padding: "10px 12px" }}>{drawerDetail.description}</div>
                    </div>
                  )}

                  {/* Tracking Timeline */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14 }}>Tracking History</div>
                    {[...drawerDetail.trackingEvents].reverse().map((evt, i, arr) => {
                      const m = STATUS_META[evt.status];
                      const isLatest = i === 0;
                      return (
                        <div key={evt.id} style={{ display: "flex", gap: 12 }}>
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
              </>
            )}
          </div>
        </div>
      )}

      {/* LOCATION / STATUS UPDATE MODAL — independent of the drawer */}
      {locationModal && (() => {
        const s = shipments.find((x) => x.id === locationModal);
        if (!s) return null;
        const transitions = STATUS_TRANSITIONS[s.status] ?? [];
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div
              style={{ position: "absolute", inset: 0, background: "rgba(12,20,33,0.45)", backdropFilter: "blur(2px)" }}
              onClick={() => { setLocationModal(null); setLocError(""); }}
            />
            <div style={{ position: "relative", background: "#fff", borderRadius: 14, padding: 28, width: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0C1421", letterSpacing: "-0.02em" }}>Update Shipment</div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "#2563EB", fontWeight: 700, marginTop: 4 }}>{s.trackingNumber}</div>
                </div>
                <button
                  onClick={() => { setLocationModal(null); setLocError(""); }}
                  style={{ background: "#F8F9FB", border: "1px solid #E4E7EC", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 15, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ✕
                </button>
              </div>

              <div style={{ background: "#F8F9FB", borderRadius: 8, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: "#667085", fontWeight: 500 }}>Current status</span>
                <StatusBadge status={s.status} />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  New Status <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <select
                  value={locForm.status}
                  onChange={(e) => setLocForm((f) => ({ ...f, status: e.target.value as ShipmentStatus | "" }))}
                  style={{ width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid #E4E7EC", fontSize: 13, color: "#101828", outline: "none", background: "#fff", fontFamily: "inherit", cursor: "pointer" }}
                >
                  <option value="">— Select status —</option>
                  {transitions.map((t) => (
                    <option key={t} value={t}>{STATUS_META[t]?.label ?? t}</option>
                  ))}
                  <option value={s.status}>{STATUS_META[s.status]?.label ?? s.status} (location update only)</option>
                </select>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Current Location
                </label>
                <input
                  value={locForm.location}
                  onChange={(e) => setLocForm((f) => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Chicago, IL"
                  style={{ width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid #E4E7EC", fontSize: 13, color: "#101828", outline: "none", background: "#fff", fontFamily: "inherit" }}
                  onFocus={(e) => { e.currentTarget.style.border = "1.5px solid #2563EB"; }}
                  onBlur={(e)  => { e.currentTarget.style.border = "1.5px solid #E4E7EC"; }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                  Note <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400 }}>— optional</span>
                </label>
                <textarea
                  value={locForm.note}
                  onChange={(e) => setLocForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Package arrived at sorting facility"
                  rows={3}
                  style={{ width: "100%", padding: "10px 13px", borderRadius: 8, border: "1.5px solid #E4E7EC", fontSize: 13, color: "#101828", outline: "none", background: "#fff", fontFamily: "inherit", resize: "vertical" }}
                  onFocus={(e) => { e.currentTarget.style.border = "1.5px solid #2563EB"; }}
                  onBlur={(e)  => { e.currentTarget.style.border = "1.5px solid #E4E7EC"; }}
                />
              </div>

              {locError && (
                <div style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 13px", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
                  {locError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => { setLocationModal(null); setLocError(""); }}
                  style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1.5px solid #E4E7EC", background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => pushTrackingEvent(s.id)}
                  disabled={!locForm.status || locLoading}
                  style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 700, cursor: !locForm.status || locLoading ? "not-allowed" : "pointer", background: !locForm.status || locLoading ? "#93C5FD" : "#2563EB", color: "#fff" }}
                >
                  {locLoading ? "Pushing update…" : "Push Update"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
