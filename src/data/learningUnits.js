// Learning Units — mapping from a concept to its related learning artifacts.
//
// Every concept now has a matching code / questions / cheatsheet artifact
// under ml_learning_lab_content/. The convention is 1:1 with the concept id,
// so the arrays just contain the concept id itself. Kept as arrays (not a
// single string) so a concept can point at multiple artifacts of the same
// kind later (e.g. two different code implementations).
//
// `relatedConceptIds` is hand-picked: each link answers "what should I learn
// next / alongside this?", not "everything in the same family".

function unit(id, related) {
  return {
    conceptId: id,
    codeIds: [id],
    questionIds: [id],
    resourceIds: [id],    // cheatsheet route uses the same conceptId lookup
    relatedConceptIds: related,
  };
}

export const learningUnits = {
  // ── Attention Family ────────────────────────────────────────────────────
  "self-attention": unit("self-attention", [
    "multi-head-attention",       // the parallel extension
    "attention-internals",         // deeper look at Q/K/V mechanics
    "positional-information",      // required companion — attention is set-invariant
    "masks",                       // needed for causal / padding cases
  ]),

  "multi-head-attention": unit("multi-head-attention", [
    "self-attention",              // the base mechanism heads share
    "attention-internals",         // per-head Q/K/V mechanics
    "cross-attention",             // multi-head cross-attention is the decoder pattern
    "full-transformer-block",      // where MHA lives
  ]),

  "cross-attention": unit("cross-attention", [
    "self-attention",              // contrast: same-sequence vs two-sequence
    "encoder-vs-decoder-attention",// where cross-attention sits in the stack
    "masks",                       // padding masks apply to source keys
    "multi-head-attention",        // cross-attention is usually multi-head
  ]),

  "attention-internals": unit("attention-internals", [
    "self-attention",              // the mechanism this dissects
    "multi-head-attention",        // per-head internals
    "masks",                       // scores + mask = filtered attention
  ]),

  masks: unit("masks", [
    "self-attention",              // where the mask is applied
    "encoder-vs-decoder-attention",// causal mask = decoder; padding mask = both
    "attention-internals",         // masks live inside the softmax step
  ]),

  "encoder-vs-decoder-attention": unit("encoder-vs-decoder-attention", [
    "self-attention",              // encoder block core
    "cross-attention",             // decoder block core
    "masks",                       // causal vs padding masking distinguishes them
  ]),

  "positional-information": unit("positional-information", [
    "self-attention",              // the reason positional info is needed
    "full-transformer-block",      // where positions are added to the input
  ]),

  // ── Transformer Block Family ────────────────────────────────────────────
  "residual-connections": unit("residual-connections", [
    "layernorm",                   // paired: norm + residual is the sublayer template
    "pre-ln-vs-post-ln",           // where in the residual path norm sits
    "full-transformer-block",      // context of use
    "stacking-transformer-blocks", // residuals enable deep stacks
  ]),

  layernorm: unit("layernorm", [
    "residual-connections",        // partner in the sublayer template
    "pre-ln-vs-post-ln",           // placement choice
    "full-transformer-block",      // where it lives
  ]),

  "pre-ln-vs-post-ln": unit("pre-ln-vs-post-ln", [
    "layernorm",                   // the norm being placed
    "residual-connections",        // the path around which it's placed
    "stacking-transformer-blocks", // matters more as depth grows
  ]),

  "ffn-mlp": unit("ffn-mlp", [
    "full-transformer-block",      // the FFN is the second sublayer
    "residual-connections",        // wrapped in a residual
    "layernorm",                   // preceded / followed by norm
  ]),

  "full-transformer-block": unit("full-transformer-block", [
    "multi-head-attention",        // sublayer 1
    "ffn-mlp",                     // sublayer 2
    "residual-connections",        // structural glue
    "layernorm",                   // normalization
    "stacking-transformer-blocks", // what happens when you repeat this
  ]),

  "stacking-transformer-blocks": unit("stacking-transformer-blocks", [
    "full-transformer-block",      // the unit being stacked
    "residual-connections",        // what makes deep stacks trainable
    "pre-ln-vs-post-ln",           // key at depth
    "positional-information",      // added once before the stack
  ]),
};

// Lookup helper: safely fetch the unit for a concept, returning null when
// the concept isn't mapped yet. Callers can null-check and skip the section.
export function getLearningUnit(conceptId) {
  return learningUnits[conceptId] || null;
}
