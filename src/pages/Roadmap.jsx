import "./Roadmap.css";

const roadmapItems = [
  {
    phase: "Phase 1",
    title: "Attention Family",
    status: "Completed",
    topics: [
      "Self-Attention",
      "Multi-Head Attention",
      "Cross Attention",
      "Masks",
      "Encoder vs Decoder Attention",
      "Positional Information",
    ],
  },
  {
    phase: "Phase 2",
    title: "Transformer Block",
    status: "Completed",
    topics: [
      "Residual Connections",
      "LayerNorm",
      "Pre-LN vs Post-LN",
      "FFN / MLP",
      "Transformer Block Implementation",
      "Tests",
    ],
  },
  {
    phase: "Phase 3",
    title: "Autoregression",
    status: "Next",
    topics: [
      "Next-token prediction",
      "Teacher forcing",
      "Exposure bias",
      "Sampling strategies",
    ],
  },
  {
    phase: "Phase 4",
    title: "GPT / LLM Stack",
    status: "Planned",
    topics: [
      "Decoder-only Transformer",
      "Causal attention",
      "Logits and vocab projection",
      "KV cache",
      "RoPE / RMSNorm / SwiGLU",
    ],
  },
  {
    phase: "Phase 5",
    title: "Diffusion / VAE / DiT",
    status: "Planned",
    topics: [
      "DDPM",
      "Schedulers",
      "Latent diffusion",
      "VAE",
      "Diffusion Transformer",
    ],
  },
  {
    phase: "Phase 6",
    title: "GANs",
    status: "Planned",
    topics: [
      "Generator",
      "Discriminator",
      "Adversarial loss",
      "Mode collapse",
    ],
  },
  {
    phase: "Phase 7",
    title: "Final Interview Consolidation",
    status: "Planned",
    topics: [
      "Question banks",
      "Code summaries",
      "Mock interviews",
      "Revision notes",
    ],
  },
];

function Roadmap() {
  return (
    <section className="roadmap-page">
      <div className="page-header">
        <p className="eyebrow">Roadmap</p>
        <h1>Learning path from attention to generative AI.</h1>
        <p>
          A phased roadmap for building intuition, implementation skill, and
          interview readiness.
        </p>
      </div>

      <div className="roadmap-list">
        {roadmapItems.map((item) => (
          <article className="roadmap-card" key={item.title}>
            <div className="roadmap-card-header">
              <div>
                <p className="phase">{item.phase}</p>
                <h2>{item.title}</h2>
              </div>
              <span className={`status ${item.status.toLowerCase()}`}>
                {item.status}
              </span>
            </div>

            <div className="topic-list">
              {item.topics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Roadmap;