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

function RelatedConceptCard({ conceptId }) {
  const topic = TOPIC_BY_ID[conceptId];
  if (!topic) return null;   // stale mapping — skip silently

  return (
    <Link
      to={`/concepts/${topic.id}`}
      className="continue-learning-card"
    >
      <p className="continue-learning-card-group">{topic.groupTitle}</p>
      <h4>{topic.title}</h4>
      <p className="continue-learning-card-summary">{topic.summary}</p>
      <span className="continue-learning-card-cta">Open →</span>
    </Link>
  );
}

// Placeholder for future Code / Questions / Resources sections. Kept
// separate from RelatedConceptCard so those sections can grow independently
// once real data lands.
function ComingSoonRow({ label, count }) {
  return (
    <div className="continue-learning-stub">
      <span className="continue-learning-stub-label">{label}</span>
      <span className="continue-learning-stub-count">
        {count} planned · content coming soon
      </span>
    </div>
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

  const hasAnything =
    relatedConceptIds.length > 0 ||
    codeIds.length > 0 ||
    questionIds.length > 0 ||
    resourceIds.length > 0;

  if (!hasAnything) return null;

  return (
    <section className="continue-learning">
      <div className="continue-learning-header">
        <p className="continue-learning-eyebrow">Continue learning</p>
        <h2>Where to go from here</h2>
      </div>

      {relatedConceptIds.length > 0 && (
        <div className="continue-learning-block">
          <h3>Related concepts</h3>
          <div className="continue-learning-grid">
            {relatedConceptIds.map((id) => (
              <RelatedConceptCard key={id} conceptId={id} />
            ))}
          </div>
        </div>
      )}

      {(codeIds.length > 0 ||
        questionIds.length > 0 ||
        resourceIds.length > 0) && (
        <div className="continue-learning-block">
          <h3>More on this topic</h3>
          <div className="continue-learning-stub-list">
            {codeIds.length > 0 && (
              <ComingSoonRow label="Code" count={codeIds.length} />
            )}
            {questionIds.length > 0 && (
              <ComingSoonRow label="Questions" count={questionIds.length} />
            )}
            {resourceIds.length > 0 && (
              <ComingSoonRow label="Resources" count={resourceIds.length} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ContinueLearning;
