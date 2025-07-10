# SSG with Vite and React -- a proof of concept

```
npm run dev
# OR
npm run build && npx serve dist
```

To generate static pages from pages that use React, here's the mental model I've
found helpful:

- The static `.html` file that gets loaded needs to have:
  - The initial HTML structure.
  - The required CSS.
  - Everything required to give the page interactivity; the bundled client
    scripts and any data they need.
- Imagine we had a static `.html` page that didn't have the initial HTML
  structure. This would be a client-rendered static page where the client
  JavaScript renders and hydrates the HTML.
- To achieve that, we need to generate a script bundle that renders a React
  component upon load and put that in a generic index.html file with a `<div
  id="root"></div>` element.
- This is what Vite does based on an entry point (e.g. `index.html` or a `.tsx`
  file).
- For SSG we don't need to have any dynamic routing logic, but we do need the
  client bundle to know which page content to render. We could imagine that it
  inspects the `window.location.pathname` to do that. But we want to build that
  statically into the `.html` so it doesn't rely on how and where it is served.
  So when we create the `.html` file we include a `<scrip>` tag with serialized
  JSON that tells the client bundle which page to render (a "spec").
- So now we have a static `.html` file that loads a client bundle, which loads a
  JSON object that tells it everything it needs to know what page to render.
  This is now a fully static page, but it renders the HTML content client-side
  only. So the final step is to pre-render the HTML in the `.html` file.
- To do that, we render to a string the page React component with the page spec
  and include that in the `.html` file. We do this at the same time as we
  include the `<script>` with the JSON spec.
- All we have to do then is to ensure the client bundle *hydrates* the React
  component rather than creating it from scratch.

In short: SSG is about generating a client bundle that knows how to render a
React page (which includes interactivity) based on a specification statically
included in the `.html` file and then also include the pre-rendered HTML string
in the `.html` file so the client bundle can hydrate it rather than create it
from scratch.

This repo is a proof of concept of this using Vite and React.
