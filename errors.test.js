import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AppError, ValidationError, RateLimitError } from '../src/utils/errors.js';
import { throttle, debounce, memoize } from '../src/utils/performance.js';
import { executeDiagnosticSuite } from '../src/modules/auditEngine.js';
import { EVENT_SCENARIOS } from '../src/config/constants.js';

describe('Structured Errors, Performance Helpers & Audit Engine Suite', () => {
  it('constructs AppError, ValidationError, and RateLimitError with ISO timestamps and codes', () => {
    const appErr = new AppError('System failure', 'ERR_SYS');
    assert.strictEqual(appErr.code, 'ERR_SYS');
    assert.ok(appErr.timestamp.includes('T'));

    const valErr = new ValidationError('Invalid budget', ['totalBudget']);
    assert.strictEqual(valErr.code, 'ERR_VALIDATION');
    assert.deepStrictEqual(valErr.fields, ['totalBudget']);

    const rateErr = new RateLimitError(5000);
    assert.strictEqual(rateErr.code, 'ERR_RATE_LIMIT');
    assert.ok(rateErr.message.includes('5s'));
  });

  it('supports LRU cache eviction, clear(), debounce.cancel(), and throttle()', () => {
    const fn = memoize((n) => n * 2, 2);
    fn(1);
    fn(2);
    fn(3); // evicts key 1
    assert.strictEqual(fn.getStats().size, 2);
    fn.clear();
    assert.strictEqual(fn.getStats().size, 0);

    let count = 0;
    const throttled = throttle(() => { count += 1; }, 50);
    throttled();
    throttled();
    assert.strictEqual(count, 1);

    const debounced = debounce(() => {}, 50);
    debounced();
    debounced.cancel();
  });

  it('executes the 6-pillar diagnostic suite with 100% pass rate in headless Node', () => {
    const report = executeDiagnosticSuite(EVENT_SCENARIOS.wedding, null);
    assert.strictEqual(report.passedCount, report.total);
    assert.ok(report.total >= 15);
  });
});
