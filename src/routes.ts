import type { PageSpec } from "@/Page";

export function allPages(): { path: string; spec: PageSpec }[] {
  return [
    "/",
    "/blog",
    "/blog/first-post",
    "/blog/second-post",
    "/cms/test-page",
  ].map((path) => {
    const spec = route(path);
    if (!spec) throw new Error(`No spec found for path: ${path}`);
    return { path, spec };
  });
}

export function route(path: string): PageSpec | undefined {
  if (path === "/") return { type: "cms", title: "Home Page", data: {} };
  if (path.startsWith("/blog"))
    return { type: "blog", title: `I am ${path}`, body: "This a post." };
  if (path.startsWith("/cms"))
    return { type: "cms", title: "CMS specified page", data: { path } };
}
