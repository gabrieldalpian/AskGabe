import { lazy } from "react";

// The Markdown renderer (with syntax highlighting) is ~100 KB gzipped, so it loads
// separately instead of delaying the first page load.
const load = () => import("./Markdown");

export const LazyMarkdown = lazy(() => load().then((m) => ({ default: m.Markdown })));

// Start fetching it early (e.g. when the first question is sent).
export const preloadMarkdown = () => void load();
