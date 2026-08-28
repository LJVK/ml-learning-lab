import "./MultiHeadAttentionVisual.css";

const TOKENS = ["The", "cat", "sat", "on", "mat"];

// ── Layout constants (SVG user units) ──────────────────────────────────────
const V = { w: 1000, h: 1000 };
const TOKEN_W = 100;
const TOKEN_H = 44;
const INPUT_Y = 60;

// Split band: one representative token vector D, sliced into H segments of D_h
const SPLIT_Y = 180;
const SPLIT_BAR_W = 600;
const SPLIT_BAR_H = 28;
const SPLIT_BAR_X = (V.w - SPLIT_BAR_W) / 2;

const HEADS_Y = 360;
const HEAD_W = 280;
const HEAD_H = 320;

const MERGE_Y = 760;
const MERGE_W = 620;
const MERGE_H = 80;

const OUTPUT_Y = 920;

// Horizontal centers for the 5 tokens (both input and output rows)
const TOKEN_CENTERS = [220, 360, 500, 640, 780];
// Left-x of the 3 head boxes
const HEAD_X = [50, 360, 670];

// Per-head styling + attention-arc pattern (pairs of mini-token indices)
const HEAD_META = [
  {
    title: "Head 1",
    desc: "Local / nearby",
    color: "#22d3ee",
    glow: "glow-cyan",
    pattern: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    title: "Head 2",
    desc: "Long-range",
    color: "#c084fc",
    glow: "glow-purple",
    pattern: [[0, 4], [0, 3], [1, 4]],
  },
  {
    title: "Head 3",
    desc: "Semantic",
    color: "#facc15",
    glow: "glow-gold",
    pattern: [[0, 2], [1, 3], [2, 4]],
  },
];

// Vertical cubic-bezier connector between two points
function vCurve(x1, y1, x2, y2) {
  const dy = (y2 - y1) * 0.5;
  return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
}

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
        filter="url(#glow-blue)"
      />
      <text
        x={cx}
        y={y + TOKEN_H / 2 + 5}
        textAnchor="middle"
        fill="#f8fafc"
        fontWeight="800"
        fontSize="15"
      >
        {label}
      </text>
    </g>
  );
}

// Textbook-style bracket: a horizontal line with two short down-ticks at each end
// and an optional middle tick. Rendered above (dir=-1) or below (dir=1) an anchor y.
function Bracket({ x1, x2, y, dir, label, color = "#cbd5e1" }) {
  const tick = 5 * dir;
  const labelY = y + (dir > 0 ? 20 : -10);
  return (
    <g>
      <path
        d={`M ${x1} ${y + tick} L ${x1} ${y} L ${x2} ${y} L ${x2} ${y + tick}`}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeOpacity="0.75"
        strokeLinecap="round"
      />
      <text
        x={(x1 + x2) / 2}
        y={labelY}
        textAnchor="middle"
        fill={color}
        fontSize="13"
        fontWeight="900"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
      >
        {label}
      </text>
    </g>
  );
}

// The horizontal split band: shows D sliced into 3 tinted segments of width D_h = D/H.
// Segment centers align with the head centers below so fan-out lines read as
// "this slice → this head". Bracket labels replace prose captions.
function SplitBand() {
  const segW = SPLIT_BAR_W / HEAD_META.length;
  return (
    <g>
      <text
        x={V.w / 2}
        y={SPLIT_Y - 42}
        textAnchor="middle"
        fill="#93c5fd"
        fontSize="11"
        fontWeight="900"
        letterSpacing="2.5"
      >
        SPLIT EMBEDDING
      </text>

      {/* D bracket above the full bar */}
      <Bracket
        x1={SPLIT_BAR_X}
        x2={SPLIT_BAR_X + SPLIT_BAR_W}
        y={SPLIT_Y - 6}
        dir={-1}
        label="D"
        color="#e2e8f0"
      />

      {/* Base bar outline */}
      <rect
        x={SPLIT_BAR_X}
        y={SPLIT_Y}
        width={SPLIT_BAR_W}
        height={SPLIT_BAR_H}
        rx={6}
        fill="rgba(15,23,42,0.6)"
        stroke="rgba(147,197,253,0.35)"
        strokeWidth="1"
      />

      {/* Colored segments + per-segment D_h bracket below */}
      {HEAD_META.map((meta, i) => {
        const x = SPLIT_BAR_X + i * segW;
        return (
          <g key={meta.title}>
            <rect
              x={x + 2}
              y={SPLIT_Y + 2}
              width={segW - 4}
              height={SPLIT_BAR_H - 4}
              rx={4}
              fill={meta.color}
              fillOpacity="0.3"
              stroke={meta.color}
              strokeOpacity="0.8"
              strokeWidth="1"
            />
            <text
              x={x + segW / 2}
              y={SPLIT_Y + SPLIT_BAR_H / 2 + 4}
              textAnchor="middle"
              fill={meta.color}
              fontSize="12"
              fontWeight="800"
              letterSpacing="1"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            >
              slice {i + 1}
            </text>
            <Bracket
              x1={x + 4}
              x2={x + segW - 4}
              y={SPLIT_Y + SPLIT_BAR_H + 6}
              dir={1}
              label="D_h"
              color={meta.color}
            />
          </g>
        );
      })}

      {/* Compact formula chip beneath the brackets: D = H · D_h */}
      <g transform={`translate(${V.w / 2}, ${SPLIT_Y + SPLIT_BAR_H + 52})`}>
        <rect
          x={-108}
          y={-14}
          width={216}
          height={28}
          rx={14}
          fill="rgba(15,23,42,0.7)"
          stroke="rgba(147,197,253,0.35)"
        />
        <text
          x={0}
          y={5}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="13"
          fontWeight="800"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        >
          D  =  H · D_h
        </text>
      </g>
    </g>
  );
}

function Head({ meta, x, y }) {
  const cx = x + HEAD_W / 2;
  const miniY = y + 200;
  const miniStart = x + 26;
  const miniStep = (HEAD_W - 52) / (TOKENS.length - 1);
  const miniR = 12;

  return (
    <g>
      {/* Card */}
      <rect
        x={x}
        y={y}
        width={HEAD_W}
        height={HEAD_H}
        rx={22}
        fill="rgba(15,23,42,0.78)"
        stroke={meta.color}
        strokeOpacity="0.75"
        strokeWidth="1.5"
        filter={`url(#${meta.glow})`}
      />

      {/* Title + subtitle */}
      <text
        x={cx}
        y={y + 40}
        textAnchor="middle"
        fill={meta.color}
        fontWeight="900"
        fontSize="22"
      >
        {meta.title}
      </text>
      <text
        x={cx}
        y={y + 66}
        textAnchor="middle"
        fill="#cbd5e1"
        fontWeight="600"
        fontSize="13"
      >
        {meta.desc}
      </text>

      {/* Q · K · V pill */}
      <g transform={`translate(${cx}, ${y + 108})`}>
        <rect
          x={-64}
          y={-16}
          width={128}
          height={32}
          rx={16}
          fill={meta.color}
          fillOpacity="0.14"
          stroke={meta.color}
          strokeOpacity="0.55"
        />
        <text
          x={0}
          y={5}
          textAnchor="middle"
          fill={meta.color}
          fontWeight="800"
          fontSize="12"
          letterSpacing="2"
        >
          Q · K · V
        </text>
      </g>

      {/* Attention arcs above the mini-token row — pulse via CSS */}
      <g className="mha-arcs">
        {meta.pattern.map(([a, b], i) => {
          const xa = miniStart + a * miniStep;
          const xb = miniStart + b * miniStep;
          const dist = Math.abs(b - a);
          const arcH = 22 + dist * 14;
          const midX = (xa + xb) / 2;
          return (
            <path
              key={i}
              d={`M ${xa} ${miniY - miniR} Q ${midX} ${miniY - arcH}, ${xb} ${miniY - miniR}`}
              fill="none"
              stroke={meta.color}
              strokeWidth="1.6"
              strokeOpacity="0.75"
              strokeLinecap="round"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          );
        })}
      </g>

      {/* Mini tokens */}
      {TOKENS.map((t, i) => {
        const cxm = miniStart + i * miniStep;
        return (
          <g key={t}>
            <circle
              cx={cxm}
              cy={miniY}
              r={miniR}
              fill="rgba(15,23,42,0.95)"
              stroke={meta.color}
              strokeWidth="1.3"
            />
            <text
              x={cxm}
              y={miniY + 3}
              textAnchor="middle"
              fill="#f8fafc"
              fontSize="9"
              fontWeight="700"
            >
              {t}
            </text>
          </g>
        );
      })}

      {/* Head output marker */}
      <text
        x={cx}
        y={y + HEAD_H - 34}
        textAnchor="middle"
        fill={meta.color}
        fontSize="11"
        fontWeight="800"
        letterSpacing="2"
      >
        HEAD OUT
      </text>
      <circle
        cx={cx}
        cy={y + HEAD_H - 16}
        r={5}
        fill={meta.color}
        className="mha-head-out-dot"
      />
    </g>
  );
}

function MultiHeadAttentionVisual() {
  const mergeCX = V.w / 2;
  const mergeX = mergeCX - MERGE_W / 2;

  // Segment centers on the split band — fan-out lines start here so the
  // "which slice goes to which head" mapping is visually explicit.
  const segW = SPLIT_BAR_W / HEAD_META.length;
  const segCenters = HEAD_META.map((_, i) => SPLIT_BAR_X + segW * (i + 0.5));

  return (
    <section className="mha-visual-card">
      <div className="mha-visual-header">
        <p className="mha-eyebrow">Visual mental model</p>
        <h2>Multi&#8209;head attention runs several attention patterns in parallel</h2>
        <p>
          Each token vector is split by embedding dimension into equal-sized
          slices — one per head. Every head sees the full token sequence but
          only its own slice, so heads learn different relationship patterns
          in parallel. Their outputs are concatenated and re-projected back to
          the original dimension.
        </p>
        <dl className="mha-defs">
          <div>
            <dt>D</dt>
            <dd>model dim</dd>
          </div>
          <div>
            <dt>H</dt>
            <dd>number of heads</dd>
          </div>
          <div>
            <dt>D_h = D / H</dt>
            <dd>per-head dim</dd>
          </div>
        </dl>
      </div>

      <div className="mha-diagram-wrap">
        <svg
          viewBox={`0 0 ${V.w} ${V.h}`}
          xmlns="http://www.w3.org/2000/svg"
          className="mha-diagram"
          role="img"
          aria-label="Input tokens are split by embedding dimension into three parallel attention heads, each with a different connection pattern; head outputs concatenate and project back into output tokens."
        >
          <defs>
            <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Section label: input */}
          <text
            x={V.w / 2}
            y={36}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="12"
            fontWeight="900"
            letterSpacing="3"
          >
            INPUT TOKENS
          </text>

          {/* Input token row */}
          {TOKENS.map((t, i) => (
            <TokenRect key={`in-${t}`} cx={TOKEN_CENTERS[i]} y={INPUT_Y} label={t} />
          ))}

          {/* Input tokens → split band (thin guide lines) */}
          {TOKEN_CENTERS.map((cx, i) => (
            <path
              key={`t2s-${i}`}
              d={vCurve(cx, INPUT_Y + TOKEN_H, cx, SPLIT_Y)}
              fill="none"
              stroke="#93c5fd"
              strokeOpacity="0.28"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
          ))}

          {/* Split band (D → H × D_h) */}
          <SplitBand />

          {/* Fan-out: each split-band segment → its head (animated flow) */}
          {segCenters.map((sx, hi) => {
            const meta = HEAD_META[hi];
            return (
              <path
                key={`fo-${hi}`}
                className="mha-flow mha-flow-down"
                d={vCurve(sx, SPLIT_Y + SPLIT_BAR_H, HEAD_X[hi] + HEAD_W / 2, HEADS_Y)}
                fill="none"
                stroke={meta.color}
                strokeWidth="2.5"
                strokeOpacity="0.85"
                strokeLinecap="round"
                strokeDasharray="10 8"
                style={{ animationDelay: `${hi * 0.3}s` }}
              />
            );
          })}

          {/* Heads */}
          {HEAD_META.map((meta, i) => (
            <Head key={meta.title} meta={meta} x={HEAD_X[i]} y={HEADS_Y} />
          ))}

          {/* Fan-in: each head → merge box (animated flow) */}
          {HEAD_X.map((hx, hi) => {
            const meta = HEAD_META[hi];
            return (
              <path
                key={`fi-${hi}`}
                className="mha-flow mha-flow-down"
                d={vCurve(hx + HEAD_W / 2, HEADS_Y + HEAD_H, mergeCX, MERGE_Y)}
                fill="none"
                stroke={meta.color}
                strokeWidth="2.5"
                strokeOpacity="0.85"
                strokeLinecap="round"
                strokeDasharray="10 8"
                style={{ animationDelay: `${0.4 + hi * 0.2}s` }}
              />
            );
          })}

          {/* Merge box */}
          <g className="mha-merge">
            <rect
              x={mergeX}
              y={MERGE_Y}
              width={MERGE_W}
              height={MERGE_H}
              rx={20}
              fill="rgba(37,99,235,0.22)"
              stroke="rgba(147,197,253,0.55)"
              strokeWidth="1.4"
              filter="url(#glow-blue)"
            />
            <text
              x={mergeCX}
              y={MERGE_Y + 33}
              textAnchor="middle"
              fill="#ffffff"
              fontWeight="900"
              fontSize="17"
            >
              Concatenate + Output Projection
            </text>
            <g transform={`translate(${mergeCX}, ${MERGE_Y + 60})`}>
              <rect
                x={-130}
                y={-13}
                width={260}
                height={26}
                rx={13}
                fill="#2563eb"
              />
              <text
                x={0}
                y={5}
                textAnchor="middle"
                fill="#ffffff"
                fontWeight="800"
                fontSize="12"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              >
                (B, H, T, D_h) → (B, T, D)
              </text>
            </g>
          </g>

          {/* Merge → output (animated) */}
          <path
            className="mha-flow mha-flow-down"
            d={vCurve(mergeCX, MERGE_Y + MERGE_H, mergeCX, OUTPUT_Y)}
            fill="none"
            stroke="#93c5fd"
            strokeWidth="2.5"
            strokeOpacity="0.9"
            strokeLinecap="round"
            strokeDasharray="10 8"
          />

          {/* Section label: output */}
          <text
            x={V.w / 2}
            y={OUTPUT_Y - 18}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="12"
            fontWeight="900"
            letterSpacing="3"
          >
            OUTPUT TOKENS
          </text>

          {/* Output token row */}
          {TOKENS.map((t, i) => (
            <TokenRect key={`out-${t}`} cx={TOKEN_CENTERS[i]} y={OUTPUT_Y} label={t} />
          ))}
        </svg>
      </div>

      <div className="mha-legend">
        <span className="mha-legend-item cyan">Head 1 — local / nearby</span>
        <span className="mha-legend-item purple">Head 2 — long-range</span>
        <span className="mha-legend-item gold">Head 3 — semantic</span>
      </div>

      <div className="mha-bottom-note">
        <strong>Why it matters:</strong> splitting the embedding lets multiple
        heads compute attention in parallel with proportionally less work per
        head, while each learns a different relationship view — nearby
        structure, long-range dependencies, semantic grouping. The
        concatenation restores the full dimension so downstream layers see one
        richer representation.
      </div>
    </section>
  );
}

export default MultiHeadAttentionVisual;
