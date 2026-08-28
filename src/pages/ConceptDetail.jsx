import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ConceptArchitectureDiagram from "../components/ConceptArchitectureDiagram";
import ContinueLearning from "../components/ContinueLearning";
import UnderstandingCheck from "../components/UnderstandingCheck";
import MultiHeadAttentionVisual from "../components/visuals/MultiHeadAttentionVisual";
import SelfAttentionVisual from "../components/visuals/SelfAttentionVisual";
import CrossAttentionVisual from "../components/visuals/CrossAttentionVisual";
import { conceptGroups } from "../data/concepts";
import {
  isConceptCompleted,
  markConceptCompleted,
} from "../utils/progress";
import "./ConceptDetail.css";


function findTopic(conceptId) {
  for (const group of conceptGroups) {
    const topic = group.topics.find((item) => item.id === conceptId);

    if (topic) {
      return {
        groupTitle: group.title,
        topic,
      };
    }
  }

  return null;
}

function getActiveArchitectureNode(conceptId) {
  const nodeMap = {
    "self-attention": "attention",
    "multi-head-attention": "attention",
    "cross-attention": "attention",
    "attention-internals": "attention",
    masks: "attention",
    "encoder-vs-decoder-attention": "attention",
    "positional-information": "input",

    "residual-connections": "residual-1",
    layernorm: "layernorm-1",
    "pre-ln-vs-post-ln": "layernorm-1",
    "ffn-mlp": "ffn",
    "full-transformer-block": "attention",
    "stacking-transformer-blocks": "output",
  };

  return nodeMap[conceptId] || "attention";
}

function DetailCard({ title, children, variant = "default" }) {
  return (
    <article className={`detail-card ${variant}`}>
      <h2>{title}</h2>
      {children}
    </article>
  );
}

function ConceptVisual({ conceptId }) {
  if (conceptId === "multi-head-attention") {
    return <MultiHeadAttentionVisual />;
  }

  if (conceptId === "self-attention") {
    return <SelfAttentionVisual />;
  }

  if (conceptId === "cross-attention") {
    return <CrossAttentionVisual />;
  }

  return (
    <ConceptArchitectureDiagram
      activeNode={getActiveArchitectureNode(conceptId)}
    />
  );
}

function ConceptDetail() {
  const { conceptId } = useParams();
  const result = findTopic(conceptId);

  if (!result) {
    return (
      <section className="concept-detail-page">
        <Link to="/concepts" className="back-link">
          ← Back to Concepts
        </Link>
        <h1>Concept not found</h1>
      </section>
    );
  }

  const { groupTitle, topic } = result;
  const details = topic.details;

  const [completed, setCompleted] = useState(isConceptCompleted(topic.id));

  useEffect(() => {
    window.scrollTo(0, 0);
    setCompleted(isConceptCompleted(topic.id));
  }, [topic.id]);

  // Completion is now triggered explicitly by UnderstandingCheck instead of
  // scroll depth. Scroll-to-90% was a "read receipt", not a learning signal;
  // an answered recall question + confirm click is the real signal.
  function handleMarkComplete() {
    markConceptCompleted(topic.id);
    setCompleted(true);
  }

  return (
    <section className="concept-detail-page">
      <Link to="/concepts" className="back-link">
        ← Back to Concepts
      </Link>

      <p className="eyebrow">{groupTitle}</p>
      <h1>{topic.title}</h1>
      <p className="concept-summary">{topic.summary}</p>

      {completed && <div className="completed-banner">Completed ✓</div>}

      <ConceptVisual conceptId={topic.id} />

      {details ? (
        <>
          <DetailCard title="One-line intuition" variant="highlight">
            <p>{details.intuition}</p>
          </DetailCard>

          <div className="detail-grid">
            <DetailCard title="Core idea">
              <p>{details.coreIdea}</p>
            </DetailCard>

            <DetailCard title="Why it matters">
              <p>{details.whyItMatters}</p>
            </DetailCard>
          </div>

          <DetailCard title="Step-by-step mechanism">
            <ol>
              {details.mechanismSteps.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </DetailCard>

          <DetailCard title="Shape flow" variant="code">
            <div className="shape-flow-list">
              {details.shapeFlow.map((item) => (
                <div key={item}>{item}</div>
              ))}
            </div>
          </DetailCard>

          <div className="detail-grid">
            <DetailCard title="Common mistakes">
              <ul>
                {details.commonMistakes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailCard>

            <DetailCard title="Key takeaways">
              <ul>
                {details.keyTakeaways.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </DetailCard>
          </div>
        </>
      ) : (
        <DetailCard title="Core idea">
          <p>
            Detailed notes for this concept will go here. This page will later
            include intuition, tensor shapes, code references, common failure
            modes, and review questions.
          </p>
        </DetailCard>
      )}

      <UnderstandingCheck
        conceptId={topic.id}
        recallQuestion={details?.recallQuestion}
        isCompleted={completed}
        onMarkComplete={handleMarkComplete}
      />

      <ContinueLearning conceptId={topic.id} />
    </section>
  );
}

export default ConceptDetail;