import { Link } from "react-router-dom";
import { conceptGroups } from "../data/concepts";
import { getGroupProgress } from "../utils/progress";
import "./Home.css";

function getOverallProgress() {
  const totalConcepts = conceptGroups.reduce(
    (total, group) => total + group.topics.length,
    0
  );

  const completedConcepts = conceptGroups.reduce((total, group) => {
    const progress = getGroupProgress(group);
    return total + progress.completedCount;
  }, 0);

  const percent =
    totalConcepts === 0
      ? 0
      : Math.round((completedConcepts / totalConcepts) * 100);

  return {
    completedConcepts,
    totalConcepts,
    percent,
  };
}

function Home() {
  const progress = getOverallProgress();

  return (
    <section className="home-page">
      <div className="hero">
        <p className="eyebrow">ML Learning Lab</p>
        <h1>Learning ML, Transformers, and Generative AI from scratch.</h1>
        <p className="hero-text">
          A structured learning site for concepts, code, questions, and
          implementation notes.
        </p>
      </div>

      <section className="progress-card">
        <div>
          <p className="progress-label">Overall concept progress</p>
          <h2>{progress.percent}% complete</h2>
          <p>
            {progress.completedConcepts} / {progress.totalConcepts} concepts
            completed
          </p>
        </div>

        <div className="progress-bar">
          <span style={{ width: `${progress.percent}%` }} />
        </div>
      </section>

      <div className="home-grid">
        <Link to="/concepts" className="home-card">
          <span>01</span>
          <h2>Concepts</h2>
          <p>Attention, Transformer Blocks, GPT, Diffusion, and more.</p>
        </Link>

        <Link to="/code" className="home-card">
          <span>02</span>
          <h2>Code</h2>
          <p>PyTorch implementations and tests from scratch.</p>
        </Link>

        <Link to="/questions" className="home-card">
          <span>03</span>
          <h2>Questions</h2>
          <p>Questions with concise ideal answers.</p>
        </Link>

        <Link to="/roadmap" className="home-card">
          <span>04</span>
          <h2>Roadmap</h2>
          <p>The full learning path from attention to generative AI.</p>
        </Link>

        <Link to="/resources" className="home-card">
          <span>05</span>
          <h2>Resources</h2>
          <p>Question banks, references, and learning artifacts.</p>
        </Link>
      </div>
    </section>
  );
}

export default Home;