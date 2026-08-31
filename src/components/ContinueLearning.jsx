import { Link } from "react-router-dom";

import { conceptGroups } from "../data/concepts";
import { getLearningUnit } from "../data/learningUnits";
import "./ContinueLearning.css";

// Build a flat id -> topic map once so we can look up related-concept titles
// without walking the group array on every render.
const TOPIC_BY_ID = {};
for (const group of conceptGroups) {
  for (const topic of group.topics) {
    TOPIC_BY_ID[topic.id] = { ...topic, groupTitle: group.title };
  }
}

function RelatedConceptChip({ conceptId }) {
  const topic = TOPIC_BY_ID[conceptId];
  if (!topic) return null;   // stale mapping — skip silently

  return (
    <Link
      to={`/concepts/${topic.id}`}
      className="continue-learning-chip"
      title={topic.summary}
    >
      {topic.title}
    </Link>
  );
}

// Artifact card — a big, prominent tile that lets the user jump straight
// into the code / questions / cheatsheet for THIS concept. This is the
// "learning-artifact" real estate that earned the top of the Continue
// Learning block.
function ArtifactCard({ kind, label, description, to, icon }) {
  return (
    <Link to={to} className={`continue-learning-artifact ${kind}`}>
      <div className="continue-learning-artifact-icon" aria-hidden="true">
        {icon}
      </div>
      <div className="continue-learning-artifact-text">
        <h4>{label}</h4>
        <p>{description}</p>
      </div>
      <span className="continue-learning-artifact-cta">Open →</span>
    </Link>
  );
}

function ContinueLearning({ conceptId }) {
  const unit = getLearningUnit(conceptId);

  // No unit means we haven't mapped this concept yet — render nothing rather
  // than an empty section header.
  if (!unit) return null;

  const {
    relatedConceptIds = [],
    codeIds = [],
    questionIds = [],
    resourceIds = [],
  } = unit;

  // For each kind, we currently point at the first id in the array. The
  // arrays keep the plural shape so a concept can eventually own multiple
  // artifacts of the same type (e.g. two independent code implementations).
  const codeId = codeIds[0];
  const questionId = questionIds[0];
  const cheatsheetId = resourceIds[0];

  const hasArtifacts = Boolean(codeId || questionId || cheatsheetId);
  const hasRelated = relatedConceptIds.length > 0;
  if (!hasArtifacts && !hasRelated) return null;

  return (
    <section className="continue-learning">
      <div className="continue-learning-header">
        <p className="continue-learning-eyebrow">Continue learning</p>
        <h2>Where to go from here</h2>
      </div>

      {/* Code / Questions / Cheatsheet artifacts — top real estate. */}
      {hasArtifacts && (
        <div className="continue-learning-block">
          <h3>More on this topic</h3>
          <div className="continue-learning-artifact-grid">
            {cheatsheetId && (
              <ArtifactCard
                kind="cheatsheet"
                label="Cheat sheet"
                description="Dense revision page: math, shape flow, common mistakes, 30-second recall."
                to={`/cheatsheets/${cheatsheetId}`}
                icon="⚡"
              />
            )}
            {questionId && (
              <ArtifactCard
                kind="questions"
                label="Question bank"
                description="Senior-level interview questions with concise ideal answers."
                to={`/questions/${questionId}`}
                icon="?"
              />
            )}
            {codeId && (
              <ArtifactCard
                kind="code"
                label="Code"
                description="From-scratch implementation with inline shape comments."
                to={`/code/${codeId}`}
                icon="{ }"
              />
            )}
          </div>
        </div>
      )}

      {/* Related concepts trail as a compact chip row — captures relationships
          the sidebar's family grouping cannot (e.g. self-attention pairs with
          positional-information), without competing for attention with the
          learning artifacts above. */}
      {hasRelated && (
        <div className="continue-learning-block">
          <h3>Related concepts</h3>
          <div className="continue-learning-chip-row">
            {relatedConceptIds.map((id) => (
              <RelatedConceptChip key={id} conceptId={id} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ContinueLearning;
