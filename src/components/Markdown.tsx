import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

const components: Components = {
  pre({ node, children }) {
    const code = node?.children[0];
    const classes = code?.type === "element" ? code.properties.className : undefined;
    const language = Array.isArray(classes)
      ? classes
          .map(String)
          .find((c) => c.startsWith("language-"))
          ?.slice("language-".length)
      : undefined;
    return <CodeBlock language={language}>{children}</CodeBlock>;
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  table({ children }) {
    return (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    );
  },
};

// react-markdown ignores raw HTML in the reply and strips unsafe link URLs,
// so text from the model can't inject markup into the page.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
