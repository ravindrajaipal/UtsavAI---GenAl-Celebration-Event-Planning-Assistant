'use strict';

/**
 * @fileoverview Primary DOM renderer for Hero KPIs, Risk Radar, Sub-Functions,
 * and Smart Budget Studio (using DocumentFragment and in-place Chart.js updates).
 * @module modules/uiRenderer
 */

export const CATEGORY_LABELS = Object.freeze({
  venueCatering: 'Venue & Catering',
  decorLighting: 'Decor & Lighting',
  entertainmentAV: 'Entertainment & AV',
  photographyMedia: 'Photography & Media',
  logisticsHospitality: 'Logistics & Hospitality'
});

/**
 * Safely sets textContent on an element by ID.
 * @param {string} id - DOM element ID.
 * @param {string} text - Text content to assign.
 */
export function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = text;
  }
}

/**
 * Renders top Hero Banner & 4 financial/readiness KPI cards.
 * @param {Object} ev - Active event object.
 * @param {Object} budgetData - Memoized budget output.
 * @param {boolean} aiOptimized - Whether 15% AI optimization is active.
 */
export function renderHeroAndKpis(ev, budgetData, aiOptimized) {
  const vendorSaved = ev.vendors.reduce((acc, v) => acc + Math.max(0, v.quoted - v.negotiated), 0);
  const combinedSavings = vendorSaved + budgetData.totalAiSavingsINR;
  const completedCount = ev.timeline.filter((t) => t.status === 'completed').length;
  const readinessPct = Math.min(100, Math.round(65 + (completedCount / Math.max(1, ev.timeline.length)) * 35));

  setElementText('hero-category-badge', ev.category);
  setElementText('hero-date-badge', `📅 ${ev.date}`);
  setElementText('hero-venue-badge', `📍 ${ev.venue}`);
  setElementText('event-hero-heading', ev.title);
  setElementText('hero-theme-text', `Theme: ${ev.theme}`);
  setElementText('kpi-total-budget', `₹${budgetData.grossBudgetINR.toLocaleString('en-IN')}`);
  setElementText('kpi-contingency-note', `₹${budgetData.contingencyReserveINR.toLocaleString('en-IN')} (10% Reserve)`);
  setElementText('kpi-guest-count', `${budgetData.guestCount} Guests`);
  setElementText('kpi-per-guest', `₹${budgetData.netPerGuestINR.toLocaleString('en-IN')} / guest`);
  setElementText('kpi-total-savings', `₹${combinedSavings.toLocaleString('en-IN')}`);
  setElementText('kpi-savings-badge', aiOptimized ? '15% AI + Vendor SLA' : 'Vendor SLA Saved');
  setElementText('kpi-readiness-score', `${readinessPct}%`);
}

/**
 * Renders AI Risk, Weather & Contingency Radar cards.
 * @param {Object} ev - Active event object.
 * @param {Object} budgetData - Computed budget breakdown.
 */
export function renderRiskRadar(ev, budgetData) {
  const container = document.getElementById('risk-radar-list');
  if (!container) return;

  const powerKva = ev.guestCount > 300 ? '125 kVA Silent DG Twin-Set' : '62.5 kVA Acoustic Backup';
  const risks = [
    { badge: '⚡ Power & AV Failover', status: 'Mitigated', detail: `Deploy ${powerKva} with automatic transfer switch (ATS) for stage audio & DMX lighting.` },
    { badge: '🌦️ Weather & Canopy Shield', status: 'Ready', detail: `Waterproof marquee & patio climate heaters pre-reserved for ${ev.venue}.` },
    { badge: '🚑 Medical & Crowd Safety', status: 'Verified', detail: `${Math.ceil(ev.guestCount / 50)} licensed fire marshals, clear 4m exits & dedicated paramedic bay.` },
    { badge: '🏦 Escrow Financial Guard', status: 'Locked', detail: `₹${budgetData.contingencyReserveINR.toLocaleString('en-IN')} (10% reserve) isolated from vendor payouts.` }
  ];

  const frag = document.createDocumentFragment();
  for (const r of risks) {
    const card = document.createElement('div');
    card.className = 'bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1';
    const header = document.createElement('div');
    header.className = 'flex items-center justify-between font-semibold text-white';
    const bSpan = document.createElement('span');
    bSpan.textContent = r.badge;
    const sSpan = document.createElement('span');
    sSpan.className = 'text-[11px] font-mono text-emerald-400';
    sSpan.textContent = r.status;
    header.append(bSpan, sSpan);

    const p = document.createElement('p');
    p.className = 'text-slate-300 leading-relaxed';
    p.textContent = r.detail;
    card.append(header, p);
    frag.appendChild(card);
  }
  container.replaceChildren(frag);
}

/**
 * Renders Sub-Ceremony Architect cards.
 * @param {Object} ev - Active event object.
 * @param {Object} budgetData - Computed budget breakdown.
 */
export function renderSubFunctions(ev, budgetData) {
  const grid = document.getElementById('subfunctions-grid');
  if (!grid) return;

  const frag = document.createDocumentFragment();
  for (const sf of ev.subFunctions) {
    const alloc = Math.round((budgetData.totalActualINR * (sf.sharePct || 25)) / 100);
    const card = document.createElement('div');
    card.className = 'bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2';

    const top = document.createElement('div');
    top.className = 'flex items-center justify-between text-xs font-mono text-amber-400';
    const tSpan = document.createElement('span');
    tSpan.textContent = sf.time;
    const pSpan = document.createElement('span');
    pSpan.textContent = `${sf.sharePct}% Split`;
    top.append(tSpan, pSpan);

    const title = document.createElement('h4');
    title.className = 'text-sm font-bold text-white';
    title.textContent = sf.name;

    const dress = document.createElement('p');
    dress.className = 'text-xs text-slate-300';
    dress.textContent = `👗 ${sf.dressCode}`;

    const budgetEl = document.createElement('p');
    budgetEl.className = 'text-xs font-mono text-emerald-400 font-semibold';
    budgetEl.textContent = `Allocated: ₹${alloc.toLocaleString('en-IN')}`;

    card.append(top, title, dress, budgetEl);
    frag.appendChild(card);
  }
  grid.replaceChildren(frag);
}

/**
 * Renders Smart Budget Studio table & updates Chart.js in-place.
 * @param {Object} budgetData - Computed budget breakdown.
 * @param {Object} appState - Controller state holding Chart.js instance.
 */
export function renderBudgetStudio(budgetData, appState) {
  setElementText('label-slider-budget', `₹${budgetData.grossBudgetINR.toLocaleString('en-IN')}`);
  setElementText('label-slider-guests', `${budgetData.guestCount} Guests`);
  setElementText('summary-contingency', `₹${budgetData.contingencyReserveINR.toLocaleString('en-IN')}`);
  setElementText('summary-allocatable', `₹${budgetData.allocatablePoolINR.toLocaleString('en-IN')}`);
  setElementText('summary-ai-savings', `₹${budgetData.totalAiSavingsINR.toLocaleString('en-IN')}`);
  setElementText('summary-gst', `₹${budgetData.estimatedGstINR.toLocaleString('en-IN')}`);

  const tbody = document.getElementById('budget-ledger-tbody');
  if (tbody) {
    const frag = document.createDocumentFragment();
    for (const c of budgetData.categories) {
      const label = CATEGORY_LABELS[c.key] || c.key;
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-800/40';
      const cols = [
        [label, 'py-2 pr-3 font-sans font-semibold text-white'],
        [`${c.percent}%`, 'py-2 px-3 text-right text-slate-300'],
        [`₹${c.plannedINR.toLocaleString('en-IN')}`, 'py-2 px-3 text-right text-slate-300'],
        [`₹${c.actualINR.toLocaleString('en-IN')}`, 'py-2 px-3 text-right text-emerald-400 font-bold'],
        [`₹${c.perGuestINR.toLocaleString('en-IN')}`, 'py-2 pl-3 text-right text-amber-300']
      ];
      for (const [txt, cls] of cols) {
        const td = document.createElement('td');
        td.className = cls;
        td.textContent = txt;
        tr.appendChild(td);
      }
      frag.appendChild(tr);
    }
    tbody.replaceChildren(frag);
  }

  if (typeof globalThis.Chart !== 'undefined') {
    const canvas = document.getElementById('budget-chart-canvas');
    if (canvas) {
      const labels = budgetData.categories.map((c) => CATEGORY_LABELS[c.key] || c.key);
      const plannedArr = budgetData.categories.map((c) => c.plannedINR);
      const actualArr = budgetData.categories.map((c) => c.actualINR);
      if (!appState.budgetChart) {
        appState.budgetChart = new globalThis.Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels,
            datasets: [
              { label: 'Planned (INR)', data: plannedArr, backgroundColor: 'rgba(245, 158, 11, 0.75)', borderRadius: 6 },
              { label: 'Actual / AI (INR)', data: actualArr, backgroundColor: 'rgba(16, 185, 129, 0.85)', borderRadius: 6 }
            ]
          },
          options: { responsive: true, maintainAspectRatio: false }
        });
      } else {
        appState.budgetChart.data.labels = labels;
        appState.budgetChart.data.datasets[0].data = plannedArr;
        appState.budgetChart.data.datasets[1].data = actualArr;
        appState.budgetChart.update('none');
      }
    }
  }
}
