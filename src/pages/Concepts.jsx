import "./Concepts.css";

const conceptGroups = [
  {
    title: "Attention Family",
    description: "Core attention mechanisms used in Transformers and generative AI systems.",
    topics: [
      "Self-Attention",
      "Multi-Head Attention",
      "Cross Attention",
      "Attention Internals",
      "Masks",
      "Encoder vs Decoder Attention",
      "Positional Information",
    ],
  },
  {
    title: "Transformer Block Family",
    description: "The building blocks that make modern Transformer architectures trainable and scalable.",
    topics: [
      "Residual Connections",
      "LayerNorm",
      "Pre-LN vs Post-LN",
      "FFN / MLP",
      "Full Transformer Block",
      "Stacking Transformer Blocks",
    ],
  },
];

function Concepts() {
  return (
    <section className="concepts-page">
      <div className="page-header">
        <p className="eyebrow">Concepts</p>
        <h1>ML concepts organized by learning path.</h1>
        <p>
          Start with attention, then move into Transformer blocks, GPT, diffusion,
          and other generative AI architectures.
        </p>
      </div>

      <div className="concept-group-list">
        {conceptGroups.map((group) => (
          <article className="concept-group-card" key={group.title}>
            <h2>{group.title}</h2>
            <p>{group.description}</p>

            <div className="topic-list">
              {group.topics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Concepts;