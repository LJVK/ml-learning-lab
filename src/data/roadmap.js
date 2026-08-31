// Roadmap data — phases, dependencies, and topics that make up the
// learning path. Kept as a single source of truth so the Roadmap page can
// render as either a list or a graph without duplicating content.
//
// Each topic may include `conceptId`, which links it to an existing
// /concepts/:id page. Topics without conceptId render as static chips.
//
// Dependencies describe which earlier phase(s) unlock a later one — this
// is the graph structure that turns the roadmap into a proper dependency
// map instead of a straight sequential list.

export const roadmapPhases = [
  {
    id: "phase-1",
    phase: "Phase 1",
    title: "Attention Family",
    status: "Completed",
    dependsOn: [],
    summary:
      "Core attention mechanisms — the primitive every modern generative model relies on.",
    topics: [
      { label: "Self-Attention", conceptId: "self-attention" },
      { label: "Multi-Head Attention", conceptId: "multi-head-attention" },
      { label: "Cross Attention", conceptId: "cross-attention" },
      { label: "Masks", conceptId: "masks" },
      { label: "Encoder vs Decoder Attention", conceptId: "encoder-vs-decoder-attention" },
      { label: "Positional Information", conceptId: "positional-information" },
      { label: "Attention Internals", conceptId: "attention-internals" },
    ],
  },
  {
    id: "phase-2",
    phase: "Phase 2",
    title: "Transformer Block",
    status: "Completed",
    dependsOn: ["phase-1"],
    summary:
      "Residual + LayerNorm wrappers, FFN sublayers, and stacking — what makes deep Transformers trainable.",
    topics: [
      { label: "Residual Connections", conceptId: "residual-connections" },
      { label: "LayerNorm", conceptId: "layernorm" },
      { label: "Pre-LN vs Post-LN", conceptId: "pre-ln-vs-post-ln" },
      { label: "FFN / MLP", conceptId: "ffn-mlp" },
      { label: "Full Transformer Block", conceptId: "full-transformer-block" },
      { label: "Stacking Transformer Blocks", conceptId: "stacking-transformer-blocks" },
    ],
  },
  {
    id: "phase-3",
    phase: "Phase 3",
    title: "Autoregression",
    status: "Next",
    dependsOn: ["phase-2"],
    summary:
      "Next-token prediction, teacher forcing, exposure bias, and sampling strategies for generation.",
    topics: [
      { label: "Next-token prediction" },
      { label: "Teacher forcing" },
      { label: "Exposure bias" },
      { label: "Sampling strategies" },
    ],
  },
  {
    id: "phase-4",
    phase: "Phase 4",
    title: "GPT / LLM Stack",
    status: "Planned",
    dependsOn: ["phase-3"],
    summary:
      "Decoder-only Transformers, KV caches, and modern LLM building blocks (RoPE, RMSNorm, SwiGLU).",
    topics: [
      { label: "Decoder-only Transformer" },
      { label: "Causal attention" },
      { label: "Logits and vocab projection" },
      { label: "KV cache" },
      { label: "RoPE / RMSNorm / SwiGLU" },
    ],
  },
  {
    id: "phase-5-diffusion",
    phase: "Phase 5a",
    title: "Diffusion / DiT",
    status: "Planned",
    dependsOn: ["phase-2"],
    summary:
      "Iterative denoising, schedulers, latent diffusion, and diffusion Transformers (DiT).",
    topics: [
      { label: "DDPM" },
      { label: "Schedulers" },
      { label: "Latent diffusion" },
      { label: "Diffusion Transformer (DiT)" },
      { label: "Classifier-free guidance" },
    ],
  },
  {
    id: "phase-5-vae",
    phase: "Phase 5b",
    title: "VAE",
    status: "Planned",
    dependsOn: ["phase-2"],
    summary:
      "Latent representations, ELBO / KL objective, and the encoder-decoder used inside latent diffusion.",
    topics: [
      { label: "Encoder / decoder" },
      { label: "Reparameterization trick" },
      { label: "ELBO / KL divergence" },
      { label: "Latent space geometry" },
    ],
  },
  {
    id: "phase-6",
    phase: "Phase 6",
    title: "GANs",
    status: "Planned",
    dependsOn: ["phase-2"],
    summary:
      "Adversarial training, generator/discriminator dynamics, and mode collapse.",
    topics: [
      { label: "Generator" },
      { label: "Discriminator" },
      { label: "Adversarial loss" },
      { label: "Mode collapse" },
    ],
  },
  {
    id: "phase-7",
    phase: "Phase 7",
    title: "Final Interview Consolidation",
    status: "Planned",
    dependsOn: ["phase-4", "phase-5-diffusion", "phase-5-vae", "phase-6"],
    summary:
      "Consolidation: question banks, code summaries, mock interviews, revision notes.",
    topics: [
      { label: "Question banks" },
      { label: "Code summaries" },
      { label: "Mock interviews" },
      { label: "Revision notes" },
    ],
  },
];

// Status → color/style mapping used by the Roadmap graph node component.
export const STATUS_STYLE = {
  Completed: {
    color: "#22c55e",
    background: "rgba(34, 197, 94, 0.14)",
    border: "rgba(34, 197, 94, 0.6)",
    label: "Completed",
  },
  Next: {
    color: "#fb923c",
    background: "rgba(251, 146, 60, 0.16)",
    border: "rgba(251, 146, 60, 0.7)",
    label: "Next",
  },
  Planned: {
    color: "#94a3b8",
    background: "rgba(148, 163, 184, 0.12)",
    border: "rgba(148, 163, 184, 0.45)",
    label: "Planned",
  },
};

// Helper: find a phase by id
export function getPhase(id) {
  return roadmapPhases.find((p) => p.id === id) || null;
}
