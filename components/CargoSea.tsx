// components/CargoSea.tsx — inline SVG container-ship seascape (no external file)
const W = 1440, H = 600, HZ = 330;

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const n1 = (v: number) => Math.round(v * 10) / 10;

function build() {
  const rand = rng(11);

  // ---- sea: rows of short wave dashes, bigger and wider toward the viewer
  const waveColors = ["#8DB5D0", "#2B5A7C", "#6C9DBB", "#E6F0F7"];
  const weights = [0.34, 0.36, 0.22, 0.08];
  const waves = new Map<string, string>();
  const rows = 70;
  for (let k = 0; k < rows; k++) {
    const t = k / (rows - 1);
    const y = HZ + 3 + Math.pow(t, 1.8) * (H - HZ - 3);
    const sp = 6 + Math.pow(t, 1.3) * 34;
    for (let x = rand() * sp; x < W; x += sp * (0.6 + rand() * 0.8)) {
      let r = rand(), i = 0, a = weights[0];
      while (r > a && i < 3) a += weights[++i];
      const len = (3 + t * 26) * (0.6 + rand() * 0.9);
      const sw = Math.max(0.8, Math.round((0.6 + t * 1.8) * (0.7 + rand() * 0.6) * 2) / 2);
      const yy = y + (rand() - 0.5) * sp * 0.3;
      const key = waveColors[i] + "|" + sw;
      waves.set(key, (waves.get(key) ?? "") + `M${n1(x)} ${n1(yy)}h${n1(len)}`);
    }
  }

  // ---- distant skyline (left)
  const sky = ["", ""];
  const spires: number[][] = [[92, 10, 70], [250, 9, 66], [150, 8, 50], [20, 8, 44]];
  const bld: number[][] = [...spires];
  for (let x = 10; x < 700; x += 5 + rand() * 12) {
    const falloff = x > 520 ? 0.6 : 1;
    bld.push([x, 6 + rand() * 14, (8 + rand() * 30) * falloff]);
  }
  const wins: string[] = ["", ""];
  for (const [x, w, h] of bld) {
    sky[rand() < 0.5 ? 0 : 1] += `M${n1(x)} ${HZ + 1}v${-n1(h)}h${n1(w)}v${n1(h)}z`;
    for (let wy = HZ - h + 4; wy < HZ - 3; wy += 5)
      for (let wx = x + 2; wx < x + w - 2; wx += 4)
        if (rand() < 0.35) wins[rand() < 0.5 ? 0 : 1] += `M${n1(wx)} ${n1(wy)}h1.5`;
  }

  // ---- containers on the ship, batched by color
  const cColors = ["#B5573A", "#2F5F94", "#C8714A", "#8C4B35", "#3A74A8"];
  const stacks = new Map<string, string>();
  const cw = 18, ch = 10;
  for (let x = 750, col = 0; x < 1330; x += cw + 1, col++) {
    const edge = Math.min(1, (x - 750) / 60, (1330 - x) / 70);
    const rowsN = Math.max(2, Math.round(2 + edge * 4 + rand() * 1.2));
    for (let r = 0; r < rowsN; r++) {
      const c = cColors[Math.floor(rand() * cColors.length)];
      const y = 292 - (r + 1) * (ch + 1);
      stacks.set(c, (stacks.get(c) ?? "") + `M${x} ${y}h${cw}v${ch}h${-cw}z`);
    }
  }

  return { waves: [...waves.entries()], sky, wins, stacks: [...stacks.entries()] };
}

const { waves, sky, wins, stacks } = build();

export default function CargoSea() {
  return (
    <svg
      className="bg-skyline"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DCE5EE" />
          <stop offset="0.6" stopColor="#EEF3F8" />
          <stop offset="1" stopColor="#F6F9FC" />
        </linearGradient>
        <linearGradient id="cs-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5E8FAF" />
          <stop offset="0.35" stopColor="#2E6286" />
          <stop offset="1" stopColor="#173E5E" />
        </linearGradient>
        <radialGradient id="cs-glow" cx="20%" cy="45%" r="45%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <filter id="cs-blur" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* sky + clouds */}
      <rect width={W} height={HZ + 2} fill="url(#cs-sky)" />
      <rect width={W} height={HZ} fill="url(#cs-glow)" />
      <g filter="url(#cs-blur)" fill="#FFFFFF">
        <ellipse cx="180" cy="70" rx="260" ry="34" opacity=".8" />
        <ellipse cx="620" cy="40" rx="300" ry="30" opacity=".7" />
        <ellipse cx="1100" cy="90" rx="320" ry="38" opacity=".75" />
        <ellipse cx="1340" cy="40" rx="220" ry="28" opacity=".8" />
        <ellipse cx="420" cy="150" rx="280" ry="26" opacity=".6" />
        <ellipse cx="900" cy="200" rx="240" ry="24" opacity=".55" />
        <ellipse cx="120" cy="270" rx="150" ry="30" opacity=".95" />
        <ellipse cx="330" cy="285" rx="110" ry="20" opacity=".85" />
      </g>
      <g filter="url(#cs-blur)" fill="#B9C8D8" opacity=".45">
        <ellipse cx="760" cy="115" rx="220" ry="16" />
        <ellipse cx="1250" cy="170" rx="200" ry="14" />
        <ellipse cx="260" cy="110" rx="180" ry="12" />
      </g>

      {/* distant skyline */}
      <path d={sky[0]} fill="#9EB7CD" />
      <path d={sky[1]} fill="#B7CBDC" />
      <path d={wins[0]} stroke="#E4EEF7" strokeWidth="1.5" opacity=".8" />
      <path d={wins[1]} stroke="#E4EEF7" strokeWidth="1.5" opacity=".4" />

      {/* sea */}
      <rect y={HZ} width={W} height={H - HZ} fill="url(#cs-sea)" />
      <g strokeLinecap="round" opacity=".85">
        {waves.map(([key, d]) => {
          const [c, s] = key.split("|");
          return <path key={key} d={d} stroke={c} strokeWidth={s} />;
        })}
      </g>

      {/* port cranes (far right) */}
      <g stroke="#6F9CC4" strokeWidth="3" fill="none" strokeLinecap="square">
        <path d="M1384 330V248l30-34M1384 248h54M1414 330V260M1430 330V270" />
      </g>

      {/* container ship */}
      <g>
        {stacks.map(([c, d]) => (
          <path key={c} d={d} fill={c} />
        ))}
        {/* bridge */}
        <path d="M900 232h330v-14H900z" fill="#F2F4F6" />
        <path d="M980 218h210v-14H980z" fill="#E4E8EC" />
        <rect x="1060" y="196" width="26" height="22" fill="#1E3E6B" />
        <path d="M1073 196v-26M1063 178h20" stroke="#2A3550" strokeWidth="2" />
        {/* foremast */}
        <path d="M806 292V210" stroke="#E8ECEF" strokeWidth="3" />
        <path d="M798 238h16" stroke="#E8ECEF" strokeWidth="2" />
        {/* hull */}
        <path d="M740 292H1350L1344 330L1318 342H872L822 328Z" fill="#1B2A44" />
        <path d="M744 296H1346" stroke="#3B4C69" strokeWidth="1.5" />
        <path d="M822 328L872 342H1318L1336 334L1340 326Z" fill="#B5654A" />
        <path d="M872 342H1318" stroke="#8E4A35" strokeWidth="2" />
      </g>

      {/* bow wake */}
      <g stroke="#F4F9FD" strokeLinecap="round" fill="none">
        <path d="M850 346h110M980 349h160M1160 347h120" strokeWidth="3" opacity=".95" />
        <path d="M820 353h80M930 356h120M1080 355h150" strokeWidth="2" opacity=".6" />
      </g>
    </svg>
  );
}
