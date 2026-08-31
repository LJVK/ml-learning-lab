import { Link } from "react-router-dom";

import { conceptGroups } from "../data/concepts";
import { listContent } from "../utils/content";
import "./Code.css";

// Code page — directory of every code file. Groups by concept family so it
// reads as a curriculum, not a folder listing. Each card links to
// /code/:conceptId.

function Code() {
  const available = new Set(listContent("code"));

  return (
    <section className="code-page">
      <div className="page-header">
        <p className="eyebrow">Code</p>
        <h1>From-scratch implementations.</h1>
        <p>
          PyTorch code for every attention and Transformer-block concept, with
          heavy inline shape comments. Read a file to see the mechanism as
          runnable code.
        </p>
      </div>

      <div className="code-groups">
        {conceptGroups.map((group) => (
          <section className="code-group" key={group.id}>
            <div className="code-group-header">
              <h2>{group.title}</h2>
              <p>{group.description}</p>
            </div>

            <div className="code-topic-grid">
              {group.topics
                .filter((t) => available.has(t.id))
                .map((topic) => (
                  <Link
                    key={topic.id}
                    to={`/code/${topic.id}`}
                    className="code-topic-card"
                  >
                    <div className="code-topic-icon" aria-hidden="true">
                      {"{ }"}
                    </div>
                    <div className="code-topic-text">
                      <h3>{topic.title}</h3>
                      <p>{topic.summary}</p>
                    </div>
                    <span className="code-topic-cta">Open →</span>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export default Code;
