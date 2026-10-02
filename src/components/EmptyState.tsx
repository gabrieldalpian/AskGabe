import { Avatar } from "./Avatar";

const SUGGESTIONS = [
  "What does Gabriel study?",
  "What's his work experience?",
  "Which programming languages does he know?",
  "Tell me a fun fact about him",
];

export function EmptyState({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="chat chat--empty">
      <div className="empty">
        <Avatar size="lg" />
        <h2>Hi, I'm Gabriel's assistant 👋</h2>
        <p>Ask me anything about his studies, experience, skills or interests.</p>
        <div className="suggestions">
          {SUGGESTIONS.map((question) => (
            <button key={question} type="button" className="chip" onClick={() => onPick(question)}>
              {question}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
