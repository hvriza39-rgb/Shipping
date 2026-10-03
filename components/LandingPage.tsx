"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CargoSea from "@/components/CargoSea";

// ─── CONCEPT ────────────────────────────────────────────
// The seascape is the whole site. It is fixed behind everything, the hero
// sits in its sky, and as you scroll the "day" turns to dusk and the ship
// drifts away. Content bands are dark glass over the water.
// Display: Big Shoulders Display · Body: IBM Plex Sans · Mono: IBM Plex Mono

const FEED = [
  ["SHP-M3A2-XQRP", "Delivered", "Los Angeles, CA", "2 min ago"],
  ["SHP-N7B3-YWMQ", "Out for delivery", "Miami, FL", "5 min ago"],
  ["SHP-P9C4-ZTLV", "In transit", "Nashville, TN", "8 min ago"],
  ["SHP-Q2D5-ABKX", "Picked up", "Houston, TX", "12 min ago"],
  ["SHP-R8E6-CVNP", "Confirmed", "Seattle, WA", "15 min ago"],
  ["SHP-S5F7-DWQR", "Delivered", "Boston, MA", "18 min ago"],
];

const STATS = [
  { label: "Packages delivered", value: 52000, suffix: "+" },
  { label: "On-time rate", value: 98, suffix: "%" },
  { label: "Average booking", value: 2, suffix: " min" },
  { label: "Support", value: 24, suffix: "/7" },
];

const FEATURES = [
  { title: "Real-time tracking", desc: "Every status update, the moment it happens. From pickup to doorstep, the record never goes stale." },
  { title: "Same-day booking", desc: "Enter addresses, pick a service level, and you're done in under two minutes. No account setup first." },
  { title: "Digital paperwork", desc: "Invoices, receipts, and shipment history filed automatically. Nothing to chase, nothing to print." },
];

const STEPS = [
  { title: "Book online", desc: "Enter pickup and delivery addresses, package details, and a service level." },
  { title: "We pick it up", desc: "A courier collects your package at the scheduled time and you're notified right away." },
  { title: "Track every move", desc: "Live checkpoint updates from our network, so you always know where it is." },
];

function useCountUp(target: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let t0: number | null = null;
    const step = (ts: number) => {
      if (t0 === null) t0 = ts;
      const p = Math.min((ts - t0) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function Stat({ label, value, suffix, go }: { label: string; value: number; suffix: string; go: boolean }) {
  const n = useCountUp(value, 1400, go);
  return (
    <div className="stat">
      <div className="stat-n">{n.toLocaleString()}<span>{suffix}</span></div>
      <div className="stat-l">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [num, setNum] = useState("");
  const [statsOn, setStatsOn] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const duskRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);

  // scroll → day to dusk, ship drifts away (skipped for reduced motion)
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (duskRef.current) duskRef.current.style.opacity = String(p * 0.4);
      if (sceneRef.current && !calm)
        sceneRef.current.style.transform = `translate3d(${-p * 60}px, ${-p * 24}px, 0) scale(1.08)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && setStatsOn(true), { threshold: 0.4 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const track = (e: FormEvent) => {
    e.preventDefault();
    const v = num.trim();
    router.push(v ? `/track?n=${encodeURIComponent(v)}` : "/track");
  };

  return (
    <div className="ss">
      <style>{CSS}</style>

      <div className="scene" aria-hidden="true">
        <div ref={sceneRef} className="scene-in"><CargoSea /></div>
        <div ref={duskRef} className="dusk" />
      </div>

      <nav className="nav">
        <Link href="/" className="brand">SwiftShip</Link>
        <div className="nav-r">
          <Link href="/track">Track</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/register" className="btn btn-rust">Get started</Link>
        </div>
      </nav>

      <main>
        {/* HERO — headline lives in the sky, ship sails below it */}
        <section className="hero">
          <div className="hero-copy">
            <h1>Every package<br />leaves a wake.</h1>
            <p>Book a pickup, get a tracking number, and follow your shipment checkpoint by checkpoint, from dock to doorstep.</p>
            <form onSubmit={track} className="track">
              <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="Tracking number, e.g. SHP-M3A2-XQRP" aria-label="Tracking number" />
              <button className="btn btn-ink" type="submit">Track</button>
            </form>
            <Link href="/register" className="hero-link">or book a pickup</Link>
          </div>

          <div className="log" aria-label="Recent shipment activity">
            <div className="log-track">
              {[...FEED, ...FEED].map(([id, ev, loc, t], i) => (
                <span key={i} className="log-item">
                  <b>{id}</b> {ev} <i>{loc}</i> {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section ref={statsRef} className="band">
          <div className="wrap stats">
            {STATS.map((s) => <Stat key={s.label} {...s} go={statsOn} />)}
          </div>
        </section>

        {/* FEATURES */}
        <section className="band">
          <div className="wrap">
            <h2>Built for people who actually ship things</h2>
            <div className="feat">
              {FEATURES.map((f) => (
                <div key={f.title} className="feat-i">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROUTE */}
        <section className="band">
          <div className="wrap">
            <h2>From booking to doorstep</h2>
            <ol className="route">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <span className="dot">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="band cta">
          <div className="wrap">
            <h2>Ready to start shipping?</h2>
            <p>Create your free account and book your first shipment today. No credit card required.</p>
            <div className="row">
              <Link href="/register" className="btn btn-white">Create free account</Link>
              <Link href="/login" className="btn btn-line">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <span className="brand">SwiftShip</span>
        <div>
          {["Terms", "Privacy", "Contact"].map((l) => <a key={l} href="#">{l}</a>)}
          <Link href="/track">Track a package</Link>
        </div>
        <small>&copy; 2026 SwiftShip. All rights reserved.</small>
      </footer>
    </div>
  );
}

const CSS = `
.ss{--ink:#10283C;--sea:#2E6286;--rust:#C0654A;--mist:#EAF1F6;--glass:rgba(12,32,50,.5);
  font-family:var(--font-body),system-ui,sans-serif;color:var(--mist);position:relative;overflow-x:hidden}
.ss a{color:inherit;text-decoration:none}
.ss h1,.ss h2,.ss h3,.brand{font-family:var(--font-display),'Arial Narrow',sans-serif;font-weight:600;margin:0;letter-spacing:-.005em}
.scene{position:fixed;inset:0;z-index:0;overflow:hidden;background:#DCE5EE}
.scene-in{position:absolute;inset:0;will-change:transform;transform-origin:70% 60%}
.scene .bg-skyline{width:100%;height:100%;display:block}
.dusk{position:absolute;inset:0;opacity:0;background:linear-gradient(#3A4A78,#12263C)}
.nav{position:fixed;top:12px;left:16px;right:16px;z-index:50;height:54px;padding:0 10px 0 24px;display:flex;align-items:center;justify-content:space-between;
  background:rgba(255,255,255,.55);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.6);border-radius:999px;color:var(--ink)}
.brand{font-size:24px;color:var(--ink)}
.nav-r{display:flex;align-items:center;gap:4px}
.nav-r a{font-size:14px;font-weight:500;padding:8px 14px;color:#2F4558;border-radius:999px}
.nav-r a:hover{background:rgba(255,255,255,.6)}
.btn{display:inline-block;font-weight:600;font-size:15px;border-radius:999px;padding:13px 28px;border:1.5px solid transparent;cursor:pointer;font-family:inherit}
.nav-r .btn{padding:9px 20px;font-size:14px;color:#fff}
.btn-rust{background:var(--rust)}.btn-rust:hover{background:#a85339}
.btn-ink{background:var(--ink);color:#fff}.btn-ink:hover{background:#1b4060}
.btn-white{background:#fff;color:var(--ink)}
.btn-line{border-color:rgba(255,255,255,.7);color:#fff}
.btn:focus-visible,.ss input:focus-visible,.ss a:focus-visible{outline:2px solid #fff;outline-offset:2px}
.hero{position:relative;min-height:100svh;padding:70px 40px 0;display:flex;flex-direction:column}
.hero-copy{max-width:620px;margin-top:10vh;color:var(--ink)}
.hero h1{font-size:clamp(48px,7.5vw,96px);line-height:1}
.hero p{font-size:17px;line-height:1.6;color:var(--ink);max-width:470px;margin:20px 0 22px;padding:14px 20px;background:rgba(255,255,255,.12);backdrop-filter:blur(14px);border-radius:22px}
.track{display:flex;max-width:520px;padding:6px;background:rgba(255,255,255,.85);border-radius:999px;box-shadow:0 14px 36px rgba(16,40,60,.16)}
.track input{flex:1;min-width:0;padding:10px 18px;font:14px var(--font-mono),monospace;border:0;background:transparent;color:var(--ink)}
.track input:focus-visible{outline:none}
.hero-link{display:inline-block;margin:16px 0 0;font-size:14px;font-weight:600;color:var(--ink);padding:8px 16px;background:rgba(255,255,255,.72);backdrop-filter:blur(14px);border-radius:999px}
.log{position:absolute;left:20px;right:20px;bottom:20px;overflow:hidden;background:rgba(12,32,50,.45);backdrop-filter:blur(10px);border-radius:999px;padding:11px 0}
.log-track{display:flex;width:max-content;animation:tick 40s linear infinite}
.log-item{font:11px var(--font-mono),monospace;color:rgba(255,255,255,.8);padding:0 26px;white-space:nowrap}
.log-item b{color:#fff}.log-item i{font-style:normal;color:#BFE0F2}
@keyframes tick{to{transform:translateX(-50%)}}
.band{position:relative;padding:9vh 20px}
.wrap{max-width:1040px;margin:0 auto;padding:52px;background:var(--glass);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.2);border-radius:32px}
.band h2{font-size:clamp(30px,4vw,44px);margin-bottom:36px;line-height:1.1}
.band p{line-height:1.65;color:rgba(234,241,246,.85);margin:0}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.stat{padding:4px 0}
.stat-n{font:500 38px var(--font-mono),monospace;color:#fff}.stat-n span{color:#F4B496}
.stat-l{font-size:14px;color:rgba(234,241,246,.75);margin-top:6px}
.feat{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.feat-i{background:rgba(255,255,255,.08);border-radius:22px;padding:24px}
.ss h3{font-size:22px;margin-bottom:10px;color:#fff}
.feat p,.route p{font-size:15px}
.route{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;position:relative}
.route::before{content:"";position:absolute;top:19px;left:20px;right:20px;border-top:2px dotted rgba(255,255,255,.4)}
.route li{position:relative}
.dot{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;margin-bottom:18px;
  background:#fff;font:600 14px var(--font-mono),monospace;color:var(--ink)}
.cta .wrap{max-width:640px;text-align:center;background:rgba(192,101,74,.82);border-color:rgba(255,255,255,.3)}
.cta p{color:rgba(255,255,255,.92);max-width:480px;margin:0 auto 28px}
.cta h2{margin-bottom:14px}
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.foot{position:relative;margin:0 16px 16px;background:rgba(12,32,50,.6);backdrop-filter:blur(14px);border-radius:28px;padding:28px 32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.foot div{display:flex;gap:24px;flex-wrap:wrap}.foot a{font-size:13px;color:rgba(255,255,255,.7)}.foot a:hover{color:#fff}
.foot small{font:11px var(--font-mono),monospace;color:rgba(255,255,255,.5)}
@media(max-width:760px){
  .nav{left:10px;right:10px;padding-left:18px}.nav-r a:not(.btn){display:none}
  .hero{padding:70px 20px 0}.band{padding:6vh 12px}.wrap{padding:28px 22px;border-radius:26px}
  .stats{grid-template-columns:1fr 1fr}.feat,.route{grid-template-columns:1fr}.route::before{display:none}
  .log{left:12px;right:12px}
}
@media(prefers-reduced-motion:reduce){.log-track{animation:none}}
`;
