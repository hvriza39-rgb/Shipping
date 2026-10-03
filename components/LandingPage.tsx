"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CargoSea from "@/components/CargoSea";

const FEED = [
  {
    code: "MSCU4829176",
    origin: "ROTTERDAM",
    destination: "SINGAPORE",
    status: "IN TRANSIT",
    eta: "OCT 14",
  },
  {
    code: "MAEU7319054",
    origin: "HAMBURG",
    destination: "NEW YORK",
    status: "AT SEA",
    eta: "OCT 17",
  },
  {
    code: "CMAU6184329",
    origin: "SHANGHAI",
    destination: "LOS ANGELES",
    status: "LOADED",
    eta: "OCT 21",
  },
  {
    code: "OOLU2948173",
    origin: "BUSAN",
    destination: "ROTTERDAM",
    status: "IN TRANSIT",
    eta: "OCT 19",
  },
  {
    code: "TGHU8526104",
    origin: "DUBAI",
    destination: "FELIXSTOWE",
    status: "AT SEA",
    eta: "OCT 23",
  },
];

const STATS = [
  { value: 184, suffix: "K", label: "SHIPMENTS TRACKED" },
  { value: 97.4, suffix: "%", label: "ON-TIME ARRIVALS", decimals: 1 },
  { value: 142, suffix: "", label: "PORTS CONNECTED" },
  { value: 24, suffix: "/7", label: "GLOBAL VISIBILITY" },
];

const FEATURES = [
  {
    number: "01",
    title: "LIVE POSITION",
    text: "Know where your cargo is across oceans, terminals, and ports with continuously updated vessel intelligence.",
  },
  {
    number: "02",
    title: "ETA INTELLIGENCE",
    text: "Turn vessel movement into clear arrival expectations with route-aware estimated arrival times.",
  },
  {
    number: "03",
    title: "EXCEPTION SIGNALS",
    text: "Surface delays and route changes early, so your team can act before a shipment becomes a problem.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "ENTER",
    text: "Drop in your shipment or container reference.",
  },
  {
    number: "02",
    title: "LOCATE",
    text: "We connect the reference to its current logistics movement.",
  },
  {
    number: "03",
    title: "FOLLOW",
    text: "Watch the journey unfold from origin to destination.",
  },
];

function censorShipmentCode(code: string) {
  if (code.length <= 4) return "••••";

  return `${code.slice(0, -4)}••••`;
}

function useCountUp(
  target: number,
  duration = 1400,
  decimals = 0,
  enabled = true
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);

      // Smooth ease-out.
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = target * eased;

      setValue(
        Number(
          next.toFixed(decimals)
        )
      );

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [target, duration, decimals, enabled]);

  return value;
}

function Stat({
  value,
  suffix,
  label,
  decimals = 0,
}: {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const count = useCountUp(value, 1300, decimals, visible);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="stat">
      <div className="stat-value">
        {count}
        <span>{suffix}</span>
      </div>

      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();

  const duskRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);

  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    let raf = 0;

    const updateDusk = () => {
      raf = 0;

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        maxScroll > 0
          ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1)
          : 0;

      if (duskRef.current) {
        // Day slowly turns toward dusk as the page progresses.
        duskRef.current.style.opacity = String(progress * 0.78);
      }
    };

    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(updateDusk);
      }
    };

    updateDusk();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  const handleTrack = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = trackingNumber.trim();

    if (!value) return;

    router.push(`/track?n=${encodeURIComponent(value)}`);
  };

  return (
    <main className="landing">
      {/* 
        The seascape is the whole site.
        CargoSea owns the ship/parallax scroll animation.
        This page owns the broader day → dusk transition.
      */}
      <div className="scene" aria-hidden="true">
        <CargoSea />
        <div ref={duskRef} className="dusk" />
      </div>

      {/* NAV */}
      <header className="nav-wrap">
        <nav className="nav">
          <Link href="/" className="brand" aria-label="Harbor home">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>

            <span className="brand-name">HARBOR</span>
          </Link>

          <div className="nav-links">
            <a href="#features">CAPABILITIES</a>
            <a href="#how-it-works">HOW IT WORKS</a>
            <a href="#network">NETWORK</a>
          </div>

          <Link href="/track" className="nav-cta">
            TRACK SHIPMENT
            <span>↗</span>
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            GLOBAL FREIGHT VISIBILITY
          </div>

          <h1>
            MOVE CARGO.
            <br />
            <em>SEE EVERYTHING.</em>
          </h1>

          <p className="hero-copy">
            Real-time shipment visibility across the world's ports,
            terminals, and trade lanes.
          </p>

          <form className="track-form" onSubmit={handleTrack}>
            <div className="track-input-wrap">
              <span className="track-prefix">TRACK</span>

              <input
                value={trackingNumber}
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Container or shipment number"
                aria-label="Container or shipment number"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <button type="submit">
              <span>LOCATE CARGO</span>
              <span className="button-arrow">→</span>
            </button>
          </form>

          <div className="hero-note">
            <span>●</span>
            AIS + PORT DATA + CARRIER EVENTS
          </div>
        </div>

        <div className="hero-scroll">
          <span>SCROLL TO EXPLORE</span>
          <span className="scroll-line" />
        </div>
      </section>

      {/* LIVE FEED */}
      <section className="feed-section" id="network">
        <div className="feed-header">
          <div className="section-kicker">
            <span />
            LIVE NETWORK
          </div>

          <div className="feed-status">
            <span className="live-dot" />
            SIGNAL ACTIVE
          </div>
        </div>

        <div className="feed-window">
          <div className="feed-track">
            {[...FEED, ...FEED].map((shipment, index) => (
              <div className="feed-item" key={`${shipment.code}-${index}`}>
                <div className="feed-code">
                  {censorShipmentCode(shipment.code)}
                </div>

                <div className="feed-route">
                  <span>{shipment.origin}</span>
                  <i>→</i>
                  <span>{shipment.destination}</span>
                </div>

                <div className="feed-state">{shipment.status}</div>

                <div className="feed-eta">
                  ETA <strong>{shipment.eta}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="stats-band">
        <div className="stats-grid">
          {STATS.map((stat) => (
            <Stat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              decimals={stat.decimals}
            />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="band features-section" id="features">
        <div className="section-heading">
          <div className="section-kicker">
            <span />
            BUILT FOR THE OCEAN
          </div>

          <h2>
            CLARITY
            <br />
            <em>IN MOTION.</em>
          </h2>

          <p>
            Freight doesn't stop when it leaves the terminal. Your visibility
            shouldn't either.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <div className="feature-number">{feature.number}</div>

              <div className="feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>

              <div className="feature-arrow">↗</div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="band steps-section" id="how-it-works">
        <div className="steps-intro">
          <div className="section-kicker">
            <span />
            HOW IT WORKS
          </div>

          <h2>
            FROM
            <br />
            <em>DOCK TO DOOR.</em>
          </h2>
        </div>

        <div className="steps-list">
          {STEPS.map((step, index) => (
            <div className="step" key={step.number}>
              <div className="step-index">{step.number}</div>

              <div className="step-main">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>

              {index < STEPS.length - 1 && (
                <div className="step-connector" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="cta-glow" />

        <div className="cta-content">
          <div className="section-kicker">
            <span />
            YOUR CARGO, CLEARER
          </div>

          <h2>
            KNOW WHERE
            <br />
            <em>IT'S GOING.</em>
          </h2>

          <p>
            One reference. One view. Every mile of the journey.
          </p>

          <Link href="/track" className="cta-button">
            <span>TRACK A SHIPMENT</span>
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="brand-name">HARBOR</span>
        </div>

        <div className="footer-meta">
          GLOBAL FREIGHT VISIBILITY
        </div>

        <div className="footer-links">
          <a href="#">TERMS</a>
          <a href="#">PRIVACY</a>
          <a href="#">CONTACT</a>
        </div>

        <div className="footer-copy">
          © {new Date().getFullYear()} HARBOR
        </div>
      </footer>

      <style jsx>{`
        .landing {
          position: relative;
          min-height: 100vh;
          overflow: clip;
          background: #07131c;
          color: #f3f1e8;
        }

        .scene {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .dusk {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          opacity: 0;
          background:
            linear-gradient(
              180deg,
              rgba(20, 32, 70, 0.15) 0%,
              rgba(11, 28, 44, 0.38) 45%,
              rgba(5, 17, 27, 0.76) 100%
            );
        }

        .nav-wrap,
        .hero,
        .feed-section,
        .band,
        .stats-band,
        .cta-band,
        .footer {
          position: relative;
          z-index: 3;
        }

        .nav-wrap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
        }

        .nav {
          width: min(1400px, calc(100% - 64px));
          margin: 0 auto;
          min-height: 86px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          width: fit-content;
          color: inherit;
          text-decoration: none;
        }

        .brand-name {
          font-family: var(--font-display), Arial, sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }

        .brand-mark {
          width: 22px;
          height: 20px;
          display: flex;
          align-items: flex-end;
          gap: 3px;
        }

        .brand-mark span {
          display: block;
          width: 5px;
          background: currentColor;
          transform: skewX(-18deg);
        }

        .brand-mark span:nth-child(1) {
          height: 11px;
        }

        .brand-mark span:nth-child(2) {
          height: 16px;
        }

        .brand-mark span:nth-child(3) {
          height: 20px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 34px;
        }

        .nav-links a,
        .nav-cta,
        .footer-links a {
          color: inherit;
          text-decoration: none;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.14em;
          transition: opacity 180ms ease;
        }

        .nav-links a:hover,
        .footer-links a:hover {
          opacity: 0.6;
        }

        .nav-cta {
          justify-self: end;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 11px 15px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(5, 15, 23, 0.18);
        }

        .nav-cta span {
          font-size: 15px;
        }

        .hero {
          min-height: 100svh;
          display: flex;
          align-items: center;
          padding: 130px 32px 90px;
        }

        .hero-inner {
          width: min(1400px, 100%);
          margin: 0 auto;
        }

        .eyebrow,
        .section-kicker {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.16em;
          color: rgba(255, 255, 255, 0.68);
        }

        .eyebrow-dot,
        .section-kicker span {
          width: 5px;
          height: 5px;
          display: inline-block;
          background: currentColor;
          border-radius: 50%;
        }

        h1,
        h2,
        h3,
        p {
          margin: 0;
        }

        .hero h1 {
          max-width: 980px;
          margin-top: 24px;
          font-family: var(--font-display), Arial, sans-serif;
          font-size: clamp(62px, 10vw, 150px);
          line-height: 0.84;
          letter-spacing: -0.065em;
          font-weight: 500;
        }

        .hero h1 em,
        h2 em {
          font-style: normal;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.65);
        }

        .hero-copy {
          max-width: 430px;
          margin-top: 32px;
          font-family: var(--font-body), Arial, sans-serif;
          font-size: 16px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.76);
        }

        .track-form {
          width: min(690px, 100%);
          display: grid;
          grid-template-columns: 1fr auto;
          margin-top: 36px;
          padding: 5px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(3, 14, 22, 0.35);
          backdrop-filter: blur(12px);
        }

        .track-input-wrap {
          display: flex;
          align-items: center;
          min-width: 0;
        }

        .track-prefix {
          padding-left: 16px;
          padding-right: 10px;
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
        }

        .track-form input {
          width: 100%;
          min-width: 0;
          padding: 15px 8px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #fff;
          font-family: var(--font-mono), monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
        }

        .track-form input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .track-form button {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 20px;
          border: 0;
          background: #f1eee3;
          color: #09151c;
          cursor: pointer;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .track-form button:hover {
          transform: translateX(2px);
          background: #fff;
        }

        .button-arrow {
          font-size: 17px;
        }

        .hero-note {
          margin-top: 14px;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.42);
        }

        .hero-note span {
          color: #b6d8bd;
          margin-right: 7px;
        }

        .hero-scroll {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.16em;
          color: rgba(255, 255, 255, 0.42);
        }

        .scroll-line {
          width: 1px;
          height: 42px;
          background: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0.65),
            transparent
          );
        }

        .feed-section {
          padding: 22px 0;
          background: rgba(5, 18, 27, 0.62);
          border-top: 1px solid rgba(255, 255, 255, 0.12);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(8px);
        }

        .feed-header {
          width: min(1400px, calc(100% - 64px));
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .feed-status {
          display: flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.4);
        }

        .live-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #b7d7bd;
          box-shadow: 0 0 10px rgba(183, 215, 189, 0.8);
        }

        .feed-window {
          overflow: hidden;
        }

        .feed-track {
          width: max-content;
          display: flex;
          animation: tick 55s linear infinite;
        }

        .feed-item {
          min-width: 420px;
          padding: 4px 34px;
          display: grid;
          grid-template-columns: 100px 1fr 100px 90px;
          align-items: center;
          gap: 16px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .feed-code,
        .feed-state,
        .feed-eta,
        .feed-route {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }

        .feed-code {
          color: rgba(255, 255, 255, 0.8);
        }

        .feed-route {
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.55);
        }

        .feed-route i {
          font-style: normal;
          color: rgba(255, 255, 255, 0.3);
        }

        .feed-state {
          color: #aebfac;
        }

        .feed-eta {
          color: rgba(255, 255, 255, 0.35);
        }

        .feed-eta strong {
          color: rgba(255, 255, 255, 0.7);
          font-weight: 400;
        }

        @keyframes tick {
          to {
            transform: translateX(-50%);
          }
        }

        .stats-band {
          background: rgba(6, 20, 29, 0.72);
          border-bottom: 1px solid rgba(255, 255, 255, 0.11);
          backdrop-filter: blur(10px);
        }

        .stats-grid {
          width: min(1400px, calc(100% - 64px));
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .stat {
          min-height: 180px;
          padding: 42px 30px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat:first-child {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-value {
          font-family: var(--font-display), Arial, sans-serif;
          font-size: clamp(44px, 5vw, 72px);
          line-height: 0.9;
          letter-spacing: -0.05em;
        }

        .stat-value span {
          font-size: 0.42em;
          margin-left: 4px;
          color: rgba(255, 255, 255, 0.52);
        }

        .stat-label {
          margin-top: 18px;
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.38);
        }

        .band {
          background: rgba(6, 18, 27, 0.82);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(14px);
        }

        .features-section {
          padding: 130px max(32px, calc((100vw - 1400px) / 2));
        }

        .section-heading {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          column-gap: 8vw;
          align-items: end;
        }

        .section-heading .section-kicker {
          align-self: start;
        }

        .section-heading h2,
        .steps-intro h2,
        .cta-content h2 {
          font-family: var(--font-display), Arial, sans-serif;
          font-size: clamp(58px, 8vw, 118px);
          line-height: 0.84;
          letter-spacing: -0.06em;
          font-weight: 500;
        }

        .section-heading p {
          grid-column: 2;
          max-width: 390px;
          margin-top: 28px;
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.55);
        }

        .features-grid {
          margin-top: 90px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        }

        .feature-card {
          min-height: 310px;
          position: relative;
          padding: 30px;
          border-right: 1px solid rgba(255, 255, 255, 0.12);
        }

        .feature-card:first-child {
          border-left: 1px solid rgba(255, 255, 255, 0.12);
        }

        .feature-number,
        .step-index {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.35);
        }

        .feature-content {
          position: absolute;
          left: 30px;
          right: 30px;
          bottom: 34px;
        }

        .feature-content h3,
        .step-main h3 {
          font-family: var(--font-display), Arial, sans-serif;
          font-size: 28px;
          letter-spacing: -0.03em;
          font-weight: 500;
        }

        .feature-content p,
        .step-main p {
          max-width: 330px;
          margin-top: 12px;
          font-size: 13px;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.5);
        }

        .feature-arrow {
          position: absolute;
          top: 28px;
          right: 28px;
          color: rgba(255, 255, 255, 0.35);
        }

        .steps-section {
          padding: 130px max(32px, calc((100vw - 1400px) / 2));
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 10vw;
        }

        .steps-intro .section-kicker {
          margin-bottom: 30px;
        }

        .steps-list {
          border-top: 1px solid rgba(255, 255, 255, 0.14);
        }

        .step {
          position: relative;
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 24px;
          padding: 34px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .step-main p {
          max-width: 420px;
        }

        .cta-band {
          position: relative;
          min-height: 700px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: rgba(4, 16, 25, 0.82);
          backdrop-filter: blur(12px);
        }

        .cta-glow {
          position: absolute;
          width: 60vw;
          height: 60vw;
          max-width: 900px;
          max-height: 900px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(101, 137, 143, 0.18),
            transparent 65%
          );
          filter: blur(20px);
        }

        .cta-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }

        .cta-content .section-kicker {
          justify-content: center;
        }

        .cta-content h2 {
          margin-top: 30px;
        }

        .cta-content p {
          margin: 30px auto 0;
          max-width: 430px;
          color: rgba(255, 255, 255, 0.52);
          font-size: 15px;
        }

        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 35px;
          margin-top: 35px;
          padding: 17px 21px;
          background: #f1eee3;
          color: #09151c;
          text-decoration: none;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          transition:
            transform 180ms ease,
            background 180ms ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          background: #fff;
        }

        .cta-button span:last-child {
          font-size: 17px;
        }

        .footer {
          min-height: 100px;
          padding: 25px max(32px, calc((100vw - 1400px) / 2));
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 30px;
          background: rgba(3, 12, 19, 0.94);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-meta,
        .footer-copy {
          font-family: var(--font-mono), monospace;
          font-size: 8px;
          letter-spacing: 0.13em;
          color: rgba(255, 255, 255, 0.32);
        }

        .footer-links {
          justify-self: end;
          display: flex;
          gap: 22px;
        }

        .footer-copy {
          display: none;
        }

        @media (max-width: 900px) {
          .nav {
            width: min(100% - 36px, 1400px);
            grid-template-columns: 1fr auto;
          }

          .nav-links {
            display: none;
          }

          .hero {
            padding-left: 18px;
            padding-right: 18px;
          }

          .hero h1 {
            font-size: clamp(58px, 17vw, 105px);
          }

          .feed-header,
          .stats-grid {
            width: calc(100% - 36px);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stat:nth-child(3) {
            border-left: 1px solid rgba(255, 255, 255, 0.1);
          }

          .section-heading,
          .steps-section {
            grid-template-columns: 1fr;
          }

          .section-heading p {
            grid-column: auto;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .feature-card {
            min-height: 270px;
            border-left: 1px solid rgba(255, 255, 255, 0.12);
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          }

          .feature-card:last-child {
            border-bottom: 0;
          }

          .steps-section {
            gap: 70px;
          }

          .footer {
            grid-template-columns: 1fr auto;
          }

          .footer-meta {
            display: none;
          }
        }

        @media (max-width: 620px) {
          .nav {
            min-height: 72px;
          }

          .nav-cta {
            padding: 9px 11px;
            font-size: 8px;
          }

          .hero {
            min-height: 100svh;
            padding-top: 105px;
            padding-bottom: 75px;
          }

          .hero h1 {
            font-size: clamp(52px, 16vw, 82px);
          }

          .hero-copy {
            font-size: 14px;
          }

          .track-form {
            grid-template-columns: 1fr;
            padding: 5px;
          }

          .track-form button {
            min-height: 48px;
            justify-content: space-between;
          }

          .hero-scroll {
            display: none;
          }

          .feed-item {
            min-width: 340px;
            grid-template-columns: 85px 1fr 80px;
          }

          .feed-eta {
            display: none;
          }

          .stats-grid {
            width: 100%;
          }

          .stat {
            min-height: 150px;
            padding: 30px 20px;
          }

          .features-section,
          .steps-section {
            padding: 90px 20px;
          }

          .section-heading h2,
          .steps-intro h2,
          .cta-content h2 {
            font-size: clamp(55px, 16vw, 90px);
          }

          .features-grid {
            margin-top: 60px;
          }

          .cta-band {
            min-height: 580px;
            padding: 30px 20px;
          }

          .footer {
            padding: 24px 20px;
          }

          .footer-links {
            gap: 12px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .feed-track {
            animation: none;
          }

          .track-form button,
          .cta-button {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}
