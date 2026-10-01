import { useEffect, useRef, useState, type ReactNode } from "react";
import { CheckIcon, CopyIcon } from "./Icons";

type Props = {
  language?: string;
  children: ReactNode;
};

export function CodeBlock({ language, children }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    const code = preRef.current?.textContent?.replace(/\n$/, "") ?? "";
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked by the browser; leave the button as it is.
    }
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span>{language ?? "code"}</span>
        <button type="button" onClick={copy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre ref={preRef}>{children}</pre>
    </div>
  );
}
