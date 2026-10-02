import { useLayoutEffect, useRef } from "react";
import type { ChatMessage } from "../bot";
import { Message } from "./Message";

type Props = {
  messages: ChatMessage[];
  loading: boolean;
};

// How close to the bottom (px) still counts as "following along".
const PIN_THRESHOLD = 80;

export function MessageList({ messages, loading }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);
  const count = useRef(messages.length);

  // Keep the newest text in view while it streams, unless the visitor scrolled up to
  // read something. Sending a new message always jumps back down.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (messages.length !== count.current) {
      count.current = messages.length;
      pinned.current = true;
    }
    if (pinned.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < PIN_THRESHOLD;
  };

  return (
    <div className="chat" ref={scrollRef} onScroll={onScroll}>
      <div className="chat-inner" role="log" aria-label="Conversation">
        {messages.map((message, i) => (
          <Message key={i} message={message} streaming={loading && i === messages.length - 1} />
        ))}
      </div>
    </div>
  );
}
