import { Link } from "react-router-dom";

import { conceptGroups } from "../data/concepts";
import { listContent } from "../utils/content";
import "./Resources.css";

// Resources page — directory of every cheatsheet in ml_learning_lab_content/.
// Cheatsheets are the "revision-focused" primary resource per handoff §15.
// Grouped by concept family so it feels like a curriculum, not a bin.

function Resources() {
  const available = new Set(listContent("cheatsheets"));

  return (
    <section className="resources-page">
      <div className="page-header">
        <p className="eyebrow">Resources</p>
        <h1>Cheat sheets and revision references.</h1>
        <p>
          Dense one-page revision sheets for every concept — math, shape flow,
          common mistakes, and a 30-second recall scaffold. Print-friendly.
        </p>
      </div>

      <div className="resource-groups">
        {conceptGroups.map((group) => (
          <section className="resource-group" key={group.id}>
            <div className="resource-group-header">
              <h2>{group.title}</h2>
              <p>{group.description}</p>
            </div>

            <div className="resource-cheatsheet-grid">
              {group.topics
                .filter((t) => available.has(t.id))
                .map((topic) => (
                  <Link
                    key={topic.id}
                    to={`/cheatsheets/${topic.id}`}
                    className="resource-cheatsheet-card"
                  >
                    <div className="resource-cheatsheet-icon" aria-hidden="true">
                      ⚡
                    </div>
                    <div className="resource-cheatsheet-text">
                      <h3>{topic.title}</h3>
                      <p>{topic.summary}</p>
                    </div>
                    <span className="resource-cheatsheet-cta">Open →</span>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}

export default Resources;
