'use strict';

/**
 * @fileoverview Main application controller for UtsavAI Pro v4.0.
 * Connects ES6 domain modules, WAI-ARIA keyboard navigation, and debounced UI updates.
 * @module app
 */

import { EVENT_SCENARIOS } from './config/constants.js';
import { sanitizeText, validateEventInput, validateGeminiKeyFormat, maskApiKey } from './utils/security.js';
import { debounce } from './utils/performance.js';
import { calculateBudgetBreakdown } from './modules/budgetEngine.js';
import { exportToICSFormat } from './modules/timelineEngine.js';
import { executeDiagnosticSuite } from './modules/auditEngine.js';
import {
  setElementText,
  renderHeroAndKpis,
  renderRiskRadar,
  renderSubFunctions,
  renderBudgetStudio
} from './modules/uiRenderer.js';
import {
  renderTimelineSection,
  renderVendorSection,
  renderFloorplanAndInvites
} from './modules/workspaceRenderer.js';
import { queryGeminiCoPilot } from './services/geminiService.js';

const appState = {
  activeTab: 'overview',
  scenarioKey: 'wedding',
  event: JSON.parse(JSON.stringify(EVENT_SCENARIOS.wedding)),
  aiOptimized: false,
  selectedVendorIndex: 0,
  selectedZoneId: 'T1',
  customInviteNote: 'Your presence and blessings are our greatest joy.',
  ephemeralGeminiKey: '',
  budgetChart: null
};

/**
 * Announces status updates to screen readers via polite live region.
 * @param {string} message - Message to announce.
 */
export function announceToScreenReader(message) {
  setElementText('a11y-live-announcer', sanitizeText(message, 240));
}

/**
 * Synchronizes all active views and updates telemetry metrics.
 */
export function renderAllViews() {
  const t0 = performance.now();
  const ev = appState.event;
  const budgetData = calculateBudgetBreakdown(ev.totalBudget, ev.guestCount, ev.splits, appState.aiOptimized);

  renderHeroAndKpis(ev, budgetData, appState.aiOptimized);
  renderRiskRadar(ev, budgetData);
  renderSubFunctions(ev, budgetData);
  renderBudgetStudio(budgetData, appState);
  renderTimelineSection(ev);
  renderVendorSection(ev, appState);
  renderFloorplanAndInvites(ev, appState);

  const stats = calculateBudgetBreakdown.getStats();
  setElementText('metric-render-ms', `${(performance.now() - t0).toFixed(2)}ms`);
  setElementText('metric-cache-hits', `${stats.hitRatePercent}% Hit Rate (${stats.hits} hits)`);
}

/**
 * Switches active WAI-ARIA tab and tabpanel.
 * @param {string} tabKey - Target tab identifier.
 * @param {boolean} [focusBtn=false] - Move keyboard focus to tab button.
 */
export function switchTab(tabKey, focusBtn = false) {
  appState.activeTab = tabKey;
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    const active = btn.dataset.tab === tabKey;
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
    btn.setAttribute('tabindex', active ? '0' : '-1');
    if (active && focusBtn) btn.focus();
  });

  document.querySelectorAll('.tab-panel').forEach((panel) => {
    panel.classList.toggle('hidden', panel.id !== `panel-${tabKey}`);
  });

  if (tabKey === 'audit') {
    executeDiagnosticSuite(appState.event, document);
  }
  announceToScreenReader(`Switched to ${tabKey} tab panel.`);
}

/**
 * Wires event delegation and form listeners on DOMContentLoaded.
 */
export function initApplication() {
  if (typeof document === 'undefined') return;

  const tablist = document.getElementById('main-tablist');
  const tabOrder = ['overview', 'budget', 'timeline', 'vendors', 'floorplan', 'invites', 'audit'];

  tablist?.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (btn?.dataset?.tab) switchTab(btn.dataset.tab, false);
  });

  tablist?.addEventListener('keydown', (e) => {
    const idx = tabOrder.indexOf(appState.activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      switchTab(tabOrder[(idx + 1) % tabOrder.length], true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      switchTab(tabOrder[(idx - 1 + tabOrder.length) % tabOrder.length], true);
    }
  });

  document.getElementById('scenario-select')?.addEventListener('change', (e) => {
    const next = EVENT_SCENARIOS[e.target.value];
    if (next) {
      appState.event = JSON.parse(JSON.stringify(next));
      appState.aiOptimized = false;
      renderAllViews();
    }
  });

  document.getElementById('btn-contrast-toggle')?.addEventListener('click', (e) => {
    const enabled = document.body.classList.toggle('high-contrast');
    e.currentTarget.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  });

  document.getElementById('slider-budget')?.addEventListener('input', debounce((e) => {
    const check = validateEventInput({
      title: appState.event.title,
      totalBudget: Number(e.target.value),
      guestCount: appState.event.guestCount
    });
    if (check.valid) {
      appState.event.totalBudget = check.sanitized.totalBudget;
      renderAllViews();
    }
  }, 60));

  document.getElementById('slider-guests')?.addEventListener('input', debounce((e) => {
    const check = validateEventInput({
      title: appState.event.title,
      totalBudget: appState.event.totalBudget,
      guestCount: Number(e.target.value)
    });
    if (check.valid) {
      appState.event.guestCount = check.sanitized.guestCount;
      renderAllViews();
    }
  }, 60));

  document.getElementById('btn-toggle-ai-budget')?.addEventListener('click', () => {
    appState.aiOptimized = !appState.aiOptimized;
    renderAllViews();
  });

  document.getElementById('btn-apply-ai-action')?.addEventListener('click', () => {
    appState.aiOptimized = !appState.aiOptimized;
    renderAllViews();
  });

  document.getElementById('copilot-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('copilot-input');
    const response = await queryGeminiCoPilot(input?.value || 'Optimize budget', appState.event, appState.ephemeralGeminiKey);
    setElementText('copilot-summary-text', response.summary);
  });

  document.getElementById('btn-export-ics')?.addEventListener('click', () => {
    exportToICSFormat(appState.event);
    announceToScreenReader('Downloaded ICS calendar file.');
  });

  document.getElementById('form-api-key')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('input-gemini-key');
    if (input && validateGeminiKeyFormat(input.value)) {
      appState.ephemeralGeminiKey = input.value.trim();
      setElementText('api-key-status-badge', `Key: ${maskApiKey(appState.ephemeralGeminiKey)}`);
    }
  });

  renderAllViews();
  executeDiagnosticSuite(appState.event, document);
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initApplication);
}
