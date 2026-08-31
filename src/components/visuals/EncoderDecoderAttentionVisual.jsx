import "./EncoderDecoderAttentionVisual.css";

// ── Layout ───────────────────────────────────────────────────────────────
const V = { w: 1080, h: 1240 };

// Two-stack architecture at the top
const STACK_TOP = 100;
const STACK_BLOCK_H = 110;
const STACK_BLOCK_W = 300;
const STACK_GAP = 14;
const N_BLOCKS = 3;

// Encoder stack (left) and decoder stack (right)
const ENC_X = 90;
const DEC_X = V.w - 90 - STACK_BLOCK_W;

// Mask-pattern comparison row (bottom)
const MASK_ROW_Y = STACK_TOP + N_BLOCKS * (STACK_BLOCK_H + STACK_GAP) + 100;
const MASK_CELL = 30;
const MASK_ROWS = 5;
const MASK_COLS = 5;
const MASK_SIZE = MASK_CELL * MASK_ROWS;

// Table (below masks)
const TABLE_Y = MASK_ROW_Y + MASK_SIZE + 200;

// Palette
const C = {
  encoder: "#7dd3fc",       // sky — encoder side
  decoder: "#fb923c",       // orange — decoder side
  cross: "#c084fc",         // purple — cross-attention flow
  q: "#f472b6",             // pink — query axis
  k: "#22d3ee",             // cyan — key axis
  allowed: "#22c55e",       // green
  blocked: "#ef4444",       // red
};

// ── Small components ─────────────────────────────────────────────────────

function StackBlock({ x, y, index, side, showCross, showCausal }) {
  const color = side === "encoder" ? C.encoder : C.decoder;
  const label = side === "encoder" ? "Encoder block" : "Decoder block";

  return (
    <g>
      {/* Block outline */}
      <rect
        x={x}
        y={y}
        width={STACK_BLOCK_W}
        height={STACK_BLOCK_H}
        rx={16}
        fill={color}
        fillOpacity="0.14"
        stroke={color}
        strokeOpacity="0.65"
        strokeWidth="1.4"
        filter={`url(#eda-glow-${side})`}
      />

      {/* Block header */}
      <text
        x={x + 16}
        y={y + 22}
        fill={color}
        fontSize="12"
        fontWeight="900"
        letterSpacing="1"
      >
        {label} {index + 1}
      </text>

      {/* Sublayer 1: self-attention */}
      <g>
        <rect
          x={x + 12}
          y={y + 32}
          width={STACK_BLOCK_W - 24}
          height={showCross ? 30 : 62}
          rx={8}
          fill="rgba(15,23,42,0.6)"
          stroke={color}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <text
          x={x + 24}
          y={y + 52}
          fill="#e2e8f0"
          fontSize="12"
          fontWeight="700"
        >
          {showCausal ? "causal self-attn" : "self-attn (bidir)"}
        </text>
        {/* Small mask badge */}
        <g>
          <rect
            x={x + STACK_BLOCK_W - 60}
            y={y + 40}
            width={44}
            height={14}
            rx={7}
            fill={showCausal ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.22)"}
            stroke={showCausal ? C.blocked : C.allowed}
            strokeOpacity="0.6"
          />
          <text
            x={x + STACK_BLOCK_W - 38}
            y={y + 50}
            textAnchor="middle"
            fill={showCausal ? "#fca5a5" : "#86efac"}
            fontSize="9"
            fontWeight="800"
          >
            {showCausal ? "causal" : "bidir"}
          </text>
        </g>
      </g>

      {/* Sublayer 2: cross-attention (decoder only) */}
      {showCross && (
        <g>
          <rect
            x={x + 12}
            y={y + 68}
            width={STACK_BLOCK_W - 24}
            height={28}
            rx={8}
            fill={`${C.cross}22`}
            stroke={C.cross}
            strokeOpacity="0.5"
            strokeWidth="1"
          />
          <text
            x={x + 24}
            y={y + 86}
            fill={C.cross}
            fontSize="12"
            fontWeight="800"
          >
            cross-attn ← encoder K/V
          </text>
          <circle
            cx={x + 4}
            cy={y + 82}
            r={5}
            fill={C.cross}
          />
        </g>
      )}
    </g>
  );
}

// A mini mask heatmap for the pattern comparison row.
function MiniMask({ x, y, title, subtitle, allowedFn, color, showAxes }) {
  return (
    <g>
      <text
        x={x + MASK_SIZE / 2}
        y={y - 32}
        textAnchor="middle"
        fill={color}
        fontSize="12"
        fontWeight="900"
        letterSpacing="1"
      >
        {title}
      </text>
      <text
        x={x + MASK_SIZE / 2}
        y={y - 16}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize="10.5"
        fontWeight="600"
      >
        {subtitle}
      </text>

      {/* Grid cells */}
      {Array.from({ length: MASK_ROWS }, (_, i) =>
        Array.from({ length: MASK_COLS }, (_, j) => {
          const allowed = allowedFn(i, j);
          const cx = x + j * MASK_CELL;
          const cy = y + i * MASK_CELL;
          return (
            <rect
              key={`c-${i}-${j}`}
              x={cx + 1}
              y={cy + 1}
              width={MASK_CELL - 2}
              height={MASK_CELL - 2}
              rx={3}
              fill={allowed ? color : C.blocked}
              fillOpacity={allowed ? 0.45 : 0.4}
              stroke={allowed ? color : C.blocked}
              strokeOpacity="0.55"
              strokeWidth="0.8"
            />
          );
        })
      )}

      {/* Small axis hints */}
      {showAxes && (
        <>
          <text
            x={x - 6}
            y={y + MASK_SIZE / 2}
            textAnchor="end"
            fill={C.q}
            fontSize="9"
            fontWeight="800"
          >
            Q
          </text>
          <text
            x={x + MASK_SIZE / 2}
            y={y + MASK_SIZE + 12}
            textAnchor="middle"
            fill={C.k}
            fontSize="9"
            fontWeight="800"
          >
            K
          </text>
        </>
      )}
    </g>
  );
}

function EncoderDecoderAttentionVisual() {
  return (
    <section className="eda-visual-card">
      <div className="eda-visual-header">
        <p className="eda-eyebrow">Visual mental model</p>
        <h2>
          Encoder vs decoder attention: three roles, one shared math kernel
        </h2>
        <p>
          The same scaled-dot-product attention formula plays three different
          roles depending on <strong>who provides Q/K/V</strong> and{" "}
          <strong>which mask is applied</strong>. Encoder self-attention is
          bidirectional; decoder self-attention is causal; encoder-decoder
          cross-attention pulls K/V from the encoder while Q stays on the
          decoder side.
        </p>
        <dl className="eda-defs">
          <div>
            <dt>encoder self</dt>
            <dd>bidirectional understanding (BERT)</dd>
          </div>
          <div>
            <dt>decoder self</dt>
            <dd>causal generation (GPT)</dd>
          </div>
          <div>
            <dt>cross</dt>
            <dd>conditioning on encoder (seq2seq)</dd>
          </div>
        </dl>
      </div>

      <div className="eda-diagram-wrap">
        <svg
          viewBox={`0 0 ${V.w} ${V.h}`}
          xmlns="http://www.w3.org/2000/svg"
          className="eda-diagram"
          role="img"
          aria-label="Encoder and decoder stacks side by side. Encoder blocks use bidirectional self-attention. Decoder blocks use causal self-attention and a cross-attention sublayer that pulls keys and values from the encoder output."
        >
          <defs>
            <filter id="eda-glow-encoder" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="eda-glow-decoder" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <marker
              id="eda-arrow"
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={C.cross} />
            </marker>
          </defs>

          {/* Section 1: encoder & decoder stacks */}
          <text
            x={ENC_X + STACK_BLOCK_W / 2}
            y={STACK_TOP - 22}
            textAnchor="middle"
            fill={C.encoder}
            fontSize="12"
            fontWeight="900"
            letterSpacing="3"
          >
            ENCODER STACK
          </text>
          <text
            x={DEC_X + STACK_BLOCK_W / 2}
            y={STACK_TOP - 22}
            textAnchor="middle"
            fill={C.decoder}
            fontSize="12"
            fontWeight="900"
            letterSpacing="3"
          >
            DECODER STACK
          </text>

          {/* Encoder blocks (bottom-up: index 0 is bottom, N-1 is top) */}
          {Array.from({ length: N_BLOCKS }, (_, i) => (
            <StackBlock
              key={`enc-${i}`}
              x={ENC_X}
              y={STACK_TOP + (N_BLOCKS - 1 - i) * (STACK_BLOCK_H + STACK_GAP)}
              index={i}
              side="encoder"
              showCross={false}
              showCausal={false}
            />
          ))}

          {/* Decoder blocks */}
          {Array.from({ length: N_BLOCKS }, (_, i) => (
            <StackBlock
              key={`dec-${i}`}
              x={DEC_X}
              y={STACK_TOP + (N_BLOCKS - 1 - i) * (STACK_BLOCK_H + STACK_GAP)}
              index={i}
              side="decoder"
              showCross
              showCausal
            />
          ))}

          {/* Cross-attention flow: encoder top → H_enc bus → tap into each
              decoder block. Makes it visually explicit that the SAME encoder
              output is reused by every decoder block; there is only one
              encoder pass, not three separate ones. */}
          {(() => {
            const encTopY = STACK_TOP; // topmost encoder block
            const encOutX = ENC_X + STACK_BLOCK_W;
            const encOutY = encTopY + STACK_BLOCK_H / 2;

            // Bus node placed midway between the two stacks
            const busX = (ENC_X + STACK_BLOCK_W + DEC_X) / 2;
            const busY = encTopY + STACK_BLOCK_H / 2;
            const busW = 130;
            const busH = 42;
            const busLeft = busX - busW / 2;
            const busRight = busX + busW / 2;

            // Thick arrow: encoder → bus (one pass, one signal)
            const encToBusPath = `M ${encOutX + 4} ${encOutY} L ${busLeft - 4} ${busY}`;

            // Tap-off arrows: bus → each decoder block's cross-attn socket
            const tapPaths = Array.from({ length: N_BLOCKS }, (_, i) => {
              const decY = STACK_TOP + (N_BLOCKS - 1 - i) * (STACK_BLOCK_H + STACK_GAP);
              const decInY = decY + 82; // matches cross-attn socket in StackBlock
              const decInX = DEC_X - 6;
              const midX = (busRight + decInX) / 2;
              return `M ${busRight + 4} ${busY} C ${midX} ${busY}, ${midX} ${decInY}, ${decInX} ${decInY}`;
            });

            return (
              <g>
                {/* Encoder → bus: thick solid arrow (this is where the signal
                    actually comes from — the whole encoder ran once) */}
                <path
                  d={encToBusPath}
                  fill="none"
                  stroke={C.cross}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  markerEnd="url(#eda-arrow)"
                />

                {/* H_enc bus node — the shared encoder output tensor */}
                <rect
                  x={busLeft}
                  y={busY - busH / 2}
                  width={busW}
                  height={busH}
                  rx={12}
                  fill={C.cross}
                  fillOpacity="0.18"
                  stroke={C.cross}
                  strokeOpacity="0.7"
                  strokeWidth="1.4"
                  filter="url(#eda-glow-decoder)"
                />
                <text
                  x={busX}
                  y={busY - 3}
                  textAnchor="middle"
                  fill={C.cross}
                  fontSize="13"
                  fontWeight="900"
                  fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                >
                  H_enc
                </text>
                <text
                  x={busX}
                  y={busY + 12}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="9.5"
                  fontWeight="700"
                >
                  (B, T_source, D)
                </text>

                {/* Caption above the bus explaining the sharing */}
                <text
                  x={busX}
                  y={busY - busH / 2 - 12}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="11"
                  fontWeight="700"
                >
                  one encoder pass · reused by every decoder block
                </text>

                {/* Tap-offs: bus → decoder blocks (thinner, dashed) */}
                {tapPaths.map((d, i) => (
                  <path
                    key={`tap-${i}`}
                    d={d}
                    fill="none"
                    stroke={C.cross}
                    strokeWidth="1.8"
                    strokeOpacity="0.7"
                    strokeDasharray="6 5"
                    strokeLinecap="round"
                    markerEnd="url(#eda-arrow)"
                  />
                ))}
              </g>
            );
          })()}

          {/* Input labels at the bottom of the two stacks */}
          <text
            x={ENC_X + STACK_BLOCK_W / 2}
            y={STACK_TOP + N_BLOCKS * (STACK_BLOCK_H + STACK_GAP) + 6}
            textAnchor="middle"
            fill={C.encoder}
            fontSize="11"
            fontWeight="700"
          >
            source tokens (e.g. English sentence)
          </text>
          <text
            x={DEC_X + STACK_BLOCK_W / 2}
            y={STACK_TOP + N_BLOCKS * (STACK_BLOCK_H + STACK_GAP) + 6}
            textAnchor="middle"
            fill={C.decoder}
            fontSize="11"
            fontWeight="700"
          >
            target tokens (e.g. French sentence)
          </text>

          {/* ── Section 2: three mask patterns side by side ─────────────── */}
          <text
            x={V.w / 2}
            y={MASK_ROW_Y - 60}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            SAME MATH · DIFFERENT MASK PATTERN
          </text>

          {(() => {
            const gap = 90;
            const totalW = 3 * MASK_SIZE + 2 * gap;
            const startX = (V.w - totalW) / 2;
            return (
              <>
                <MiniMask
                  x={startX}
                  y={MASK_ROW_Y}
                  title="Encoder self"
                  subtitle="bidirectional — every Q sees every K"
                  allowedFn={() => true}
                  color={C.encoder}
                  showAxes
                />
                <MiniMask
                  x={startX + MASK_SIZE + gap}
                  y={MASK_ROW_Y}
                  title="Decoder self"
                  subtitle="causal — Q i sees K j only if j ≤ i"
                  allowedFn={(i, j) => j <= i}
                  color={C.decoder}
                  showAxes
                />
                <MiniMask
                  x={startX + 2 * (MASK_SIZE + gap)}
                  y={MASK_ROW_Y}
                  title="Cross"
                  subtitle="Q from decoder · K from encoder"
                  allowedFn={() => true}
                  color={C.cross}
                  showAxes
                />
              </>
            );
          })()}

          {/* ── Section 3: comparison table ─────────────────────────────── */}
          <text
            x={V.w / 2}
            y={TABLE_Y - 22}
            textAnchor="middle"
            fill="#93c5fd"
            fontSize="11"
            fontWeight="900"
            letterSpacing="3"
          >
            THE THREE ATTENTION ROLES
          </text>

          {(() => {
            const rows = [
              {
                name: "Encoder self",
                q: "encoder tokens",
                kv: "encoder tokens",
                mask: "padding only",
                purpose: "full-context understanding",
                color: C.encoder,
              },
              {
                name: "Decoder self",
                q: "decoder tokens",
                kv: "decoder tokens",
                mask: "causal + padding",
                purpose: "autoregressive generation",
                color: C.decoder,
              },
              {
                name: "Cross",
                q: "decoder tokens",
                kv: "encoder tokens",
                mask: "source padding",
                purpose: "conditioning on encoder",
                color: C.cross,
              },
            ];
            const cols = ["Role", "Q source", "K, V source", "Mask", "Purpose"];
            const totalW = V.w - 120;
            const cx = 60;
            const colW = totalW / cols.length;
            const rowH = 40;

            return (
              <g>
                {cols.map((c, i) => (
                  <text
                    key={c}
                    x={cx + i * colW + 14}
                    y={TABLE_Y + 8}
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
                  y1={TABLE_Y + 14}
                  x2={cx + totalW}
                  y2={TABLE_Y + 14}
                  stroke="rgba(147,197,253,0.35)"
                  strokeWidth="1"
                />

                {rows.map((r, i) => {
                  const y = TABLE_Y + 24 + i * rowH;
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
                      <text x={cx + 14} y={y + rowH / 2 + 2} fill={r.color} fontSize="13" fontWeight="900">{r.name}</text>
                      <text x={cx + colW + 14} y={y + rowH / 2 + 2} fill="#e2e8f0" fontSize="12" fontWeight="600">{r.q}</text>
                      <text x={cx + 2 * colW + 14} y={y + rowH / 2 + 2} fill="#e2e8f0" fontSize="12" fontWeight="600">{r.kv}</text>
                      <text x={cx + 3 * colW + 14} y={y + rowH / 2 + 2} fill="#e2e8f0" fontSize="12" fontWeight="600">{r.mask}</text>
                      <text x={cx + 4 * colW + 14} y={y + rowH / 2 + 2} fill="#cbd5e1" fontSize="11.5" fontWeight="600">{r.purpose}</text>
                    </g>
                  );
                })}
              </g>
            );
          })()}
        </svg>
      </div>

      <div className="eda-legend">
        <span className="eda-legend-item encoder">encoder side</span>
        <span className="eda-legend-item decoder">decoder side</span>
        <span className="eda-legend-item cross">cross-attention flow</span>
      </div>

      <div className="eda-bottom-note">
        <strong>Common wrong mental models</strong>

        <p>
          <em>Wrong:</em> "GPT is decoder-only, so it uses cross-attention on
          itself."
          <br />
          <em>Right:</em> GPT has <strong>no encoder</strong>, so its cross-
          attention sublayer is <strong>removed entirely</strong>. Each block
          has only causal self-attention. What people sometimes call
          "self cross-attention" is just causal self-attention.
        </p>

        <p>
          <em>Wrong:</em> "BERT is bidirectional, so it does cross-attention."
          <br />
          <em>Right:</em> BERT is encoder-only. Bidirectional self-attention
          means every token can attend to every other token in the{" "}
          <strong>same sequence</strong>. There is no second sequence to
          cross-attend to.
        </p>

        <p>
          <em>Wrong:</em> "Cross-attention is just self-attention on the
          concatenation of two sequences."
          <br />
          <em>Right:</em> Cross-attention <strong>keeps the two sequences
          separate</strong>. Q comes strictly from one, K/V from the other.
          The output length always matches the query sequence, and the score
          matrix is rectangular (T_target × T_source), not square. It only
          exists when both stacks exist (seq2seq translation, text-to-image
          diffusion, encoder-decoder Transformers).
        </p>
      </div>
    </section>
  );
}

export default EncoderDecoderAttentionVisual;
