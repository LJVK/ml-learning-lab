import { useState } from "react";
import { Link } from "react-router-dom";
import { Handle, Position } from "@xyflow/react";

import { STATUS_STYLE } from "../data/roadmap";
import "./RoadmapPhaseNode.css";

// PhaseNode — one node in the roadmap dependency graph.
// Data shape (via node.data):
//   phase:    "Phase 1"
//   title:    "Attention Family"
//   summary:  short prose
//   status:   "Completed" | "Next" | "Planned"
//   topics:   [{ label, conceptId? }, ...]
//
// Node collapsed by default: shows phase, title, status pill, summary,
// and a chip row of topic labels. Click the header to expand and see
// the same topics as clickable chips (concept-linked ones become links).

function PhaseNode({ data }) {
  const [expanded, setExpanded] = useState(false);
  const style = STATUS_STYLE[data.status] || STATUS_STYLE.Planned;

  return (
    <div
      className={`roadmap-node roadmap-node-${data.status.toLowerCase()} nopan nodrag`}
      style={{
        borderColor: style.border,
        boxShadow: `0 0 24px ${style.background}`,
      }}
    >
      {/* React Flow handles: incoming edges from upstream phases connect
          on the left, outgoing edges to downstream phases exit on the right.
          Pin both to a fixed offset from the node TOP (top: 100px) so an
          expanded node's larger height doesn't shift the edge attachment
          point — this keeps straight edges between same-row phases from
          slanting when one node is expanded and the other isn't. */}
      <Handle
        type="target"
        position={Position.Left}
        className="roadmap-node-handle"
        isConnectable={false}
        style={{ top: 100 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="roadmap-node-handle"
        isConnectable={false}
        style={{ top: 100 }}
      />

      <button
        type="button"
        className="roadmap-node-header"
        onClick={(e) => {
          // React Flow attaches its own pointer handlers to the node wrapper.
          // Without stopPropagation, node-selection handlers can swallow the
          // click and the toggle never runs. `nopan` on the wrapper isn't
          // enough for click events specifically.
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        onMouseDown={(e) => e.stopPropagation()}
        aria-expanded={expanded}
      >
        <div className="roadmap-node-header-text">
          <p className="roadmap-node-phase" style={{ color: style.color }}>
            {data.phase}
          </p>
          <h3>{data.title}</h3>
        </div>
        <span
          className="roadmap-node-status"
          style={{
            color: style.color,
            background: style.background,
            borderColor: style.border,
          }}
        >
          {style.label}
        </span>
      </button>

      <p className="roadmap-node-summary">{data.summary}</p>

      {expanded ? (
        <div className="roadmap-node-topics expanded">
          {data.topics.map((t) =>
            t.conceptId ? (
              <Link
                key={t.label}
                to={`/concepts/${t.conceptId}`}
                className="roadmap-topic-chip linked"
                title={`Open concept: ${t.label}`}
              >
                {t.label}
              </Link>
            ) : (
              <span key={t.label} className="roadmap-topic-chip">
                {t.label}
              </span>
            )
          )}
        </div>
      ) : (
        <div className="roadmap-node-topics collapsed">
          <span className="roadmap-node-topics-count">
            {data.topics.length} topics
          </span>
          <span className="roadmap-node-topics-toggle">
            {expanded ? "▲ collapse" : "▼ expand"}
          </span>
        </div>
      )}
    </div>
  );
}

export default PhaseNode;
