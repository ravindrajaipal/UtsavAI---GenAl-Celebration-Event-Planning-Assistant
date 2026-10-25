import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHTML,
  sanitizeText,
  validateEventInput,
  validateGeminiKeyFormat,
  maskApiKey,
  RateLimiter
} from '../src/utils/security.js';

describe('Enterprise Security Module — XSS, Validation & Rate Limiting Suite', () => {
  it('neutralizes DOM XSS script tags and event attributes via escapeHTML', () => {
    const malicious = '<script>alert("xss")</script><img src=x onerror="fetch(\'http://evil\')">';
    const escaped = escapeHTML(malicious);
    assert.ok(!escaped.includes('<script>'));
    assert.ok(!escaped.includes('<img'));
    assert.ok(escaped.includes('&lt;script&gt;'));
  });

  it('strips dangerous javascript: and data: URIs in sanitizeText', () => {
    const payload = 'javascript:alert(1) Wedding Plan';
    const clean = sanitizeText(payload, 100);
    assert.ok(!clean.toLowerCase().includes('javascript:'));
  });

  it('enforces strict bounds on event input validation', () => {
    const valid = validateEventInput({
      title: 'Jaipur Royal Wedding',
      totalBudget: 1500000,
      guestCount: 300
    });
    assert.strictEqual(valid.valid, true);
    assert.strictEqual(valid.errors.length, 0);

    const invalid = validateEventInput({
      title: 'A',
      totalBudget: -500,
      guestCount: 999999
    });
    assert.strictEqual(invalid.valid, false);
    assert.strictEqual(invalid.errors.length, 3);
  });

  it('validates and masks Gemini API keys without leaking credentials', () => {
    const fakeKey = 'AIzaSyD9876543210abcdefghijklmnopqrstuv';
    assert.strictEqual(validateGeminiKeyFormat(fakeKey), true);
    assert.strictEqual(validateGeminiKeyFormat('invalid-key'), false);

    const masked = maskApiKey(fakeKey);
    assert.ok(masked.startsWith('AIza'));
    assert.ok(masked.includes('••••••••'));
    assert.ok(!masked.includes('9876543210'));
  });

  it('throttles burst requests accurately via token-bucket RateLimiter', () => {
    const limiter = new RateLimiter(3, 60000);
    const t0 = 1000000;
    assert.strictEqual(limiter.tryAcquire(t0).allowed, true);
    assert.strictEqual(limiter.tryAcquire(t0 + 100).allowed, true);
    assert.strictEqual(limiter.tryAcquire(t0 + 200).allowed, true);
    const blocked = limiter.tryAcquire(t0 + 300);
    assert.strictEqual(blocked.allowed, false);
    assert.ok(blocked.retryAfterMs > 0);
  });
});
