import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <section className="home-page">
      <div className="hero">
        <p className="eyebrow">ML Learning Lab</p>
        <h1>Learning ML, Transformers, and Generative AI from scratch.</h1>
        <p className="hero-text">
          A structured learning site for concepts, code, questions,
          and implementation notes.
        </p>
      </div>

      <div className="home-grid">
        <Link to="/concepts" className="home-card">
          <span>01</span>
          <h2>Concepts</h2>
          <p>Attention, Transformer Blocks, GPT, Diffusion, and more.</p>
        </Link>

        <Link to="/questions" className="home-card">
          <span>02</span>
          <h2>Questions</h2>
          <p>Questions with concise ideal answers.</p>
        </Link>

        <Link to="/roadmap" className="home-card">
          <span>03</span>
          <h2>Roadmap</h2>
          <p>The full learning path from attention to generative AI.</p>
        </Link>
      </div>
    </section>
  );
}

export default Home;