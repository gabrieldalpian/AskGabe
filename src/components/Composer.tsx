import { useEffect, useLayoutEffect, useRef } from "react";
import { SendIcon, StopIcon } from "./Icons";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  busy: boolean;
  maxLength: number;
};

// Only auto-focus where there's a mouse, so phones don't pop the keyboard open by themselves.
const finePointer = window.matchMedia("(pointer: fine)");

export function Composer({ value, onChange, onSend, onStop, busy, maxLength }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const canSend = !busy && value.trim() !== "";

  // Grow with the text; past the CSS max-height it scrolls instead.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  // Ready for the next question on load and after each reply.
  useEffect(() => {
    if (!busy && finePointer.matches) ref.current?.focus();
  }, [busy]);

  return (
    <div className="composer-wrap">
      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) onSend();
        }}
      >
        <textarea
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // isComposing: Enter confirms IME input (e.g. Japanese) rather than sending.
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder="Ask anything about Gabriel…"
          aria-label="Message"
          maxLength={maxLength}
          enterKeyHint="send"
        />
        {busy ? (
          <button type="button" className="send-btn" onClick={onStop} aria-label="Stop generating" title="Stop">
            <StopIcon />
          </button>
        ) : (
          <button type="submit" className="send-btn" disabled={!canSend} aria-label="Send message" title="Send">
            <SendIcon />
          </button>
        )}
      </form>
      <p className="composer-hint">Enter to send · Shift+Enter for a new line</p>
    </div>
  );
}
