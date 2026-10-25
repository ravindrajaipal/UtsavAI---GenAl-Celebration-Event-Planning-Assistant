import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EVENT_SCENARIOS } from '../src/config/constants.js';
import { analyzeTimelineProgress, detectScheduleConflicts, exportToICSFormat } from '../src/modules/timelineEngine.js';
import { evaluateVendorReadiness, generateNegotiationScript } from '../src/modules/vendorEngine.js';
import { calculateDietaryMatrix } from '../src/modules/floorplanEngine.js';
import { generateAccessibleInviteSVG, generateBilingualInviteCopy } from '../src/modules/inviteEngine.js';
import { generateDeterministicCoPilotResponse } from '../src/services/geminiService.js';

describe('PromptWars Challenge 5 — Problem Statement Alignment Suite', () => {
  it('provides complete scenarios for Weddings, Birthdays, and Community Events', () => {
    assert.ok(EVENT_SCENARIOS.wedding);
    assert.ok(EVENT_SCENARIOS.birthday);
    assert.ok(EVENT_SCENARIOS.community);
    for (const key of ['wedding', 'birthday', 'community']) {
      const s = EVENT_SCENARIOS[key];
      assert.ok(s.totalBudget > 0);
      assert.ok(s.guestCount > 0);
      assert.ok(s.timeline.length >= 4);
      assert.ok(s.vendors.length >= 3);
      assert.ok(s.subFunctions.length >= 3);
    }
  });

  it('tracks timeline progress, detects conflicts, and exports valid RFC 5545 .ics files', () => {
    const progress = analyzeTimelineProgress(EVENT_SCENARIOS.wedding.timeline);
    assert.strictEqual(progress.total, 5);
    assert.ok(progress.completionPct > 0);

    const conflicts = detectScheduleConflicts([
      { phase: 'Event Day', time: '06:00 PM', task: 'Baraat Entry' },
      { phase: 'Event Day', time: '06:00 PM', task: 'Soundcheck' }
    ]);
    assert.strictEqual(conflicts.length, 1);

    const ics = exportToICSFormat(EVENT_SCENARIOS.wedding);
    assert.ok(ics.startsWith('BEGIN:VCALENDAR'));
    assert.ok(ics.includes('Royal Jaipur Palace Wedding'));
  });

  it('evaluates vendor checklists and generates bilingual English/Hindi negotiation playbooks', () => {
    const metrics = evaluateVendorReadiness(EVENT_SCENARIOS.wedding.vendors);
    assert.strictEqual(metrics.totalVendors, 4);
    assert.ok(metrics.totalSavedINR > 0);

    const script = generateNegotiationScript(EVENT_SCENARIOS.wedding.vendors[0], 350);
    assert.strictEqual(script.discountPct, 12);
    assert.ok(script.englishScript.includes('350-guest'));
    assert.ok(script.hindiScript.includes('350 guests'));
  });

  it('computes 2D table floorplan seating & dietary catering buffers (Pure Veg, Jain, Vegan)', () => {
    const matrix = calculateDietaryMatrix(350, EVENT_SCENARIOS.wedding.dietarySplit);
    assert.strictEqual(matrix.zones.length, 6);
    assert.ok(matrix.bufferedPlatesTotal >= 350);
    assert.ok(matrix.accessibleZonesCount >= 5);
  });

  it('renders accessible SVG invitations and bilingual WhatsApp RSVP copy', () => {
    const svg = generateAccessibleInviteSVG(EVENT_SCENARIOS.wedding, 'Bless the couple');
    assert.ok(svg.includes('role="img"'));
    assert.ok(svg.includes('<title id="invite-svg-title">'));
    assert.ok(svg.includes('<desc id="invite-svg-desc">'));

    const copy = generateBilingualInviteCopy(EVENT_SCENARIOS.wedding);
    assert.ok(copy.englishCopy.includes('Royal Jaipur Palace Wedding'));
    assert.ok(copy.hindiCopy.includes('स्नेहिल निमंत्रण'));
  });

  it('synthesizes context-aware GenAI Co-Pilot recommendations', () => {
    const res = generateDeterministicCoPilotResponse('Optimize budget to save 15%', EVENT_SCENARIOS.wedding);
    assert.strictEqual(res.suggestedAction, 'APPLY_15_PERCENT_SAVINGS');
    assert.ok(res.recommendations.length >= 3);
  });
});
