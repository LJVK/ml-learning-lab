import "./CrossAttentionVisual.css";

const SOURCE = ["The", "cat", "sat", "quietly"];
const TARGET = ["Le", "chat", "silencieux"];
const NS = SOURCE.length;
const NT = TARGET.length;

// ── Layout constants (SVG user units) ─────────────────────────────────────
const V = { w: 1000, h: 1080 };

// Row 1: SOURCE tokens (top-left half)
const SRC_Y = 60;
const SRC_TOKEN_W = 100;
const SRC_TOKEN_H = 42;
const SRC_TOKEN_CENTERS = [130, 260, 390, 520];

// Row 2: TARGET tokens (top-right half, visually offset)
const TGT_Y = 60;
const TGT_TOKEN_W = 110;
const TGT_TOKEN_H = 42;
const TGT_TOKEN_CENTERS = [660, 790, 920];

// Divider between source/target halves — placed midway between last source
// (x=520+50=570) and first target (x=660-55=605), so it never crosses tokens.
const DIVIDER_X = 588;

// Row 3: K / V (from source) and Q (from target) projection stacks
const QKV_Y = 220;
const QKV_ROW_H = 36;
const QKV_ROW_GAP = 8;
const K_CX = 200;   // K stack center-x (from source)
const V_CX = 470;   // V stack center-x (from source)
const Q_CX = 800;   // Q stack center-x (from target)
// Source-derived stacks have NS rows; target-derived has NT rows
const KV_STACK_END = QKV_Y + NS * (QKV_ROW_H + QKV_ROW_GAP) - QKV_ROW_GAP;
const Q_STACK_END = QKV_Y + NT * (QKV_ROW_H + QKV_ROW_GAP) - QKV_ROW_GAP;
const QKV_END = Math.max(KV_STACK_END, Q_STACK_END);

// Row 4: attention matrix (rectangular: NT rows × NS cols)
const MATRIX_Y = QKV_END + 100;
const MATRIX_CELL = 52;
const MATRIX_W = MATRIX_CELL * NS;   // 208
const MATRIX_H = MATRIX_CELL * NT;   // 156
const MATRIX_X = 130;

// Softmax matrix on the right — gap must fit a centered arrow AND clear the
// softmax row labels ("silencieux" ≈ 65px wide, extending left of SOFTMAX_X).
const SOFTMAX_X = MATRIX_X + MATRIX_W + 260;

// Row 5: weighted-mix band
const MIX_Y = MATRIX_Y + MATRIX_H + 90;
const MIX_ROW_H = 40;
const MIX_ROW_GAP = 12;

// Row 6: output target tokens (tight to end of mix band; no dead space below)
const OUTPUT_Y = MIX_Y + NT * (MIX_ROW_H + MIX_ROW_GAP) - MIX_ROW_GAP + 44;

// Palette — source is cool (blue/cyan), target is warm (pink/orange)
const C = {
  src: "#7dd3fc",      // sky
  tgt: "#fb923c",      // orange
  q: "#f472b6",        // pink (Q from target)
  k: "#22d3ee",        // cyan (K from source)
  v: "#facc15",        // gold (V from source)
  weightHi: "#3b82f6",
};

// Attention weights: NT×NS (rows = target queries, cols = source keys)
const WEIGHTS = [
  [0.70, 0.10, 0.05, 0.15], // "Le"          → "The"
  [0.10, 0.65, 0.15, 0.10], // "chat"        → "cat"
  [0.05, 0.05, 0.15, 0.75], // "silencieux"  → "quietly"
];

// Raw pre-softmax scores
const RAW_SCORES = [
  [3.2, 0.5, 0.2, 1.1],
  [0.8, 3.0, 1.3, 0.7],
  [0.3, 0.4, 1.2, 3.3],
];

function TokenRect({ cx, y, label, color, width = SRC_TOKEN_W, height = SRC_TOKEN_H }) {
  const x = cx - width / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={12}
        fill={color}
        fillOpacity="0.22"
        stroke={color}
        strokeOpacity="0.7"
        strokeWidth="1.2"
        filter={`url(#ca-glow-${color === C.src ? "src" : "tgt"})`}
      />
      <text
        x={cx}
        y={y + height / 2 + 5}
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

// A projection column of length `rows` (5-ish token vectors, colored by role).
function ProjectionColumn({ cx, label, color, filterId, tokens, rowLabelColor }) {
  return (
    <g>
      <text
        x={cx}
        y={QKV_Y - 14}
        textAnchor="middle"
        fill={color}
        fontSize="16"
        fontWeight="900"
        letterSpacing="2"
      >
        {label}
      </text>
      {tokens.map((tk, i) => {
        const y = QKV_Y + i * (QKV_ROW_H + QKV_ROW_GAP);
        return (
          <g key={`${label}-${tk}-${i}`}>
            <rect
              x={cx - 78}
              y={y}
              width={156}
              height={QKV_ROW_H}
              rx={8}
              fill={color}
              fillOpacity="0.16"
              stroke={color}
              strokeOpacity="0.7"
              strokeWidth="1.2"
              filter={`url(#${filterId})`}
            />
            {[0, 1, 2, 3, 4, 5, 6].map((k) => (
              <rect
                key={k}
                x={cx - 68 + k * 20}
                y={y + 8}
                width={16}
                height={QKV_ROW_H - 16}
                rx={2}
                fill={color}
                fillOpacity={0.35 + ((i * 5 + k * 3) % 5) * 0.1}
              />
            ))}
            <text
              x={cx - 96}
              y={y + QKV_ROW_H / 2 + 4}
              textAnchor="end"
              fill={rowLabelColor}
              fontSize="11"
              fontWeight="700"
            >
              {tk}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Matrix({ x, y, mode, title, subtitle, rows, cols, data }) {
  const w = MATRIX_CELL * cols;
  return (
    <g>
      <text
        x={x + w / 2}
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
        x={x + w / 2}
        y={y - 14}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="11"
        fontWeight="600"
      >
        {subtitle}
      </text>

      {/* Column headers: source keys */}
      {SOURCE.slice(0, cols).map((tk, j) => (
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

      {/* Row headers: target queries */}
      {TARGET.slice(0, rows).map((tk, i) => (
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
          const opacity =
            mode === "weights" ? Math.max(0.08, Math.min(1, val * 1.4)) : 0.14 + val * 0.08;
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
                fontSize="12"
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

function CrossAttentionVisual() {
  const matrixMidY = MATRIX_Y + MATRIX_H / 2;
  // Center the arrow on the true midpoint between the two matrices' cell
  // regions (not on the "safe" sub-range biased by row labels). Softmax row
  // labels extend ~70px left of SOFTMAX_X — we've widened the gap so that
  // fits alongside a centered arrow.
  const gapLeft = MATRIX_X + MATRIX_W;      // 338
  const gapRight = SOFTMAX_X;               // 598
  const gapMid = (gapLeft + gapRight) / 2;  // 468
  const arrowHalf = 48;
  const arrowX1 = gapMid - arrowHalf;       // 420
  const arrowX2 = gapMid + arrowHalf;       // 516 — clears "silencieux" (~ x=528)

  return (
    <section className="ca-visual-card">
      <div className="ca-visual-header">
        <p className="ca-eyebrow">Visual mental model</p>
        <h2>
          Cross&#8209;attention: one sequence queries another for information
        </h2>
        <p>
          Two sequences meet. The target sequence produces queries; the source
          sequence produces keys and values. Each target token asks &ldquo;what
          in the source is relevant to me?&rdquo; and pulls a weighted mix of
          the source&rsquo;s values. This is the mechanism a decoder uses to
          attend to an encoder&rsquo;s output.
        </p>
        <dl className="ca-defs">
          <div>
            <dt>Q ← target</dt>
            <dd>what each target token is looking for</dd>
          </div>
          <div>
            <dt>K ← source</dt>
            <dd>source-side labels</dd>
          </div>
          <div>
            <dt>V ← source</dt>
            <dd>source-side content</dd>
          </div>
        </dl>
      </div>

      <div className="ca-diagram-wrap">
        <svg
          viewBox={`0 0 ${V.w} ${V.h}`}
          xmlns="http://www.w3.org/2000/svg"
          className="ca-diagram"
          role="img"
          aria-label="Cross-attention: source tokens produce K and V, target tokens produce Q, they combine into a rectangular attention matrix (target × source), softmax converts scores to weights, and each output is a weighted mix of source V vectors."
        >
          <defs>
            <filter id="ca-glow-src" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="ca-glow-tgt" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="ca-glow-q" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="ca-glow-k" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="ca-glow-v" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="ca-arrow"
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

          {/* Divider line between source-half and target-half at the top */}
          <line
            x1={DIVIDER_X}
            y1={20}
            x2={DIVIDER_X}
            y2={QKV_Y - 40}
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />

          {/* Section labels */}
          <text
            x={SRC_TOKEN_CENTERS[Math.floor(NS / 2)]}
            y={30}
            textAnchor="middle"
            fill={C.src}
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            SOURCE (ENCODER)
          </text>
          <text
            x={(TGT_TOKEN_CENTERS[0] + TGT_TOKEN_CENTERS[NT - 1]) / 2}
            y={30}
            textAnchor="middle"
            fill={C.tgt}
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            TARGET (DECODER)
          </text>

          {/* Source tokens */}
          {SOURCE.map((t, i) => (
            <TokenRect
              key={`src-${t}`}
              cx={SRC_TOKEN_CENTERS[i]}
              y={SRC_Y}
              label={t}
              color={C.src}
            />
          ))}

          {/* Target tokens */}
          {TARGET.map((t, i) => (
            <TokenRect
              key={`tgt-${t}`}
              cx={TGT_TOKEN_CENTERS[i]}
              y={TGT_Y}
              label={t}
              color={C.tgt}
              width={TGT_TOKEN_W}
              height={TGT_TOKEN_H}
            />
          ))}

          {/* Fan lines: source → K, V; target → Q. Colored so which-goes-where reads. */}
          {SRC_TOKEN_CENTERS.map((tcx, i) => (
            <g key={`src-fan-${i}`}>
              {[K_CX, V_CX].map((qcx, j) => {
                const y1 = SRC_Y + SRC_TOKEN_H;
                const rowY = QKV_Y + i * (QKV_ROW_H + QKV_ROW_GAP) + QKV_ROW_H / 2;
                return (
                  <path
                    key={j}
                    d={`M ${tcx} ${y1} C ${tcx} ${(y1 + rowY) / 2}, ${qcx} ${(y1 + rowY) / 2}, ${qcx - 78} ${rowY}`}
                    fill="none"
                    stroke={C.src}
                    strokeOpacity="0.2"
                    strokeWidth="1"
                    strokeDasharray="3 4"
                  />
                );
              })}
            </g>
          ))}
          {TGT_TOKEN_CENTERS.map((tcx, i) => {
            const y1 = TGT_Y + TGT_TOKEN_H;
            const rowY = QKV_Y + i * (QKV_ROW_H + QKV_ROW_GAP) + QKV_ROW_H / 2;
            return (
              <path
                key={`tgt-fan-${i}`}
                d={`M ${tcx} ${y1} C ${tcx} ${(y1 + rowY) / 2}, ${Q_CX} ${(y1 + rowY) / 2}, ${Q_CX - 78} ${rowY}`}
                fill="none"
                stroke={C.tgt}
                strokeOpacity="0.25"
                strokeWidth="1"
                strokeDasharray="3 4"
              />
            );
          })}

          {/* PROJECT label */}
          <text
            x={V.w / 2}
            y={QKV_Y - 42}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            PROJECT: K, V ← SOURCE  ·  Q ← TARGET
          </text>

          <ProjectionColumn
            cx={K_CX}
            label="K"
            color={C.k}
            filterId="ca-glow-k"
            tokens={SOURCE}
            rowLabelColor={C.src}
          />
          <ProjectionColumn
            cx={V_CX}
            label="V"
            color={C.v}
            filterId="ca-glow-v"
            tokens={SOURCE}
            rowLabelColor={C.src}
          />
          <ProjectionColumn
            cx={Q_CX}
            label="Q"
            color={C.q}
            filterId="ca-glow-q"
            tokens={TARGET}
            rowLabelColor={C.tgt}
          />

          {/* Section: QK^T → softmax weights */}
          <text
            x={V.w / 2}
            y={MATRIX_Y - 60}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            SCORE · SCALE · SOFTMAX  (matrix is NT × NS — not square)
          </text>

          <Matrix
            x={MATRIX_X}
            y={MATRIX_Y}
            mode="raw"
            title="Q · Kᵀ (raw scores)"
            subtitle="row = target query · col = source key"
            rows={NT}
            cols={NS}
            data={RAW_SCORES}
          />

          {/* Arrow between the two matrices */}
          <g>
            <line
              x1={arrowX1}
              y1={matrixMidY}
              x2={arrowX2}
              y2={matrixMidY}
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinecap="round"
              markerEnd="url(#ca-arrow)"
            />
            <g transform={`translate(${gapMid}, ${matrixMidY - 26})`}>
              <rect
                x={-78}
                y={-16}
                width={156}
                height={32}
                rx={16}
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
                ÷ √d_k · softmax
              </text>
            </g>
            <text
              x={gapMid}
              y={MATRIX_Y + MATRIX_H + 20}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="10"
              fontWeight="700"
            >
              (each row sums to 1)
            </text>
          </g>

          <Matrix
            x={SOFTMAX_X}
            y={MATRIX_Y}
            mode="weights"
            title="attention weights"
            subtitle="how much each target attends to each source"
            rows={NT}
            cols={NS}
            data={WEIGHTS}
          />

          {/* Weighted mix band: for each target row, mix source V vectors */}
          <text
            x={V.w / 2}
            y={MIX_Y - 20}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            OUTPUT = ATTENTION · V_source
          </text>

          {TARGET.map((qtok, i) => {
            const rowY = MIX_Y + i * (MIX_ROW_H + MIX_ROW_GAP);
            return (
              <g key={`mix-${qtok}`}>
                <text
                  x={110}
                  y={rowY + MIX_ROW_H / 2 + 4}
                  textAnchor="end"
                  fill={C.q}
                  fontSize="12"
                  fontWeight="800"
                >
                  {qtok}
                </text>
                {WEIGHTS[i].map((w, j) => {
                  const slotX = 130 + j * 200;
                  const barW = 20 + w * 170;
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
                        x={slotX + 10}
                        y={rowY + MIX_ROW_H / 2 + 4}
                        fill={w > 0.35 ? "#0f172a" : "#e2e8f0"}
                        fontSize="11"
                        fontWeight="800"
                      >
                        {w.toFixed(2)}·V({SOURCE[j]})
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* Output target tokens (contextualized) */}
          <text
            x={V.w / 2}
            y={OUTPUT_Y - 12}
            textAnchor="middle"
            fill={C.tgt}
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            OUTPUT (TARGET, CONTEXTUALIZED)
          </text>
          {TARGET.map((t, i) => (
            <TokenRect
              key={`out-${t}`}
              cx={TGT_TOKEN_CENTERS[i]}
              y={OUTPUT_Y}
              label={t}
              color={C.tgt}
              width={TGT_TOKEN_W}
              height={TGT_TOKEN_H}
            />
          ))}
        </svg>
      </div>

      <div className="ca-legend">
        <span className="ca-legend-item src">SOURCE — provides K, V</span>
        <span className="ca-legend-item tgt">TARGET — provides Q</span>
      </div>

      <div className="ca-bottom-note">
        <strong>Common wrong mental model:</strong> cross&#8209;attention is
        not self&#8209;attention on the concatenation of the two sequences.
        Q strictly comes from one sequence, K and V from the other, and the
        output length always matches the query sequence — not the key/value
        sequence. That is why the matrix is rectangular NT × NS, not square.
      </div>
    </section>
  );
}

export default CrossAttentionVisual;
