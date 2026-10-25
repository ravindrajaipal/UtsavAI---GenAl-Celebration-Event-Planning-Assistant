import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { queryGeminiCoPilot, generateDeterministicCoPilotResponse } from '../src/services/geminiService.js';
import { EVENT_SCENARIOS } from '../src/config/constants.js';
import { analyzeTimelineProgress, detectScheduleConflicts } from '../src/modules/timelineEngine.js';
import { evaluateVendorReadiness } from '../src/modules/vendorEngine.js';
import { generateAiSavingsPlan } from '../src/modules/budgetEngine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Gemini Service, Edge Cases & Zero-innerHTML Static Security Audit', () => {
  it('resolves queryGeminiCoPilot with deterministic fallback when API key is omitted', async () => {
    const res = await queryGeminiCoPilot('Generate schedule for wedding', EVENT_SCENARIOS.wedding, '');
    assert.strictEqual(res.suggestedAction, 'ADD_GOLDEN_HOUR_TASK');
    assert.ok(res.summary.length > 10);
  });

  it('rejects empty prompts in queryGeminiCoPilot', async () => {
    await assert.rejects(
      async () => queryGeminiCoPilot('   ', EVENT_SCENARIOS.wedding, ''),
      /Prompt cannot be empty/
    );
  });

  it('handles empty/null edge cases across timeline, vendor, and budget modules safely', () => {
    assert.strictEqual(analyzeTimelineProgress([]).total, 0);
    assert.strictEqual(detectScheduleConflicts(null).length, 0);
    assert.strictEqual(evaluateVendorReadiness([]).totalVendors, 0);
    assert.strictEqual(generateAiSavingsPlan(null).length, 0);
    const fallback = generateDeterministicCoPilotResponse('General advice', EVENT_SCENARIOS.community);
    assert.strictEqual(fallback.suggestedAction, 'READY');
  });

  it('verifies zero unsafe .innerHTML sinks exist anywhere in src/ or index.html', () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const filesToScan = [path.join(__dirname, '..', 'index.html')];
    for (const sub of ['config', 'utils', 'modules', 'services']) {
      const dir = path.join(srcDir, sub);
      for (const f of fs.readdirSync(dir)) {
        if (f.endsWith('.js')) filesToScan.push(path.join(dir, f));
      }
    }
    for (const filePath of filesToScan) {
      const content = fs.readFileSync(filePath, 'utf-8');
      assert.ok(!content.includes('.innerHTML'), `Unsafe .innerHTML found in ${filePath}`);
      assert.ok(!content.includes('eval('), `Unsafe eval() found in ${filePath}`);
    }
  });
});
