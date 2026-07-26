---
name: cognitiva
description: "Produce a Claude Artifact with the Cognitiva reader shell: a self-contained HTML doc with a 3-column layout (left sidebar of pages, center prose, right on-this-page TOC), warm paper palette, light/dark, scroll-spy navigation, and a built-in reader settings panel (typeface + accent color). Takes ANY input: a topic or prompt with data ('make an artifact about X'), markdown you already have, or existing content/an earlier artifact to re-present. Default output is the Cognitiva Artifact; return raw markdown instead only if the user explicitly asks for markdown. Fire when the user says 'make this a Cognitiva doc', 'cognitiva format', 'cognitiva artifact', 'wrap this in Cognitiva', 'turn this into a readable doc/artifact', or wants a navigable documentation artifact instead of a plain one."
metadata:
  short-description: "Turn any input into a Cognitiva-format Artifact"
---

# cognitiva

Turn content into a **Cognitiva Artifact**: one self-contained HTML file that renders as a clean, navigable documentation reader with a built-in settings panel (the reader can switch typeface and accent color live).

The look is fixed and shared: the reader shell in [assets/cognitiva-shell.html](assets/cognitiva-shell.html). You do **not** redesign it. You fill it with content.

## Any input, one output

Whatever the user hands you, the job is the same: produce the Cognitiva Artifact. Accept any of these:

- **A topic or prompt with data** ("make a Cognitiva artifact about X", "turn these notes into a doc"). Generate the content, then render it into the shell.
- **Markdown you already have.** Map its `#`/`##` structure onto the page model and render.
- **Existing content or an earlier artifact.** Read it from the conversation and re-present it in the shell.

You don't need to ask which case it is; treat them the same. Structure the content into pages, then fill the shell.

**Output:** the Cognitiva Artifact by default. Return raw markdown *instead of* an artifact only when the user explicitly asks for markdown (e.g. "just give me the markdown"). In that case, emit clean `#`/`##` markdown following the content model below, and skip the shell.

## The one hard rule: it must be a valid Artifact

The output is a Claude Artifact. Artifacts run in a sandboxed iframe with a strict CSP. If you break these, the artifact renders broken:

- **Self-contained, single HTML file.** All CSS and JS inline. No build step, no imports.
- **No external resources except the allowlist.** The Artifact CSP blocks outside network requests. Only `cdnjs.cloudflare.com` and `cdn.jsdelivr.net` are reachable for `<script>`. Everything else (Google Fonts, arbitrary images, `fetch`) is blocked.
- **Fonts:** the settings panel uses only **native font stacks** (system serif/sans/mono), so every typeface option works inside the Artifact with zero network. Do not add Google Fonts `<link>`s or `@font-face` webfont URLs; they are blocked and would silently fall back.
- **Code highlighting:** the shell already loads Prism from `cdn.jsdelivr.net`. Keep it, it's on the allowlist.
- **No `localStorage`/`sessionStorage`:** blocked in the sandbox. The settings panel keeps its state in memory only (resets on reload); don't add storage.
- Keep the file under ~16 MB (Artifact limit). Embedded fonts/images eat into this fast.

If the user wants a downloadable/hostable file instead of an in-chat Artifact, the same file works - the constraints above only make it *more* portable.

## The shell contract

Read [assets/cognitiva-shell.html](assets/cognitiva-shell.html) before rendering. It is the source of truth for markup, tokens, and behavior. Do not reinvent it. The structure you fill:

- `.sidebar-left` → one `.nav-item[data-page="ID"]` per page. First item is `active`.
- `.main` → one `.page[id="page-ID"]` per page, each containing `.prose` blocks.
- `.sidebar-right #on-this-page` → left empty; the shell's JS builds the TOC from `h2[id]` via scroll-spy.
- The page-switching and scroll-spy JS at the bottom is already wired to `data-page` / `h2[id]`. Keep that contract:
  - every page needs a matching `nav-item[data-page]` ⇄ `.page[id="page-…"]`,
  - every `## H2` you emit needs a stable `id` so it appears in the right TOC.

Preserve: the `Cognitiva.` branding, the sidebar + TOC layout, the typography/color tokens, the light/dark blocks, and the favicon (inline data-URI already in the shell `<head>`).

## Content model

- `# H1` → a **page** (a sidebar entry). Use 3–6 per doc.
- `## H2` → a **section** inside a page → appears in the right TOC. Give each a stable `id`.
- `### H3` → subsection, only when there are 2+ distinct sub-topics.
- `.prose` holds standard markup only: `h2 h3 p ul ol li table blockquote pre code strong em hr`. No custom widgets - Cognitiva is a *reader*, prose-first. If the source has diagrams as Mermaid, you may keep them only if you load Mermaid from the jsdelivr allowlist; otherwise describe them in prose.

Structure every doc as: first page = title + intro/summary; middle pages = one per theme; last page = a short synthesis/conclusion. The doc must read well even if every non-prose element is stripped.

## Workflow

1. **Read the shell** ([assets/cognitiva-shell.html](assets/cognitiva-shell.html)) so you match its markup exactly.
2. **Segment** the content into 3–6 pages, each a coherent theme.
3. **Write** each page's prose; assign `id`s to every `## H2`.
4. **Fill the shell**: replace the placeholder nav items and `.page` blocks with real ones; wire `data-page` ⇄ `id`. Leave `#on-this-page` empty.
5. **Set** `<title>` and the first sidebar brand/heading to the doc's title.
6. **Output as an Artifact** (single self-contained HTML).
7. **Validate** against the checklist below before finishing.

## Validation checklist

- [ ] Single self-contained HTML file - no external CSS/JS except `cdn.jsdelivr.net` / `cdnjs.cloudflare.com`.
- [ ] Every `.nav-item[data-page="X"]` has a matching `.page[id="page-X"]` and vice-versa.
- [ ] Every `## H2` has a unique `id`; right TOC populates on load.
- [ ] Page switching works (clicking a sidebar item shows its page).
- [ ] Light and dark both look right (tokens intact).
- [ ] Typeface + accent settings panel opens and changes apply live, in both light and dark.
- [ ] All fonts are native stacks (no Google Fonts / webfont links anywhere).
- [ ] The doc makes sense as prose with no widgets.
- [ ] `<title>` and branding reflect the real doc title.

## What this skill is NOT

- Not a heavy editorial/“visual explainer” generator - that's the older `docs-generator` family. Cognitiva is a *reader shell*: prose-first, minimal components.
- Not a designer of new layouts - the shell is fixed; you fill it, you don't restyle it.
