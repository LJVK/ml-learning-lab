import "./Resources.css";

const resources = [
  {
    title: "Transformer Block Question Bank",
    type: "DOCX",
    status: "Ready",
    description:
        "Questions and concise answers covering residuals, LayerNorm, FFN, Transformer Block implementation, and tests.",
  },
  {
    title: "Attention Family Question Banks",
    type: "DOCX",
    status: "Ready",
    description:
      "Question banks for self-attention, multi-head attention, cross-attention, masks, encoder/decoder attention, and positional information.",
  },
  {
    title: "Website v1 Notes",
    type: "Site",
    status: "In Progress",
    description:
      "Concept notes, code references, questions, and roadmap pages for ML Learning Lab.",
  },
];

function Resources() {
  return (
    <section className="resources-page">
      <div className="page-header">
        <p className="eyebrow">Resources</p>
        <h1>Learning artifacts and downloadable references.</h1>
        <p>
          Question banks, diagrams, code references, and study materials collected
          from each learning phase.
        </p>
      </div>

      <div className="resource-list">
        {resources.map((resource) => (
          <article className="resource-card" key={resource.title}>
            <div className="resource-card-header">
              <div>
                <p className="resource-type">{resource.type}</p>
                <h2>{resource.title}</h2>
              </div>
              <span>{resource.status}</span>
            </div>

            <p>{resource.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Resources;