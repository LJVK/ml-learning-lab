import "./Questions.css";

const questionBanks = [
  {
    title: "Attention Family",
    description:
      "Question banks covering self-attention, multi-head attention, cross-attention, masks, encoder/decoder attention, and positional information.",
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
    title: "Transformer Block",
    description:
      "Questions covering residuals, LayerNorm, Pre-LN/Post-LN, FFN/MLP, Transformer block implementation, and tests.",
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
];

function Questions() {
  return (
    <section className="questions-page">
      <div className="page-header">
        <p className="eyebrow">Questions</p>
        <h1>Questions for review and interview preparation.</h1>
        <p>
          Captured questions from each learning topic with concise ideal answers.
        </p>
      </div>

      <div className="question-bank-list">
        {questionBanks.map((bank) => (
          <article className="question-card" key={bank.title}>
            <div className="question-card-header">
              <h2>{bank.title}</h2>
              <span>{bank.status}</span>
            </div>

            <p>{bank.description}</p>

            <div className="topic-list">
              {bank.topics.map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Questions;