import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import "highlight.js/styles/github-dark.css";
import "./MarkdownPage.css";

// MarkdownPage — shared shell for /questions, /code, /cheatsheets routes.
// Renders the front-matter title as an <h1>, adds a back-link to the
// concept page, then renders the markdown body with GFM (tables,
// task-lists) + syntax highlighting.
//
// The `kind` prop is the artifact type ("questions" | "code" |
// "cheatsheet") and is used only for the eyebrow label; all layout is
// shared so the three routes feel like one system.
function MarkdownPage({ kind, conceptId, frontMatter, body }) {
  const title = frontMatter.title || conceptId;
  const groupTitle = frontMatter.group ? frontMatter.group.replace(/-/g, " ") : "";
  const relatedConcept = frontMatter.related_concept || `/concepts/${conceptId}`;

  return (
    <section className="md-page">
      <div className="md-page-nav">
        <Link to={relatedConcept} className="md-page-back">
          ← Back to concept
        </Link>
        <Link to="/concepts" className="md-page-back muted">
          All concepts
        </Link>
      </div>

      <p className="md-page-eyebrow">
        {kind}
        {groupTitle && <span> · {groupTitle}</span>}
      </p>
      <h1 className="md-page-title">{title}</h1>

      <article className="md-page-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          // Skip the first H1 in the body — front-matter title already
          // rendered above. Everything else passes through untouched.
          components={{
            h1: () => null,
          }}
        >
          {body}
        </ReactMarkdown>
      </article>
    </section>
  );
}

export default MarkdownPage;
