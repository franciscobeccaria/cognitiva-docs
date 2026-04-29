# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: renderer.spec.js >> Copy Markdown >> clicking copy markdown button shows "Copiado" feedback
- Location: tests/renderer.spec.js:583:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('#preview-frame').contentFrame().locator('#copy-md-btn')
Expected substring: "Copiado"
Received string:    "Copy markdown"
Timeout: 5000ms

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('#preview-frame').contentFrame().locator('#copy-md-btn')
    8 × locator resolved to <button id="copy-md-btn" class="copy-md-btn" onclick="copyMarkdown()">Copy markdown</button>
      - unexpected value "Copy markdown"

```

# Page snapshot

```yaml
- iframe [active] [ref=e3]:
  - generic [ref=f1e2]:
    - complementary [ref=f1e3]:
      - generic [ref=f1e4]:
        - generic [ref=f1e5]:
          - generic [ref=f1e6]: Cognitiva.
          - button [ref=f1e7] [cursor=pointer]:
            - img [ref=f1e8]
        - generic [ref=f1e11]: Guía de Docker
        - paragraph [ref=f1e13]: Docker es una plataforma de contenedores.
        - navigation [ref=f1e14]:
          - generic [ref=f1e15]:
            - generic [ref=f1e16] [cursor=pointer]: Instalación
            - generic [ref=f1e17] [cursor=pointer]: Conceptos Básicos
            - generic [ref=f1e18] [cursor=pointer]: Comandos Esenciales
            - generic [ref=f1e19] [cursor=pointer]: Docker Compose
        - generic [ref=f1e20]:
          - button "Download HTML" [ref=f1e21] [cursor=pointer]
          - button "Copy markdown" [active] [ref=f1e22] [cursor=pointer]
          - button "← Editor" [ref=f1e23] [cursor=pointer]
          - link "← Home" [ref=f1e24] [cursor=pointer]:
            - /url: index.html
    - main [ref=f1e25]:
      - generic [ref=f1e27]:
        - generic [ref=f1e28]:
          - generic [ref=f1e29]: Cognitiva. · Guía de Docker
          - heading "Instalación" [level=1] [ref=f1e30]
        - paragraph [ref=f1e33]: Instrucciones de instalación.
        - button "Next → Conceptos Básicos" [ref=f1e36] [cursor=pointer]:
          - generic [ref=f1e37]: Next →
          - generic [ref=f1e38]: Conceptos Básicos
    - complementary [ref=f1e40]:
      - generic [ref=f1e41]: On this page
      - navigation
```

# Test source

```ts
  487 | ## Capítulo Uno
  488 | Intro.
  489 | ### Sub A
  490 | Contenido.
  491 | ### Sub B
  492 | Más.
  493 | ## Capítulo Dos
  494 | Otro capítulo.`;
  495 |     const frame = await renderMarkdown(page, mdWithH3);
  496 |     await snap(page, testInfo, 'h2-split-first-page');
  497 |     const navItems = frame.locator('.nav-item');
  498 |     await navItems.first().click();
  499 |     await page.waitForTimeout(400);
  500 |     const otpLinks = frame.locator('#on-this-page .otp-link');
  501 |     const tocCount = await otpLinks.count();
  502 |     expect(tocCount).toBeGreaterThanOrEqual(0);
  503 |     await snap(page, testInfo, 'h3-toc-visible');
  504 |   });
  505 | 
  506 |   test('prev/next navigation buttons work', async ({ page }, testInfo) => {
  507 |     const frame = await renderMarkdown(page, MD_MANY_H1S);
  508 |     await snap(page, testInfo, 'prev-next-initial');
  509 |     const nextBtn = frame.locator('.page-nav-btn.next').first();
  510 |     await expect(nextBtn).toBeVisible();
  511 |     await nextBtn.click();
  512 |     const navItems = frame.locator('.nav-item');
  513 |     await expect(navItems.nth(1)).toHaveClass(/active/);
  514 |     await snap(page, testInfo, 'prev-next-after-next');
  515 |   });
  516 | });
  517 | 
  518 | /* ============================================================
  519 |    SIDEBARS + MERMAID
  520 |    ============================================================ */
  521 | test.describe('Sidebars and Mermaid', () => {
  522 |   test.beforeEach(async ({ page }) => {
  523 |     await page.goto('/renderer.html');
  524 |   });
  525 | 
  526 |   test('left and right sidebars allow wrapped labels (no ellipsis styles)', async ({ page }, testInfo) => {
  527 |     const frame = await renderMarkdown(page, MD_LONG_SIDEBAR_AND_MERMAID);
  528 |     const navStyles = await frame.locator('.nav-item').first().evaluate((el) => {
  529 |       const s = getComputedStyle(el);
  530 |       return {
  531 |         whiteSpace: s.whiteSpace,
  532 |         textOverflow: s.textOverflow,
  533 |       };
  534 |     });
  535 |     expect(navStyles.whiteSpace).toBe('normal');
  536 |     expect(navStyles.textOverflow).toBe('clip');
  537 | 
  538 |     const otpStyles = await frame.locator('.otp-link').first().evaluate((el) => {
  539 |       const s = getComputedStyle(el);
  540 |       return {
  541 |         whiteSpace: s.whiteSpace,
  542 |         textOverflow: s.textOverflow,
  543 |       };
  544 |     });
  545 |     expect(otpStyles.whiteSpace).toBe('normal');
  546 |     expect(otpStyles.textOverflow).toBe('clip');
  547 |     await snap(page, testInfo, 'sidebars-no-ellipsis');
  548 |   });
  549 | 
  550 |   test('mermaid fenced code blocks are converted to .mermaid containers', async ({ page }, testInfo) => {
  551 |     const frame = await renderMarkdown(page, MD_LONG_SIDEBAR_AND_MERMAID);
  552 |     const mermaid = frame.locator('.prose .mermaid');
  553 |     await expect(mermaid).toHaveCount(1);
  554 |     await expect(mermaid.locator('svg')).toHaveCount(1);
  555 |     await expect(frame.locator('.prose pre code.language-mermaid')).toHaveCount(0);
  556 |     await snap(page, testInfo, 'mermaid-container');
  557 |   });
  558 | });
  559 | 
  560 | /* ============================================================
  561 |    COPY MARKDOWN
  562 |    ============================================================ */
  563 | test.describe('Copy Markdown', () => {
  564 |   test.beforeEach(async ({ page }) => {
  565 |     await page.goto('/renderer.html');
  566 |   });
  567 | 
  568 |   test('copy markdown button exists in rendered doc sidebar', async ({ page }, testInfo) => {
  569 |     const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
  570 |     const btn = frame.locator('.copy-md-btn');
  571 |     await expect(btn).toBeVisible();
  572 |     await expect(btn).toContainText('Copy markdown');
  573 |     await snap(page, testInfo, 'copy-md-button-visible');
  574 |   });
  575 | 
  576 |   test('__rawMd embedded in generated HTML matches original markdown', async ({ page }) => {
  577 |     await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
  578 |     const srcDoc = await page.evaluate(() => document.getElementById('preview-frame').srcdoc);
  579 |     const expected = JSON.stringify(MD_SINGLE_H1_MANY_H2);
  580 |     expect(srcDoc).toContain('var __rawMd=' + expected + ';');
  581 |   });
  582 | 
  583 |   test('clicking copy markdown button shows "Copiado" feedback', async ({ page }, testInfo) => {
  584 |     const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
  585 |     const btn = frame.locator('#copy-md-btn');
  586 |     await btn.click();
> 587 |     await expect(btn).toContainText('Copiado');
      |                       ^ Error: expect(locator).toContainText(expected) failed
  588 |     await snap(page, testInfo, 'copy-md-feedback');
  589 |     // after 2s it reverts
  590 |     await page.waitForTimeout(2200);
  591 |     await expect(btn).toContainText('Copy markdown');
  592 |   });
  593 | });
  594 | 
```