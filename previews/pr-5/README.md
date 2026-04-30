# Cognitiva. markdown docs reader

Cognitiva turns existing markdown into a clean, navigable documentation reader.

The product is intentionally simple: paste markdown, render a readable 3-column doc, and optionally download it as standalone HTML. The built-in prompt is only a helper for preparing markdown in an external chat app.

## Tools

### [Renderer](https://franciscobeccaria.github.io/cognitiva-docs/renderer.html)

Paste markdown → get a paginated 3-column docs site.

- `# H1` → sidebar page
- `## H2` → right TOC section
- Download as standalone HTML
- Optional prompt for rewriting rough source material into renderer-friendly markdown

### [Template](https://franciscobeccaria.github.io/cognitiva-docs/template.html)

Reference HTML template for markdown-only documentation pages. Same 3-column layout, no custom components.

## How it works

1. Paste existing markdown into the Renderer
2. Render it as a navigable reader
3. Use the optional prompt only when source material needs cleanup
4. Download the result as standalone HTML

## Live site

[franciscobeccaria.github.io/cognitiva-docs](https://franciscobeccaria.github.io/cognitiva-docs/)

## PR previews

Pull requests deploy the static HTML app to GitHub Pages under:

`/previews/pr-<number>/`

The preview workflow comments the exact URLs for the app, renderer, and template back into the PR.
