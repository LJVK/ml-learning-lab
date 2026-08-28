// Learning Units — mapping from a concept to its related learning artifacts.
//
// A concept detail page is a *hub*, not a wall of content. This file wires up
// the exit ramps: from a concept to related code, questions, resources, and
// other concepts.
//
// Today only `relatedConceptIds` is populated (concept-to-concept links work
// against the existing concept pages). `codeIds`, `questionIds`, and
// `resourceIds` are stubs — as Code/Questions/Resources content lands they can
// be filled in without touching the ConceptDetail component. Empty arrays are
// hidden from the UI, so the page stays clean.
//
// `relatedConceptIds` is deliberately hand-picked (not "everything in the same
// family"). Each link answers "what should I learn next / alongside this?"

export const learningUnits = {
  // ── Attention Family ────────────────────────────────────────────────────
  "self-attention": {
    conceptId: "self-attention",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "multi-head-attention",       // the parallel extension
      "attention-internals",         // deeper look at Q/K/V mechanics
      "positional-information",      // required companion — attention is set-invariant
      "masks",                       // needed for causal / padding cases
    ],
  },

  "multi-head-attention": {
    conceptId: "multi-head-attention",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "self-attention",              // the base mechanism heads share
      "attention-internals",         // per-head Q/K/V mechanics
      "cross-attention",             // multi-head cross-attention is the decoder pattern
      "full-transformer-block",      // where MHA lives
    ],
  },

  "cross-attention": {
    conceptId: "cross-attention",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "self-attention",              // contrast: same-sequence vs two-sequence
      "encoder-vs-decoder-attention",// where cross-attention sits in the stack
      "masks",                       // padding masks apply to source keys
      "multi-head-attention",        // cross-attention is usually multi-head
    ],
  },

  "attention-internals": {
    conceptId: "attention-internals",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "self-attention",              // the mechanism this dissects
      "multi-head-attention",        // per-head internals
      "masks",                       // scores + mask = filtered attention
    ],
  },

  masks: {
    conceptId: "masks",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "self-attention",              // where the mask is applied
      "encoder-vs-decoder-attention",// causal mask = decoder; padding mask = both
      "attention-internals",         // masks live inside the softmax step
    ],
  },

  "encoder-vs-decoder-attention": {
    conceptId: "encoder-vs-decoder-attention",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "self-attention",              // encoder block core
      "cross-attention",             // decoder block core
      "masks",                       // causal vs padding masking distinguishes them
    ],
  },

  "positional-information": {
    conceptId: "positional-information",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "self-attention",              // the reason positional info is needed
      "full-transformer-block",      // where positions are added to the input
    ],
  },

  // ── Transformer Block Family ────────────────────────────────────────────
  "residual-connections": {
    conceptId: "residual-connections",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "layernorm",                   // paired: norm + residual is the sublayer template
      "pre-ln-vs-post-ln",           // where in the residual path norm sits
      "full-transformer-block",      // context of use
      "stacking-transformer-blocks", // residuals enable deep stacks
    ],
  },

  layernorm: {
    conceptId: "layernorm",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "residual-connections",        // partner in the sublayer template
      "pre-ln-vs-post-ln",           // placement choice
      "full-transformer-block",      // where it lives
    ],
  },

  "pre-ln-vs-post-ln": {
    conceptId: "pre-ln-vs-post-ln",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "layernorm",                   // the norm being placed
      "residual-connections",        // the path around which it's placed
      "stacking-transformer-blocks", // matters more as depth grows
    ],
  },

  "ffn-mlp": {
    conceptId: "ffn-mlp",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "full-transformer-block",      // the FFN is the second sublayer
      "residual-connections",        // wrapped in a residual
      "layernorm",                   // preceded / followed by norm
    ],
  },

  "full-transformer-block": {
    conceptId: "full-transformer-block",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "multi-head-attention",        // sublayer 1
      "ffn-mlp",                     // sublayer 2
      "residual-connections",        // structural glue
      "layernorm",                   // normalization
      "stacking-transformer-blocks", // what happens when you repeat this
    ],
  },

  "stacking-transformer-blocks": {
    conceptId: "stacking-transformer-blocks",
    codeIds: [],
    questionIds: [],
    resourceIds: [],
    relatedConceptIds: [
      "full-transformer-block",      // the unit being stacked
      "residual-connections",        // what makes deep stacks trainable
      "pre-ln-vs-post-ln",           // key at depth
      "positional-information",      // added once before the stack
    ],
  },
};

// Lookup helper: safely fetch the unit for a concept, returning null when
// the concept isn't mapped yet. Callers can null-check and skip the section.
export function getLearningUnit(conceptId) {
  return learningUnits[conceptId] || null;
}
