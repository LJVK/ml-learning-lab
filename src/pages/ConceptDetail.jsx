import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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

function DetailCard({ title, children, variant = "default" }) {
  return (
    <article className={`detail-card ${variant}`}>
      <h2>{title}</h2>
      {children}
    </article>
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
}, [topic.id]);

  useEffect(() => {
    function handleScroll() {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        const scrollPercent = (scrollTop + windowHeight) / documentHeight;

        if (scrollPercent >= 0.9) {
            markConceptCompleted(topic.id);
            setCompleted(true);
        }
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
        window.removeEventListener("scroll", handleScroll);
    };
}, [topic.id]);

  return (
    <section className="concept-detail-page">
      <Link to="/concepts" className="back-link">
        ← Back to Concepts
      </Link>

      <p className="eyebrow">{groupTitle}</p>
      <h1>{topic.title}</h1>
      <p className="concept-summary">{topic.summary}</p>
      {completed && <div className="completed-banner">Completed ✓</div>}

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
    </section>
  );
}

export default ConceptDetail;