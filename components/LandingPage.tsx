"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TICKER_EVENTS = [
  { id: "SHP-M3A2-XQRP", event: "Delivered",        location: "Los Angeles, CA",  time: "2 min ago"  },
  { id: "SHP-N7B3-YWMQ", event: "Out for Delivery", location: "Miami, FL",        time: "5 min ago"  },
  { id: "SHP-P9C4-ZTLV", event: "In Transit",       location: "Nashville, TN",    time: "8 min ago"  },
  { id: "SHP-Q2D5-ABKX", event: "Picked Up",        location: "Houston, TX",      time: "12 min ago" },
  { id: "SHP-R8E6-CVNP", event: "Confirmed",        location: "Seattle, WA",      time: "15 min ago" },
  { id: "SHP-S5F7-DWQR", event: "Delivered",        location: "Boston, MA",       time: "18 min ago" },
  { id: "SHP-T1G8-EXMS", event: "In Transit",       location: "Chicago, IL",      time: "22 min ago" },
  { id: "SHP-U4H9-FYNP", event: "Out for Delivery", location: "Phoenix, AZ",      time: "25 min ago" },
];

const STATUS_COLORS: Record<string, string> = {
  "Delivered":        "#22C55E",
  "Out for Delivery": "#F97316",
  "In Transit":       "#0EA5E9",
  "Picked Up":        "#8B5CF6",
  "Confirmed":        "#3B82F6",
};

const FEATURES = [
  { icon: "📍", title: "Real-time tracking",  desc: "Every status update, the moment it happens. From pickup to doorstep, always know where your package is." },
  { icon: "⚡", title: "Same-day booking",    desc: "Book a shipment in under two minutes. Enter addresses, pick your service level, and you're done." },
  { icon: "🧾", title: "Digital paperwork",   desc: "Invoices, receipts, and shipment history all in one place. No more chasing documents." },
];

const STEPS = [
  { n: "01", title: "Book online",      desc: "Enter pickup and delivery addresses, package details, and choose your service level." },
  { n: "02", title: "We pick it up",    desc: "A courier collects your package at the scheduled time. You get a confirmation the moment it's picked up." },
  { n: "03", title: "Track every move", desc: "Live status updates from our team. Know exactly where your package is at all times." },
];

const STATS = [
  { value: 52000, suffix: "+",   label: "Packages delivered"      },
  { value: 98,    suffix: "%",   label: "On-time delivery rate"   },
  { value: 2,     suffix: " min", label: "Average booking time"   },
  { value: 24,    suffix: "/7",  label: "Support availability"    },
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

function StatItem({ value, suffix, label, animate }: { value: number; suffix: string; label: string; animate: boolean }) {
  const count = useCountUp(value, 1600, animate);
  return (
    <div style={{ textAlign: "center", flex: 1, minWidth: 140 }}>
      <div style={{ fontSize: 38, fontWeight: 800, color: "#0C1421", letterSpacing: "-0.04em", lineHeight: 1 }}>
        {count.toLocaleString()}<span style={{ color: "#2563EB" }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 13, color: "#667085", marginTop: 6, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [visible, setVisible]           = useState<Set<string>>(new Set());
  const statsRef                        = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          const key = (e.target as HTMLElement).dataset.s;
          if (e.isIntersecting && key) {
            setVisible((prev) => { const next = new Set(prev); next.add(key); return next; });
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-s]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const vis = (key: string, delay = 0): React.CSSProperties => ({
    opacity: visible.has(key) ? 1 : 0,
    transform: visible.has(key) ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
  });

  const SYNE  = "var(--font-syne), sans-serif";
  const INTER = "var(--font-inter), system-ui, sans-serif";

  return (
    <div style={{ fontFamily: INTER, color: "#101828", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", background: "rgba(12,20,33,0.88)",
        backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, background: "#2563EB", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
              <rect x="9" y="11" width="14" height="10" rx="2"/>
              <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            </svg>
          </div>
          <span style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>SwiftShip</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Link href="/track" className="nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, textDecoration: "none", padding: "7px 14px", transition: "color 0.15s" }}>Track</Link>
          <Link href="/login" className="nav-link" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 500, textDecoration: "none", padding: "7px 14px", transition: "color 0.15s" }}>Sign in</Link>
          <Link href="/register" className="btn-p" style={{ background: "#2563EB", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", padding: "8px 18px", borderRadius: 8, marginLeft: 4, transition: "background 0.15s" }}>Get started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", background: linear-gradient(135deg, #ffffff, #b0eaeb);, display: "flex", flexDirection: "column", justifyContent: "center", padding: "100px 40px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
        <div style={{ position: "absolute", top: "15%", left: "52%", width: 580, height: 580, background: "radial-gradient(circle, rgba(37,99,235,0.16) 0%, transparent 70%)", zIndex: 0, pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1160, margin: "0 auto", width: "100%", position: "relative", zIndex: 1, gap: 48 }}>

          {/* Left */}
          <div style={{ maxWidth: 560 }}>
            <div className="h-title">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(37,99,235,0.15)", border: "1px solid rgba(37,99,235,0.3)", borderRadius: 20, padding: "5px 14px", marginBottom: 26 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulseDot 1.5s ease infinite" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE TRACKING ACTIVE</span>
              </div>
              <h1 style={{ fontFamily: SYNE, fontSize: 56, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1.07, margin: 0 }}>
                Every package,<br />
                <span style={{ color: "#2563EB" }}>always</span> on track.
              </h1>
            </div>
            <p className="h-sub" style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "20px 0 36px", maxWidth: 430 }}>
              Book shipments in minutes, track them in real time, and get delivery confirmations the moment they happen.
            </p>
            <div className="h-cta" style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link href="/register" className="btn-p" style={{ background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", padding: "13px 28px", borderRadius: 10, transition: "background 0.15s", letterSpacing: "-0.01em" }}>
                Start shipping &rarr;
              </Link>
              <Link href="/track" className="btn-o" style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "13px 20px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.13)", transition: "background 0.15s" }}>
                Track a package
              </Link>
            </div>
          </div>

          {/* Right — card mockup */}
          <div className="h-card" style={{ flexShrink: 0 }}>
            <div style={{ background: "#131D2D", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, padding: 26, width: 330, boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Tracking</div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "#3B82F6", fontWeight: 700 }}>SHP-M3A2-XQRP</div>
                </div>
                <div style={{ background: "rgba(34,197,94,0.13)", color: "#22C55E", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(34,197,94,0.28)" }}>
                  Delivered ✓
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>From</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>NYC</div>
                </div>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 14 }}>✈</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>To</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>LAX</div>
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
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", marginTop: 3, flexShrink: 0 }} />
                    {i < arr.length - 1 && <div style={{ width: 1.5, flex: 1, minHeight: 12, background: "rgba(255,255,255,0.07)" }} />}
                  </div>
                  <div style={{ paddingBottom: 9 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{step.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.22)", marginTop: 1 }}>{step.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div style={{ position: "relative", zIndex: 1, marginTop: 56, borderTop: "1px solid rgba(255,255,255,0.06)", padding: "13px 0", overflow: "hidden" }}>
          <div style={{ display: "flex", animation: "ticker 30s linear infinite", width: "max-content" }}>
            {[...TICKER_EVENTS, ...TICKER_EVENTS].map((evt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 28px", borderRight: "1px solid rgba(255,255,255,0.06)", whiteSpace: "nowrap" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_COLORS[evt.event] ?? "#9CA3AF", flexShrink: 0 }} />
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>{evt.id}</span>
                <span style={{ fontSize: 10, color: STATUS_COLORS[evt.event] ?? "#9CA3AF", fontWeight: 600 }}>{evt.event}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{evt.location}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.15)" }}>{evt.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ background: "#fff", padding: "64px 40px", borderBottom: "1px solid #E4E7EC" }}>
        <div style={{ display: "flex", gap: 32, maxWidth: 860, margin: "0 auto", justifyContent: "space-around", flexWrap: "wrap" }}>
          {STATS.map((s) => <StatItem key={s.label} {...s} animate={statsVisible} />)}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "#F8F9FB", padding: "96px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div data-s="feats" style={{ textAlign: "center", marginBottom: 52, ...vis("feats") }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>Why SwiftShip</div>
            <h2 style={{ fontFamily: SYNE, fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", color: "#0C1421", margin: "0 0 12px" }}>Built for people who actually ship things</h2>
            <p style={{ fontSize: 15, color: "#667085", maxWidth: 460, margin: "0 auto" }}>No bloat, no guesswork. Just the tools you need to get packages from A to B.</p>
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {FEATURES.map((f, i) => (
              <div key={i} data-s={`f${i}`} className="feat-card" style={{ flex: 1, minWidth: 240, background: "#fff", borderRadius: 16, padding: "30px 26px", border: "1.5px solid #E4E7EC", ...vis(`f${i}`, i * 0.08) }}>
                <div style={{ fontSize: 30, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#0C1421", letterSpacing: "-0.02em", marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: "#fff", padding: "96px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div data-s="how" style={{ marginBottom: 52, ...vis("how") }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#2563EB", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
            <h2 style={{ fontFamily: SYNE, fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", color: "#0C1421" }}>From booking to doorstep</h2>
          </div>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {STEPS.map((s, i) => (
              <div key={i} data-s={`step${i}`} style={{ flex: 1, minWidth: 220, paddingRight: 40, position: "relative", ...vis(`step${i}`, i * 0.1) }}>
                {i < STEPS.length - 1 && (
                  <div style={{ position: "absolute", top: 18, right: 8, width: 24, height: 1.5, background: "#E4E7EC" }} />
                )}
                <div style={{ fontSize: 13, fontWeight: 800, color: "#2563EB", fontFamily: "monospace", letterSpacing: "0.04em", marginBottom: 14 }}>{s.n}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0C1421", letterSpacing: "-0.03em", marginBottom: 10 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#667085", lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
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
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(12,20,33,0.88) 0%, rgba(12,20,33,0.25) 100%)" }} />
        <div data-s="img" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 80px", ...vis("img") }}>
          <div style={{ maxWidth: 480 }}>
            <h2 style={{ fontFamily: SYNE, fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 14px", lineHeight: 1.15 }}>
              Infrastructure built for scale
            </h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: "0 0 26px" }}>
              Our courier network covers all 50 states, with same-day and overnight options across major cities.
            </p>
            <Link href="/register" className="btn-p" style={{ display: "inline-block", background: "#2563EB", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none", padding: "12px 24px", borderRadius: 9, transition: "background 0.15s" }}>
              Get started free
            </Link>
          </div>
        </div>
      </section>

      {/* PHOTO GRID */}
      <section style={{ background: "#F8F9FB", padding: "96px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div data-s="photos" style={{ display: "flex", gap: 14, ...vis("photos") }}>
            <div style={{ flex: 2, borderRadius: 16, overflow: "hidden", height: 320 }}>
              <img src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=900&q=80" alt="Delivery van" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ flex: 1, borderRadius: 16, overflow: "hidden" }}>
                <img src="https://images.unsplash.com/photo-1524508762098-b9f8c975d5ec?w=600&q=80" alt="Packages" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ flex: 1, borderRadius: 16, overflow: "hidden" }}>
                <img src="https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&q=80" alt="Courier" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#2563EB", padding: "96px 40px" }}>
        <div data-s="cta" style={{ maxWidth: 580, margin: "0 auto", textAlign: "center", ...vis("cta") }}>
          <h2 style={{ fontFamily: SYNE, fontSize: 40, fontWeight: 800, color: "#fff", letterSpacing: "-0.04em", margin: "0 0 16px", lineHeight: 1.1 }}>
            Ready to start shipping?
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", margin: "0 0 36px", lineHeight: 1.65 }}>
            Create your free account and book your first shipment today. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" className="btn-w" style={{ background: "#fff", color: "#2563EB", fontWeight: 800, fontSize: 14, textDecoration: "none", padding: "13px 30px", borderRadius: 10, transition: "background 0.15s" }}>
              Create free account
            </Link>
            <Link href="/login" className="btn-o" style={{ color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: 13, textDecoration: "none", padding: "13px 20px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.22)", transition: "background 0.15s" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0C1421", padding: "44px 40px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, background: "#2563EB", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
                <rect x="9" y="11" width="14" height="10" rx="2"/>
                <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              </svg>
            </div>
            <span style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.02em" }}>SwiftShip</span>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Terms", "Privacy", "Contact", "Track a Package"].map((l) => (
              <a key={l} href="#" className="foot-link" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}>{l}</a>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.18)" }}>&#169; 2026 SwiftShip. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
