import { Link } from "react-router-dom";

import { conceptGroups } from "../data/concepts";
import { listContent } from "../utils/content";
import "./Questions.css";

// Questions page — directory of every question bank. Groups by concept family
// so it reads as a curriculum. Each card links to /questions/:conceptId.

function Questions() {
  const available = new Set(listContent("questions"));

  return (
    <section className="questions-page">
      <div className="page-header">
        <p className="eyebrow">Questions</p>
        <h1>Question banks for review and interview preparation.</h1>
        <p>
          Senior-level questions with concise ideal answers, grouped by
          concept. Written for spaced revision and interview prep.
        </p>
      </div>

      <div className="question-groups">
        {conceptGroups.map((group) => (
          <section className="question-group" key={group.id}>
            <div className="question-group-header">
              <h2>{group.title}</h2>
              <p>{group.description}</p>
            </div>

            <div className="question-topic-grid">
              {group.topics
                .filter((t) => available.has(t.id))
                .map((topic) => (
                  <Link
                    key={topic.id}
                    to={`/questions/${topic.id}`}
                    className="question-topic-card"
                  >
                    <div className="question-topic-icon" aria-hidden="true">
                      ?
                    </div>
                    <div className="question-topic-text">
                      <h3>{topic.title}</h3>
                      <p>{topic.summary}</p>
                    </div>
                    <span className="question-topic-cta">Open →</span>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export default Questions;
