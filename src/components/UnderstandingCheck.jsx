import { useEffect, useState } from "react";

import "./UnderstandingCheck.css";

// UnderstandingCheck — replaces the old scroll-to-90% completion trigger with
// an explicit "I got it" signal. If the concept has a recallQuestion in
// concepts.js, the user must answer it correctly before the completion
// button becomes enabled; otherwise we fall back to a plain button so the
// flow still works for concepts we have not yet written questions for.

function UnderstandingCheck({
  conceptId,
  recallQuestion,
  isCompleted,
  onMarkComplete,
}) {
  const hasQuestion = Boolean(recallQuestion && recallQuestion.options?.length);

  // Local state tracks the current attempt on THIS render of this concept.
  // Reset whenever the concept changes so navigating between concepts starts
  // fresh (a wrong answer on concept A doesn't linger when we open concept B).
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);

  useEffect(() => {
    setSelectedIndex(null);
    setAnsweredCorrectly(false);
  }, [conceptId]);

  function handlePick(index, option) {
    setSelectedIndex(index);
    if (option.correct) {
      setAnsweredCorrectly(true);
    }
  }

  const canComplete = hasQuestion ? answeredCorrectly : true;

  // Already completed on a previous visit — show a compact confirmation
  // rather than making the user go through the question again.
  if (isCompleted) {
    return (
      <section className="understanding-check completed">
        <div className="understanding-check-header">
          <p className="understanding-check-eyebrow">Understanding check</p>
          <h2>You have marked this concept as understood</h2>
        </div>
        <p className="understanding-check-completed-note">
          Your progress is saved locally in this browser. Move on when you are
          ready — you can revisit this page anytime.
        </p>
      </section>
    );
  }

  return (
    <section className="understanding-check">
      <div className="understanding-check-header">
        <p className="understanding-check-eyebrow">Check your understanding</p>
        <h2>
          {hasQuestion
            ? "Answer the recall question, then mark as understood"
            : "Ready to move on?"}
        </h2>
      </div>

      {hasQuestion && (
        <div className="understanding-check-question">
          <p className="understanding-check-prompt">{recallQuestion.prompt}</p>
          <ul className="understanding-check-options">
            {recallQuestion.options.map((option, i) => {
              const isPicked = selectedIndex === i;
              const state = !isPicked
                ? "idle"
                : option.correct
                ? "correct"
                : "wrong";
              return (
                <li key={option.text}>
                  <button
                    type="button"
                    className={`understanding-check-option ${state}`}
                    onClick={() => handlePick(i, option)}
                    // Once answered correctly, freeze the correct button;
                    // wrong picks stay clickable so the user can try again.
                    disabled={answeredCorrectly && !option.correct}
                  >
                    <span className="understanding-check-option-letter">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="understanding-check-option-text">
                      {option.text}
                    </span>
                  </button>
                  {isPicked && (
                    <div
                      className={`understanding-check-feedback ${
                        option.correct ? "correct" : "wrong"
                      }`}
                    >
                      <strong>
                        {option.correct ? "Correct." : "Not quite."}
                      </strong>{" "}
                      {option.feedback}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="understanding-check-actions">
        <button
          type="button"
          className="understanding-check-cta"
          onClick={onMarkComplete}
          disabled={!canComplete}
          title={
            canComplete
              ? undefined
              : "Answer the recall question correctly first"
          }
        >
          Mark as understood ✓
        </button>
        {!hasQuestion && (
          <p className="understanding-check-nohint">
            No recall question written for this concept yet — mark it when you
            feel comfortable with the material.
          </p>
        )}
      </div>
    </section>
  );
}

export default UnderstandingCheck;
