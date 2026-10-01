import type { Theme } from "../useTheme";
import { MoonIcon, NewChatIcon, SunIcon } from "./Icons";

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
  // Omitted while the conversation is empty, which disables the button.
  onNewChat?: () => void;
};

export function Header({ theme, onToggleTheme, onNewChat }: Props) {
  const isDark = theme === "dark";

  return (
    <header className="header">
      <div className="header-toolbar">
        <button type="button" className="new-chat" onClick={onNewChat} disabled={!onNewChat} title="Start a new chat">
          <NewChatIcon />
          New chat
        </button>
        <span className="toolbar-divider" aria-hidden="true" />
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label="Dark mode"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="theme-switch"
          onClick={onToggleTheme}
        >
          <span className="theme-switch-thumb" aria-hidden="true" />
          <SunIcon />
          <MoonIcon />
        </button>
      </div>
    </header>
  );
}
