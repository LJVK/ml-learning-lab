import { Link } from "react-router-dom";
import { conceptGroups } from "../data/concepts";
import { getGroupProgress, isConceptCompleted } from "../utils/progress";
import "./Concepts.css";

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
        {conceptGroups.map((group) => {
          const progress = getGroupProgress(group);

          return (
            <article className="concept-group-card" key={group.id}>
              <div className="concept-group-header">
                <div>
                  <h2>{group.title}</h2>
                  <p>{group.description}</p>
                </div>

                <div className="group-progress">
                  <span>
                    {progress.completedCount} / {progress.totalCount} complete
                  </span>

                  <strong className={`group-status ${progress.status.toLowerCase().replaceAll(" ", "-")}`}>
                    {progress.status}
                    {progress.isCompleted ? " ✓" : ""}
                  </strong>
                </div>
              </div>

              <div className="concept-topic-grid">
                {group.topics.map((topic) => {
                  const completed = isConceptCompleted(topic.id);

                  return (
                    <Link
                      to={`/concepts/${topic.id}`}
                      className={`concept-topic-card ${
                        completed ? "completed" : ""
                      }`}
                      key={topic.id}
                    >
                      <div className="concept-topic-header">
                        <h3>{topic.title}</h3>
                        {completed && <span>✓</span>}
                      </div>

                      <p>{topic.summary}</p>
                    </Link>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default Concepts;