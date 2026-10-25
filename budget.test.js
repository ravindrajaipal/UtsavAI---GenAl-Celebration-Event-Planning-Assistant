import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateBudgetBreakdown, generateAiSavingsPlan } from '../src/modules/budgetEngine.js';
import { EVENT_SCENARIOS } from '../src/config/constants.js';

describe('Smart Budget Engine — Unit & Invariant Suite', () => {
  it('allocates exactly 10% emergency contingency reserve and 90% allocatable pool', () => {
    const result = calculateBudgetBreakdown(1000000, 200, EVENT_SCENARIOS.wedding.splits, false);
    assert.strictEqual(result.grossBudgetINR, 1000000);
    assert.strictEqual(result.contingencyReserveINR, 100000);
    assert.strictEqual(result.allocatablePoolINR, 900000);
    assert.strictEqual(result.totalAiSavingsINR, 0);
  });

  it('applies 15% AI optimization across all 5 categories accurately', () => {
    const unoptimized = calculateBudgetBreakdown(2000000, 250, EVENT_SCENARIOS.wedding.splits, false);
    const optimized = calculateBudgetBreakdown(2000000, 250, EVENT_SCENARIOS.wedding.splits, true);
    assert.strictEqual(optimized.aiOptimized, true);
    assert.ok(optimized.totalAiSavingsINR > 0, 'Expected positive AI savings');
    assert.strictEqual(
      optimized.totalPlannedINR - optimized.totalActualINR,
      optimized.totalAiSavingsINR
    );
    assert.ok(optimized.netPerGuestINR < unoptimized.netPerGuestINR);
  });

  it('handles zero or negative guest counts gracefully without division-by-zero', () => {
    const result = calculateBudgetBreakdown(50000, 0, EVENT_SCENARIOS.birthday.splits, false);
    assert.ok(Number.isFinite(result.netPerGuestINR));
    assert.ok(result.guestCount >= 1);
  });

  it('generates actionable savings tactics for every budget pillar', () => {
    const breakdown = calculateBudgetBreakdown(600000, 500, EVENT_SCENARIOS.community.splits, true);
    const plan = generateAiSavingsPlan(breakdown);
    assert.strictEqual(plan.length, 5);
    for (const item of plan) {
      assert.ok(item.savingsINR > 0);
      assert.ok(item.tactic.length > 10);
    }
  });
});
