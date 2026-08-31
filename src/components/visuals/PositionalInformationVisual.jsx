import "./PositionalInformationVisual.css";

// ── Layout ───────────────────────────────────────────────────────────────
const V = { w: 1080, h: 1200 };

// Section 1: three copies of the same token at three positions
const PROBLEM_Y = 80;
const TOKEN_W = 120;
const TOKEN_H = 44;
const TOKEN_POSITIONS = [0, 3, 7];

// Section 2: sinusoidal grid (position × dim). GRID_Y needs clear headroom
// for the section header + 2-line explanation + formula chip + axis label
// before the grid rows begin. Empirically ~180px of preamble → GRID_Y=460.
const GRID_Y = 460;
const GRID_LEFT = 140;
const GRID_RIGHT = V.w - 100;
const GRID_W = GRID_RIGHT - GRID_LEFT;
const NUM_DIMS = 8;          // show 8 dimensions of the encoding
const ROW_H = 46;
const ROW_GAP = 6;
const POSITIONS = 24;        // sample this many positions along x

// Section 3: strategies comparison table (rendered as SVG rects/text)
const STRATS_Y = GRID_Y + NUM_DIMS * (ROW_H + ROW_GAP) + 130;

// Palette
const C = {
  tokenBase: "#7dd3fc",       // sky — raw token
  tokenSame: "#94a3b8",       // gray — indistinguishable to attention
  tokenPositioned: "#c084fc", // purple — after PE added
  sin: "#3b82f6",             // blue — even dims (sin)
  cos: "#f472b6",             // pink — odd dims (cos)
  emphasis: "#fbbf24",        // gold — labels
};

// Sinusoidal PE formula from Vaswani et al.:
//   PE(pos, 2i)   = sin(pos / 10000^(2i / D))
//   PE(pos, 2i+1) = cos(pos / 10000^(2i / D))
// D = model dimension. We use D=NUM_DIMS for the visual so all dims fit on
// screen; in real models D is 512–4096.
function peValue(pos, dim, D = NUM_DIMS) {
  const i = Math.floor(dim / 2);
  const wavelength = Math.pow(10000, (2 * i) / D);
  const angle = pos / wavelength;
  return dim % 2 === 0 ? Math.sin(angle) : Math.cos(angle);
}

// Build the smooth curve path for one dimension across `positions` samples.
function curvePath(dim, x0, x1, y0, h, positions = POSITIONS) {
  const points = [];
  for (let p = 0; p < positions; p++) {
    const x = x0 + (p / (positions - 1)) * (x1 - x0);
    const v = peValue(p, dim);          // in [-1, 1]
    const y = y0 + h / 2 - v * (h / 2 - 4);
    points.push([x, y]);
  }
  // Build cubic bezier through samples using Catmull–Rom-ish smoothing.
  let d = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0p, y0p] = points[i];
    const [x1p, y1p] = points[i + 1];
    const midX = (x0p + x1p) / 2;
    d += ` C ${midX} ${y0p}, ${midX} ${y1p}, ${x1p} ${y1p}`;
  }
  return d;
}

// ── Small components ─────────────────────────────────────────────────────

function TokenChip({ cx, y, label, color, dashed = false, sublabel }) {
  const x = cx - TOKEN_W / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={TOKEN_W}
        height={TOKEN_H}
        rx={12}
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeOpacity="0.75"
        strokeWidth="1.4"
        strokeDasharray={dashed ? "4 4" : "0"}
        filter="url(#piv-glow)"
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
      {sublabel && (
        <text
          x={cx}
          y={y + TOKEN_H + 18}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="11"
          fontWeight="700"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

function PositionalInformationVisual() {
  // Section 1 layout: three token pairs (before / after adding PE)
  const problemColX = [280, 540, 800];

  return (
    <section className="piv-visual-card">
      <div className="piv-visual-header">
        <p className="piv-eyebrow">Visual mental model</p>
        <h2>
          Positional information: attention is permutation&#8209;invariant, so
          we inject position into the token vector before block 1
        </h2>
        <p>
          Self-attention sees a <em>set</em> of tokens; it cannot tell{" "}
          <code>"the cat sat"</code> from <code>"sat cat the"</code>. Adding a
          position-dependent vector to each token embedding is what makes the
          model order-aware. In the sinusoidal formula, every position gets a
          unique <strong>D-dimensional fingerprint</strong> — one sine or
          cosine value per model dimension.
        </p>
        <dl className="piv-defs">
          <div>
            <dt>pos</dt>
            <dd>token index in the sequence</dd>
          </div>
          <div>
            <dt>i</dt>
            <dd>dimension pair index (0, 1, 2, …)</dd>
          </div>
          <div>
            <dt>D</dt>
            <dd>model dim (must match embedding)</dd>
          </div>
        </dl>
      </div>

      <div className="piv-diagram-wrap">
        <svg
          viewBox={`0 0 ${V.w} ${V.h}`}
          xmlns="http://www.w3.org/2000/svg"
          className="piv-diagram"
          role="img"
          aria-label="Positional information: same token at different positions is indistinguishable without PE. Adding sinusoidal position vectors makes each position uniquely identifiable across the model dimensions."
        >
          <defs>
            <filter id="piv-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="piv-glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Section 1: the problem (before / after) ─────────────────── */}
          <text
            x={V.w / 2}
            y={30}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            THE PROBLEM · SAME TOKEN AT THREE POSITIONS
          </text>

          {/* Before: three grey tokens (indistinguishable to attention) */}
          <text
            x={GRID_LEFT}
            y={PROBLEM_Y - 8}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="800"
            letterSpacing="1"
          >
            BEFORE PE — attention sees three identical vectors
          </text>
          {TOKEN_POSITIONS.map((pos, i) => (
            <TokenChip
              key={`before-${i}`}
              cx={problemColX[i]}
              y={PROBLEM_Y}
              label="cat"
              color={C.tokenSame}
              dashed
              sublabel={`pos = ${pos}`}
            />
          ))}
          {/* Arrow "same" for the before row */}
          <text
            x={V.w - 60}
            y={PROBLEM_Y + TOKEN_H / 2 + 5}
            fill="#94a3b8"
            fontSize="12"
            fontWeight="800"
          >
            same
          </text>

          {/* After: three positioned tokens (each visibly different) */}
          <text
            x={GRID_LEFT}
            y={PROBLEM_Y + 130}
            fill={C.tokenPositioned}
            fontSize="12"
            fontWeight="800"
            letterSpacing="1"
          >
            AFTER PE — each token vector encodes its position
          </text>
          {TOKEN_POSITIONS.map((pos, i) => (
            <TokenChip
              key={`after-${i}`}
              cx={problemColX[i]}
              y={PROBLEM_Y + 140}
              label={`cat + PE(${pos})`}
              color={C.tokenPositioned}
              sublabel={`pos = ${pos}`}
            />
          ))}
          <text
            x={V.w - 60}
            y={PROBLEM_Y + 140 + TOKEN_H / 2 + 5}
            fill={C.tokenPositioned}
            fontSize="12"
            fontWeight="800"
          >
            distinct
          </text>

          {/* ── Section 2: the sinusoidal grid ──────────────────────────── */}
          <text
            x={V.w / 2}
            y={GRID_Y - 100}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            THE FORMULA — SINUSOIDAL PE ACROSS THE FIRST 8 DIMENSIONS
          </text>

          {/* Explanation: what "8 dims" actually means */}
          <text
            x={V.w / 2}
            y={GRID_Y - 82}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="700"
          >
            A token vector has D numbers (D = 512 in the paper). PE gives one
            number per dim per position.
          </text>
          <text
            x={V.w / 2}
            y={GRID_Y - 66}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="600"
          >
            Below: rows are the first 8 dims of the PE vector · x-axis is
            position · each curve is the PE value at that dim across
            positions.
          </text>

          {/* Formula chip — two lines so it fits comfortably */}
          <g transform={`translate(${V.w / 2}, ${GRID_Y - 40})`}>
            <rect
              x={-220}
              y={-22}
              width={440}
              height={44}
              rx={12}
              fill="rgba(15,23,42,0.85)"
              stroke="rgba(147,197,253,0.5)"
            />
            <text
              x={0}
              y={-4}
              textAnchor="middle"
              fill="#93c5fd"
              fontSize="12"
              fontWeight="800"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              PE(pos, 2i)   =  sin( pos / 10000^(2i/D) )
            </text>
            <text
              x={0}
              y={14}
              textAnchor="middle"
              fill="#f9a8d4"
              fontSize="12"
              fontWeight="800"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              PE(pos, 2i+1) =  cos( pos / 10000^(2i/D) )
            </text>
          </g>

          {/* Position axis label */}
          <text
            x={GRID_LEFT}
            y={GRID_Y - 6}
            fill="#94a3b8"
            fontSize="11"
            fontWeight="700"
          >
            position →
          </text>
          <text
            x={GRID_RIGHT}
            y={GRID_Y - 6}
            textAnchor="end"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="700"
          >
            pos = {POSITIONS - 1}
          </text>

          {/* Vertical hint at pos=3: this column of 8 values IS the position-3 fingerprint. */}
          {(() => {
            const gridInnerW = GRID_RIGHT - GRID_LEFT - 8;
            const hintPos = 3;
            const xh = GRID_LEFT + 4 + (hintPos / (POSITIONS - 1)) * gridInnerW;
            const yTop = GRID_Y;
            const yBot = GRID_Y + NUM_DIMS * (ROW_H + ROW_GAP) - ROW_GAP;
            return (
              <g>
                <line
                  x1={xh}
                  y1={yTop}
                  x2={xh}
                  y2={yBot}
                  stroke="#fbbf24"
                  strokeWidth="1.4"
                  strokeDasharray="3 4"
                  strokeOpacity="0.75"
                />
                <text
                  x={xh}
                  y={yBot + 22}
                  textAnchor="middle"
                  fill="#fbbf24"
                  fontSize="11"
                  fontWeight="800"
                >
                  ↑ these 8 values at pos = 3 are that position's fingerprint
                </text>
              </g>
            );
          })()}

          {/* One row per dimension, alternating sin / cos */}
          {Array.from({ length: NUM_DIMS }, (_, dim) => {
            const y0 = GRID_Y + dim * (ROW_H + ROW_GAP);
            const isEven = dim % 2 === 0;
            const color = isEven ? C.sin : C.cos;
            const label = isEven ? `dim ${dim} · sin` : `dim ${dim} · cos`;

            return (
              <g key={`row-${dim}`}>
                {/* Row background */}
                <rect
                  x={GRID_LEFT}
                  y={y0}
                  width={GRID_W}
                  height={ROW_H}
                  rx={8}
                  fill="rgba(15,23,42,0.55)"
                  stroke="rgba(147,197,253,0.14)"
                />

                {/* Zero-line midline */}
                <line
                  x1={GRID_LEFT}
                  y1={y0 + ROW_H / 2}
                  x2={GRID_RIGHT}
                  y2={y0 + ROW_H / 2}
                  stroke="rgba(148,163,184,0.25)"
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />

                {/* Row label */}
                <text
                  x={GRID_LEFT - 10}
                  y={y0 + ROW_H / 2 + 4}
                  textAnchor="end"
                  fill={color}
                  fontSize="11"
                  fontWeight="800"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                >
                  {label}
                </text>

                {/* The curve */}
                <path
                  d={curvePath(dim, GRID_LEFT + 4, GRID_RIGHT - 4, y0, ROW_H)}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#piv-glow-blue)"
                  opacity="0.95"
                />

                {/* Wavelength hint: how fast this dim oscillates */}
                <text
                  x={GRID_RIGHT + 6}
                  y={y0 + ROW_H / 2 + 4}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="700"
                >
                  {(() => {
                    const i = Math.floor(dim / 2);
                    const wl = Math.pow(10000, (2 * i) / NUM_DIMS);
                    // λ = 2π · wavelength (period of the sinusoid in units of pos)
                    const period = (2 * Math.PI * wl).toFixed(1);
                    return `λ ≈ ${period}`;
                  })()}
                </text>
              </g>
            );
          })}

          {/* Explanation caption below the grid.
              Row layout (below grid bottom): 22px fingerprint, 50px caption1, 68px caption2 */}
          <text
            x={V.w / 2}
            y={GRID_Y + NUM_DIMS * (ROW_H + ROW_GAP) + 50}
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="12"
            fontWeight="700"
          >
            Wavelength grows geometrically with dim index — low dims fire fast,
            high dims change slowly across positions.
          </text>
          <text
            x={V.w / 2}
            y={GRID_Y + NUM_DIMS * (ROW_H + ROW_GAP) + 68}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="600"
          >
            Real models use D = 512 or larger, so a real fingerprint stacks
            hundreds of these values.
          </text>

          {/* ── Section 3: strategies comparison ─────────────────────────── */}
          <text
            x={V.w / 2}
            y={STRATS_Y - 22}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            THREE POSITIONAL-ENCODING STRATEGIES
          </text>

          {(() => {
            const rows = [
              {
                name: "Sinusoidal",
                learned: "no (formula)",
                extrap: "✓ works past max_len",
                encodes: "absolute",
                where: "original Transformer",
                color: C.sin,
              },
              {
                name: "Learned",
                learned: "yes (nn.Embedding)",
                extrap: "✕ capped at max_len",
                encodes: "absolute",
                where: "BERT, GPT-2",
                color: C.emphasis,
              },
              {
                name: "RoPE",
                learned: "no (rotation)",
                extrap: "✓ works past max_len",
                encodes: "relative (rotates Q/K)",
                where: "Llama, GPT-NeoX, most modern LLMs",
                color: C.cos,
              },
            ];
            const cols = ["Strategy", "Learned?", "Extrapolates?", "Encodes", "Where used"];
            const totalW = V.w - 120;
            const cx = 60;
            const colW = totalW / cols.length;
            const rowH = 40;

            return (
              <g>
                {/* Header row */}
                {cols.map((c, i) => (
                  <text
                    key={c}
                    x={cx + i * colW + 14}
                    y={STRATS_Y + 8}
                    fill="#93c5fd"
                    fontSize="11"
                    fontWeight="800"
                    letterSpacing="1"
                  >
                    {c.toUpperCase()}
                  </text>
                ))}
                <line
                  x1={cx}
                  y1={STRATS_Y + 14}
                  x2={cx + totalW}
                  y2={STRATS_Y + 14}
                  stroke="rgba(147,197,253,0.35)"
                  strokeWidth="1"
                />

                {rows.map((r, i) => {
                  const y = STRATS_Y + 24 + i * rowH;
                  return (
                    <g key={r.name}>
                      <rect
                        x={cx}
                        y={y}
                        width={totalW}
                        height={rowH - 4}
                        rx={8}
                        fill="rgba(15,23,42,0.55)"
                        stroke={r.color}
                        strokeOpacity="0.35"
                        strokeWidth="1"
                      />
                      <text
                        x={cx + 14}
                        y={y + rowH / 2 + 2}
                        fill={r.color}
                        fontSize="13"
                        fontWeight="900"
                      >
                        {r.name}
                      </text>
                      <text
                        x={cx + colW + 14}
                        y={y + rowH / 2 + 2}
                        fill="#e2e8f0"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {r.learned}
                      </text>
                      <text
                        x={cx + 2 * colW + 14}
                        y={y + rowH / 2 + 2}
                        fill="#e2e8f0"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {r.extrap}
                      </text>
                      <text
                        x={cx + 3 * colW + 14}
                        y={y + rowH / 2 + 2}
                        fill="#e2e8f0"
                        fontSize="12"
                        fontWeight="600"
                      >
                        {r.encodes}
                      </text>
                      <text
                        x={cx + 4 * colW + 14}
                        y={y + rowH / 2 + 2}
                        fill="#cbd5e1"
                        fontSize="11.5"
                        fontWeight="600"
                      >
                        {r.where}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="piv-legend">
        <span className="piv-legend-item sin">even dim · sin</span>
        <span className="piv-legend-item cos">odd dim · cos</span>
        <span className="piv-legend-item same">no PE — indistinguishable</span>
        <span className="piv-legend-item positioned">with PE — unique</span>
      </div>

      <div className="piv-bottom-note">
        <strong>Common wrong mental models:</strong> (1) PE is{" "}
        <strong>added</strong> to the token embedding elementwise — not
        concatenated — so it must share the same dimension <code>D</code>. (2)
        Learned positional embeddings cannot extrapolate past{" "}
        <code>max_len</code>; sinusoidal PE and RoPE can. (3) RoPE is not a
        lookup added to <code>x</code> — it rotates <code>Q</code> and{" "}
        <code>K</code> at each layer, encoding <em>relative</em> position via
        rotation.
      </div>
    </section>
  );
}

export default PositionalInformationVisual;
