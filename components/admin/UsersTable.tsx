'use client';
import { useState, useEffect, useCallback } from "react";
import type { Role, ShipmentStatus } from "@prisma/client";

interface UserListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
  _count: { shipments: number; deliveries: number };
}

interface AddressItem {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ShipmentSummary {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  createdAt: string;
  destination?: { city: string; state: string };
}

interface UserDetail extends UserListItem {
  addresses: AddressItem[];
  shipments: ShipmentSummary[];
  deliveries: ShipmentSummary[];
}

const ROLE_META: Record<Role, { label: string; color: string; bg: string }> = {
  ADMIN:    { label: "Admin",    color: "#7C2D12", bg: "#FFEDD5" },
  STAFF:    { label: "Staff",    color: "#1D4ED8", bg: "#DBEAFE" },
  COURIER:  { label: "Courier",  color: "#6D28D9", bg: "#EDE9FE" },
  CUSTOMER: { label: "Customer", color: "#374151", bg: "#F3F4F6" },
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "#F59E0B", CONFIRMED: "#3B82F6", PICKED_UP: "#8B5CF6",
  IN_TRANSIT: "#0EA5E9", OUT_FOR_DELIVERY: "#F97316", DELIVERED: "#22C55E",
  FAILED: "#EF4444", RETURNED: "#9CA3AF", CANCELLED: "#9CA3AF",
};

const ROLE_FILTERS: ("ALL" | Role)[] = ["ALL", "ADMIN", "STAFF", "COURIER", "CUSTOMER"];
const ROLE_OPTIONS: Role[] = ["ADMIN", "STAFF", "COURIER", "CUSTOMER"];

function fmtDate(d: string | Date): string {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function RoleBadge({ role }: { role: Role }) {
  const m = ROLE_META[role];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", color: m.color, background: m.bg,
    }}>
      {m.label}
    </span>
  );
}

interface UsersTableProps {
  currentUserId: string;
  currentUserRole: Role;
}

export default function UsersTable({ currentUserId, currentUserRole }: UsersTableProps) {
  const [users, setUsers]     = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const [activeRole, setActiveRole]           = useState<"ALL" | Role>("ALL");
  const [search, setSearch]                   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage]   = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [drawer, setDrawer]               = useState<string | null>(null);
  const [drawerDetail, setDrawerDetail]   = useState<UserDetail | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);

  const canEditRoles = currentUserRole === "ADMIN";

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [activeRole]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeRole !== "ALL") params.set("role", activeRole);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load users");
      const data = await res.json();
      setUsers(data.users);
      setPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e.message ?? "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [activeRole, debouncedSearch, page]);

  const fetchUserDetail = useCallback(async (id: string) => {
    setDrawerLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      if (!res.ok) throw new Error("Failed to load user");
      setDrawerDetail(await res.json());
    } catch {
      setDrawerDetail(null);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => {
    if (drawer) fetchUserDetail(drawer);
    else setDrawerDetail(null);
  }, [drawer, fetchUserDetail]);

  const changeRole = async (userId: string, newRole: Role) => {
    setRoleUpdating(userId);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to update role");
      await fetchUsers();
      if (drawer === userId) fetchUserDetail(userId);
    } catch (e: any) {
      setError(e.message ?? "Failed to update role");
    } finally {
      setRoleUpdating(null);
    }
  };

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
          <a href="/admin/dashboard" style={{
            fontSize: 12, fontWeight: 600, color: "#374151", textDecoration: "none",
            padding: "6px 12px", borderRadius: 7, border: "1px solid #E4E7EC", background: "#F8F9FB",
          }}>
            Shipments
          </a>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or email…"
              style={{ padding: "7px 12px 7px 30px", borderRadius: 8, border: "1px solid #E4E7EC", fontSize: 13, width: 230, outline: "none", background: "#F8F9FB", color: "#101828" }}
            />
          </div>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#2563EB", fontSize: 13 }}>A</div>
        </div>
      </nav>

      <div style={{ padding: "28px 28px", maxWidth: 1280, margin: "0 auto" }}>

        <div style={{ marginBottom: 22 }}>
          <h1 style={{ margin: 0, fontSize: 21, fontWeight: 800, letterSpacing: "-0.03em" }}>Users</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#9CA3AF" }}>
            {total} registered {total === 1 ? "user" : "users"}
          </p>
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
            {error}
          </div>
        )}

        {!canEditRoles && (
          <div style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>
            You're viewing as Staff — only Admins can change user roles.
          </div>
        )}

        {/* ROLE FILTER TABS */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
          {ROLE_FILTERS.map(r => {
            const active = activeRole === r;
            const m = r !== "ALL" ? ROLE_META[r] : null;
            return (
              <button key={r} onClick={() => setActiveRole(r)} style={{
                padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: "pointer", outline: "none",
                background: active ? (m?.bg ?? "#EFF6FF") : "#fff",
                color: active ? (m?.color ?? "#2563EB") : "#667085",
                border: `1.5px solid ${active ? (m ? m.color : "#2563EB") : "#E4E7EC"}`,
              }}>
                {r === "ALL" ? "All" : ROLE_META[r].label}
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
                  {["Name", "Email", "Phone", "Role", "Joined", "Shipments", "Deliveries", ""].map((h, i) => (
                    <th key={i} style={{ padding: "11px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} style={{ padding: 56, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>Loading users…</td></tr>
                )}
                {!loading && users.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 56, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>No users match your filters.</td></tr>
                )}
                {!loading && users.map((u, i) => {
                  const isSelf = u.id === currentUserId;
                  const isDrawerOpen = drawer === u.id;
                  const disabled = !canEditRoles || isSelf || roleUpdating === u.id;
                  return (
                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid #F2F4F7" : "none", background: isDrawerOpen ? "#FAFBFF" : "transparent" }}>
                      <td style={{ padding: "13px 16px" }}>
                        <span onClick={() => setDrawer(isDrawerOpen ? null : u.id)} style={{ fontSize: 13, fontWeight: 700, color: "#2563EB", cursor: "pointer" }}>
                          {u.name}
                        </span>
                        {isSelf && <span style={{ marginLeft: 6, fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>(you)</span>}
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#667085" }}>{u.email}</td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#667085", whiteSpace: "nowrap" }}>{u.phone ?? "—"}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <select
                          value={u.role}
                          disabled={disabled}
                          onChange={(e) => changeRole(u.id, e.target.value as Role)}
                          title={isSelf ? "You can't change your own role" : !canEditRoles ? "Only Admins can change roles" : undefined}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: "4px 8px", borderRadius: 7,
                            border: `1px solid ${ROLE_META[u.role].color}33`,
                            color: ROLE_META[u.role].color, background: ROLE_META[u.role].bg,
                            cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1,
                          }}
                        >
                          {ROLE_OPTIONS.map(r => (
                            <option key={r} value={r}>{ROLE_META[r].label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>{fmtDate(u.createdAt)}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{u._count.shipments}</td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151" }}>{u._count.deliveries}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <button onClick={() => setDrawer(isDrawerOpen ? null : u.id)} style={{
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
            {total === 0 ? "0 users" : `Page ${page} of ${pages} · ${total} total`}
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
                <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #E4E7EC", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.03em" }}>{drawerDetail.name}</div>
                      <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>{drawerDetail.email}</div>
                    </div>
                    <button onClick={() => setDrawer(null)} style={{ background: "#F8F9FB", border: "1px solid #E4E7EC", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#374151" }}>✕</button>
                  </div>
                  <div style={{ marginTop: 10 }}><RoleBadge role={drawerDetail.role} /></div>
                </div>

                <div style={{ padding: "20px 24px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                    {[
                      ["Phone",  drawerDetail.phone ?? "—"],
                      ["Joined", fmtDate(drawerDetail.createdAt)],
                      ["Shipments (as customer)", String(drawerDetail._count.shipments)],
                      ["Deliveries (as courier)",  String(drawerDetail._count.deliveries)],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: "#F8F9FB", borderRadius: 8, padding: "10px 12px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {drawerDetail.addresses.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Addresses</div>
                      {drawerDetail.addresses.map(a => (
                        <div key={a.id} style={{ background: "#F8F9FB", borderRadius: 8, padding: "10px 12px", marginBottom: 8, fontSize: 12, color: "#374151" }}>
                          {a.label && <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", marginBottom: 2 }}>{a.label}</div>}
                          <div style={{ fontWeight: 600 }}>{a.fullName}</div>
                          <div>{a.line1}{a.line2 ? `, ${a.line2}` : ""}</div>
                          <div>{a.city}, {a.state} {a.zip} · {a.country}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {drawerDetail.shipments.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Recent Shipments</div>
                      {drawerDetail.shipments.map(s => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F2F4F7", fontSize: 12 }}>
                          <div>
                            <div style={{ fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>{s.trackingNumber}</div>
                            {s.destination && <div style={{ color: "#9CA3AF" }}>{s.destination.city}, {s.destination.state}</div>}
                          </div>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, color: "#374151" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[s.status] ?? "#9CA3AF" }} />
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {drawerDetail.deliveries.length > 0 && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Recent Deliveries (as courier)</div>
                      {drawerDetail.deliveries.map(s => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #F2F4F7", fontSize: 12 }}>
                          <span style={{ fontFamily: "monospace", color: "#2563EB", fontWeight: 700 }}>{s.trackingNumber}</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, color: "#374151" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[s.status] ?? "#9CA3AF" }} />
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
