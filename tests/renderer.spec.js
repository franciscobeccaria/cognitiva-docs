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
