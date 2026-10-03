// components/CargoSea.tsx
//
// Procedural container-ship seascape.
// No external assets.
//
// Features:
// - Atmospheric sky and sea
// - Distant port skyline
// - Container ship initially far away
// - Scroll-driven ship approach
// - Multi-layer parallax
// - Growing bow wake
// - Smooth requestAnimationFrame updates
// - prefers-reduced-motion support
//
// Usage:
//
// <section className="relative min-h-[100svh] overflow-hidden">
//   <CargoSea />
//   <div className="relative z-10">
//     {/* Hero content */}
//   </div>
// </section>

"use client";

import {
  useEffect,
  useMemo,
  useRef,
} from "react";

const W = 1440;
const H = 600;
const HZ = 330;

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;

    let t = Math.imul(
      seed ^ (seed >>> 15),
      1 | seed
    );

    t =
      (t +
        Math.imul(
          t ^ (t >>> 7),
          61 | t
        )) ^
      t;

    return (
      ((t ^ (t >>> 14)) >>> 0) /
      4294967296
    );
  };
}

const n1 = (v: number) =>
  Math.round(v * 10) / 10;

function build() {
  const rand = rng(11);

  // ============================================================
  // SEA WAVES
  // ============================================================

  const waveColors = [
    "#AFCFE1",
    "#6F9DBA",
    "#3F7293",
    "#DDEAF2",
  ];

  const weights = [
    0.30,
    0.40,
    0.22,
    0.08,
  ];

  const waves = new Map<
    string,
    string
  >();

  const rows = 58;

  for (let k = 0; k < rows; k++) {
    const t =
      k / (rows - 1);

    const y =
      HZ +
      5 +
      Math.pow(t, 1.7) *
        (H - HZ - 8);

    const spacing =
      8 +
      Math.pow(t, 1.45) *
        38;

    for (
      let x =
        rand() * spacing - 30;
      x < W + 30;
      x +=
        spacing *
        (0.65 + rand() * 0.8)
    ) {
      let r = rand();
      let i = 0;
      let a = weights[0];

      while (
        r > a &&
        i < weights.length - 1
      ) {
        a += weights[++i];
      }

      // Keep the horizon relatively quiet.
      const densityFade =
        0.25 + t * 0.75;

      if (
        rand() > densityFade
      ) {
        continue;
      }

      const len =
        (3 + t * 30) *
        (0.65 + rand() * 0.85);

      const sw = Math.max(
        0.7,
        Math.round(
          (0.7 + t * 1.5) *
            (0.7 + rand() * 0.5) *
            2
        ) / 2
      );

      const yy =
        y +
        (rand() - 0.5) *
          spacing *
          0.28;

      const key =
        waveColors[i] +
        "|" +
        sw;

      waves.set(
        key,
        (waves.get(key) ?? "") +
          `M${n1(x)} ${n1(
            yy
          )}h${n1(len)}`
      );
    }
  }

  // ============================================================
  // DISTANT CITY / PORT
  // ============================================================

  const sky = ["", ""];

  const spires: number[][] = [
    [92, 10, 70],
    [250, 9, 66],
    [150, 8, 50],
    [20, 8, 44],
  ];

  const buildings: number[][] = [
    ...spires,
  ];

  for (
    let x = 10;
    x < 690;
    x += 5 + rand() * 12
  ) {
    const falloff =
      x > 520 ? 0.6 : 1;

    buildings.push([
      x,
      6 + rand() * 14,
      (8 + rand() * 30) *
        falloff,
    ]);
  }

  const wins: string[] = [
    "",
    "",
  ];

  for (const [x, w, h] of buildings) {
    const layer =
      rand() < 0.5 ? 0 : 1;

    sky[layer] +=
      `M${n1(x)} ${
        HZ + 1
      }` +
      `v${-n1(h)}` +
      `h${n1(w)}` +
      `v${n1(h)}z`;

    for (
      let wy =
        HZ - h + 4;
      wy < HZ - 3;
      wy += 5
    ) {
      for (
        let wx = x + 2;
        wx < x + w - 2;
        wx += 4
      ) {
        if (rand() < 0.28) {
          wins[
            rand() < 0.5
              ? 0
              : 1
          ] +=
            `M${n1(
              wx
            )} ${n1(wy)}h1.5`;
        }
      }
    }
  }

  // ============================================================
  // CONTAINERS
  // ============================================================

  const containerColors = [
    "#B85D43",
    "#356D9D",
    "#CF7650",
    "#874A38",
    "#477FAF",
    "#A84F3A",
  ];

  const stacks = new Map<
    string,
    string
  >();

  const cw = 18;
  const ch = 10;

  for (
    let x = 750, col = 0;
    x < 1330;
    x += cw + 1, col++
  ) {
    const edge = Math.min(
      1,
      (x - 750) / 60,
      (1330 - x) / 70
    );

    const rowsN = Math.max(
      2,
      Math.round(
        2 +
          edge * 4 +
          rand() * 1.2
      )
    );

    for (
      let r = 0;
      r < rowsN;
      r++
    ) {
      const color =
        containerColors[
          Math.floor(
            rand() *
              containerColors.length
          )
        ];

      const y =
        292 -
        (r + 1) *
          (ch + 1);

      stacks.set(
        color,
        (stacks.get(color) ?? "") +
          `M${x} ${y}` +
          `h${cw}` +
          `v${ch}` +
          `h${-cw}z`
      );
    }
  }

  return {
    waves: Array.from(
      waves.entries()
    ),
    sky,
    wins,
    stacks:
      Array.from(
        stacks.entries()
      ),
  };
}

export default function CargoSea() {
  /*
   * useMemo ensures the procedural geometry is
   * generated once for this component instance.
   */
  const scene = useMemo(
    () => build(),
    []
  );

  const svgRef =
    useRef<SVGSVGElement | null>(
      null
    );

  const shipRef =
    useRef<SVGGElement | null>(
      null
    );

  const cloudsFarRef =
    useRef<SVGGElement | null>(
      null
    );

  const cloudsNearRef =
    useRef<SVGGElement | null>(
      null
    );

  const skylineRef =
    useRef<SVGGElement | null>(
      null
    );

  const cranesRef =
    useRef<SVGGElement | null>(
      null
    );

  const waterRef =
    useRef<SVGGElement | null>(
      null
    );

  const wakeRef =
    useRef<SVGGElement | null>(
      null
    );

  useEffect(() => {
    const svg =
      svgRef.current;

    const ship =
      shipRef.current;

    if (!svg || !ship) {
      return;
    }

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    let frame = 0;

    /*
     * Interpolate toward the target instead of directly
     * applying scroll position.
     *
     * This creates a subtle "physical" feeling:
     * the ship appears to follow the user rather than
     * being mechanically attached to the scrollbar.
     */
    let current = 0;

    const update = () => {
      frame = 0;

      const heroHeight =
        Math.max(
          window.innerHeight * 1.05,
          600
        );

      const raw =
        window.scrollY /
        heroHeight;

      const target =
        Math.min(
          1,
          Math.max(0, raw)
        );

      if (
        reduceMotion.matches
      ) {
        current = 0;

        ship.setAttribute(
          "transform",
          "translate(0 42) scale(.68)"
        );

        wakeRef.current?.setAttribute(
          "opacity",
          "0.55"
        );

        return;
      }

      // Smoothly catch up to scroll.
      current +=
        (target - current) *
        0.075;

      /*
       * Ship
       *
       * Starts around 68% scale and approaches
       * roughly 95%.
       */
      const scale =
        0.68 +
        current * 0.27;

      /*
       * Small vertical movement.
       *
       * The ship rises slightly as it approaches.
       */
      const y =
        42 -
        current * 42;

      /*
       * Small horizontal movement.
       *
       * This keeps the ship from feeling like it is
       * simply zooming in place.
       */
      const x =
        current * -18;

      /*
       * SVG transform order:
       *
       * translate first, then scale.
       */
      ship.setAttribute(
        "transform",
        `translate(${x} ${y}) scale(${scale})`
      );

      // --------------------------------------------------------
      // Clouds
      // --------------------------------------------------------

      cloudsFarRef.current?.setAttribute(
        "transform",
        `translate(${
          current * -10
        } ${current * 2})`
      );

      cloudsNearRef.current?.setAttribute(
        "transform",
        `translate(${
          current * -24
        } ${current * 4})`
      );

      // --------------------------------------------------------
      // Skyline
      // --------------------------------------------------------

      skylineRef.current?.setAttribute(
        "transform",
        `translate(${
          current * -8
        } ${current * 2})`
      );

      // --------------------------------------------------------
      // Port cranes
      // --------------------------------------------------------

      cranesRef.current?.setAttribute(
        "transform",
        `translate(${
          current * -16
        } ${current * 3})`
      );

      // --------------------------------------------------------
      // Water
      // --------------------------------------------------------

      waterRef.current?.setAttribute(
        "transform",
        `translate(0 ${
          current * -3
        })`
      );

      // --------------------------------------------------------
      // Wake
      // --------------------------------------------------------

      /*
       * The wake becomes more pronounced as the ship
       * approaches.
       */
      const wakeOpacity =
        0.45 +
        current * 0.45;

      wakeRef.current?.setAttribute(
        "opacity",
        String(wakeOpacity)
      );
    };

    const onScroll = () => {
      if (!frame) {
        frame =
          requestAnimationFrame(
            update
          );
      }
    };

    const onMotionChange =
      () => {
        if (!frame) {
          frame =
            requestAnimationFrame(
              update
            );
        }
      };

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      }
    );

    reduceMotion.addEventListener(
      "change",
      onMotionChange
    );

    update();

    return () => {
      window.removeEventListener(
        "scroll",
        onScroll
      );

      reduceMotion.removeEventListener(
        "change",
        onMotionChange
      );

      if (frame) {
        cancelAnimationFrame(
          frame
        );
      }
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="bg-skyline pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        {/* ================================================== */}
        {/* SKY                                                 */}
        {/* ================================================== */}

        <linearGradient
          id="cs-sky"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#C9D9E6"
          />

          <stop
            offset=".42"
            stopColor="#E4EDF4"
          />

          <stop
            offset=".78"
            stopColor="#F2F6FA"
          />

          <stop
            offset="1"
            stopColor="#F8FAFC"
          />
        </linearGradient>

        {/* Sun / atmospheric glow */}

        <radialGradient
          id="cs-light"
          cx="19%"
          cy="46%"
          r="52%"
        >
          <stop
            offset="0"
            stopColor="#FFFFFF"
            stopOpacity=".78"
          />

          <stop
            offset=".45"
            stopColor="#FFFFFF"
            stopOpacity=".25"
          />

          <stop
            offset="1"
            stopColor="#FFFFFF"
            stopOpacity="0"
          />
        </radialGradient>

        {/* Horizon haze */}

        <linearGradient
          id="cs-haze"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#FFFFFF"
            stopOpacity="0"
          />

          <stop
            offset=".75"
            stopColor="#FFFFFF"
            stopOpacity=".30"
          />

          <stop
            offset="1"
            stopColor="#FFFFFF"
            stopOpacity=".62"
          />
        </linearGradient>

        {/* Sea */}

        <linearGradient
          id="cs-sea"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#6798B5"
          />

          <stop
            offset=".27"
            stopColor="#376E90"
          />

          <stop
            offset=".64"
            stopColor="#245572"
          />

          <stop
            offset="1"
            stopColor="#12364F"
          />
        </linearGradient>

        {/* Sea reflection */}

        <linearGradient
          id="cs-reflection"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            offset="0"
            stopColor="#DDEAF2"
            stopOpacity=".28"
          />

          <stop
            offset=".5"
            stopColor="#8EB4CA"
            stopOpacity=".10"
          />

          <stop
            offset="1"
            stopColor="#FFFFFF"
            stopOpacity="0"
          />
        </linearGradient>

        {/* Clouds */}

        <filter
          id="cs-cloud"
          x="-30%"
          y="-100%"
          width="160%"
          height="300%"
        >
          <feGaussianBlur
            stdDeviation="16"
          />
        </filter>

        <filter
          id="cs-atmosphere"
          x="-20%"
          y="-50%"
          width="140%"
          height="200%"
        >
          <feGaussianBlur
            stdDeviation="7"
          />
        </filter>

        {/* Ship shadow */}

        <filter
          id="cs-ship-shadow"
          x="-20%"
          y="-30%"
          width="140%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="8"
            floodColor="#10283B"
            floodOpacity=".22"
          />
        </filter>
      </defs>

      {/* ====================================================== */}
      {/* SKY                                                     */}
      {/* ====================================================== */}

      <rect
        width={W}
        height={HZ + 5}
        fill="url(#cs-sky)"
      />

      <rect
        width={W}
        height={HZ}
        fill="url(#cs-light)"
      />

      {/* ====================================================== */}
      {/* FAR CLOUDS                                              */}
      {/* ====================================================== */}

      <g
        ref={cloudsFarRef}
        filter="url(#cs-cloud)"
        fill="#FFFFFF"
      >
        <ellipse
          cx="160"
          cy="66"
          rx="270"
          ry="30"
          opacity=".70"
        />

        <ellipse
          cx="570"
          cy="42"
          rx="310"
          ry="27"
          opacity=".58"
        />

        <ellipse
          cx="1030"
          cy="78"
          rx="350"
          ry="34"
          opacity=".60"
        />

        <ellipse
          cx="1370"
          cy="42"
          rx="220"
          ry="28"
          opacity=".68"
        />

        <ellipse
          cx="420"
          cy="150"
          rx="300"
          ry="23"
          opacity=".46"
        />

        <ellipse
          cx="910"
          cy="190"
          rx="260"
          ry="21"
          opacity=".40"
        />
      </g>

      {/* ====================================================== */}
      {/* NEAR CLOUDS                                             */}
      {/* ====================================================== */}

      <g
        ref={cloudsNearRef}
        filter="url(#cs-atmosphere)"
        fill="#FFFFFF"
      >
        <ellipse
          cx="90"
          cy="275"
          rx="160"
          ry="27"
          opacity=".75"
        />

        <ellipse
          cx="315"
          cy="284"
          rx="125"
          ry="22"
          opacity=".62"
        />
      </g>

      {/* Cool cloud shadows */}

      <g
        filter="url(#cs-cloud)"
        fill="#AEBFD0"
        opacity=".22"
      >
        <ellipse
          cx="760"
          cy="112"
          rx="230"
          ry="15"
        />

        <ellipse
          cx="1240"
          cy="165"
          rx="210"
          ry="14"
        />

        <ellipse
          cx="265"
          cy="112"
          rx="185"
          ry="12"
        />
      </g>

      {/* ====================================================== */}
      {/* DISTANT CITY                                            */}
      {/* ====================================================== */}

      <g ref={skylineRef}>
        <path
          d={scene.sky[0]}
          fill="#91ADC3"
          opacity=".72"
        />

        <path
          d={scene.sky[1]}
          fill="#AFC4D5"
          opacity=".65"
        />

        <path
          d={scene.wins[0]}
          stroke="#E6F0F7"
          strokeWidth="1.5"
          opacity=".55"
        />

        <path
          d={scene.wins[1]}
          stroke="#E6F0F7"
          strokeWidth="1.5"
          opacity=".28"
        />
      </g>

      {/* Horizon haze */}

      <rect
        y={HZ - 8}
        width={W}
        height="70"
        fill="url(#cs-haze)"
      />

      {/* ====================================================== */}
      {/* SEA                                                      */}
      {/* ====================================================== */}

      <rect
        y={HZ}
        width={W}
        height={H - HZ}
        fill="url(#cs-sea)"
      />

      {/* ====================================================== */}
      {/* WATER PARALLAX LAYER                                    */}
      {/* ====================================================== */}

      <g ref={waterRef}>
        {/* Light reflection */}

        <path
          d="
            M0 340
            C220 325 420 342 650 332
            C860 322 1100 339 1440 328
            L1440 390
            C1110 375 880 384 650 374
            C420 365 190 380 0 366Z
          "
          fill="url(#cs-reflection)"
          opacity=".32"
        />

        {/* Generated waves */}

        <g
          strokeLinecap="round"
          opacity=".82"
        >
          {scene.waves.map(
            ([key, d]) => {
              const [
                color,
                strokeWidth,
              ] =
                key.split("|");

              return (
                <path
                  key={key}
                  d={d}
                  stroke={color}
                  strokeWidth={
                    strokeWidth
                  }
                />
              );
            }
          )}
        </g>

        {/* Foreground darker water */}

        <g
          fill="none"
          stroke="#0F3048"
          strokeLinecap="round"
          opacity=".16"
        >
          <path
            d="M40 548h210M330 570h290M750 536h250M1100 570h290"
            strokeWidth="2"
          />

          <path
            d="M80 585h180M460 592h240M850 575h190M1210 590h180"
            strokeWidth="3"
          />
        </g>
      </g>

      {/* ====================================================== */}
      {/* PORT CRANES                                             */}
      {/* ====================================================== */}

      <g
        ref={cranesRef}
        stroke="#648BA8"
        strokeWidth="2.5"
        fill="none"
        opacity=".72"
        strokeLinecap="square"
      >
        <path d="M1378 330V249l32-36" />

        <path d="M1378 249h58" />

        <path d="M1409 330V261" />

        <path d="M1428 330V270" />
      </g>

      {/* ====================================================== */}
      {/* CONTAINER SHIP                                          */}
      {/* ====================================================== */}

      <g
        ref={shipRef}
        filter="url(#cs-ship-shadow)"
        /*
         * The ship starts far away.
         *
         * Scroll code modifies this transform:
         * translate + scale.
         */
        transform="translate(0 42) scale(.68)"
        opacity=".96"
      >
        {/* -------------------------------------------------- */}
        {/* CONTAINERS                                          */}
        {/* -------------------------------------------------- */}

        {scene.stacks.map(
          ([color, d]) => (
            <path
              key={color}
              d={d}
              fill={color}
            />
          )
        )}

        {/* Container seam details */}

        <g
          stroke="#183C59"
          strokeWidth=".7"
          opacity=".22"
        >
          {Array.from({
            length: 28,
          }).map((_, i) => (
            <path
              key={i}
              d={`M${
                752 + i * 21
              } 292v-8`}
            />
          ))}
        </g>

        {/* -------------------------------------------------- */}
        {/* BRIDGE                                               */}
        {/* -------------------------------------------------- */}

        <path
          d="M900 232h330v-14H900z"
          fill="#F1F4F6"
        />

        <path
          d="M980 218h210v-14H980z"
          fill="#E0E6EB"
        />

        {/* Bridge windows */}

        <path
          d="
            M990 206
            h194
            v7
            h-194z
          "
          fill="#294B68"
          opacity=".85"
        />

        <g
          stroke="#B8C9D6"
          strokeWidth="1"
          opacity=".55"
        >
          {Array.from({
            length: 9,
          }).map((_, i) => (
            <path
              key={i}
              d={`M${
                1005 +
                i * 20
              } 206v7`}
            />
          ))}
        </g>

        {/* -------------------------------------------------- */}
        {/* NAVIGATION TOWER                                    */}
        {/* -------------------------------------------------- */}

        <rect
          x="1060"
          y="196"
          width="26"
          height="22"
          fill="#1C3B59"
        />

        <path
          d="M1073 196v-26"
          stroke="#263A4D"
          strokeWidth="2"
        />

        <path
          d="M1063 178h20"
          stroke="#263A4D"
          strokeWidth="2"
        />

        <circle
          cx="1073"
          cy="168"
          r="2"
          fill="#F4F8FB"
        />

        {/* -------------------------------------------------- */}
        {/* FOREMAST                                             */}
        {/* -------------------------------------------------- */}

        <path
          d="M806 292V210"
          stroke="#E3E9EE"
          strokeWidth="3"
        />

        <path
          d="M798 238h16"
          stroke="#E3E9EE"
          strokeWidth="2"
        />

        {/* -------------------------------------------------- */}
        {/* MAIN HULL                                            */}
        {/* -------------------------------------------------- */}

        <path
          d="
            M740 292
            H1350
            L1344 330
            L1318 342
            H872
            L822 328
            Z
          "
          fill="#172A42"
        />

        {/* Hull highlight */}

        <path
          d="M744 296H1346"
          stroke="#435873"
          strokeWidth="2"
        />

        {/* Painted hull band */}

        <path
          d="
            M822 328
            L872 342
            H1318
            L1336 334
            L1340 326
            Z
          "
          fill="#A95740"
        />

        <path
          d="M872 342H1318"
          stroke="#7E4132"
          strokeWidth="2"
        />

        {/* Hull reflection */}

        <path
          d="
            M860 349
            C970 355
            1110 355
            1290 348
            L1260 359
            C1090 367
            960 365
            880 357Z
          "
          fill="#081F32"
          opacity=".28"
        />

        {/* -------------------------------------------------- */}
        {/* WAKE                                                */}
        {/* -------------------------------------------------- */}

        <g
          ref={wakeRef}
          opacity=".55"
          stroke="#F5FAFD"
          strokeLinecap="round"
          fill="none"
        >
          <path
            d="
              M850 346h110
              M980 349h160
              M1160 347h120
            "
            strokeWidth="3"
          />

          <path
            d="
              M820 353h80
              M930 356h120
              M1080 355h150
            "
            strokeWidth="2"
            opacity=".65"
          />

          <path
            d="
              M880 363h120
              M1030 365h130
            "
            strokeWidth="1.5"
            opacity=".4"
          />
        </g>
      </g>

      {/* ====================================================== */}
      {/* FINAL ATMOSPHERIC VEIL                                 */}
      {/* ====================================================== */}

      <rect
        x="0"
        y="0"
        width={W}
        height={H}
        fill="url(#cs-light)"
        opacity=".08"
        pointerEvents="none"
      />
    </svg>
  );
}
