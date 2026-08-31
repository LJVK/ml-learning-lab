import "./AttentionInternalsVisual.css";

// ── Layout ───────────────────────────────────────────────────────────────
const V = { w: 1080, h: 1440 };

// Section 1 — Q/K route vs V content
const S1_Y = 90;
const S1_H = 300;

// Section 2 — Head specialization
const S2_Y = S1_Y + S1_H + 100;
const HEAD_W = 260;
const HEAD_GAP = 40;
const HEAD_CELL = 32;         // small heatmap cells
const HEAD_ROWS = 6;
const HEAD_HEATMAP_SIZE = HEAD_CELL * HEAD_ROWS; // 192
const S2_H = HEAD_HEATMAP_SIZE + 200;

// Section 3 — Interpretability trap
const S3_Y = S2_Y + S2_H + 90;

// Palette
const C = {
  route: "#f472b6",       // pink — Q/K routing
  content: "#facc15",     // gold — V content
  weight: "#3b82f6",      // blue — attention weights
  head1: "#22d3ee",       // cyan — head 1
  head2: "#c084fc",       // purple — head 2
  head3: "#fbbf24",       // amber — head 3
  before: "#60a5fa",      // blue — before intervention
  after: "#94a3b8",       // gray — after (weakened)
  warn: "#ef4444",        // red — trap
  ok: "#22c55e",          // green — correct
};

// Hand-crafted mini attention patterns per head (rows sum to 1, roughly).
// Sequence: [The, cat, sat, on, the, mat]
const HEAD_PATTERNS = [
  {
    name: "Head 1",
    role: "nearest-neighbor",
    color: C.head1,
    weights: [
      [0.55, 0.35, 0.05, 0.02, 0.02, 0.01],
      [0.20, 0.50, 0.25, 0.03, 0.01, 0.01],
      [0.05, 0.20, 0.50, 0.20, 0.03, 0.02],
      [0.02, 0.03, 0.20, 0.55, 0.15, 0.05],
      [0.01, 0.02, 0.05, 0.20, 0.55, 0.17],
      [0.01, 0.02, 0.03, 0.10, 0.30, 0.54],
    ],
  },
  {
    name: "Head 2",
    role: "coreference",
    color: C.head2,
    weights: [
      // "the" and "the" bind; "cat"/"mat" cluster; long-range links
      [0.30, 0.05, 0.02, 0.03, 0.55, 0.05],
      [0.03, 0.35, 0.05, 0.05, 0.02, 0.50],
      [0.02, 0.10, 0.55, 0.20, 0.03, 0.10],
      [0.05, 0.10, 0.15, 0.55, 0.05, 0.10],
      [0.55, 0.05, 0.02, 0.03, 0.30, 0.05],
      [0.05, 0.50, 0.10, 0.10, 0.05, 0.20],
    ],
  },
  {
    name: "Head 3",
    role: "punctuation / boundary",
    color: C.head3,
    // BOS/EOS-style anchor: every row attends heavily to token 0 or token N-1
    weights: [
      [0.65, 0.05, 0.05, 0.05, 0.05, 0.15],
      [0.60, 0.10, 0.05, 0.05, 0.05, 0.15],
      [0.55, 0.05, 0.10, 0.05, 0.05, 0.20],
      [0.55, 0.05, 0.05, 0.10, 0.05, 0.20],
      [0.55, 0.05, 0.05, 0.05, 0.10, 0.20],
      [0.55, 0.05, 0.05, 0.05, 0.05, 0.25],
    ],
  },
];

// ── Small components ─────────────────────────────────────────────────────

function TinyToken({ cx, y, label, color, small }) {
  const w = small ? 62 : 80;
  const h = small ? 26 : 34;
  const x = cx - w / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={8}
        fill={color}
        fillOpacity="0.25"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.2"
      />
      <text
        x={cx}
        y={y + h / 2 + (small ? 3 : 4)}
        textAnchor="middle"
        fill="#f8fafc"
        fontSize={small ? 10 : 12}
        fontWeight="800"
      >
        {label}
      </text>
    </g>
  );
}

// A little "projection matrix" tile — 3 rows × 3 cols of colored cells,
// deterministically shaded per head so users see the three sets differ.
function ProjMatrix({ x, y, seed, color, label }) {
  const cell = 12;
  const cells = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      // Pseudo-random opacity from a fixed seed × index — same values every render
      const shade = 0.25 + ((seed * 13 + i * 7 + j * 3) % 10) * 0.075;
      cells.push({ i, j, shade });
    }
  }
  return (
    <g>
      {cells.map(({ i, j, shade }) => (
        <rect
          key={`${i}-${j}`}
          x={x + j * cell}
          y={y + i * cell}
          width={cell - 1}
          height={cell - 1}
          rx={2}
          fill={color}
          fillOpacity={shade}
        />
      ))}
      <text
        x={x + (3 * cell) / 2}
        y={y + 3 * cell + 12}
        textAnchor="middle"
        fill={color}
        fontSize="10"
        fontWeight="800"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {label}
      </text>
    </g>
  );
}

// A small attention heatmap for the head-specialization panel.
function HeadHeatmap({ x, y, weights, color }) {
  const cell = HEAD_CELL;
  return (
    <g>
      {weights.map((row, i) =>
        row.map((w, j) => (
          <rect
            key={`c-${i}-${j}`}
            x={x + j * cell + 1}
            y={y + i * cell + 1}
            width={cell - 2}
            height={cell - 2}
            rx={2}
            fill={color}
            fillOpacity={Math.max(0.06, Math.min(1, w * 1.6))}
            stroke={color}
            strokeOpacity="0.15"
            strokeWidth="0.5"
          />
        ))
      )}
    </g>
  );
}

function AttentionInternalsVisual() {
  return (
    <section className="aiv-visual-card">
      <div className="aiv-visual-header">
        <p className="aiv-eyebrow">Visual mental model</p>
        <h2>
          Attention internals: three lenses on how the mechanism actually
          learns
        </h2>
        <p>
          The attention math is one line, but{" "}
          <strong>three different things</strong> happen inside it. Q and K
          learn a <em>routing</em> function ("which tokens should connect?").
          V learns the <em>content</em> that flows along those routes.
          Multiple heads learn multiple routing functions in parallel. And
          the attention weights we see in a heatmap are correlational — they
          need an intervention to prove causal importance.
        </p>
        <dl className="aiv-defs">
          <div>
            <dt>lens 1</dt>
            <dd>Q/K route · V carries content</dd>
          </div>
          <div>
            <dt>lens 2</dt>
            <dd>heads specialize into different patterns</dd>
          </div>
          <div>
            <dt>lens 3</dt>
            <dd>weights are correlation, not causation</dd>
          </div>
        </dl>
      </div>

      <div className="aiv-diagram-wrap">
        <svg
          viewBox={`0 0 ${V.w} ${V.h}`}
          xmlns="http://www.w3.org/2000/svg"
          className="aiv-diagram"
          role="img"
          aria-label="Three lenses on attention internals: Q/K routing versus V content, head specialization across three learned attention patterns, and the interpretability trap where high attention weights do not prove causal importance."
        >
          <defs>
            <filter id="aiv-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="aiv-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#93c5fd" />
            </marker>
          </defs>

          {/* ── Section 1: Q/K routing vs V content ─────────────────────── */}
          <text
            x={V.w / 2}
            y={S1_Y - 30}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            LENS 1 — Q, K DECIDE WHERE · V DECIDES WHAT
          </text>

          {(() => {
            const laneW = (V.w - 120) / 2;
            const leftX = 60;
            const rightX = leftX + laneW + 20;
            return (
              <g>
                {/* Left lane: Q/K routing */}
                <rect
                  x={leftX}
                  y={S1_Y}
                  width={laneW - 10}
                  height={S1_H}
                  rx={16}
                  fill={C.route}
                  fillOpacity="0.08"
                  stroke={C.route}
                  strokeOpacity="0.55"
                  strokeWidth="1.4"
                />
                <text
                  x={leftX + 20}
                  y={S1_Y + 26}
                  fill={C.route}
                  fontSize="15"
                  fontWeight="900"
                >
                  Q · Kᵀ — routing
                </text>
                <text
                  x={leftX + 20}
                  y={S1_Y + 46}
                  fill="#cbd5e1"
                  fontSize="12"
                  fontWeight="600"
                >
                  Which token pairs should share information?
                </text>
                {/* Illustrative arrows: three tokens, one "asking" pattern */}
                {(() => {
                  const cx = leftX + laneW / 2 - 10;
                  const y0 = S1_Y + 90;
                  return (
                    <g>
                      <TinyToken cx={cx - 100} y={y0} label="it" color={C.route} />
                      <TinyToken cx={cx} y={y0} label="the" color={C.route} />
                      <TinyToken cx={cx + 100} y={y0} label="dog" color={C.route} />

                      <path
                        d={`M ${cx - 100 + 40} ${y0 + 34} C ${cx - 100 + 40} ${y0 + 90}, ${cx + 100 - 40} ${y0 + 90}, ${cx + 100 - 40} ${y0 + 34}`}
                        fill="none"
                        stroke={C.route}
                        strokeWidth="2.5"
                        strokeOpacity="0.8"
                        strokeLinecap="round"
                        markerEnd="url(#aiv-arrow)"
                      />
                      <text
                        x={cx}
                        y={y0 + 100}
                        textAnchor="middle"
                        fill={C.route}
                        fontSize="12"
                        fontWeight="800"
                      >
                        "it" queries · "dog" key matches
                      </text>
                      <text
                        x={cx}
                        y={y0 + 148}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="11"
                        fontWeight="600"
                      >
                        Q_it · K_dog is trained to be large.
                      </text>
                      <text
                        x={cx}
                        y={y0 + 166}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="11"
                        fontWeight="600"
                      >
                        No content moves yet — this only decides <tspan fill={C.route} fontWeight="800">where</tspan>.
                      </text>
                    </g>
                  );
                })()}

                {/* Right lane: V content */}
                <rect
                  x={rightX}
                  y={S1_Y}
                  width={laneW - 10}
                  height={S1_H}
                  rx={16}
                  fill={C.content}
                  fillOpacity="0.08"
                  stroke={C.content}
                  strokeOpacity="0.55"
                  strokeWidth="1.4"
                />
                <text
                  x={rightX + 20}
                  y={S1_Y + 26}
                  fill={C.content}
                  fontSize="15"
                  fontWeight="900"
                >
                  V — content
                </text>
                <text
                  x={rightX + 20}
                  y={S1_Y + 46}
                  fill="#cbd5e1"
                  fontSize="12"
                  fontWeight="600"
                >
                  What information should each token carry?
                </text>
                {(() => {
                  const cx = rightX + laneW / 2 - 10;
                  const y0 = S1_Y + 90;
                  return (
                    <g>
                      <TinyToken cx={cx - 100} y={y0} label="it" color={C.content} />
                      <TinyToken cx={cx} y={y0} label="the" color={C.content} />
                      <TinyToken cx={cx + 100} y={y0} label="dog" color={C.content} />

                      {/* Content flow: V_dog → it, thick */}
                      <path
                        d={`M ${cx + 100 - 40} ${y0 + 34} L ${cx - 100 + 40} ${y0 + 34}`}
                        fill="none"
                        stroke={C.content}
                        strokeWidth="4"
                        strokeOpacity="0.85"
                        strokeLinecap="round"
                        markerEnd="url(#aiv-arrow)"
                      />
                      <text
                        x={cx}
                        y={y0 + 74}
                        textAnchor="middle"
                        fill={C.content}
                        fontSize="12"
                        fontWeight="800"
                      >
                        weighted mix of V_dog flows into "it"
                      </text>
                      <text
                        x={cx}
                        y={y0 + 116}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="11"
                        fontWeight="600"
                      >
                        V_dog is trained to be a useful representation to inject.
                      </text>
                      <text
                        x={cx}
                        y={y0 + 148}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="11"
                        fontWeight="600"
                      >
                        Content actually moves — this decides <tspan fill={C.content} fontWeight="800">what</tspan>.
                      </text>
                    </g>
                  );
                })()}
              </g>
            );
          })()}

          {/* ── Section 2: Head specialization ──────────────────────────── */}
          <text
            x={V.w / 2}
            y={S2_Y - 42}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            LENS 2 — HEADS SPECIALIZE INTO DIFFERENT PATTERNS
          </text>
          <text
            x={V.w / 2}
            y={S2_Y - 24}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="600"
          >
            Same 6 input tokens · three heads · three different learned attention maps.
            Each head has its own W_q / W_k / W_v.
          </text>

          {(() => {
            const totalW = 3 * HEAD_W + 2 * HEAD_GAP;
            const startX = (V.w - totalW) / 2;
            const tokens = ["The", "cat", "sat", "on", "the", "mat"];

            return HEAD_PATTERNS.map((h, i) => {
              const hx = startX + i * (HEAD_W + HEAD_GAP);
              const heatmapX = hx + (HEAD_W - HEAD_HEATMAP_SIZE) / 2;
              const heatmapY = S2_Y;

              return (
                <g key={h.name}>
                  {/* Head card */}
                  <rect
                    x={hx}
                    y={S2_Y - 8}
                    width={HEAD_W}
                    height={HEAD_HEATMAP_SIZE + 130}
                    rx={16}
                    fill="rgba(15,23,42,0.72)"
                    stroke={h.color}
                    strokeOpacity="0.6"
                    strokeWidth="1.4"
                    filter="url(#aiv-glow)"
                  />

                  {/* Head title */}
                  <text
                    x={hx + HEAD_W / 2}
                    y={S2_Y + 14}
                    textAnchor="middle"
                    fill={h.color}
                    fontSize="14"
                    fontWeight="900"
                  >
                    {h.name}
                  </text>
                  <text
                    x={hx + HEAD_W / 2}
                    y={S2_Y + 32}
                    textAnchor="middle"
                    fill="#cbd5e1"
                    fontSize="11"
                    fontWeight="700"
                    fontStyle="italic"
                  >
                    learned role: {h.role}
                  </text>

                  {/* Column headers (keys) */}
                  {tokens.map((t, j) => (
                    <text
                      key={`ch-${j}`}
                      x={heatmapX + j * HEAD_CELL + HEAD_CELL / 2}
                      y={heatmapY + 54}
                      textAnchor="middle"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="700"
                    >
                      {t}
                    </text>
                  ))}

                  {/* Row headers (queries) */}
                  {tokens.map((t, k) => (
                    <text
                      key={`rh-${k}`}
                      x={heatmapX - 4}
                      y={heatmapY + 66 + k * HEAD_CELL + HEAD_CELL / 2 + 3}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="700"
                    >
                      {t}
                    </text>
                  ))}

                  {/* Heatmap */}
                  <HeadHeatmap
                    x={heatmapX}
                    y={heatmapY + 66}
                    weights={h.weights}
                    color={h.color}
                  />

                  {/* Projection matrices below */}
                  {(() => {
                    const py = heatmapY + 66 + HEAD_HEATMAP_SIZE + 16;
                    const pw = 3 * 12; // ProjMatrix cell size
                    const gap = 22;
                    const totalPW = 3 * pw + 2 * gap;
                    const px = hx + (HEAD_W - totalPW) / 2;
                    return (
                      <g>
                        <ProjMatrix
                          x={px}
                          y={py}
                          seed={i * 3 + 1}
                          color={h.color}
                          label="W_q"
                        />
                        <ProjMatrix
                          x={px + pw + gap}
                          y={py}
                          seed={i * 3 + 2}
                          color={h.color}
                          label="W_k"
                        />
                        <ProjMatrix
                          x={px + 2 * (pw + gap)}
                          y={py}
                          seed={i * 3 + 3}
                          color={h.color}
                          label="W_v"
                        />
                      </g>
                    );
                  })()}
                </g>
              );
            });
          })()}

          {/* Caption below head panels */}
          <text
            x={V.w / 2}
            y={S2_Y + HEAD_HEATMAP_SIZE + 175}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="600"
          >
            Nobody assigned these roles — they emerged from training on the loss.
          </text>

          {/* ── Section 3: Interpretability trap ────────────────────────── */}
          <text
            x={V.w / 2}
            y={S3_Y - 22}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            LENS 3 — HIGH ATTENTION WEIGHT ≠ CAUSAL IMPORTANCE
          </text>

          {(() => {
            const paneW = (V.w - 140) / 2;
            const paneH = 250;
            const leftX = 60;
            const rightX = leftX + paneW + 20;
            const py = S3_Y;

            return (
              <g>
                {/* BEFORE */}
                <rect
                  x={leftX}
                  y={py}
                  width={paneW}
                  height={paneH}
                  rx={16}
                  fill={C.before}
                  fillOpacity="0.08"
                  stroke={C.before}
                  strokeOpacity="0.55"
                  strokeWidth="1.4"
                />
                <text
                  x={leftX + 20}
                  y={py + 26}
                  fill={C.before}
                  fontSize="14"
                  fontWeight="900"
                >
                  Before intervention
                </text>
                <text
                  x={leftX + 20}
                  y={py + 46}
                  fill="#cbd5e1"
                  fontSize="12"
                  fontWeight="600"
                >
                  Attention map shows "it" → "dog" at 0.82
                </text>
                {(() => {
                  const cx = leftX + paneW / 2;
                  const y0 = py + 80;
                  return (
                    <g>
                      <TinyToken cx={cx - 100} y={y0} label="it" color={C.before} />
                      <TinyToken cx={cx + 100} y={y0} label="dog" color={C.before} />
                      <path
                        d={`M ${cx + 100 - 40} ${y0 + 34} L ${cx - 100 + 40} ${y0 + 34}`}
                        fill="none"
                        stroke={C.before}
                        strokeWidth="5"
                        strokeOpacity="0.85"
                        strokeLinecap="round"
                        markerEnd="url(#aiv-arrow)"
                      />
                      <text
                        x={cx}
                        y={y0 + 60}
                        textAnchor="middle"
                        fill={C.before}
                        fontSize="12"
                        fontWeight="800"
                      >
                        weight = 0.82
                      </text>
                      <text
                        x={cx}
                        y={y0 + 100}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="11"
                        fontWeight="600"
                      >
                        Model output: correct next-token prediction ✓
                      </text>
                      <text
                        x={cx}
                        y={y0 + 130}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="11"
                        fontWeight="600"
                      >
                        Looks like coreference resolution.
                      </text>
                    </g>
                  );
                })()}

                {/* AFTER: ablate "dog" */}
                <rect
                  x={rightX}
                  y={py}
                  width={paneW}
                  height={paneH}
                  rx={16}
                  fill={C.after}
                  fillOpacity="0.08"
                  stroke={C.after}
                  strokeOpacity="0.55"
                  strokeWidth="1.4"
                />
                <text
                  x={rightX + 20}
                  y={py + 26}
                  fill={C.after}
                  fontSize="14"
                  fontWeight="900"
                >
                  After ablation — mask out "dog"
                </text>
                <text
                  x={rightX + 20}
                  y={py + 46}
                  fill="#cbd5e1"
                  fontSize="12"
                  fontWeight="600"
                >
                  Force weight on "dog" to zero, measure output change
                </text>
                {(() => {
                  const cx = rightX + paneW / 2;
                  const y0 = py + 80;
                  return (
                    <g>
                      <TinyToken cx={cx - 100} y={y0} label="it" color={C.after} />
                      <TinyToken cx={cx + 100} y={y0} label="dog" color={C.after} />
                      {/* Ablated arrow */}
                      <path
                        d={`M ${cx + 100 - 40} ${y0 + 34} L ${cx - 100 + 40} ${y0 + 34}`}
                        fill="none"
                        stroke={C.warn}
                        strokeWidth="2"
                        strokeOpacity="0.6"
                        strokeDasharray="4 4"
                        strokeLinecap="round"
                      />
                      <text
                        x={cx}
                        y={y0 + 60}
                        textAnchor="middle"
                        fill={C.warn}
                        fontSize="12"
                        fontWeight="800"
                      >
                        weight forced to 0
                      </text>
                      <text
                        x={cx}
                        y={y0 + 100}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="11"
                        fontWeight="600"
                      >
                        Model output: <tspan fill={C.warn} fontWeight="800">barely changed</tspan>.
                      </text>
                      <text
                        x={cx}
                        y={y0 + 130}
                        textAnchor="middle"
                        fill="#cbd5e1"
                        fontSize="11"
                        fontWeight="600"
                      >
                        The 0.82 weight was correlational, not causal.
                      </text>
                    </g>
                  );
                })()}

                {/* Verdict banner below both panes */}
                <g transform={`translate(${V.w / 2}, ${py + paneH + 30})`}>
                  <rect
                    x={-260}
                    y={-16}
                    width={520}
                    height={32}
                    rx={16}
                    fill={C.warn}
                    fillOpacity="0.16"
                    stroke={C.warn}
                    strokeOpacity="0.6"
                  />
                  <text
                    x={0}
                    y={5}
                    textAnchor="middle"
                    fill="#fca5a5"
                    fontSize="12"
                    fontWeight="800"
                  >
                    Only an intervention (ablate, replace, or corrupt) proves causal importance.
                  </text>
                </g>
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="aiv-legend">
        <span className="aiv-legend-item route">Q · K — routing</span>
        <span className="aiv-legend-item content">V — content</span>
        <span className="aiv-legend-item head">head-specific projections</span>
        <span className="aiv-legend-item warn">interpretability trap</span>
      </div>

      <div className="aiv-bottom-note">
        <strong>Two failure modes to watch for</strong>

        <p>
          <em>Dead heads:</em> every query in a head puts nearly all
          probability on one fixed position (often token 0 or the last
          token). The head is producing a constant output that does not
          depend on Q. Common in over-parameterized models; safe to prune.
        </p>

        <p>
          <em>Saturated softmax:</em> one weight ≈ 1.0 and the rest ≈ 0.
          Gradients through the softmax vanish (∂softmax/∂score becomes
          near-singular), so that head stops learning. Usually caused by
          scores growing too large — the √d_k scaling exists exactly to
          prevent this.
        </p>
      </div>
    </section>
  );
}

export default AttentionInternalsVisual;
