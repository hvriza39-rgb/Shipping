"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────

interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface PackageDetails {
  serviceType: string;
  weightKg: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  description: string;
  declaredValue: string;
  notes: string;
}

const EMPTY_ADDRESS: Address = {
  fullName: "", phone: "", line1: "", line2: "",
  city: "", state: "", zip: "", country: "US",
};

const EMPTY_PACKAGE: PackageDetails = {
  serviceType: "STANDARD",
  weightKg: "", lengthCm: "", widthCm: "", heightCm: "",
  description: "", declaredValue: "", notes: "",
};

const SERVICE_OPTIONS = [
  { value: "STANDARD",  label: "Standard",  desc: "3–7 business days",   price: "From $8.99"  },
  { value: "EXPRESS",   label: "Express",   desc: "1–3 business days",   price: "From $19.99" },
  { value: "OVERNIGHT", label: "Overnight", desc: "Next business day",   price: "From $39.99" },
  { value: "FREIGHT",   label: "Freight",   desc: "Large / heavy items", price: "From $79.99" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV",
  "NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
  "TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

// ─── Shared styles ────────────────────────────────────

const input: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: 8,
  border: "1.5px solid #E4E7EC", fontSize: 14, color: "#101828",
  outline: "none", background: "#fff", fontFamily: "inherit",
};
const inputFocus: React.CSSProperties = { ...input, border: "1.5px solid #2563EB" };
const label: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 };
const fieldWrap: React.CSSProperties = { display: "flex", flexDirection: "column", marginBottom: 16 };
const row: React.CSSProperties = { display: "flex", gap: 14 };

function Field({
  label: lbl, value, onChange, placeholder, type = "text", required = false, children,
}: {
  label: string; value?: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
  children?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={fieldWrap}>
      <label style={label}>{lbl}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}</label>
      {children ?? (
        <input
          type={type} value={value} required={required}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={focused ? inputFocus : input}
        />
      )}
    </div>
  );
}

function Select({ label: lbl, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; required?: boolean;
}) {
  return (
    <div style={fieldWrap}>
      <label style={label}>{lbl}{required && <span style={{ color: "#EF4444", marginLeft: 2 }}>*</span>}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)} required={required}
        style={{ ...input, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36, cursor: "pointer" }}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Step components ──────────────────────────────────

function AddressForm({ title, address, onChange }: {
  title: string; address: Address; onChange: (a: Address) => void;
}) {
  const set = (field: keyof Address) => (val: string) => onChange({ ...address, [field]: val });
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0C1421", letterSpacing: "-0.03em", margin: "0 0 4px" }}>{title}</h2>
      <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 24px" }}>Enter the {title.toLowerCase()} details.</p>

      <div style={row}>
        <div style={{ flex: 1 }}>
          <Field label="Full name" value={address.fullName} onChange={set("fullName")} placeholder="Jane Doe" required />
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Phone" value={address.phone} onChange={set("phone")} placeholder="+1 555-000-0000" type="tel" required />
        </div>
      </div>

      <Field label="Address line 1" value={address.line1} onChange={set("line1")} placeholder="123 Main St" required />
      <Field label="Address line 2" value={address.line2} onChange={set("line2")} placeholder="Apt, suite, unit (optional)" />

      <div style={row}>
        <div style={{ flex: 2 }}>
          <Field label="City" value={address.city} onChange={set("city")} placeholder="New York" required />
        </div>
        <div style={{ flex: 1 }}>
          <Field label="State" required>
            <select
              value={address.state} onChange={(e) => set("state")(e.target.value)} required
              style={{ ...input, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36, cursor: "pointer" }}
            >
              <option value="">State</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="ZIP" value={address.zip} onChange={set("zip")} placeholder="10001" required />
        </div>
      </div>
    </div>
  );
}

function PackageForm({ pkg, onChange }: { pkg: PackageDetails; onChange: (p: PackageDetails) => void }) {
  const set = (field: keyof PackageDetails) => (val: string) => onChange({ ...pkg, [field]: val });
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0C1421", letterSpacing: "-0.03em", margin: "0 0 4px" }}>Package Details</h2>
      <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 24px" }}>Tell us about what you're shipping.</p>

      {/* Service type */}
      <div style={{ marginBottom: 20 }}>
        <label style={label}>Service Type<span style={{ color: "#EF4444", marginLeft: 2 }}>*</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SERVICE_OPTIONS.map((s) => {
            const active = pkg.serviceType === s.value;
            return (
              <button key={s.value} type="button" onClick={() => set("serviceType")(s.value)} style={{
                padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                border: `1.5px solid ${active ? "#2563EB" : "#E4E7EC"}`,
                background: active ? "#EFF6FF" : "#fff",
                transition: "border-color 0.12s, background 0.12s",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#2563EB" : "#101828", marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{s.desc}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: active ? "#2563EB" : "#374151", marginTop: 4 }}>{s.price}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Weight */}
      <Field label="Weight (kg)" value={pkg.weightKg} onChange={set("weightKg")} placeholder="e.g. 2.5" type="number" required />

      {/* Dimensions */}
      <div style={{ marginBottom: 16 }}>
        <label style={label}>Dimensions (cm) <span style={{ color: "#9CA3AF", fontWeight: 400 }}>— optional</span></label>
        <div style={row}>
          {(["lengthCm", "widthCm", "heightCm"] as const).map((dim) => (
            <div key={dim} style={{ flex: 1 }}>
              <input
                type="number" value={pkg[dim]}
                onChange={(e) => set(dim)(e.target.value)}
                placeholder={dim === "lengthCm" ? "L" : dim === "widthCm" ? "W" : "H"}
                style={input}
              />
            </div>
          ))}
        </div>
      </div>

      <Field label="Contents / Description" value={pkg.description} onChange={set("description")} placeholder="e.g. Electronics, clothing, documents…" required />
      <Field label="Declared Value (USD)" value={pkg.declaredValue} onChange={set("declaredValue")} placeholder="e.g. 200" type="number" />
      <Field label="Notes for courier" value={pkg.notes} onChange={set("notes")} placeholder="Fragile, leave at door, etc." />
    </div>
  );
}

function ReviewSection({ label: lbl, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F2F4F7" }}>
      <span style={{ fontSize: 13, color: "#667085", fontWeight: 500 }}>{lbl}</span>
      <span style={{ fontSize: 13, color: "#101828", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
    </div>
  );
}

function ReviewForm({ origin, destination, pkg }: { origin: Address; destination: Address; pkg: PackageDetails }) {
  const service = SERVICE_OPTIONS.find((s) => s.value === pkg.serviceType)!;
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0C1421", letterSpacing: "-0.03em", margin: "0 0 4px" }}>Review & Confirm</h2>
      <p style={{ fontSize: 13, color: "#9CA3AF", margin: "0 0 24px" }}>Double-check everything before submitting.</p>

      {[
        { title: "Origin", addr: origin },
        { title: "Destination", addr: destination },
      ].map(({ title, addr }) => (
        <div key={title} style={{ background: "#F8F9FB", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
          <ReviewSection label="Name"    value={addr.fullName} />
          <ReviewSection label="Phone"   value={addr.phone} />
          <ReviewSection label="Address" value={[addr.line1, addr.line2].filter(Boolean).join(", ")} />
          <ReviewSection label="City"    value={`${addr.city}, ${addr.state} ${addr.zip}`} />
        </div>
      ))}

      <div style={{ background: "#F8F9FB", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Package</div>
        <ReviewSection label="Service"        value={`${service.label} — ${service.desc}`} />
        <ReviewSection label="Weight"         value={`${pkg.weightKg} kg`} />
        <ReviewSection label="Dimensions"     value={pkg.lengthCm ? `${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} cm` : "—"} />
        <ReviewSection label="Contents"       value={pkg.description} />
        <ReviewSection label="Declared Value" value={pkg.declaredValue ? `$${pkg.declaredValue}` : "—"} />
        <ReviewSection label="Notes"          value={pkg.notes} />
      </div>

      <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 10, padding: "12px 16px" }}>
        <div style={{ fontSize: 13, color: "#1D4ED8", fontWeight: 600 }}>
          Estimated cost: <span style={{ fontWeight: 800 }}>{service.price}</span>
        </div>
        <div style={{ fontSize: 12, color: "#3B82F6", marginTop: 3 }}>
          Final price confirmed after courier review.
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────

const STEPS = ["Origin", "Destination", "Package", "Review"];

export default function BookShipment() {
  const router = useRouter();
  const [step, setStep]           = useState(0);
  const [origin, setOrigin]       = useState<Address>(EMPTY_ADDRESS);
  const [destination, setDest]    = useState<Address>(EMPTY_ADDRESS);
  const [pkg, setPkg]             = useState<PackageDetails>(EMPTY_PACKAGE);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const isAddressValid = (a: Address) =>
    a.fullName && a.phone && a.line1 && a.city && a.state && a.zip;

  const canAdvance = () => {
    if (step === 0) return isAddressValid(origin);
    if (step === 1) return isAddressValid(destination);
    if (step === 2) return !!pkg.weightKg && !!pkg.description;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceType:   pkg.serviceType,
          weightKg:      parseFloat(pkg.weightKg),
          lengthCm:      pkg.lengthCm ? parseFloat(pkg.lengthCm) : null,
          widthCm:       pkg.widthCm  ? parseFloat(pkg.widthCm)  : null,
          heightCm:      pkg.heightCm ? parseFloat(pkg.heightCm) : null,
          description:   pkg.description,
          declaredValue: pkg.declaredValue ? parseFloat(pkg.declaredValue) : null,
          notes:         pkg.notes || null,
          origin,
          destination,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push(`/shipments/${data.id}?booked=1`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "36px", maxWidth: 680, margin: "0 auto" }}>

      {/* Page title */}
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: "#0C1421", margin: "0 0 28px" }}>Book a Shipment</h1>

      {/* Progress */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
        {STEPS.map((s, i) => {
          const done   = i < step;
          const active = i === step;
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800,
                  background: done ? "#2563EB" : active ? "#EFF6FF" : "#F3F4F6",
                  color: done ? "#fff" : active ? "#2563EB" : "#9CA3AF",
                  border: active ? "2px solid #2563EB" : "none",
                  transition: "all 0.2s",
                }}>
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  ) : i + 1}
                </div>
                <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "#2563EB" : done ? "#374151" : "#9CA3AF", whiteSpace: "nowrap" }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, background: done ? "#2563EB" : "#E4E7EC", margin: "0 8px", marginBottom: 18, transition: "background 0.2s" }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div style={{ background: "#D2EEEC", border: "1px solid #E4E7EC", borderRadius: 14, padding: "28px 28px" }}>
        {step === 0 && <AddressForm title="Origin Address"      address={origin}      onChange={setOrigin} />}
        {step === 1 && <AddressForm title="Destination Address" address={destination} onChange={setDest}   />}
        {step === 2 && <PackageForm pkg={pkg} onChange={setPkg} />}
        {step === 3 && <ReviewForm origin={origin} destination={destination} pkg={pkg} />}

        {error && (
          <div style={{ background: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 500, marginTop: 16 }}>
            {error}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid #F2F4F7" }}>
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "1.5px solid #E4E7EC",
              background: "#fff", fontSize: 13, fontWeight: 600, color: "#374151",
              cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.4 : 1,
            }}
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              style={{
                padding: "10px 24px", borderRadius: 8, border: "none",
                background: canAdvance() ? "#2563EB" : "#93C5FD",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: canAdvance() ? "pointer" : "not-allowed",
              }}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "10px 28px", borderRadius: 8, border: "none",
                background: loading ? "#93C5FD" : "#2563EB",
                color: "#fff", fontSize: 13, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Submitting…" : "Confirm Shipment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
