"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CargoSea from "@./CargoSea";

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
      if (duskRef.current) duskRef.current.style.opacity = String(p * 0.78);
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
.ss{--ink:#10283C;--sea:#2E6286;--rust:#B5573A;--mist:#EAF1F6;--glass:rgba(11,28,44,.8);
  font-family:var(--font-body),system-ui,sans-serif;color:var(--mist);position:relative;overflow-x:hidden}
.ss a{color:inherit;text-decoration:none}
.ss h1,.ss h2,.ss h3,.brand{font-family:var(--font-display),'Arial Narrow',sans-serif;font-weight:700;text-transform:uppercase;margin:0}
.scene{position:fixed;inset:0;z-index:0;overflow:hidden;background:#DCE5EE}
.scene-in{position:absolute;inset:0;will-change:transform;transform-origin:70% 60%}
.scene .bg-skyline{width:100%;height:100%;display:block}
.dusk{position:absolute;inset:0;opacity:0;background:linear-gradient(#1B2A52,#0B1C2C)}
.nav{position:fixed;top:0;left:0;right:0;z-index:50;height:58px;padding:0 40px;display:flex;align-items:center;justify-content:space-between;
  background:rgba(11,28,44,.72);backdrop-filter:blur(10px);border-bottom:2px solid var(--rust)}
.brand{font-size:20px;letter-spacing:.02em;color:#fff}
.nav-r{display:flex;align-items:center;gap:6px}
.nav-r a{font-size:13px;font-weight:500;padding:7px 14px;color:rgba(255,255,255,.7)}
.nav-r a:hover{color:#fff}
.btn{display:inline-block;font-weight:700;font-size:14px;border-radius:3px;padding:12px 24px;border:1.5px solid transparent;cursor:pointer;font-family:inherit}
.nav-r .btn{padding:8px 18px;font-size:13px;color:#fff}
.btn-rust{background:var(--rust)}.btn-rust:hover{background:#9c4730}
.btn-ink{background:var(--ink);color:#fff}.btn-ink:hover{background:#1b4060}
.btn-white{background:#fff;color:var(--rust)}
.btn-line{border-color:rgba(255,255,255,.6);color:#fff}
.btn:focus-visible,.ss input:focus-visible,.ss a:focus-visible{outline:2px solid #fff;outline-offset:2px}
.hero{position:relative;min-height:100svh;padding:58px 40px 0;display:flex;flex-direction:column;justify-content:flex-start}
.hero-copy{max-width:600px;margin-top:9vh;color:var(--ink)}
.hero h1{font-size:clamp(46px,7.5vw,92px);line-height:.98}
.hero p{font-size:17px;line-height:1.65;color:#2F4558;max-width:460px;margin:20px 0 28px}
.track{display:flex;max-width:520px;box-shadow:0 12px 32px rgba(16,40,60,.18)}
.track input{flex:1;min-width:0;padding:14px 16px;font:14px var(--font-mono),monospace;border:1.5px solid var(--ink);border-right:0;border-radius:3px 0 0 3px;background:#fff;color:var(--ink)}
.track .btn{border-radius:0 3px 3px 0}
.hero-link{display:inline-block;margin-top:16px;font-size:14px;font-weight:600;color:var(--ink);border-bottom:1.5px solid var(--rust)}
.log{position:absolute;left:0;right:0;bottom:0;overflow:hidden;background:rgba(11,28,44,.7);backdrop-filter:blur(6px);padding:11px 0}
.log-track{display:flex;width:max-content;animation:tick 40s linear infinite}
.log-item{font:11px var(--font-mono),monospace;color:rgba(255,255,255,.75);padding:0 28px;border-right:1px solid rgba(255,255,255,.15);white-space:nowrap}
.log-item b{color:#fff}.log-item i{font-style:normal;color:#9CC4DD}
@keyframes tick{to{transform:translateX(-50%)}}
.band{position:relative;background:var(--glass);backdrop-filter:blur(10px);padding:88px 40px}
.wrap{max-width:1040px;margin:0 auto}
.band h2{font-size:clamp(30px,4vw,42px);margin-bottom:44px;line-height:1.08}
.band p{line-height:1.65;color:rgba(234,241,246,.78);margin:0}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.stat{border-top:2px solid var(--rust);padding-top:14px}
.stat-n{font:700 40px var(--font-mono),monospace;color:#fff}.stat-n span{color:#F0A27F}
.stat-l{font-size:13px;color:rgba(234,241,246,.7);margin-top:6px}
.feat{display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.feat-i{border-top:1px solid rgba(255,255,255,.25);padding-top:20px}
.ss h3{font-size:20px;margin-bottom:10px;color:#fff}
.feat p,.route p{font-size:14.5px}
.route{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:40px;position:relative}
.route::before{content:"";position:absolute;top:17px;left:0;right:0;border-top:2px dashed rgba(255,255,255,.3)}
.route li{position:relative}
.dot{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;margin-bottom:18px;
  background:#0B1C2C;border:2px solid #fff;font:700 13px var(--font-mono),monospace;color:#fff}
.cta{background:rgba(181,87,58,.94);text-align:center}
.cta p{color:rgba(255,255,255,.88);max-width:500px;margin:0 auto 30px}
.cta .wrap{max-width:600px}.cta h2{margin-bottom:16px}
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.foot{position:relative;background:#0B1C2C;padding:40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;border-top:2px dashed var(--rust)}
.foot div{display:flex;gap:24px;flex-wrap:wrap}.foot a{font-size:12px;color:rgba(255,255,255,.55)}.foot a:hover{color:#fff}
.foot small{font:11px var(--font-mono),monospace;color:rgba(255,255,255,.4)}
@media(max-width:760px){
  .nav{padding:0 16px}.nav-r a:not(.btn){display:none}
  .hero{padding:58px 20px 0}.band{padding:64px 20px}.foot{padding:32px 20px}
  .stats{grid-template-columns:1fr 1fr}.feat,.route{grid-template-columns:1fr;gap:28px}.route::before{display:none}
}
@media(prefers-reduced-motion:reduce){.log-track{animation:none}}
`;
