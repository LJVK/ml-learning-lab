import "./Code.css";

const codeSections = [
  {
    title: "Attention From Scratch",
    description: "Core attention mechanisms implemented step by step in PyTorch.",
    files: [
      "singleheadselfattention.py",
      "multiheadselfattention.py",
      "crossattention.py",
    ],
  },
  {
    title: "Transformer Block From Scratch",
    description: "Reusable Transformer components built on top of attention.",
    files: [
      "feed_forward.py",
      "transformer_block.py",
      "test_transformer_block.py",
    ],
  },
];

function Code() {
  return (
    <section className="code-page">
      <div className="page-header">
        <p className="eyebrow">Code</p>
        <h1>From-scratch implementations.</h1>
        <p>
          Clean PyTorch implementations for attention, Transformer blocks, and
          supporting tests.
        </p>
      </div>

      <div className="code-section-list">
        {codeSections.map((section) => (
          <article className="code-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.description}</p>

            <ul>
              {section.files.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Code;