import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtmlPath = path.join(__dirname, '..', 'index.html');

describe('WCAG 2.1 AAA Accessibility & Semantic Markup Verification Suite', () => {
  const html = fs.readFileSync(indexHtmlPath, 'utf-8');

  it('declares valid HTML5 doctype, lang="en", and responsive viewport', () => {
    assert.ok(html.startsWith('<!DOCTYPE html>'));
    assert.ok(html.includes('<html lang="en"'));
    assert.ok(html.includes('name="viewport"'));
  });

  it('includes a keyboard Skip-to-Main-Content link and main landmark', () => {
    assert.ok(html.includes('href="#main-content"'));
    assert.ok(html.includes('<main id="main-content"'));
    assert.ok(html.includes('role="banner"'));
    assert.ok(html.includes('role="contentinfo"'));
  });

  it('implements complete WAI-ARIA Tabs pattern (tablist, tab, tabpanel, aria-selected)', () => {
    assert.ok(html.includes('role="tablist"'));
    assert.ok(html.includes('role="tab"'));
    assert.ok(html.includes('role="tabpanel"'));
    assert.ok(html.includes('aria-selected='));
    assert.ok(html.includes('aria-controls='));
  });

  it('provides an aria-live="polite" screen-reader status announcer', () => {
    assert.ok(html.includes('id="a11y-live-announcer"'));
    assert.ok(html.includes('aria-live="polite"'));
    assert.ok(html.includes('aria-atomic="true"'));
  });

  it('supports prefers-reduced-motion and visible focus-visible keyboard rings', () => {
    assert.ok(html.includes('prefers-reduced-motion: reduce'));
    assert.ok(html.includes(':focus-visible'));
  });
});
