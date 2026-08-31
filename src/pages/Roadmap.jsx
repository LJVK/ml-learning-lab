import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import PhaseNode from "../components/RoadmapPhaseNode";
import { roadmapPhases } from "../data/roadmap";
import "./Roadmap.css";

// Roadmap — a dependency graph of the learning path. Phases are nodes,
// edges are dependencies. Not a straight line: Phase 4/5/6 fan out from
// Phase 2 and reconverge into Phase 7.
//
// Layout is hand-authored (fixed x/y per phase) so the graph reads left-
// to-right and looks the same on every viewport. React Flow's auto-layout
// libraries exist but produce inconsistent results for small hand-curated
// graphs like this one.

const nodeTypes = { phase: PhaseNode };

// Column x-coordinates for the left-to-right flow
const COL_X = { c1: 0, c2: 380, c3: 760, c4: 1140, c5: 1520 };
// Row y-coordinates. Each node is min-height 200 with padding — using
// 240px row spacing gives ~40px vertical gap between nodes on different
// rows. Main line runs at y=520. Diffusion (top) and VAE (upper) stack
// vertically ABOVE at c4; GANs sits BELOW at c4.
const ROW_Y = { top: 40, upper: 280, main: 520, lower: 760 };

const PHASE_LAYOUT = {
  "phase-1":            { x: COL_X.c1, y: ROW_Y.main },
  "phase-2":            { x: COL_X.c2, y: ROW_Y.main },
  "phase-3":            { x: COL_X.c3, y: ROW_Y.main },
  "phase-4":            { x: COL_X.c4, y: ROW_Y.main },
  // Diffusion and VAE are peer generative-model branches, stacked in one
  // column at c3. Placing them directly ABOVE Phase 3 keeps the edges
  // from Phase 2 clean: they travel diagonally up-right, no crossing of
  // Phase 3's card.
  "phase-5-diffusion":  { x: COL_X.c3, y: ROW_Y.top },
  "phase-5-vae":        { x: COL_X.c3, y: ROW_Y.upper },
  "phase-6":            { x: COL_X.c3, y: ROW_Y.lower },
  "phase-7":            { x: COL_X.c5, y: ROW_Y.main },
};

function Roadmap() {
  const { nodes, edges } = useMemo(() => {
    const nodes = roadmapPhases.map((phase) => ({
      id: phase.id,
      type: "phase",
      position: PHASE_LAYOUT[phase.id] || { x: 0, y: 0 },
      data: {
        phase: phase.phase,
        title: phase.title,
        summary: phase.summary,
        status: phase.status,
        topics: phase.topics,
      },
    }));

    // One edge per dependency. Style edges by whether the SOURCE phase is
    // completed — completed→next edges get the strong "you traveled this
    // path" green; edges into planned phases fade.
    // Edge type: use `straight` when source and target are on the same
    // y-row so we get a clean horizontal line; smoothstep otherwise so
    // branching arrows curve nicely.
    const edges = [];
    for (const phase of roadmapPhases) {
      for (const src of phase.dependsOn) {
        const srcPhase = roadmapPhases.find((p) => p.id === src);
        const traveled = srcPhase?.status === "Completed";
        const sameRow =
          PHASE_LAYOUT[src]?.y === PHASE_LAYOUT[phase.id]?.y;
        edges.push({
          id: `${src}->${phase.id}`,
          source: src,
          target: phase.id,
          type: sameRow ? "straight" : "smoothstep",
          animated: !traveled && phase.status === "Next",
          style: {
            stroke: traveled ? "#22c55e" : "#94a3b8",
            strokeWidth: traveled ? 2.5 : 1.5,
            strokeOpacity: traveled ? 0.85 : 0.55,
          },
        });
      }
    }
    return { nodes, edges };
  }, []);

  return (
    <section className="roadmap-page">
      <div className="page-header">
        <p className="eyebrow">Roadmap</p>
        <h1>Learning path from attention to generative AI.</h1>
        <p>
          A phased dependency graph. Green nodes are completed; orange is
          up next; grey is planned. Click a phase to expand its topics; any
          topic with a concept page becomes a link.
        </p>
      </div>

      <div className="roadmap-canvas">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: true }}
          // Read-only diagram — no dragging, no zoom, no connecting.
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.4}
            color="#e2e8f0"
          />
        </ReactFlow>
      </div>

      <div className="roadmap-legend">
        <span className="roadmap-legend-item completed">Completed</span>
        <span className="roadmap-legend-item next">Next</span>
        <span className="roadmap-legend-item planned">Planned</span>
      </div>
    </section>
  );
}

export default Roadmap;
