import "@/index.css";
import { Page, type PageSpec } from "@/Page";
import { captureException, init } from "@sentry/react";
import { createRoot, hydrateRoot } from "react-dom/client";

const hostname = window.location.hostname;

const environment = hostname.includes("example.com")
  ? "production"
  : hostname.includes("dev.example.com")
  ? "staging"
  : hostname.includes("localhost") || hostname === "127.0.0.1"
  ? "development"
  : "unknown";

if (import.meta.env.VITE_SENTRY_DSN) {
  init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment,
    tracesSampleRate: 1.0,
    sendDefaultPii: true,
  });
}

// biome-ignore lint/style/noNonNullAssertion: allow non-null assertion for root element
const container = document.getElementById("root")!;

let spec: PageSpec | undefined;

if (import.meta.env.PROD) {
  // In production, the client expects:

  // 1) the page data to be embedded in a script tag
  const pageData = document.getElementById("__PAGE_SPEC__")?.textContent;
  if (pageData) spec = JSON.parse(pageData);

  // 2) To be able to hydrate existing static HTML.
  if (spec) {
    hydrateRoot(container, <Page spec={spec} />);
  } else {
    captureException(new Error("No page data found in HTML"));
    createRoot(container).render(<div>Error: no spec found</div>);
  }
} else if (import.meta.env.DEV) {
  // In development, we fetch the page data by the current path from a Vite
  // server API. This gets statically eliminated in production builds.
  const path = window.location.pathname;
  const response = await fetch(`/api/spec?path=${encodeURIComponent(path)}`);
  spec = await response.json();
  if (!spec) {
    captureException(new Error(`No spec found for path: ${path}`));
    createRoot(container).render(<div>Error: no spec found for</div>);
  } else {
    createRoot(container).render(<Page spec={spec} />);
  }
}
