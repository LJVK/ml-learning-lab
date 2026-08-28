import "./SelfAttentionVisual.css";

const TOKENS = ["The", "cat", "sat", "on", "mat"];
const N = TOKENS.length;

// ── Layout constants (SVG user units) ─────────────────────────────────────
const V = { w: 1000, h: 1240 };

// Row 1: input tokens
const INPUT_Y = 50;
const TOKEN_W = 100;
const TOKEN_H = 42;
const TOKEN_CENTERS = [180, 340, 500, 660, 820];

// Row 2: Q / K / V projection triplet — three horizontal stacks
const QKV_Y = 210;
const QKV_ROW_H = 38;
const QKV_ROW_GAP = 8;
const QKV_LABEL_X = 90;
// Center-x for each of the three Q/K/V columns
const QKV_CENTERS = [280, 500, 720];
// Stack spans QKV_Y-4 down through 5 rows → ends at y ≈ QKV_Y + 226
const QKV_STACK_END = QKV_Y - 4 + N * (QKV_ROW_H + QKV_ROW_GAP) - QKV_ROW_GAP;

// Row 3: attention score matrix Q · K^T
const MATRIX_Y = QKV_STACK_END + 90;   // ≈ 528: leaves room for section label + matrix title
const MATRIX_CELL = 46;
const MATRIX_SIZE = MATRIX_CELL * N;    // 230
const MATRIX_X = 130;                   // left edge of the QK^T matrix

// Softmax matrix on the right, same size, arrow between
const SOFTMAX_X = MATRIX_X + MATRIX_SIZE + 200;

// Row 4: weighted-mix band (V rows × attention row → output row)
const MIX_Y = MATRIX_Y + MATRIX_SIZE + 90;   // matrix ends at MATRIX_Y+230; gap 90
const MIX_ROW_H = 40;
const MIX_ROW_GAP = 12;

// Row 5: output tokens
const OUTPUT_Y = MIX_Y + N * (MIX_ROW_H + MIX_ROW_GAP) - MIX_ROW_GAP + 60;

// Palette
const C = {
  q: "#f472b6",   // pink
  k: "#22d3ee",   // cyan
  v: "#facc15",   // gold
  out: "#93c5fd", // blue
  weightLo: "rgba(37, 99, 235, 0.08)",
  weightHi: "#3b82f6",
};

// Toy attention weights (softmax rows sum to 1) — hand-picked so patterns read visually.
// row i = query token i attending to key token j
const WEIGHTS = [
  [0.55, 0.25, 0.10, 0.05, 0.05], // "The" → mostly self
  [0.15, 0.45, 0.25, 0.05, 0.10], // "cat" → strong on cat, sat
  [0.10, 0.35, 0.35, 0.10, 0.10], // "sat" → cat + self
  [0.05, 0.10, 0.30, 0.35, 0.20], // "on"  → sat, self, mat
  [0.05, 0.30, 0.10, 0.20, 0.35], // "mat" → self + cat + on
];

// Raw pre-softmax scores (just for the QK^T grid feel — dispersed values)
const RAW_SCORES = [
  [3.1, 2.0, 0.6, 0.1, 0.1],
  [1.4, 2.8, 2.0, 0.2, 0.6],
  [1.0, 2.4, 2.4, 1.1, 1.0],
  [0.4, 1.1, 2.2, 2.4, 1.7],
  [0.5, 2.2, 1.0, 1.6, 2.4],
];

function TokenRect({ cx, y, label }) {
  const x = cx - TOKEN_W / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={TOKEN_W}
        height={TOKEN_H}
        rx={12}
        fill="rgba(99,102,241,0.28)"
        stroke="rgba(147,197,253,0.55)"
        strokeWidth="1.2"
        filter="url(#sa-glow-blue)"
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

// A single Q/K/V column: label + 5 stacked vector rows
function QKVColumn({ cx, label, color, filterId, showTokens }) {
  const stackTop = QKV_Y - 4;
  return (
    <g>
      <text
        x={cx}
        y={stackTop - 12}
        textAnchor="middle"
        fill={color}
        fontSize="16"
        fontWeight="900"
        letterSpacing="2"
      >
        {label}
      </text>
      {TOKENS.map((tk, i) => {
        const y = stackTop + i * (QKV_ROW_H + QKV_ROW_GAP);
        return (
          <g key={`${label}-${tk}`}>
            <rect
              x={cx - 70}
              y={y}
              width={140}
              height={QKV_ROW_H}
              rx={8}
              fill={color}
              fillOpacity="0.16"
              stroke={color}
              strokeOpacity="0.7"
              strokeWidth="1.2"
              filter={`url(#${filterId})`}
            />
            {/* Fake vector cells to communicate "this is a numeric vector" */}
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <rect
                key={k}
                x={cx - 60 + k * 20}
                y={y + 8}
                width={16}
                height={QKV_ROW_H - 16}
                rx={2}
                fill={color}
                fillOpacity={0.35 + ((i * 7 + k * 3) % 5) * 0.1}
              />
            ))}
            {showTokens && (
              <text
                x={cx - 88}
                y={y + QKV_ROW_H / 2 + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="11"
                fontWeight="700"
              >
                {tk}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

// A 5×5 matrix. `mode` = "raw" (QK^T scores) or "weights" (softmax weights)
function Matrix({ x, y, mode, title, subtitle }) {
  const data = mode === "raw" ? RAW_SCORES : WEIGHTS;
  return (
    <g>
      <text
        x={x + MATRIX_SIZE / 2}
        y={y - 32}
        textAnchor="middle"
        fill="#e2e8f0"
        fontSize="14"
        fontWeight="900"
        letterSpacing="2"
      >
        {title}
      </text>
      <text
        x={x + MATRIX_SIZE / 2}
        y={y - 14}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="11"
        fontWeight="600"
      >
        {subtitle}
      </text>

      {/* Column headers (keys) */}
      {TOKENS.map((tk, j) => (
        <text
          key={`col-${tk}`}
          x={x + j * MATRIX_CELL + MATRIX_CELL / 2}
          y={y - 2}
          textAnchor="middle"
          fill={C.k}
          fontSize="11"
          fontWeight="800"
        >
          {tk}
        </text>
      ))}

      {/* Row headers (queries) */}
      {TOKENS.map((tk, i) => (
        <text
          key={`row-${tk}`}
          x={x - 10}
          y={y + i * MATRIX_CELL + MATRIX_CELL / 2 + 4}
          textAnchor="end"
          fill={C.q}
          fontSize="11"
          fontWeight="800"
        >
          {tk}
        </text>
      ))}

      {/* Cells */}
      {data.map((row, i) =>
        row.map((val, j) => {
          const cx = x + j * MATRIX_CELL;
          const cy = y + i * MATRIX_CELL;
          // Weight heatmap: interpolate opacity in [0.08, 1.0]
          const opacity =
            mode === "weights" ? Math.max(0.08, Math.min(1, val * 1.8)) : 0.14 + val * 0.08;
          const label =
            mode === "weights" ? val.toFixed(2) : val.toFixed(1);
          return (
            <g key={`c-${i}-${j}`}>
              <rect
                x={cx + 1}
                y={cy + 1}
                width={MATRIX_CELL - 2}
                height={MATRIX_CELL - 2}
                rx={4}
                fill={mode === "weights" ? C.weightHi : "#334155"}
                fillOpacity={opacity}
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="0.8"
              />
              <text
                x={cx + MATRIX_CELL / 2}
                y={cy + MATRIX_CELL / 2 + 4}
                textAnchor="middle"
                fill={mode === "weights" && val > 0.3 ? "#0f172a" : "#e2e8f0"}
                fontSize="11"
                fontWeight={mode === "weights" && val > 0.3 ? 800 : 600}
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

function SelfAttentionVisual() {
  const matrixMidY = MATRIX_Y + MATRIX_SIZE / 2;
  const arrowX1 = MATRIX_X + MATRIX_SIZE + 10;
  const arrowX2 = SOFTMAX_X - 10;

  return (
    <section className="sa-visual-card">
      <div className="sa-visual-header">
        <p className="sa-eyebrow">Visual mental model</p>
        <h2>
          Self&#8209;attention: every token pulls information from every other
          token
        </h2>
        <p>
          Each token produces a query, a key, and a value. Queries dot with
          keys to score how much every token wants to attend to every other.
          Softmax turns scores into weights that sum to one per row, and the
          output for a token is a weighted mix of the value vectors.
        </p>
        <dl className="sa-defs">
          <div>
            <dt>Q</dt>
            <dd>what each token is looking for</dd>
          </div>
          <div>
            <dt>K</dt>
            <dd>what each token offers as a label</dd>
          </div>
          <div>
            <dt>V</dt>
            <dd>the content each token carries</dd>
          </div>
        </dl>
      </div>

      <div className="sa-diagram-wrap">
        <svg
          viewBox={`0 0 ${V.w} ${V.h}`}
          xmlns="http://www.w3.org/2000/svg"
          className="sa-diagram"
          role="img"
          aria-label="Self-attention: input tokens project into Q, K, V; Q·K^T produces a 5×5 score matrix, softmax converts it to weights, and each output token is the weighted sum of value vectors."
        >
          <defs>
            <filter id="sa-glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="sa-glow-q" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="sa-glow-k" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="sa-glow-v" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Section 1: input tokens */}
          <text
            x={V.w / 2}
            y={30}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            INPUT TOKENS
          </text>
          {TOKENS.map((t, i) => (
            <TokenRect key={`in-${t}`} cx={TOKEN_CENTERS[i]} y={INPUT_Y} label={t} />
          ))}

          {/* Section 2: Q / K / V projections */}
          <text
            x={V.w / 2}
            y={QKV_Y - 42}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            PROJECT: x → Q, K, V
          </text>

          {/* Fan lines: each input token → each of the 3 columns (subtle) */}
          {TOKEN_CENTERS.map((tcx, i) =>
            QKV_CENTERS.map((qcx, j) => {
              const y1 = INPUT_Y + TOKEN_H;
              const rowY = QKV_Y - 4 + i * (QKV_ROW_H + QKV_ROW_GAP) + QKV_ROW_H / 2;
              return (
                <path
                  key={`t2p-${i}-${j}`}
                  d={`M ${tcx} ${y1} C ${tcx} ${(y1 + rowY) / 2}, ${qcx} ${(y1 + rowY) / 2}, ${qcx - 70} ${rowY}`}
                  fill="none"
                  stroke="#93c5fd"
                  strokeOpacity="0.14"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              );
            })
          )}

          <QKVColumn cx={QKV_CENTERS[0]} label="Q" color={C.q} filterId="sa-glow-q" showTokens />
          <QKVColumn cx={QKV_CENTERS[1]} label="K" color={C.k} filterId="sa-glow-k" showTokens={false} />
          <QKVColumn cx={QKV_CENTERS[2]} label="V" color={C.v} filterId="sa-glow-v" showTokens={false} />

          {/* Section 3: QK^T → softmax weights */}
          <text
            x={V.w / 2}
            y={MATRIX_Y - 60}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            SCORE · SCALE · SOFTMAX
          </text>

          <Matrix
            x={MATRIX_X}
            y={MATRIX_Y}
            mode="raw"
            title="Q · Kᵀ (raw scores)"
            subtitle="row = query · col = key"
          />

          {/* Scale + softmax arrow between the two matrices */}
          <g>
            <line
              x1={arrowX1}
              y1={matrixMidY}
              x2={arrowX2}
              y2={matrixMidY}
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
              markerEnd="url(#sa-arrow)"
            />
            <marker
              id="sa-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#93c5fd" />
            </marker>
            <g transform={`translate(${(arrowX1 + arrowX2) / 2}, ${matrixMidY - 22})`}>
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
                fontSize="11"
                fontWeight="800"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >
                ÷ √d_k · softmax
              </text>
            </g>
            <text
              x={(arrowX1 + arrowX2) / 2}
              y={matrixMidY + 30}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontWeight="700"
            >
              (rows sum to 1)
            </text>
          </g>

          <Matrix
            x={SOFTMAX_X}
            y={MATRIX_Y}
            mode="weights"
            title="attention weights"
            subtitle="how much each query attends to each key"
          />

          {/* Section 4: Weighted mix — for each output row, show weights · V */}
          <text
            x={V.w / 2}
            y={MIX_Y - 20}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            OUTPUT = ATTENTION · V
          </text>

          {TOKENS.map((qtok, i) => {
            const rowY = MIX_Y + i * (MIX_ROW_H + MIX_ROW_GAP);
            return (
              <g key={`mix-${qtok}`}>
                <text
                  x={90}
                  y={rowY + MIX_ROW_H / 2 + 4}
                  textAnchor="end"
                  fill={C.q}
                  fontSize="12"
                  fontWeight="800"
                >
                  {qtok}
                </text>
                {/* One tinted V-slot per key, sized by attention weight */}
                {WEIGHTS[i].map((w, j) => {
                  const slotX = 110 + j * 160;
                  const barW = 12 + w * 130;
                  return (
                    <g key={`slot-${i}-${j}`}>
                      <rect
                        x={slotX}
                        y={rowY}
                        width={barW}
                        height={MIX_ROW_H}
                        rx={6}
                        fill={C.v}
                        fillOpacity={0.15 + w * 0.7}
                        stroke={C.v}
                        strokeOpacity="0.55"
                      />
                      <text
                        x={slotX + 8}
                        y={rowY + MIX_ROW_H / 2 + 4}
                        fill={w > 0.35 ? "#0f172a" : "#e2e8f0"}
                        fontSize="11"
                        fontWeight="800"
                      >
                        {w.toFixed(2)}·V({TOKENS[j]})
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Section 5: output tokens */}
          <text
            x={V.w / 2}
            y={OUTPUT_Y - 12}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            OUTPUT TOKENS
          </text>
          {TOKENS.map((t, i) => (
            <TokenRect key={`out-${t}`} cx={TOKEN_CENTERS[i]} y={OUTPUT_Y} label={t} />
          ))}
        </svg>
      </div>

      <div className="sa-legend">
        <span className="sa-legend-item q">Q — query</span>
        <span className="sa-legend-item k">K — key</span>
        <span className="sa-legend-item v">V — value</span>
      </div>

      <div className="sa-bottom-note">
        <strong>Common wrong mental model:</strong> Q, K, V are not three copies
        of the same tokens — they are three different learned views of the same
        tokens. Each view has its own projection matrix, trained end-to-end.
        Attention weights come from Q·Kᵀ; the output is those weights applied
        to V.
      </div>
    </section>
  );
}

export default SelfAttentionVisual;
