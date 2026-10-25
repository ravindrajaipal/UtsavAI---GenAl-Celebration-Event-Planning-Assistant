import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { memoize } from '../src/utils/performance.js';
import { calculateBudgetBreakdown } from '../src/modules/budgetEngine.js';
import { calculateDietaryMatrix } from '../src/modules/floorplanEngine.js';
import { EVENT_SCENARIOS } from '../src/config/constants.js';

describe('Efficiency & Algorithmic Complexity Suite', () => {
  it('caches repeated pure calculations via LRU memoize with O(1) hit tracking', () => {
    let computeCount = 0;
    const expensiveFn = memoize((x, y) => {
      computeCount += 1;
      return x * y;
    }, 4);

    assert.strictEqual(expensiveFn(12, 10), 120);
    assert.strictEqual(expensiveFn(12, 10), 120);
    assert.strictEqual(computeCount, 1);
    assert.strictEqual(expensiveFn.getStats().hits, 1);
    assert.strictEqual(expensiveFn.getStats().misses, 1);
  });

  it('computes 1,000 budget & dietary matrices in under 50ms', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      calculateBudgetBreakdown(2500000, 350, EVENT_SCENARIOS.wedding.splits, true);
      calculateDietaryMatrix(350, EVENT_SCENARIOS.wedding.dietarySplit);
    }
    const elapsedMs = performance.now() - start;
    assert.ok(elapsedMs < 50, `Expected < 50ms for 1,000 memoized iterations, took ${elapsedMs.toFixed(2)}ms`);
  });
});
