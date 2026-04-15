# Playwright + GitHub Actions + GitHub Pages: Setup Guide

End-to-end testing pipeline for static HTML projects. Tests run on every PR, the HTML report gets deployed to GitHub Pages, and a comment with the direct link is posted automatically.

---

## Architecture

```
PR pushed
    │
    ▼
GitHub Actions (ubuntu-latest)
    ├── npm ci
    ├── playwright install chromium
    ├── npx playwright test          ← 20 E2E tests, screenshots + videos per test
    ├── peaceiris/actions-gh-pages   ← deploys report to gh-pages branch
    │       └── runs/{run_id}/       ← unique directory per run, nothing gets overwritten
    └── actions/github-script        ← posts comment on PR with direct link
            └── https://{owner}.github.io/{repo}/runs/{run_id}/
```

**Stack:**
- **Test runner:** `@playwright/test`
- **Local server:** `python3 -m http.server` (zero deps, works in CI)
- **Report format:** Playwright HTML reporter (screenshots + video per test)
- **Deploy:** `peaceiris/actions-gh-pages@v4` → `gh-pages` branch
- **Hosting:** GitHub Pages (free, public repos)

---

## How the workflow works

```yaml
# .github/workflows/playwright.yml

permissions:
  contents: write       # push to gh-pages branch
  pull-requests: write  # comment on PR
  issues: write         # same token covers PR comments via issues API

jobs:
  test:
    steps:
      - run: npx playwright test
        continue-on-error: true   # deploy report even if tests fail

      - uses: peaceiris/actions-gh-pages@v4
        with:
          publish_dir: ./playwright-report
          destination_dir: runs/${{ github.run_id }}   # unique per run

      - uses: actions/github-script@v7
        # posts PR comment with URL: https://{owner}.github.io/{repo}/runs/{run_id}/
```

Key design decisions:
- `continue-on-error: true` on the test step — if tests fail you still want to see the report.
- `destination_dir: runs/{run_id}` — each run gets its own folder, old reports are never overwritten. The trade-off is that the `gh-pages` branch accumulates folders over time (add a cleanup workflow if that becomes a problem).
- No artifact upload needed — GitHub Pages replaces it as the report host.

---

## Issues found and how they were fixed

### 1. `artifacts.find is not a function`

**What happened:** The first version of the PR comment script did:

```js
const { data: artifacts } = await github.rest.actions.listWorkflowRunArtifacts({...});
artifacts.find(...)  // TypeError
```

**Why:** The GitHub API returns `{ data: { total_count, artifacts: [...] } }`. The destructuring assigned the whole `data` object to `artifacts`, which is not an array.

**Fix:**

```js
const { data: { artifacts } } = await github.rest.actions.listWorkflowRunArtifacts({...});
```

---

### 2. 403 `Resource not accessible by integration` when posting PR comment

**What happened:** The comment step failed with HTTP 403. GitHub defaults to a read-only `GITHUB_TOKEN` for Actions workflows since 2023.

**Fix:** Add an explicit `permissions` block to the workflow:

```yaml
permissions:
  contents: write
  pull-requests: write
  issues: write
```

Without this, the token has no write access to PRs regardless of repo visibility.

---

### 3. PR comment linked to the Actions run page, not the HTML report

**What happened:** The comment said "Ver reporte visual" and linked to `github.com/{owner}/{repo}/actions/runs/{run_id}`. That's the run summary page, not the actual report.

**Why:** Artifacts downloaded from GitHub are ZIP files — there's no way to browse them in the browser directly from the artifact URL.

**Fix:** Switch to GitHub Pages as the report host instead of artifacts. The report URL becomes a real `https://` link that opens directly in the browser.

---

### 4. `gh-pages` branch didn't exist when trying to configure Pages

**What happened:** The GitHub API returned 422 when trying to set the Pages source to `gh-pages` — the branch didn't exist yet, so GitHub rejected it as an invalid value.

**Fix:** Let the `peaceiris/actions-gh-pages` action create the branch on the first run, then configure Pages source via the API afterward. The branch creation is automatic when the action runs.

The API call that worked (note: `--input -` with raw JSON, not `--field`):

```bash
echo '{"source":{"branch":"gh-pages","path":"/"}}' | \
  gh api repos/{owner}/{repo}/pages --method PUT --input -
```

---

### 5. Pages returned 404 after changing source branch

**What happened:** After switching Pages from `main` to `gh-pages`, all URLs returned 404. The branch had the content, but Pages hadn't re-deployed from the new source yet.

**Why:** GitHub Pages doesn't automatically rebuild when you change the source branch via the API. It waits for a new push to the branch, or you can trigger it manually.

**Fix:** Trigger a build manually:

```bash
gh api repos/{owner}/{repo}/pages/builds --method POST
```

After ~30 seconds, the build completed and all URLs resolved correctly.

---

## Can this be applied to any other project?

Yes. The only requirements are:

1. **Your tests produce a Playwright HTML report** — set `reporter: [['html', { outputFolder: 'playwright-report' }]]` in `playwright.config.js`.
2. **You have a way to serve the app in CI** — this project uses `python3 -m http.server`. Node projects can use their own dev server. Set it in `playwright.config.js` under `webServer`.
3. **GitHub repo is public** (see below).

To adapt the workflow to another project, change:
- `publish_dir` if your report folder has a different name
- The `webServer` command in `playwright.config.js` to match your project's dev server
- The `baseURL` to match the port your server uses

Everything else (Pages deploy, PR comment, permissions) is project-agnostic.

---

## Does the repo need to be public?

**Yes, if you're on GitHub Free.** GitHub Pages for private repos requires GitHub Pro, Team, or Enterprise.

| Plan | Public repo | Private repo |
|---|---|---|
| GitHub Free | Pages available | Not available |
| GitHub Pro / Team | Pages available | Pages available |
| GitHub Enterprise | Pages available | Pages available |

If your repo is private and you can't upgrade, alternatives are:
- **Surge.sh** — ephemeral per-PR deployments, auto-deletes on PR close, needs a `SURGE_TOKEN` secret
- **Netlify / Vercel** — both have free tiers with PR preview deployments, need an account and stored secrets
- Keep using **artifacts** (ZIP download) — not as convenient but fully private

---

## One-time setup checklist

For a new repo, do this once:

- [ ] Run `npm install` locally to generate `package-lock.json`
- [ ] Run `npx playwright install chromium` locally to verify tests pass
- [ ] Push the workflow file to the repo
- [ ] Let the first CI run complete — it will create the `gh-pages` branch
- [ ] Go to **Settings → Pages → Source** and set branch to `gh-pages`, path `/` (or do it via API: `echo '{"source":{"branch":"gh-pages","path":"/"}}' | gh api repos/{owner}/{repo}/pages --method PUT --input -`)
- [ ] Trigger a Pages build: `gh api repos/{owner}/{repo}/pages/builds --method POST`
- [ ] Open a PR and verify the comment appears with the correct link

After that, everything is automatic on every PR.
