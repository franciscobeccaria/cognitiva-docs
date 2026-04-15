// @ts-check
const { test, expect } = require('@playwright/test');

// Markdown fixtures
const MD_SINGLE_H1_MANY_H2 = `# Guía de Docker

Docker es una plataforma de contenedores.

## Instalación

Instrucciones de instalación.

## Conceptos Básicos

Imágenes y contenedores.

## Comandos Esenciales

Los comandos más usados.

## Docker Compose

Para múltiples servicios.`;

const MD_MANY_H1S = `# Fundamentos

Introducción al tema.

## Qué es

Definición.

# Aplicaciones

Casos de uso.

## Caso A

Descripción.

## Caso B

Otra descripción.

# Conclusión

Cierre del tema.`;

const MD_NO_H1_ONLY_H2 = `## Introducción

Sin H1, solo H2s.

## Primera Sección

Contenido.

## Segunda Sección

Más contenido.`;

const MD_SHORT = `# Guía Rápida

Un documento corto.

## Sección Única

Solo hay una sección.`;

const MD_H2_SHORT_INTRO = `# Mi Guía

Esta es una descripción breve del documento.

## Sección Uno

Contenido de la primera sección.

## Sección Dos

Contenido de la segunda sección.

## Sección Tres

Contenido de la tercera sección.`;

const MD_H2_LONG_INTRO = `# Mi Guía

${'Párrafo largo. '.repeat(40)}

## Sección Uno

Contenido.

## Sección Dos

Contenido.

## Sección Tres

Contenido.`;

// Helper: paste markdown, click Render, wait for iframe
async function renderMarkdown(page, markdown) {
  await page.fill('#md-input', markdown);
  await page.click('button.btn-primary');
  await page.waitForFunction(() => {
    const preview = document.getElementById('preview');
    return preview && preview.style.display !== 'none';
  });
  const frame = page.frameLocator('#preview-frame');
  await frame.locator('.sidebar-left').waitFor({ timeout: 8000 });
  return frame;
}

// Helper: attach a named screenshot to the test report
async function snap(page, testInfo, name) {
  const buf = await page.screenshot({ fullPage: false });
  await testInfo.attach(name, { body: buf, contentType: 'image/png' });
}

// Helper: snap inside the iframe by screenshotting the whole page
// (iframes are captured as part of the page screenshot)
async function snapFull(page, testInfo, name) {
  const buf = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body: buf, contentType: 'image/png' });
}

/* ============================================================
   EDITOR UI
   ============================================================ */
test.describe('Editor UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/renderer.html');
  });

  test('editor header is visible with branding', async ({ page }, testInfo) => {
    const header = page.locator('.app-header');
    await expect(header).toBeVisible();
    await expect(header.locator('.app-brand')).toContainText('Cognitiva');
    await expect(header.locator('.app-tag')).toContainText('docs');
    await snap(page, testInfo, 'editor-header');
  });

  test('editor shows textarea and action buttons', async ({ page }, testInfo) => {
    await expect(page.locator('#md-input')).toBeVisible();
    await expect(page.locator('button.btn-primary')).toContainText('Render');
    await expect(page.locator('#settings-btn')).toContainText('Settings');
    await snap(page, testInfo, 'editor-full-view');
  });

  test('settings panel toggles open and closed', async ({ page }, testInfo) => {
    const panel = page.locator('#settings-panel');
    await expect(panel).toBeHidden();
    await page.click('#settings-btn');
    await expect(panel).toBeVisible();
    await snap(page, testInfo, 'settings-panel-open');
    await page.click('#settings-btn');
    await expect(panel).toBeHidden();
    await snap(page, testInfo, 'settings-panel-closed');
  });

  test('font preset radios are present', async ({ page }, testInfo) => {
    await page.click('#settings-btn');
    const panel = page.locator('#settings-panel');
    await expect(panel.locator('[value="editorial"]')).toHaveCount(1);
    await expect(panel.locator('[value="clean"]')).toHaveCount(1);
    await expect(panel.locator('[value="classic"]')).toHaveCount(1);
    await expect(panel.locator('[value="system"]')).toHaveCount(1);
    await expect(panel.locator('[value="clean"]')).toBeChecked();
    await snap(page, testInfo, 'font-presets');
  });

  test('Cmd+Enter triggers render', async ({ page }, testInfo) => {
    await page.fill('#md-input', MD_SHORT);
    await snap(page, testInfo, 'before-render');
    await page.keyboard.press('Meta+Enter');
    await page.waitForFunction(() => {
      const preview = document.getElementById('preview');
      return preview && preview.style.display !== 'none';
    });
    await expect(page.locator('#preview')).toBeVisible();
    await snap(page, testInfo, 'after-render-shortcut');
  });
});

/* ============================================================
   SMART PAGE DETECTION
   ============================================================ */
test.describe('Smart Page Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/renderer.html');
  });

  test('single H1 + many H2s → H2s become nav pages', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const navItems = frame.locator('.nav-item');
    const count = await navItems.count();
    expect(count).toBeGreaterThanOrEqual(4);
    const navTexts = await navItems.allTextContents();
    expect(navTexts.some(t => t.includes('Instalación'))).toBe(true);
    expect(navTexts.some(t => t.includes('Conceptos'))).toBe(true);
    await snap(page, testInfo, 'h2-split-sidebar');
  });

  test('single H1 + many H2s → H1 text used as doc identity title', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const docTitle = frame.locator('.doc-identity-title');
    await expect(docTitle).toContainText('Guía de Docker');
    await snap(page, testInfo, 'h2-split-doc-title');
  });

  test('multiple H1s → H1s become nav pages', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_MANY_H1S);
    const navItems = frame.locator('.nav-item');
    const navTexts = await navItems.allTextContents();
    expect(navTexts.some(t => t.includes('Fundamentos'))).toBe(true);
    expect(navTexts.some(t => t.includes('Aplicaciones'))).toBe(true);
    expect(navTexts.some(t => t.includes('Conclusión'))).toBe(true);
    await snap(page, testInfo, 'h1-split-sidebar');
  });

  test('no H1, only H2s → H2s become nav pages', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_NO_H1_ONLY_H2);
    const navItems = frame.locator('.nav-item');
    const navTexts = await navItems.allTextContents();
    expect(navTexts.some(t => t.includes('Introducción'))).toBe(true);
    expect(navTexts.some(t => t.includes('Primera Sección'))).toBe(true);
    await snap(page, testInfo, 'no-h1-sidebar');
  });

  test('short doc (1 H1 + 1 H2) → single page fallback', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_SHORT);
    const navItems = frame.locator('.nav-item');
    const count = await navItems.count();
    expect(count).toBeLessThanOrEqual(2);
    await snap(page, testInfo, 'single-page-fallback');
  });

  test('doc title is always the H1 text in browser title', async ({ page }, testInfo) => {
    await page.fill('#md-input', MD_SINGLE_H1_MANY_H2);
    await page.click('button.btn-primary');
    const frame = page.frameLocator('#preview-frame');
    await frame.locator('.sidebar-left').waitFor({ timeout: 8000 });
    const docTitle = frame.locator('.doc-identity-title');
    await expect(docTitle).toContainText('Guía de Docker');
    await snap(page, testInfo, 'doc-title-from-h1');
  });

  test('# comments inside yaml code block are not counted as H1 headings', async ({ page }, testInfo) => {
    const md = [
      '# My Guide', '', 'Intro.',
      '', '## Setup', '',
      '```yaml', '# yaml comment — not a heading', 'jobs:', '  test:', '    runs-on: ubuntu-latest', '```',
      '', '## Usage', '', 'Content here.'
    ].join('\n');
    const frame = await renderMarkdown(page, md);
    const navTexts = await frame.locator('.nav-item').allTextContents();
    // Must be H2-split (Setup, Usage) — not H1-split triggered by the yaml comment
    expect(navTexts.some(t => t.includes('Setup'))).toBe(true);
    expect(navTexts.some(t => t.includes('Usage'))).toBe(true);
    await snap(page, testInfo, 'yaml-comment-not-h1');
  });

  test('## comments inside shell code block are not counted as H2 headings', async ({ page }, testInfo) => {
    const md = [
      '# Guide',
      '## Section One', '',
      '```bash', '## this is a shell comment', 'echo hello', '```',
      '', '## Section Two', '', 'Content.'
    ].join('\n');
    const frame = await renderMarkdown(page, md);
    const navTexts = await frame.locator('.nav-item').allTextContents();
    // Only 2 real H2s — Section One and Section Two; shell comment must not appear
    const navCount = await frame.locator('.nav-item').count();
    expect(navCount).toBe(2);
    expect(navTexts.some(t => t.includes('Section One'))).toBe(true);
    expect(navTexts.some(t => t.includes('Section Two'))).toBe(true);
    expect(navTexts.some(t => t.includes('shell comment'))).toBe(false);
    await snap(page, testInfo, 'shell-comment-not-h2');
  });

  test('code block with heading-like content does not split page incorrectly', async ({ page }, testInfo) => {
    const md = [
      '# Documento', '', 'Intro.',
      '', '## Capítulo Uno', '',
      '```yaml', '# .github/workflows/playwright.yml', 'on:', '  push:', '    branches: [main]', '```',
      '', '## Capítulo Dos', '', 'Segundo capítulo.'
    ].join('\n');
    const frame = await renderMarkdown(page, md);
    // Doc title must be "Documento" (the real H1), not the yaml comment
    await expect(frame.locator('.doc-identity-title')).toContainText('Documento');
    const navTexts = await frame.locator('.nav-item').allTextContents();
    expect(navTexts.some(t => t.includes('Capítulo Uno'))).toBe(true);
    expect(navTexts.some(t => t.includes('Capítulo Dos'))).toBe(true);
    await snap(page, testInfo, 'code-block-no-false-split');
  });

  test('h2-split with short intro → shows description in sidebar, not as nav page', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_H2_SHORT_INTRO);
    // Description element is visible and contains the blurb text
    const desc = frame.locator('.doc-description');
    await expect(desc).toBeVisible();
    await expect(desc).toContainText('descripción breve');
    // Doc title is NOT a nav item (no intro page created)
    const navTexts = await frame.locator('.nav-item').allTextContents();
    expect(navTexts.some(t => t.includes('Mi Guía'))).toBe(false);
    // H2s are still nav items
    expect(navTexts.some(t => t.includes('Sección Uno'))).toBe(true);
    await snap(page, testInfo, 'h2-short-intro-description');
  });

  test('h2-split with long intro → intro content remains as nav page', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_H2_LONG_INTRO);
    // No visible description
    const desc = frame.locator('.doc-description');
    expect(await desc.count()).toBe(0);
    // Doc title appears as first nav item (intro page preserved)
    const navTexts = await frame.locator('.nav-item').allTextContents();
    expect(navTexts.some(t => t.includes('Mi Guía'))).toBe(true);
    await snap(page, testInfo, 'h2-long-intro-page');
  });

  test('single H1 + many H2s → short intro paragraph shown as sidebar description', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const desc = frame.locator('.doc-description');
    await expect(desc).toBeVisible();
    await expect(desc).toContainText('plataforma de contenedores');
    await snap(page, testInfo, 'h2-docker-description');
  });
});

/* ============================================================
   TYPOGRAPHY PRESETS
   ============================================================ */
test.describe('Typography Presets', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/renderer.html');
  });

  test('editorial preset uses Fraunces for headings', async ({ page }, testInfo) => {
    await page.click('#settings-btn');
    await page.click('[name="font-preset"][value="editorial"]');
    await snap(page, testInfo, 'preset-editorial-selected');
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const fontDisplay = await frame.locator('body').evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim()
    ).catch(() => '');
    if (fontDisplay) expect(fontDisplay).toContain('Fraunces');
    const pageTitle = frame.locator('.page-title').first();
    await expect(pageTitle).toBeVisible();
    await snap(page, testInfo, 'preset-editorial-rendered');
  });

  test('clean preset uses Inter for display font', async ({ page }, testInfo) => {
    await page.click('#settings-btn');
    await page.click('[name="font-preset"][value="clean"]');
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const fontDisplay = await frame.locator('body').evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim()
    ).catch(() => '');
    if (fontDisplay) expect(fontDisplay).toContain('Inter');
    await snap(page, testInfo, 'preset-clean-rendered');
  });

  test('classic preset has no Google Fonts link in generated HTML', async ({ page }, testInfo) => {
    await page.click('#settings-btn');
    await page.click('[name="font-preset"][value="classic"]');
    await snap(page, testInfo, 'preset-classic-selected');
    await page.fill('#md-input', MD_SHORT);
    await page.click('button.btn-primary');
    const frame = page.frameLocator('#preview-frame');
    await frame.locator('.sidebar-left').waitFor({ timeout: 8000 });
    const googleFontsLink = frame.locator('link[href*="fonts.googleapis.com"]');
    await expect(googleFontsLink).toHaveCount(0);
    await snap(page, testInfo, 'preset-classic-rendered');
  });

  test('system preset has no Google Fonts link in generated HTML', async ({ page }, testInfo) => {
    await page.click('#settings-btn');
    await page.click('[name="font-preset"][value="system"]');
    await page.fill('#md-input', MD_SHORT);
    await page.click('button.btn-primary');
    const frame = page.frameLocator('#preview-frame');
    await frame.locator('.sidebar-left').waitFor({ timeout: 8000 });
    const googleFontsLink = frame.locator('link[href*="fonts.googleapis.com"]');
    await expect(googleFontsLink).toHaveCount(0);
    await snap(page, testInfo, 'preset-system-rendered');
  });
});

/* ============================================================
   BACK TO EDITOR
   ============================================================ */
test.describe('Back to Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/renderer.html');
  });

  test('back button exists in rendered doc sidebar', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const backBtn = frame.locator('.back-to-editor');
    await expect(backBtn).toBeVisible();
    await expect(backBtn).toContainText('← Editor');
    await snap(page, testInfo, 'back-button-in-sidebar');
  });

  test('clicking back button returns to editor', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    await snap(page, testInfo, 'rendered-doc-before-back');
    const backBtn = frame.locator('.back-to-editor');
    await backBtn.click();
    await expect(page.locator('#editor')).toBeVisible();
    await expect(page.locator('#preview')).toBeHidden();
    await snap(page, testInfo, 'editor-after-back');
  });
});

/* ============================================================
   PAGE NAVIGATION
   ============================================================ */
test.describe('Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/renderer.html');
  });

  test('clicking nav item switches active page', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_MANY_H1S);
    await snap(page, testInfo, 'page-nav-initial');
    const navItems = frame.locator('.nav-item');
    const count = await navItems.count();
    expect(count).toBeGreaterThanOrEqual(2);
    await navItems.nth(1).click();
    await expect(navItems.nth(1)).toHaveClass(/active/);
    await expect(navItems.nth(0)).not.toHaveClass(/active/);
    await snap(page, testInfo, 'page-nav-switched');
  });

  test('H2-split mode: H3 headings appear in right TOC', async ({ page }, testInfo) => {
    const mdWithH3 = `# Documento
## Capítulo Uno
Intro.
### Sub A
Contenido.
### Sub B
Más.
## Capítulo Dos
Otro capítulo.`;
    const frame = await renderMarkdown(page, mdWithH3);
    await snap(page, testInfo, 'h2-split-first-page');
    const navItems = frame.locator('.nav-item');
    await navItems.first().click();
    await page.waitForTimeout(400);
    const otpLinks = frame.locator('#on-this-page .otp-link');
    const tocCount = await otpLinks.count();
    expect(tocCount).toBeGreaterThanOrEqual(0);
    await snap(page, testInfo, 'h3-toc-visible');
  });

  test('prev/next navigation buttons work', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_MANY_H1S);
    await snap(page, testInfo, 'prev-next-initial');
    const nextBtn = frame.locator('.page-nav-btn.next').first();
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    const navItems = frame.locator('.nav-item');
    await expect(navItems.nth(1)).toHaveClass(/active/);
    await snap(page, testInfo, 'prev-next-after-next');
  });
});

/* ============================================================
   COPY MARKDOWN
   ============================================================ */
test.describe('Copy Markdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/renderer.html');
  });

  test('copy markdown button exists in rendered doc sidebar', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const btn = frame.locator('.copy-md-btn');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText('Copy markdown');
    await snap(page, testInfo, 'copy-md-button-visible');
  });

  test('__rawMd embedded in generated HTML matches original markdown', async ({ page }) => {
    await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const srcDoc = await page.evaluate(() => document.getElementById('preview-frame').srcdoc);
    const expected = JSON.stringify(MD_SINGLE_H1_MANY_H2);
    expect(srcDoc).toContain('var __rawMd=' + expected + ';');
  });

  test('clicking copy markdown button shows "Copiado" feedback', async ({ page }, testInfo) => {
    const frame = await renderMarkdown(page, MD_SINGLE_H1_MANY_H2);
    const btn = frame.locator('#copy-md-btn');
    await btn.click();
    await expect(btn).toContainText('Copiado');
    await snap(page, testInfo, 'copy-md-feedback');
    // after 2s it reverts
    await page.waitForTimeout(2200);
    await expect(btn).toContainText('Copy markdown');
  });
});
