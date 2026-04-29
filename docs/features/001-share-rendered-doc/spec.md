# Feature: Share Rendered Doc

**Feature**: Share Rendered Doc
**Project**: cognitiva-docs
**Artifact type**: User story spec
**Tier**: T3 — AI-Ready
**Version**: 1.0
**Date**: 2026-04-26
**Author**: Francisco Beccaria

---

## Goal

Give cognitiva-docs users a way to share a rendered markdown doc through a single persistent URL that anyone can open in any browser, without an account, without installing or running cognitiva-docs.

---

## Audience

People using cognitiva-docs to render markdown into a navigable doc. Today, sharing a rendered doc means sending the source markdown and asking the recipient to render it themselves, or sending a screenshot. This feature lets the sharer copy one URL and the recipient sees exactly the rendered doc the sharer saw.

---

## Acceptance Criteria

### Share creation (sharer side)

- AC-01: A "Share" button appears in the generated doc sidebar, alongside the existing "Copy Markdown" button, in the same visual style.
- AC-02: Clicking "Share" opens a modal and immediately starts creating the share.
- AC-03: While the share is being created, the modal shows a loading indicator and the explanatory text "Creating your share link…".
- AC-04: After the share is created, the modal shows the share URL prominently with a one-click "Copy" button that copies the URL to the clipboard and confirms the copy with a transient indicator.
- AC-05: The modal shows the share's created date and a note that reads "Expires after 6 months without views".
- AC-06: The modal shows a list of past shares created in this browser, sorted most-recent first, each row showing slug, created date, and a per-row "Copy" button.
- AC-07: The modal always displays this note: "These URLs are saved only in this browser. Save them elsewhere too — clearing browser data will lose them."
- AC-08: A user can share the same doc multiple times. Each share creates a new URL with a new slug; no deduplication.
- AC-09: If the source markdown exceeds 1 MB, the Share button is disabled and shows the message "Doc too large to share — must be under 1 MB."
- AC-10: If share creation fails (network error, rate limit hit, server error), the modal shows the failure reason and a "Retry" button. No entry is saved to localStorage on failure.

### Share viewing (recipient side)

- AC-11: When anyone opens a valid share URL, they see the rendered doc identical to what the sharer saw, with all CSS applied.
- AC-12: The shared page renders correctly even if the cognitiva-docs main app is unavailable. Only the view-tracking beacon depends on the Worker being live.
- AC-13: Opening a share URL in a browser that executes JavaScript counts as one view, which resets the 6-month expiry timer for that share.
- AC-14: Opening a share URL whose backing data has been removed by the cleanup job shows a "This share has expired or no longer exists" message instead of the doc.

### URL structure

- AC-15: Share URLs have the form `https://pub-<bucket-id>.r2.dev/<slug>.html` where `<slug>` is a 12-character random ID drawn from a case-sensitive alphanumeric alphabet.

### Security

- AC-16: The HTML produced from the markdown is sanitized by DOMPurify with default config before being uploaded. Sanitization blocks `<script>` tags, inline event handlers, `javascript:` URLs, and other XSS vectors.
- AC-17: Shared HTML is served from `pub-<bucket-id>.r2.dev`, a different origin from the cognitiva-docs main app at `franciscobeccaria.github.io`. A malicious doc cannot reach the main app's storage or cookies under the browser's same-origin policy.
- AC-18: The Worker rejects share-creation requests whose `Origin` header does not match the cognitiva-docs main app origin.
- AC-19: The Worker enforces a per-IP rate limit of at most 10 share creations per hour. Over-limit requests return HTTP 429 with a clear error message and a `Retry-After` header.
- AC-20: The Worker requires a valid Cloudflare Turnstile token on each share-creation request. Missing or invalid tokens are rejected with HTTP 403.

### Lifespan

- AC-21: A share is deleted after 6 consecutive months without views. For shares with zero views, the 6-month timer starts at creation.
- AC-22: View tracking happens via a single fetch from the share-viewer page to a Worker `/touch` endpoint on page load. Failure of the touch fetch does not prevent the page from rendering.
- AC-23: The cleanup process runs at least once per day on a Cloudflare Cron Trigger and removes both the R2 file and the corresponding metadata for any expired share.

---

## Edge Cases

- **Source markdown is empty:** Share button is disabled until non-empty content exists.
- **Source markdown is exactly 1 MB:** Allowed (boundary inclusive).
- **Source markdown is 1 MB + 1 byte:** Rejected (boundary exclusive).
- **localStorage is full or unavailable:** Share creation succeeds; the new share is not appended to the past-shares list. A toast informs the user that the share was created but could not be saved locally.
- **localStorage is cleared between sessions:** Past shares list appears empty. The always-visible note explains why.
- **Slug collision:** Worker detects collision on R2 write, generates a new slug, retries up to 3 times. If all retries collide (vanishingly unlikely), returns 500 with "Could not generate unique slug, please retry".
- **Concurrent views from many recipients:** All views update `last_viewed_at` for the same slug; last-write-wins is acceptable since expiry granularity is in months.
- **Share viewed once and never again:** Deleted 6 months after that view.
- **Share never viewed:** Deleted 6 months after creation.
- **Markdown contains XSS attempts:** Sanitized by DOMPurify before upload — never served to the recipient as executable code.
- **User opens a share URL with a slug that does not exist:** The same "This share has expired or no longer exists" message is shown — no information is leaked about whether the slug was ever valid.
- **Worker is down at view time:** Page still renders (HTML is fully self-contained); only the touch beacon fails, and the expiry timer does not reset for that view.
- **R2 is down at view time:** The HTML file fails to load; the recipient sees the browser's standard "page not available" error.
- **Markdown contains image references with external URLs:** Images load only if their external hosts remain available. The shared HTML preserves whatever URLs the markdown referenced; this is documented in the sharer's modal but not engineered around.
- **Bot or link-unfurler hits the share URL without executing JavaScript:** The touch beacon does not fire and the view is not counted. This is acceptable — only human-triggered loads with JS execution count.
- **Recipient saves the HTML page locally and opens it offline:** The doc renders correctly. The touch fetch fails silently. Acceptable.

---

## Out of Scope

- **Editing shares after creation.** Each share is immutable; deferred.
- **Manual share deletion or revocation.** Only auto-expiry deletes shares; deferred.
- **Accounts or authentication.** All shares are anonymous; deferred.
- **Password-protected shares.** Out of scope.
- **Image uploads in markdown.** Current cognitiva-docs flow renders pasted markdown only; image references work only if their external URLs remain available. No image upload pipeline is engineered.
- **View-count display to the sharer.** View timestamps are internal-only for expiry calculation; not surfaced.
- **SEO, link previews, OpenGraph or Twitter Card customization.** Each share's HTML uses a static page title; no per-share metadata.
- **Custom domain for share URLs.** v1 uses the free `pub-<bucket-id>.r2.dev` URL. Custom domain deferred.
- **Cross-device share history.** Past-shares list is per-browser only; deferred pending accounts.
- **End-to-end encryption of share content.** Privacy model is "public-by-link" — anyone with the URL can read. The encrypted variant (key in URL hash, ciphertext on R2) was considered and explicitly rejected for v1 in favor of a simpler architecture.

---

## Definition of Done

- [ ] All ACs have at least one passing test
- [ ] Edge cases are covered by tests
- [ ] Validation plan reviewed and complete
- [ ] PR reviewed and approved
- [ ] Cloudflare account created, R2 bucket provisioned, Worker deployed
- [ ] Turnstile site keys configured for the cognitiva-docs origin
- [ ] First end-to-end share verified manually (sharer creates, recipient opens, view registers, expiry timer touches)
- [ ] Cleanup cron tested at least once against a seeded expired entry

---

## User Flow

### Sharer

1. The user pastes markdown into cognitiva-docs and the doc is rendered.
2. The user opens the rendered doc's sidebar.
3. The user clicks the "Share" button alongside the existing "Copy Markdown" button.
4. A modal opens with a loading indicator.
5. The browser renders the markdown to a self-contained HTML string (CSS inlined, identical to the existing renderer's output), sanitizes it through DOMPurify, and requests a Turnstile token in the background.
6. The browser sends the sanitized HTML and the Turnstile token to the Worker.
7. The Worker validates the origin, validates the Turnstile token, applies the rate limit, generates a unique slug, writes the HTML to R2 at `<slug>.html`, records metadata, and returns the slug.
8. The modal updates from the loading state to the share-ready state, showing the URL, copy button, dates, the past-shares list, and the localStorage note.
9. The new share is appended to localStorage.
10. The user copies the URL and shares it through any channel they choose.

### Recipient

1. The recipient opens the share URL in any browser.
2. The browser fetches the HTML file from R2 directly via Cloudflare's CDN.
3. The page renders immediately with all CSS inlined.
4. A single small fetch is sent to the Worker `/touch?slug=<slug>` to register the view. Page rendering does not depend on this fetch.
5. The recipient reads the doc.

---

## Design Reference

Visual style follows the existing cognitiva-docs app — no separate component library is in use. The Share button matches the style of the Copy Markdown button introduced in commit `bc0abbc`.

### Modal — share-ready state

```
+--------------------------------------------------+
|  Share this doc                              [x] |
+--------------------------------------------------+
|                                                  |
|  Your share URL:                                 |
|                                                  |
|  +------------------------------------+ +------+ |
|  | https://pub-xxxx.r2.dev/k4n9p7za...| | Copy | |
|  +------------------------------------+ +------+ |
|                                                  |
|  Created: 2026-04-26                             |
|  Expires: after 6 months without views           |
|                                                  |
|  +-- Note ------------------------------------+  |
|  | These URLs are saved only in this browser. |  |
|  | Save them elsewhere too — clearing browser |  |
|  | data will lose them.                       |  |
|  +--------------------------------------------+  |
|                                                  |
|  Your past shares (this browser):                |
|                                                  |
|  k4n9p7za3pst · 2026-04-26          [ Copy ]     |
|  m2x7q9bd1lkp · 2026-04-25          [ Copy ]     |
|  z8b1v4ne7tya · 2026-04-22          [ Copy ]     |
|                                                  |
+--------------------------------------------------+
```

### Modal — loading state

```
+--------------------------------------------------+
|  Share this doc                              [x] |
+--------------------------------------------------+
|                                                  |
|         (loading spinner)                        |
|         Creating your share link...              |
|                                                  |
+--------------------------------------------------+
```

### Modal — error state

```
+--------------------------------------------------+
|  Share this doc                              [x] |
+--------------------------------------------------+
|                                                  |
|  Could not create share link.                    |
|  Reason: <reason>                                |
|                                                  |
|                              [ Cancel ] [ Retry ]|
+--------------------------------------------------+
```

### Recipient view — expired/missing share

```
+--------------------------------------------------+
|                                                  |
|  This share has expired or no longer exists.     |
|                                                  |
+--------------------------------------------------+
```

---

## Technical Contracts

### Share creation

- **Method:** POST
- **URL:** `https://<worker-name>.<account>.workers.dev/share`
- **Required headers:** `Origin: https://franciscobeccaria.github.io`, `Content-Type: application/json`
- **Body fields:**
  - `html`: full sanitized HTML string (≤ 1 MB UTF-8 bytes).
  - `turnstileToken`: string from the Turnstile widget.
- **Success response:** `200 OK`, body `{ "slug": "<12-char-id>", "createdAt": "<ISO-8601>" }`.
- **Failure responses:**
  - `400`: malformed request body.
  - `403`: Turnstile token invalid, or `Origin` header does not match the configured allowlist.
  - `413`: HTML payload exceeds 1 MB.
  - `429`: per-IP rate limit exceeded; response includes `Retry-After` header.
  - `500`: server error, including slug-collision exhaustion (3 retries failed).

### View touch

- **Method:** GET
- **URL:** `https://<worker-name>.<account>.workers.dev/touch?slug=<slug>`
- **No auth.**
- **Side effect:** updates `last_viewed_at` for the slug.
- **Response:** always `204 No Content`, including for unknown slugs (no information leak).

### Storage

- **R2 bucket:** stores one HTML file per share at `<slug>.html`. Public read enabled. Each file is the fully rendered, CSS-inlined, DOMPurify-sanitized HTML, plus a small trusted touch-beacon script appended at upload time. The user's content is sanitized; the touch script is the project's own trusted code and is not subject to DOMPurify (it lives in a wrapper template, not inside the user-derived content block).
- **KV namespace:** stores per-slug metadata as `{ "createdAt": "<ISO>", "lastViewedAt": "<ISO>" }`.

### Slug format

- 12 characters from the alphabet `[A-Za-z0-9]` (case-sensitive base62).
- Total combinations: $$62^{12} \approx 3.2 \times 10^{21}$$.

### Cleanup cron

- **Schedule:** at least once per day.
- **Action:** for each KV entry, if $$\text{now} - \text{lastViewedAt} > 6 \text{ months}$$, delete both the R2 file and the KV entry.

---

## Dependencies

- Cloudflare account (free tier sufficient).
- Cloudflare R2 bucket with public read access.
- Cloudflare Workers + Workers KV namespace.
- Cloudflare Turnstile site (free).
- DOMPurify library (~22 KB minified, included in cognitiva-docs frontend).

---

## Open Questions

| Question | Blocked if unresolved? | Who answers |
|----------|----------------------|-------------|
| Custom domain for share URLs (e.g., `share.cognitiva-docs.com`) — using `pub-xxxxx.r2.dev` for v1; can be added later by binding a domain to the bucket. | No — deferred | Francisco |
| Should the Worker keep any access logs (slug, timestamp, IP) for abuse investigation, or run zero-logging? Default: zero-logging for MVP. | No — accept default | Francisco |
