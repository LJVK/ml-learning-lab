import "./ConceptArchitectureDiagram.css";

const transformerBlockNodes = [
  {
    id: "input",
    label: "Input Tokens",
    sublabel: "Token representations",
    shape: "(B, T, D)",
  },
  {
    id: "layernorm-1",
    label: "LayerNorm",
    sublabel: "Normalize before attention",
    shape: "(B, T, D)",
  },
  {
    id: "attention",
    label: "Multi-Head Attention",
    sublabel: "Tokens exchange information",
    shape: "(B, T, D)",
  },
  {
    id: "residual-1",
    label: "Residual Add",
    sublabel: "Preserve + update",
    shape: "x + attention",
  },
  {
    id: "layernorm-2",
    label: "LayerNorm",
    sublabel: "Normalize before FFN",
    shape: "(B, T, D)",
  },
  {
    id: "ffn",
    label: "FFN / MLP",
    sublabel: "Transform token features",
    shape: "D → hidden → D",
  },
  {
    id: "residual-2",
    label: "Residual Add",
    sublabel: "Preserve + update",
    shape: "x + ffn",
  },
  {
    id: "output",
    label: "Output Tokens",
    sublabel: "Updated representations",
    shape: "(B, T, D)",
  },
];

function DiagramNode({ node, activeNode }) {
  const isActive = node.id === activeNode;

  return (
    <div className={`diagram-node ${isActive ? "active" : ""}`}>
      {isActive && <span className="active-pill">You are here</span>}

      <h3>{node.label}</h3>
      <p>{node.sublabel}</p>
      <code>{node.shape}</code>
    </div>
  );
}

function ConceptArchitectureDiagram({ activeNode = "attention" }) {
  return (
    <section className="architecture-card">
      <div className="architecture-header">
        <p className="architecture-eyebrow">Architecture view</p>
        <h2>Where this concept fits</h2>
        <p>
          A visual map of the Transformer block flow. The highlighted block shows
          the current concept.
        </p>
      </div>

      <div className="transformer-diagram">
        <div className="diagram-row single">
          <DiagramNode node={transformerBlockNodes[0]} activeNode={activeNode} />
        </div>

        <div className="diagram-arrow">↓</div>

        <div className="diagram-stage">
          <p className="stage-label">Attention Sublayer</p>
          <div className="diagram-row">
            <DiagramNode node={transformerBlockNodes[1]} activeNode={activeNode} />
            <div className="diagram-arrow horizontal">→</div>
            <DiagramNode node={transformerBlockNodes[2]} activeNode={activeNode} />
            <div className="diagram-arrow horizontal">→</div>
            <DiagramNode node={transformerBlockNodes[3]} activeNode={activeNode} />
          </div>
        </div>

        <div className="diagram-arrow">↓</div>

        <div className="diagram-stage">
          <p className="stage-label">FFN Sublayer</p>
          <div className="diagram-row">
            <DiagramNode node={transformerBlockNodes[4]} activeNode={activeNode} />
            <div className="diagram-arrow horizontal">→</div>
            <DiagramNode node={transformerBlockNodes[5]} activeNode={activeNode} />
            <div className="diagram-arrow horizontal">→</div>
            <DiagramNode node={transformerBlockNodes[6]} activeNode={activeNode} />
          </div>
        </div>

        <div className="diagram-arrow">↓</div>

        <div className="diagram-row single">
          <DiagramNode node={transformerBlockNodes[7]} activeNode={activeNode} />
        </div>
      </div>
    </section>
  );
}

export default ConceptArchitectureDiagram;