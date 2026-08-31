import "./MasksVisual.css";

// Attention has a query dimension (rows) and a key dimension (cols).
// We show ONLY the real tokens as queries (PAD tokens don't produce
// meaningful queries in practice — either they're not computed at all,
// or the loss ignores their output rows). All 5 tokens appear as
// potential keys, so both masks read clearly on the grid:
//   - Causal mask   → triangular pattern in the 3×3 real-key region
//   - Padding mask  → two always-blocked rightmost columns
const QUERY_TOKENS = ["The", "cat", "sat"];
const KEY_TOKENS = ["The", "cat", "sat", "PAD", "PAD"];
const NQ = QUERY_TOKENS.length;
const NK = KEY_TOKENS.length;
const PAD_START = 3; // key indices >= PAD_START are padding

// ── Layout ───────────────────────────────────────────────────────────────
const V = { w: 1080, h: 940 };

// Input token row at the top (all 5 tokens shown so users see PAD in context)
const INPUT_Y = 40;
const TOKEN_W = 100;
const TOKEN_H = 40;
const TOKEN_CENTERS = [180, 320, 460, 600, 740];

// Three panels: raw scores | mask | masked scores
const PANEL_Y = 180;
const CELL = 50;
const GRID_W = CELL * NK;   // 250
const GRID_H = CELL * NQ;   // 150
// Center the three panels horizontally with even gaps
const PANEL_GAP = 90;
const PANEL_TOTAL_W = 3 * GRID_W + 2 * PANEL_GAP;
const PANEL_START_X = (V.w - PANEL_TOTAL_W) / 2;
const RAW_X = PANEL_START_X;
const MASK_X = RAW_X + GRID_W + PANEL_GAP;
const MASKED_X = MASK_X + GRID_W + PANEL_GAP;

// Softmax output panel below
const SOFTMAX_Y = PANEL_Y + GRID_H + 200;

// Palette
const C = {
  pad: "#f97316",       // orange for PAD tokens
  real: "#22d3ee",      // cyan for real tokens
  blocked: "#ef4444",   // red for masked / -inf
  allowed: "#22c55e",   // green for allowed
  weight: "#3b82f6",    // blue for weight heatmap
  q: "#f472b6",         // pink for query axis
  k: "#22d3ee",         // cyan for key axis
};

// Toy raw scores: NQ rows × NK cols. Values chosen so the softmax output
// demonstrates the effect clearly (allowed cells produce meaningful weights).
const RAW_SCORES = [
  [3.0, 2.0, 0.5, 1.5, 1.0],   // "The" as query
  [1.0, 3.0, 2.0, 1.2, 0.8],   // "cat" as query
  [0.5, 2.0, 3.0, 0.9, 1.1],   // "sat" as query
];

// Combined causal + padding mask: mask[i][j] = true means ALLOWED.
// Row i attends to col j iff j <= i (causal) AND j < PAD_START (not PAD).
const MASK = Array.from({ length: NQ }, (_, i) =>
  Array.from({ length: NK }, (_, j) => j <= i && j < PAD_START)
);

// Masked softmax over key dimension. If a full row is masked (never happens
// with our real queries here), return zeros to avoid NaN in the display.
function maskedSoftmax(scores, mask) {
  return scores.map((row, i) => {
    const maskedRow = row.map((v, j) => (mask[i][j] ? v : -Infinity));
    const maxV = Math.max(...maskedRow.filter((v) => v !== -Infinity));
    if (!isFinite(maxV)) return row.map(() => 0);
    const exps = maskedRow.map((v) => (v === -Infinity ? 0 : Math.exp(v - maxV)));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => (sum > 0 ? e / sum : 0));
  });
}

const SOFTMAX_OUT = maskedSoftmax(RAW_SCORES, MASK);

function TokenRect({ cx, y, label, isPad }) {
  const x = cx - TOKEN_W / 2;
  const color = isPad ? C.pad : C.real;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={TOKEN_W}
        height={TOKEN_H}
        rx={12}
        fill={color}
        fillOpacity={isPad ? 0.25 : 0.28}
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.2"
        strokeDasharray={isPad ? "4 4" : "0"}
        filter={`url(#mv-glow-${isPad ? "pad" : "real"})`}
      />
      <text
        x={cx}
        y={y + TOKEN_H / 2 + 5}
        textAnchor="middle"
        fill="#f8fafc"
        fontWeight="800"
        fontSize="14"
      >
        {label}
      </text>
    </g>
  );
}

// Renders an NQ×NK grid (rectangular: queries as rows, keys as cols).
// mode is "raw" (numeric scores) | "mask" (allowed/blocked) | "masked" (raw or -inf) | "weights"
function Grid({ x, y, mode, title, subtitle }) {
  return (
    <g>
      <text
        x={x + GRID_W / 2}
        y={y - 40}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize="14"
        fontWeight="900"
        letterSpacing="2"
      >
        {title}
      </text>
      <text
        x={x + GRID_W / 2}
        y={y - 22}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="10.5"
        fontWeight="600"
      >
        {subtitle}
      </text>

      {/* Column headers (keys) */}
      {KEY_TOKENS.map((tk, j) => (
        <text
          key={`ch-${j}`}
          x={x + j * CELL + CELL / 2}
          y={y - 4}
          textAnchor="middle"
          fill={j >= PAD_START ? C.pad : C.k}
          fontSize="10"
          fontWeight="800"
        >
          {tk}
        </text>
      ))}

      {/* Row headers (queries) */}
      {QUERY_TOKENS.map((tk, i) => (
        <text
          key={`rh-${i}`}
          x={x - 8}
          y={y + i * CELL + CELL / 2 + 4}
          textAnchor="end"
          fill={C.q}
          fontSize="10"
          fontWeight="800"
        >
          {tk}
        </text>
      ))}

      {/* Cells */}
      {RAW_SCORES.map((row, i) =>
        row.map((val, j) => {
          const cx = x + j * CELL;
          const cy = y + i * CELL;
          const allowed = MASK[i][j];
          let fill, opacity, label, labelColor, strokeColor, strokeWidth;

          if (mode === "raw") {
            fill = "#334155";
            opacity = 0.28;
            label = val.toFixed(1);
            labelColor = "#e2e8f0";
            strokeColor = "rgba(148,163,184,0.35)";
            strokeWidth = 0.8;
          } else if (mode === "mask") {
            fill = allowed ? C.allowed : C.blocked;
            opacity = allowed ? 0.45 : 0.55;
            label = allowed ? "✓" : "✕";
            labelColor = allowed ? "#052e16" : "#7f1d1d";
            strokeColor = allowed ? C.allowed : C.blocked;
            strokeWidth = 1.2;
          } else if (mode === "masked") {
            if (allowed) {
              fill = "#334155";
              opacity = 0.28;
              label = val.toFixed(1);
              labelColor = "#e2e8f0";
              strokeColor = "rgba(148,163,184,0.35)";
              strokeWidth = 0.8;
            } else {
              fill = C.blocked;
              opacity = 0.28;
              label = "−∞";
              labelColor = "#fecaca";
              strokeColor = "rgba(239,68,68,0.55)";
              strokeWidth = 0.9;
            }
          } else if (mode === "weights") {
            const w = SOFTMAX_OUT[i][j];
            fill = w > 0 ? C.weight : "#1e293b";
            opacity = w > 0 ? Math.max(0.1, Math.min(1, w * 1.5)) : 0.35;
            label = w === 0 ? "0" : w.toFixed(2);
            labelColor = w > 0.3 ? "#0f172a" : "#e2e8f0";
            strokeColor = "rgba(148,163,184,0.35)";
            strokeWidth = 0.8;
          }

          return (
            <g key={`c-${i}-${j}`}>
              <rect
                x={cx + 1}
                y={cy + 1}
                width={CELL - 2}
                height={CELL - 2}
                rx={4}
                fill={fill}
                fillOpacity={opacity}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              <text
                x={cx + CELL / 2}
                y={cy + CELL / 2 + 4}
                textAnchor="middle"
                fill={labelColor}
                fontSize="11"
                fontWeight={mode === "weights" && SOFTMAX_OUT[i][j] > 0.3 ? 800 : 600}
              >
                {label}
              </text>
            </g>
          );
        })
      )}
    </g>
  );
}

function MasksVisual() {
  return (
    <section className="mv-visual-card">
      <div className="mv-visual-header">
        <p className="mv-eyebrow">Visual mental model</p>
        <h2>
          Masks: certain attention scores get set to −∞ before softmax so those
          positions receive zero weight
        </h2>
        <p>
          Two flavors combine here: a <strong>causal mask</strong> blocks
          future positions (any j &gt; i), and a <strong>padding mask</strong>{" "}
          blocks meaningless <code>PAD</code> positions. Applied to the raw
          scores as −∞, then softmax naturally sends those cells to zero.
          Note the matrix is 3 × 5: only real tokens produce queries, but
          all tokens (real and PAD) show up as potential keys.
        </p>
        <dl className="mv-defs">
          <div>
            <dt>causal</dt>
            <dd>block future tokens (j &gt; i)</dd>
          </div>
          <div>
            <dt>padding</dt>
            <dd>block PAD positions</dd>
          </div>
          <div>
            <dt>combined</dt>
            <dd>allowed iff both permit</dd>
          </div>
        </dl>
      </div>

      <div className="mv-diagram-wrap">
        <svg
          viewBox={`0 0 ${V.w} ${V.h}`}
          xmlns="http://www.w3.org/2000/svg"
          className="mv-diagram"
          role="img"
          aria-label="Attention masks: raw scores, combined causal+padding mask, masked scores with -inf, then softmax weights showing masked positions become zero and each row sums to one."
        >
          <defs>
            <filter id="mv-glow-real" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="mv-glow-pad" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="mv-glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Input tokens */}
          <text
            x={V.w / 2}
            y={22}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            INPUT SEQUENCE — 3 REAL TOKENS + 2 PAD
          </text>
          {KEY_TOKENS.map((t, i) => (
            <TokenRect
              key={`in-${i}`}
              cx={TOKEN_CENTERS[i]}
              y={INPUT_Y}
              label={t}
              isPad={i >= PAD_START}
            />
          ))}

          {/* Explanation line: matrix is 3×5 because only real tokens query */}
          <text
            x={V.w / 2}
            y={PANEL_Y - 80}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="700"
          >
            Only the 3 real tokens issue queries · all 5 tokens are potential keys → matrix is 3 × 5
          </text>

          {/* Section label above panels */}
          <text
            x={V.w / 2}
            y={PANEL_Y - 62}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            RAW SCORES · MASK · MASKED SCORES
          </text>

          <Grid
            x={RAW_X}
            y={PANEL_Y}
            mode="raw"
            title="Q · Kᵀ (raw)"
            subtitle="only real tokens query · all tokens are keys"
          />

          {/* + operator between raw and mask */}
          <text
            x={RAW_X + GRID_W + PANEL_GAP / 2}
            y={PANEL_Y + GRID_H / 2 + 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="34"
            fontWeight="800"
          >
            ⊕
          </text>

          <Grid
            x={MASK_X}
            y={PANEL_Y}
            mode="mask"
            title="mask (causal ∩ padding)"
            subtitle="✓ = allowed · ✕ = blocked"
          />

          {/* = operator between mask and masked */}
          <text
            x={MASK_X + GRID_W + PANEL_GAP / 2}
            y={PANEL_Y + GRID_H / 2 + 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="34"
            fontWeight="800"
          >
            =
          </text>

          <Grid
            x={MASKED_X}
            y={PANEL_Y}
            mode="masked"
            title="masked scores"
            subtitle="blocked cells become −∞"
          />

          {/* Arrow down to softmax panel */}
          <path
            d={`M ${V.w / 2} ${PANEL_Y + GRID_H + 20} L ${V.w / 2} ${
              SOFTMAX_Y - 30
            }`}
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            fill="none"
            strokeLinecap="round"
            markerEnd="url(#mv-arrow)"
          />
          <marker
            id="mv-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#93c5fd" />
          </marker>

          {/* Softmax pill on the arrow */}
          <g
            transform={`translate(${V.w / 2 + 100}, ${
              (PANEL_Y + GRID_H + SOFTMAX_Y) / 2 - 5
            })`}
          >
            <rect
              x={-56}
              y={-14}
              width={112}
              height={28}
              rx={14}
              fill="rgba(15,23,42,0.85)"
              stroke="rgba(147,197,253,0.5)"
            />
            <text
              x={0}
              y={5}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="12"
              fontWeight="800"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              softmax
            </text>
          </g>

          {/* Softmax output as a weight heatmap */}
          <Grid
            x={(V.w - GRID_W) / 2}
            y={SOFTMAX_Y}
            mode="weights"
            title="attention weights"
            subtitle="masked cells = 0 exactly · each row sums to 1"
          />

          {/* Row sums check — all rows are real queries now */}
          <g>
            {SOFTMAX_OUT.map((row, i) => {
              const sum = row.reduce((a, b) => a + b, 0);
              const y = SOFTMAX_Y + i * CELL + CELL / 2 + 4;
              const x = (V.w - GRID_W) / 2 + GRID_W + 20;
              return (
                <text
                  key={`sum-${i}`}
                  x={x}
                  y={y}
                  fill={C.allowed}
                  fontSize="11"
                  fontWeight="800"
                >
                  Σ = {sum.toFixed(2)}
                </text>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="mv-legend">
        <span className="mv-legend-item allowed">✓ allowed</span>
        <span className="mv-legend-item blocked">✕ blocked → −∞</span>
        <span className="mv-legend-item pad">PAD</span>
        <span className="mv-legend-item real">real token</span>
      </div>

      <div className="mv-bottom-note">
        <strong>Common wrong mental model:</strong> a mask does not "hide"
        tokens from the input. All tokens still enter the attention layer.
        The mask zeroes out attention <em>weights</em> that would otherwise
        route information to or from disallowed positions. And it is applied{" "}
        <strong>before softmax</strong> — masking after softmax leaks
        probability into blocked positions and breaks the "rows sum to 1"
        invariant.
      </div>
    </section>
  );
}

export default MasksVisual;
