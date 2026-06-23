"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ─── DESIGN TOKENS ──────────────────────────────────────
// Display: Big Shoulders Display (condensed, industrial — crate-stencil energy)
// Body:    IBM Plex Sans (plain, official, form-like)
// Mono:    IBM Plex Mono (tracking numbers, codes, ledger figures)
const DISPLAY = "var(--font-display), 'Arial Narrow', sans-serif";
const BODY    = "var(--font-body), system-ui, sans-serif";
const MONO    = "var(--font-mono), 'Courier New', monospace";

const PAPER       = "#AADAC8";
const PAPER_LIGHT = "#FBF8EF";
const PAPER_LINE  = "#D8CBAA";
const PAPER_DARK  = "#E6D9B8";
const INK         = "#1C2B3A";
const INK_SOFT    = "#4B5A68";
const NIGHT       = "#14181C";
const STAMP       = "#B23A2E";
const ROUTE       = "#2C6E78";
const LEDGER_GREEN = "#3F7D5C";

const MANIFEST_FEED = [
  { id: "SHP-M3A2-XQRP", event: "Delivered",        location: "Los Angeles, CA", time: "2 min ago" },
  { id: "SHP-N7B3-YWMQ", event: "Out for Delivery", location: "Miami, FL",       time: "5 min ago" },
  { id: "SHP-P9C4-ZTLV", event: "In Transit",       location: "Nashville, TN",   time: "8 min ago" },
  { id: "SHP-Q2D5-ABKX", event: "Picked Up",        location: "Houston, TX",     time: "12 min ago" },
  { id: "SHP-R8E6-CVNP", event: "Confirmed",        location: "Seattle, WA",     time: "15 min ago" },
  { id: "SHP-S5F7-DWQR", event: "Delivered",        location: "Boston, MA",      time: "18 min ago" },
  { id: "SHP-T1G8-EXMS", event: "In Transit",       location: "Chicago, IL",     time: "22 min ago" },
  { id: "SHP-U4H9-FYNP", event: "Out for Delivery", location: "Phoenix, AZ",     time: "25 min ago" },
];

const STATUS_INK: Record<string, string> = {
  "Delivered":        LEDGER_GREEN,
  "Out for Delivery": STAMP,
  "In Transit":       ROUTE,
  "Picked Up":        "#8A6D3B",
  "Confirmed":        INK_SOFT,
};

const PACKING_LIST = [
  { code: "01", title: "Real-time tracking", desc: "Every status update, the moment it happens. From pickup to doorstep, the manifest never goes stale." },
  { code: "02", title: "Same-day booking",   desc: "Enter addresses, pick a service level, done in under two minutes — no account setup required first." },
  { code: "03", title: "Digital paperwork",  desc: "Invoices, receipts, and shipment history filed automatically. Nothing to chase, nothing to print." },
];

const ROUTE_STATIONS = [
  { n: "01", title: "Book online",      desc: "Enter pickup and delivery addresses, package details, and choose your service level." },
  { n: "02", title: "We pick it up",    desc: "A courier collects your package at the scheduled time. You're notified the moment it's in hand." },
  { n: "03", title: "Track every move", desc: "Live checkpoint updates from our network. Know exactly where your package is, always." },
];

const LEDGER_STATS = [
  { label: "Packages delivered",     value: 52000, suffix: "+" },
  { label: "On-time delivery rate",  value: 98,    suffix: "%" },
  { label: "Average booking time",   value: 2,     suffix: " min" },
  { label: "Support availability",   value: 24,    suffix: "/7" },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function LedgerRow({ label, value, suffix, animate }: { label: string; value: number; suffix: string; animate: boolean }) {
  const count = useCountUp(value, 1400, animate);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "16px 0", borderBottom: `1px dashed ${PAPER_LINE}` }}>
      <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.08em", color: INK_SOFT, textTransform: "uppercase", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span style={{ flex: 1, borderBottom: "1px dotted #B9AC8A", marginBottom: 6 }} />
      <span style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, color: INK, whiteSpace: "nowrap" }}>
        {count.toLocaleString()}<span style={{ color: STAMP }}>{suffix}</span>
      </span>
    </div>
  );
}

export default function LandingPage() {
  const [ledgerVisible, setLedgerVisible] = useState(false);
  const ledgerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setLedgerVisible(true); },
      { threshold: 0.3 }
    );
    if (ledgerRef.current) obs.observe(ledgerRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: BODY, color: INK, overflowX: "hidden", background: PAPER }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", background: NIGHT, borderBottom: `2px solid ${STAMP}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: STAMP, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
              <rect x="9" y="11" width="14" height="10" rx="2" />
              <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            </svg>
          </div>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: "#fff", letterSpacing: "0.01em", textTransform: "uppercase" }}>
            SwiftShip
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Link href="/track" className="nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, textDecoration: "none", padding: "7px 14px", transition: "color 0.15s" }}>Track</Link>
          <Link href="/login" className="nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, textDecoration: "none", padding: "7px 14px", transition: "color 0.15s" }}>Sign in</Link>
          <Link href="/register" className="btn-p" style={{ background: STAMP, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", padding: "8px 18px", borderRadius: 3, marginLeft: 4, transition: "background 0.15s" }}>Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 58, position: "relative", overflow: "hidden" }}>

        {/* barcode strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 40px", borderBottom: `1px solid ${PAPER_LINE}` }}>
          <div style={{
            height: 16, width: 220,
            backgroundImage: "repeating-linear-gradient(90deg, #1C2B3A 0px, #1C2B3A 2px, transparent 2px, transparent 5px, #1C2B3A 5px, #1C2B3A 6px, transparent 6px, transparent 11px, #1C2B3A 11px, #1C2B3A 14px, transparent 14px, transparent 18px)",
            opacity: 0.8,
          }} />
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: INK_SOFT, whiteSpace: "nowrap" }}>
            MANIFEST NO. 7741-SS &middot; ZONE 4
          </span>
        </div>

        <div style={{
          position: "absolute", inset: 0, top: 0,
          backgroundImage: `radial-gradient(${PAPER_LINE} 1px, transparent 1px)`,
          backgroundSize: "22px 22px", opacity: 0.35, pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", maxWidth: 1160, margin: "0 auto", width: "100%", position: "relative", zIndex: 1, gap: 48, padding: "64px 40px 56px", flexWrap: "wrap" }}>

          {/* Left */}
          <div style={{ maxWidth: 560, minWidth: 300 }}>
            <div className="stamp" style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              border: `2px solid ${STAMP}`, color: STAMP, borderRadius: 4,
              padding: "5px 12px", marginBottom: 26, transform: "rotate(-3deg)",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: LEDGER_GREEN }} />
              <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>TRACKING ACTIVE</span>
            </div>

            <h1 style={{
              fontFamily: DISPLAY, fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700,
              color: INK, letterSpacing: "0.005em", lineHeight: 1.04, margin: 0,
              textTransform: "uppercase",
            }}>
              Every package
              <br />leaves a <span style={{ color: STAMP }}>record.</span>
            </h1>

            <p style={{ fontFamily: BODY, fontSize: 17, color: INK_SOFT, lineHeight: 1.7, margin: "22px 0 36px", maxWidth: 430 }}>
              Book a pickup, get a tracking number, and watch the manifest update at every checkpoint — from dock to doorstep.
            </p>

            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/register" className="btn-p" style={{ background: INK, color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", padding: "13px 28px", borderRadius: 3, transition: "background 0.15s", letterSpacing: "0.01em" }}>
                Start shipping &rarr;
              </Link>
              <Link href="/track" className="btn-o" style={{ color: INK, fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "12px 20px", borderRadius: 3, border: `1.5px solid ${INK}`, transition: "background 0.15s" }}>
                Track a package
              </Link>
            </div>
          </div>

          {/* Right — torn label stub */}
          <div style={{ flexShrink: 0, position: "relative" }}>
            <div style={{
              background: PAPER_LIGHT, border: `1.5px solid ${PAPER_LINE}`, borderRadius: 4,
              padding: 26, width: 320, boxShadow: "0 18px 40px rgba(28,43,58,0.12)",
              borderTopStyle: "dashed", position: "relative",
            }}>
              <div style={{
                position: "absolute", top: -10, right: 22, border: `2px solid ${STAMP}`, color: STAMP,
                fontFamily: MONO, fontWeight: 700, fontSize: 10, letterSpacing: "0.1em",
                padding: "3px 8px", borderRadius: 3, background: PAPER_LIGHT, transform: "rotate(6deg)",
              }}>
                VERIFIED
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: INK_SOFT, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Tracking No.</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: ROUTE, fontWeight: 700 }}>SHP-M3A2-XQRP</div>
                </div>
                <div style={{ background: "rgba(63,125,92,0.12)", color: LEDGER_GREEN, fontFamily: MONO, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 3, border: `1px solid ${LEDGER_GREEN}` }}>
                  Delivered &#10003;
                </div>
              </div>

              <div style={{ borderTop: `1px dashed ${PAPER_LINE}`, borderBottom: `1px dashed ${PAPER_LINE}`, padding: "10px 4px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: INK_SOFT, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>From</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: INK }}>NYC</div>
                </div>
                <div style={{ flex: 1, height: 1, background: PAPER_LINE }} />
                <span style={{ fontSize: 14, color: INK_SOFT }}>&#9992;</span>
                <div style={{ flex: 1, height: 1, background: PAPER_LINE }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: INK_SOFT, fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>To</div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 700, color: INK }}>LAX</div>
                </div>
              </div>

              {[
                { label: "Order Placed",     time: "Jun 19, 8:30 AM" },
                { label: "Picked Up",        time: "Jun 19, 2:00 PM" },
                { label: "In Transit",       time: "Jun 20, 9:00 AM" },
                { label: "Out for Delivery", time: "Jun 21, 7:30 AM" },
                { label: "Delivered",        time: "Jun 21, 2:22 PM" },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: "flex", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 14, flexShrink: 0 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: LEDGER_GREEN, marginTop: 3, flexShrink: 0 }} />
                    {i < arr.length - 1 && <div style={{ width: 1.5, flex: 1, minHeight: 12, background: PAPER_LINE }} />}
                  </div>
                  <div style={{ paddingBottom: 9 }}>
                    <div style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, color: INK }}>{step.label}</div>
                    <div style={{ fontFamily: MONO, fontSize: 10, color: INK_SOFT, marginTop: 1 }}>{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customs-tape ticker */}
        <div style={{ background: PAPER_DARK, borderTop: `1px dashed ${PAPER_LINE}`, borderBottom: `1px dashed ${PAPER_LINE}`, padding: "12px 0", overflow: "hidden" }}>
          <div style={{ display: "flex", animation: "ticker 30s linear infinite", width: "max-content" }}>
            {[...MANIFEST_FEED, ...MANIFEST_FEED].map((evt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 28px", borderRight: `1px solid ${PAPER_LINE}`, whiteSpace: "nowrap" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_INK[evt.event] ?? INK_SOFT, flexShrink: 0 }} />
                <span style={{ fontFamily: MONO, fontSize: 10, color: INK_SOFT, fontWeight: 700 }}>{evt.id}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: STATUS_INK[evt.event] ?? INK_SOFT, fontWeight: 600 }}>{evt.event}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: INK_SOFT }}>{evt.location}</span>
                <span style={{ fontFamily: MONO, fontSize: 10, color: "#8A7C5C" }}>{evt.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEDGER / STATS */}
      <section ref={ledgerRef} style={{ background: PAPER_LIGHT, padding: "72px 40px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: ROUTE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>
            Ledger — Year to date
          </div>
          {LEDGER_STATS.map((s) => (
            <LedgerRow key={s.label} {...s} animate={ledgerVisible} />
          ))}
        </div>
      </section>

      {/* PACKING LIST / FEATURES */}
      <section style={{ background: "#fff", padding: "96px 40px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <div style={{ marginBottom: 44 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: ROUTE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Packing list</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, letterSpacing: "0.005em", color: INK, margin: 0, textTransform: "uppercase" }}>
              Built for people who actually ship things
            </h2>
          </div>
          <div>
            {PACKING_LIST.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 22, alignItems: "flex-start", padding: "26px 0", borderTop: i === 0 ? `1px dashed ${PAPER_LINE}` : undefined, borderBottom: `1px dashed ${PAPER_LINE}` }}>
                <div style={{
                  width: 30, height: 30, flexShrink: 0, border: `1.5px solid ${INK}`, borderRadius: 3,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: MONO, fontSize: 12, fontWeight: 700, color: INK,
                }}>
                  {f.code}
                </div>
                <div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 700, color: INK, letterSpacing: "0.005em", marginBottom: 7, textTransform: "uppercase" }}>{f.title}</div>
                  <div style={{ fontFamily: BODY, fontSize: 14, color: INK_SOFT, lineHeight: 1.65, maxWidth: 520 }}>{f.desc}</div>
                </div>
                <div style={{ marginLeft: "auto", color: LEDGER_GREEN, fontSize: 18, flexShrink: 0 }}>&#10003;</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROUTE / HOW IT WORKS */}
      <section style={{ background: PAPER, padding: "96px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 60 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: ROUTE, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>The route</div>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, letterSpacing: "0.005em", color: INK, margin: 0, textTransform: "uppercase" }}>From booking to doorstep</h2>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 17, left: 0, right: 0, height: 0, borderTop: `2px dashed ${PAPER_LINE}`, zIndex: 0 }} />
            <div style={{ display: "flex", gap: 0, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
              {ROUTE_STATIONS.map((s, i) => (
                <div key={i} style={{ flex: 1, minWidth: 220, paddingRight: 32 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", background: PAPER, border: `2px solid ${INK}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: MONO, fontSize: 13, fontWeight: 700, color: INK, marginBottom: 18,
                  }}>
                    {s.n}
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 700, color: INK, letterSpacing: "0.005em", marginBottom: 9, textTransform: "uppercase" }}>{s.title}</div>
                  <div style={{ fontFamily: BODY, fontSize: 13.5, color: INK_SOFT, lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WAREHOUSE IMAGE */}
      <section style={{ position: "relative", height: 460, overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80"
          alt="Warehouse operations"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(90deg, ${NIGHT} 0%, rgba(20,24,28,0.3) 100%)` }} />
        <div style={{
          position: "absolute", top: 28, right: 28, border: "2px solid #fff", color: "#fff",
          fontFamily: MONO, fontWeight: 700, fontSize: 11, letterSpacing: "0.1em",
          padding: "5px 12px", borderRadius: 3, transform: "rotate(5deg)",
        }}>
          VERIFIED ROUTE
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 80px" }}>
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, color: "#fff", letterSpacing: "0.005em", margin: "0 0 14px", lineHeight: 1.15, textTransform: "uppercase" }}>
              Infrastructure built for scale
            </h2>
            <p style={{ fontFamily: BODY, fontSize: 15, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, margin: "0 0 26px" }}>
              Our courier network covers all 50 states, with same-day and overnight options across major cities.
            </p>
            <Link href="/register" className="btn-w" style={{ display: "inline-block", background: "#fff", color: NIGHT, fontWeight: 700, fontSize: 14, textDecoration: "none", padding: "12px 24px", borderRadius: 3, transition: "background 0.15s" }}>
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* PHOTO GRID / FIELD NOTES */}
      <section style={{ background: "#fff", padding: "96px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={{ flex: 2, minWidth: 280 }}>
              <div style={{ borderRadius: 4, overflow: "hidden", height: 320 }}>
                <img src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=900&q=80" alt="Delivery van" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, letterSpacing: "0.06em", marginTop: 10, textTransform: "uppercase" }}>Last mile &mdash; Phoenix, AZ</div>
            </div>
            <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ borderRadius: 4, overflow: "hidden", height: 145 }}>
                  <img src="https://images.unsplash.com/photo-1524508762098-b9f8c975d5ec?w=600&q=80" alt="Packages" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, letterSpacing: "0.06em", marginTop: 10, textTransform: "uppercase" }}>Sorting &mdash; Atlanta, GA</div>
              </div>
              <div>
                <div style={{ borderRadius: 4, overflow: "hidden", height: 113 }}>
                  <img src="https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&q=80" alt="Courier" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: INK_SOFT, letterSpacing: "0.06em", marginTop: 10, textTransform: "uppercase" }}>Dock handoff &mdash; Dallas, TX</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: STAMP, padding: "96px 40px" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontFamily: DISPLAY, fontSize: 38, fontWeight: 700, color: "#fff", letterSpacing: "0.005em", margin: "0 0 16px", lineHeight: 1.1, textTransform: "uppercase" }}>
            Ready to start shipping?
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 16, color: "rgba(255,255,255,0.85)", margin: "0 0 36px", lineHeight: 1.65 }}>
            Create your free account and book your first shipment today. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-w" style={{ background: "#fff", color: STAMP, fontWeight: 800, fontSize: 14, textDecoration: "none", padding: "13px 30px", borderRadius: 3, transition: "background 0.15s" }}>
              Create free account
            </Link>
            <Link href="/login" className="btn-o" style={{ color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "13px 20px", borderRadius: 3, border: "1.5px solid rgba(255,255,255,0.6)", transition: "background 0.15s" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: NIGHT, padding: "44px 40px", borderTop: `2px dashed ${STAMP}` }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, background: STAMP, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                <rect x="9" y="11" width="14" height="10" rx="2" />
                <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              </svg>
            </div>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "0.01em", textTransform: "uppercase" }}>SwiftShip</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Terms", "Privacy", "Contact", "Track a Package"].map((l) => (
              <a key={l} href="#" className="foot-link" style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}>{l}</a>
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>&#169; 2026 SwiftShip. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
