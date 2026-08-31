import { useParams } from "react-router-dom";

import MarkdownPage from "../components/MarkdownPage";
import { getContent } from "../utils/content";
import "../components/MarkdownPage.css";

// Small wrapper that resolves :conceptId from the route, loads the right
// markdown file, and delegates rendering to the shared MarkdownPage shell.
// If the file is missing (an id someone linked to but we never wrote),
// render a fallback rather than a blank page.
function ArtifactPage({ kind }) {
  const { conceptId } = useParams();
  const content = getContent(kind, conceptId);

  if (!content) {
    return (
      <section className="md-page">
        <div className="md-page-missing">
          <h2>No {kind} yet for “{conceptId}”</h2>
          <p>
            This artifact hasn’t been written or extracted yet. The concept
            page still works — this is a coming-soon slot.
          </p>
        </div>
      </section>
    );
  }

  return (
    <MarkdownPage
      kind={kind}
      conceptId={conceptId}
      frontMatter={content.frontMatter}
      body={content.body}
    />
  );
}

export function CodePage() {
  return <ArtifactPage kind="code" />;
}

export function QuestionsPage() {
  return <ArtifactPage kind="questions" />;
}

export function CheatsheetPage() {
  return <ArtifactPage kind="cheatsheets" />;
}

export default ArtifactPage;
