import { useRef, useState } from "react";
import { streamReply, type ChatMessage } from "./bot";
import { Composer } from "./components/Composer";
import { EmptyState } from "./components/EmptyState";
import { Header } from "./components/Header";
import { preloadMarkdown } from "./components/LazyMarkdown";
import { MessageList } from "./components/MessageList";
import { useTheme } from "./useTheme";
import "./App.css";

const MAX_MESSAGE_CHARS = 2000;

function App() {
  const { theme, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);

  const send = async (question: string) => {
    const text = question.trim();
    if (!text || loading) return;

    preloadMarkdown();
    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setLoading(true);
    const controller = new AbortController();
    request.current = controller;

    const updateReply = (update: (content: string) => string) =>
      setMessages((prev) => {
        const last = prev.at(-1);
        if (last?.role !== "assistant") return prev;
        return [...prev.slice(0, -1), { role: "assistant", content: update(last.content) }];
      });

    try {
      await streamReply(history, (chunk) => updateReply((content) => content + chunk), controller.signal);
    } catch {
      if (request.current !== controller) return;
      if (controller.signal.aborted) {
        setMessages((prev) => (prev.at(-1)?.content === "" ? prev.slice(0, -1) : prev));
      } else {
        updateReply((content) => content || "Sorry, I couldn't reach the server. Please try again.");
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        setLoading(false);
      }
    }
  };

  const stop = () => request.current?.abort();

  const newChat = () => {
    request.current?.abort();
    request.current = null;
    setMessages([]);
    setLoading(false);
  };

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggleTheme} onNewChat={messages.length ? newChat : undefined} />
      {messages.length === 0 ? (
        <EmptyState onPick={send} />
      ) : (
        <MessageList messages={messages} loading={loading} />
      )}
      <Composer
        value={input}
        onChange={setInput}
        onSend={() => send(input)}
        onStop={stop}
        busy={loading}
        maxLength={MAX_MESSAGE_CHARS}
      />
    </div>
  );
}

export default App;
