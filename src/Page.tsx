import { captureException } from "@sentry/react";
import { type ReactElement, useState } from "react";
import { z } from "zod/v4";

export { Page, PageSpec };

// Proof of concept
const PageSpec = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("blog"),
    title: z.string(),
    body: z.string(),
  }),
  z.object({
    type: z.literal("cms"),
    title: z.string(),
    data: z.json(),
  }),
]);
type PageSpec = z.infer<typeof PageSpec>;

function Page({ spec }: { spec: PageSpec }): ReactElement {
  if (spec.type === "blog") return <BlogPage spec={spec} />;
  if (spec.type === "cms") return <CmsPage spec={spec} />;
  const __exhaustive: never = spec;
  captureException(new Error(`Unknown page type: ${spec}`));
  return <div>Error: Unknown page type</div>;
}

type BlogSpec = Extract<PageSpec, { type: "blog" }>;

function BlogPage({ spec }: { spec: BlogSpec }): React.ReactElement {
  return (
    <div>
      <h1 className="text-3xl bg-blue-500">Blog page: {spec.title}</h1>
      <p>{spec.body}</p>
    </div>
  );
}

type CmsSpec = Extract<PageSpec, { type: "cms" }>;

function CmsPage({ spec }: { spec: CmsSpec }): ReactElement {
  const [count, setCount] = useState(0);
  const { title, data } = spec;

  return (
    <div>
      <h1 className="text-3xl bg-red-500">Test Page {title}</h1>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount((count) => count + 1)}>
        Increment me
      </button>
      <button
        type="button"
        onClick={() => {
          throw new Error("This is your first error!");
        }}
      >
        Break the world (Sentry test)
      </button>
      <pre className="bg-gray-100 p-4 rounded">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}
