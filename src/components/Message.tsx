import { Suspense } from "react";
import type { ChatMessage } from "../bot";
import { Avatar } from "./Avatar";
import { LazyMarkdown } from "./LazyMarkdown";

type Props = {
  message: ChatMessage;
  // True while this reply is still streaming in.
  streaming: boolean;
};

export function Message({ message, streaming }: Props) {
  if (message.role === "user") {
    return (
      <div className="msg msg--user">
        <div className="bubble">{message.content}</div>
      </div>
    );
  }

  return (
    <div className="msg msg--bot">
      <Avatar size="sm" />
      <div className="msg-body" aria-busy={streaming}>
        {message.content ? (
          <Suspense fallback={<div className="plain-text">{message.content}</div>}>
            <LazyMarkdown>{message.content}</LazyMarkdown>
          </Suspense>
        ) : (
          <TypingDots />
        )}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="typing" role="status" aria-label="Typing">
      <span />
      <span />
      <span />
    </div>
  );
}
