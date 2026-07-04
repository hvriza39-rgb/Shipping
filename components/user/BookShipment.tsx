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
  estimatedDeliveryDate: string;
}

const EMPTY_ADDRESS: Address = {
  fullName: "", phone: "", line1: "", line2: "",
  city: "", state: "", zip: "", country: "US",
};

const EMPTY_PACKAGE: PackageDetails = {
  serviceType: "STANDARD",
  weightKg: "", lengthCm: "", widthCm: "", heightCm: "",
  description: "", declaredValue: "", notes: "", estimatedDeliveryDate: "",
};

const SERVICE_OPTIONS = [
  { value: "STANDARD",  label: "Standard",  desc: "3–7 business days" },
  { value: "EXPRESS",   label: "Express",   desc: "1–3 business days" },
  { value: "OVERNIGHT", label: "Overnight", desc: "Next business day" },
  { value: "FREIGHT",   label: "Freight",   desc: "Large / heavy items" },
];

// Maps each service option to its own token pair, so the picker doesn't
// flatten every option to one brand color — matches the tokens already
// defined for service badges elsewhere in the app.
const SERVICE_COLORS: Record<string, { text: string; bg: string }> = {
  STANDARD:  { text: "var(--service-standard-text)",  bg: "var(--service-standard-bg)" },
  EXPRESS:   { text: "var(--service-express-text)",   bg: "var(--service-express-bg)" },
  OVERNIGHT: { text: "var(--service-overnight-text)", bg: "var(--service-overnight-bg)" },
  FREIGHT:   { text: "var(--service-freight-text)",   bg: "var(--service-freight-bg)" },
};

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN",
  "IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV",
  "NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN",
  "TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "MX", name: "Mexico" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "NZ", name: "New Zealand" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "KR", name: "South Korea" },
  { code: "NL", name: "Netherlands" },
  { code: "ZA", name: "South Africa" },
  { code: "AE", name: "United Arab Emirates" },
];

// ─── Shared styles ────────────────────────────────────

const input: React.CSSProperties = {
  width: "100%", padding: "10px 13px", borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)", fontSize: 14, color: "var(--color-ink)",
  outline: "none", background: "var(--color-surface)", fontFamily: "var(--font-sans)",
  transition: "border-color 0.15s",
};
const inputFocus: React.CSSProperties = { ...input, border: "1px solid var(--color-accent-teal)" };
const label: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
  textTransform: "uppercase", color: "var(--color-muted)", display: "block", marginBottom: 7,
};
const fieldWrap: React.CSSProperties = { display: "flex", flexDirection: "column", marginBottom: 16 };
const row: React.CSSProperties = { display: "flex", gap: 14 };
const sectionHeading: React.CSSProperties = {
  fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em",
  color: "var(--color-heading)", margin: "0 0 4px",
};
const sectionSub: React.CSSProperties = {
  fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-subtle)", margin: "0 0 24px",
};

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
      <label style={label}>{lbl}{required && <span style={{ color: "var(--color-error-text)", marginLeft: 2 }}>*</span>}</label>
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
      <label style={label}>{lbl}{required && <span style={{ color: "var(--color-error-text)", marginLeft: 2 }}>*</span>}</label>
      <select
        value={value} onChange={(e) => onChange(e.target.value)} required={required}
        style={{ ...input, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23828C99' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36, cursor: "pointer" }}
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
  const isUS = address.country === "US";

  return (
    <div>
      <h2 style={sectionHeading}>{title}</h2>
      <p style={sectionSub}>Enter the {title.toLowerCase()} details.</p>

      <Select
        label="Country"
        value={address.country}
        onChange={set("country")}
        options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
        required
      />

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
        {isUS ? (
          <div style={{ flex: 1 }}>
            <Field label="State" required>
              <select
                value={address.state} onChange={(e) => set("state")(e.target.value)} required
                style={{ ...input, appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23828C99' stroke-width='2'%3E%3Cpolyline points='6,9 12,15 18,9'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 36, cursor: "pointer" }}
              >
                <option value="">State</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <Field label="Province/Region" value={address.state} onChange={set("state")} placeholder="e.g. Ontario" required />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <Field label={isUS ? "ZIP" : "Postal code"} value={address.zip} onChange={set("zip")} placeholder={isUS ? "10001" : "M5V 3A9"} required />
        </div>
      </div>
    </div>
  );
}

function PackageForm({ pkg, onChange }: { pkg: PackageDetails; onChange: (p: PackageDetails) => void }) {
  const set = (field: keyof PackageDetails) => (val: string) => onChange({ ...pkg, [field]: val });

  const calcEstimate = (serviceType: string): string => {
    const today = new Date();
    let daysToAdd = 3;
    switch (serviceType) {
      case "STANDARD":  daysToAdd = 5; break;
      case "EXPRESS":   daysToAdd = 2; break;
      case "OVERNIGHT": daysToAdd = 1; break;
      case "FREIGHT":   daysToAdd = 7; break;
    }
    const date = new Date(today);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split("T")[0];
  };

  const handleServiceChange = (serviceType: string) => {
    set("serviceType")(serviceType);
    onChange({ ...pkg, serviceType, estimatedDeliveryDate: calcEstimate(serviceType) });
  };

  return (
    <div>
      <h2 style={sectionHeading}>Package Details</h2>
      <p style={sectionSub}>Tell us about what you're shipping.</p>

      <div style={{ marginBottom: 20 }}>
        <label style={label}>Service Type<span style={{ color: "var(--color-error-text)", marginLeft: 2 }}>*</span></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SERVICE_OPTIONS.map((s) => {
            const active = pkg.serviceType === s.value;
            const colors = SERVICE_COLORS[s.value];
            return (
              <button key={s.value} type="button" onClick={() => handleServiceChange(s.value)} style={{
                padding: "12px 14px", borderRadius: "var(--radius-md)", cursor: "pointer", textAlign: "left",
                border: `1.5px solid ${active ? colors.text : "var(--color-border)"}`,
                background: active ? colors.bg : "var(--color-surface)",
                transition: "border-color 0.12s, background 0.12s",
              }}>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 700, color: active ? colors.text : "var(--color-ink)", marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: active ? colors.text : "var(--color-subtle)" }}>{s.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <Field label="Weight (kg)" value={pkg.weightKg} onChange={set("weightKg")} placeholder="e.g. 2.5" type="number" required />

      <div style={{ marginBottom: 16 }}>
        <label style={label}>Dimensions (cm) <span style={{ color: "var(--color-placeholder)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span></label>
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
      <Field label="Estimated Delivery Date" value={pkg.estimatedDeliveryDate} onChange={set("estimatedDeliveryDate")} type="date" />
      <Field label="Notes for courier" value={pkg.notes} onChange={set("notes")} placeholder="Fragile, leave at door, etc." />
    </div>
  );
}

function ReviewSection({ label: lbl, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--color-border-light)" }}>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-muted)", fontWeight: 500 }}>{lbl}</span>
      <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-ink)", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value || "—"}</span>
    </div>
  );
}

function ReviewForm({ origin, destination, pkg }: { origin: Address; destination: Address; pkg: PackageDetails }) {
  const service = SERVICE_OPTIONS.find((s) => s.value === pkg.serviceType)!;
  const originCountry = COUNTRIES.find((c) => c.code === origin.country)?.name || origin.country;
  const destCountry = COUNTRIES.find((c) => c.code === destination.country)?.name || destination.country;

  const cardBox: React.CSSProperties = {
    background: "var(--color-surface-alt)", borderRadius: "var(--radius-md)",
    padding: "14px 16px", marginBottom: 14,
  };
  const cardLabel: React.CSSProperties = {
    fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "var(--color-subtle)",
    letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10,
  };

  return (
    <div>
      <h2 style={sectionHeading}>Review &amp; Confirm</h2>
      <p style={sectionSub}>Double-check everything before submitting.</p>

      {[
        { title: "Origin", addr: origin, country: originCountry },
        { title: "Destination", addr: destination, country: destCountry },
      ].map(({ title, addr, country }) => (
        <div key={title} style={cardBox}>
          <div style={cardLabel}>{title}</div>
          <ReviewSection label="Name"    value={addr.fullName} />
          <ReviewSection label="Phone"   value={addr.phone} />
          <ReviewSection label="Address" value={[addr.line1, addr.line2].filter(Boolean).join(", ")} />
          <ReviewSection label="City"    value={addr.state ? `${addr.city}, ${addr.state} ${addr.zip}` : `${addr.city}, ${addr.zip}`} />
          <ReviewSection label="Country" value={country} />
        </div>
      ))}

      <div style={cardBox}>
        <div style={cardLabel}>Package</div>
        <ReviewSection label="Service"        value={`${service.label} — ${service.desc}`} />
        <ReviewSection label="Weight"         value={`${pkg.weightKg} kg`} />
        <ReviewSection label="Dimensions"     value={pkg.lengthCm ? `${pkg.lengthCm} × ${pkg.widthCm} × ${pkg.heightCm} cm` : "—"} />
        <ReviewSection label="Contents"       value={pkg.description} />
        <ReviewSection label="Declared Value" value={pkg.declaredValue ? `$${pkg.declaredValue}` : "—"} />
        <ReviewSection label="Est. Delivery"  value={pkg.estimatedDeliveryDate ? new Date(pkg.estimatedDeliveryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"} />
        <ReviewSection label="Notes"          value={pkg.notes} />
      </div>

      <div style={{ background: "var(--color-info-bg)", border: "1px solid var(--color-info-border)", borderRadius: "var(--radius-md)", padding: "12px 16px" }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-info-text)", fontWeight: 600 }}>
          Price to be determined by SwiftShip admin
        </div>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--color-info-text)", marginTop: 3, opacity: 0.85 }}>
          Your shipment will be reviewed and quoted within 24 hours.
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
    a.fullName && a.phone && a.line1 && a.city && a.state && a.zip && a.country;

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
          serviceType:       pkg.serviceType,
          weightKg:          parseFloat(pkg.weightKg),
          lengthCm:          pkg.lengthCm ? parseFloat(pkg.lengthCm) : null,
          widthCm:           pkg.widthCm  ? parseFloat(pkg.widthCm)  : null,
          heightCm:          pkg.heightCm ? parseFloat(pkg.heightCm) : null,
          description:       pkg.description,
          declaredValue:     pkg.declaredValue ? parseFloat(pkg.declaredValue) : null,
          notes:             pkg.notes || null,
          estimatedDelivery: pkg.estimatedDeliveryDate || null,
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
    <div style={{ background: "var(--color-bg)", minHeight: "100vh", padding: "36px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <h1 style={{
          fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 600, letterSpacing: "-0.01em",
          color: "var(--color-heading)", margin: "0 0 28px",
        }}>
          Book a Shipment
        </h1>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 32 }}>
          {STEPS.map((s, i) => {
            const done   = i < step;
            const active = i === step;
            return (
              <div key={s} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                    background: done ? "var(--color-primary)" : active ? "var(--color-accent-teal-light)" : "var(--color-surface-alt)",
                    color: done ? "#fff" : active ? "var(--color-accent-teal)" : "var(--color-subtle)",
                    border: active ? "2px solid var(--color-accent-teal)" : "none",
                    transition: "all 0.2s",
                  }}>
                    {done ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase",
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--color-accent-teal)" : done ? "var(--color-body)" : "var(--color-subtle)",
                    whiteSpace: "nowrap",
                  }}>
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1, height: 2, margin: "0 8px", marginBottom: 18, transition: "background 0.2s",
                    background: done ? "var(--color-primary)" : "var(--color-border)",
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <div style={{
          background: "var(--color-surface)", border: "1px solid var(--color-border-light)",
          borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-md)", padding: "28px 28px",
        }}>
          {step === 0 && <AddressForm title="Origin Address"      address={origin}      onChange={setOrigin} />}
          {step === 1 && <AddressForm title="Destination Address" address={destination} onChange={setDest}   />}
          {step === 2 && <PackageForm pkg={pkg} onChange={setPkg} />}
          {step === 3 && <ReviewForm origin={origin} destination={destination} pkg={pkg} />}

          {error && (
            <div style={{
              background: "var(--color-error-bg)", color: "var(--color-error-text)",
              border: "1px solid var(--color-error-border)", borderRadius: "var(--radius-sm)",
              padding: "10px 14px", fontSize: 13, fontWeight: 500, marginTop: 16, fontFamily: "var(--font-sans)",
            }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div style={{
            display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20,
            borderTop: "1px solid var(--color-border-light)",
          }}>
            <button
              type="button"
              className="btn-o"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              style={{
                padding: "10px 20px", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)",
                background: "var(--color-surface)", fontSize: 13, fontWeight: 600, color: "var(--color-body)",
                fontFamily: "var(--font-sans)",
                cursor: step === 0 ? "not-allowed" : "pointer", opacity: step === 0 ? 0.4 : 1,
              }}
            >
              Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                className="btn-p"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                style={{
                  padding: "10px 24px", borderRadius: "var(--radius-sm)", border: "none",
                  background: canAdvance() ? "var(--color-primary)" : "var(--color-primary-light)",
                  color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-sans)",
                  cursor: canAdvance() ? "pointer" : "not-allowed",
                }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="btn-p"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "10px 28px", borderRadius: "var(--radius-sm)", border: "none",
                  background: loading ? "var(--color-primary-light)" : "var(--color-primary)",
                  color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-sans)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Submitting…" : "Confirm Shipment"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
