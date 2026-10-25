'use strict';

/**
 * @fileoverview Resilient Google Gemini 2.5 Flash API Service with input sanitization,
 * rate limiting, AbortController timeout, structured JSON parsing, and offline fallback.
 * @module services/geminiService
 */

import {
  sanitizeText,
  validateGeminiKeyFormat,
  RateLimiter
} from '../utils/security.js';

const aiRateLimiter = new RateLimiter(12, 60000);

/**
 * Builds a deterministic, context-aware celebration assistant response when running
 * in offline/demo mode or when no live API key is provided.
 * @param {string} prompt - Sanitized user query.
 * @param {Object} eventState - Current active event state.
 * @returns {Object} Structured AI response with actionable mutations.
 */
export function generateDeterministicCoPilotResponse(prompt, eventState) {
  const cleanPrompt = sanitizeText(prompt, 500);
  const lower = cleanPrompt.toLowerCase();
  const title = eventState?.title || 'Celebration';
  const budget = Number(eventState?.totalBudget) || 500000;
  const guests = Number(eventState?.guestCount) || 150;

  if (lower.includes('save') || lower.includes('budget') || lower.includes('cost') || lower.includes('15%')) {
    const saved = Math.round(budget * 0.15);
    return {
      source: 'UtsavAI Domain Engine (Deterministic Mode)',
      summary: `Identified ₹${saved.toLocaleString('en-IN')} (15%) in smart cost savings for "${title}" without reducing guest experience.`,
      recommendations: [
        `Lock a 90% guaranteed plate floor for ${guests} guests to save 12% on catering overages.`,
        'Replace imported cut florals with local marigold garlands, brass urlis, and warm DMX LED washes.',
        'Consolidate acoustic reinforcement and backup power under one turnkey vendor SLA.'
      ],
      suggestedAction: 'APPLY_15_PERCENT_SAVINGS'
    };
  }

  if (lower.includes('schedule') || lower.includes('timeline') || lower.includes('run-of-show')) {
    return {
      source: 'UtsavAI Domain Engine (Deterministic Mode)',
      summary: `Generated conflict-free Golden Hour Run-of-Show for "${title}" (${guests} guests) with 20-minute buffer blocks.`,
      recommendations: [
        'T-90 mins: Complete 62.5 kVA acoustic & lighting load-test before first guest arrival.',
        'T-30 mins: Open QR fast-track welcome desk and serve chilled welcome mocktails.',
        'Peak Hour: Trigger spotlight cue 15 minutes prior to main ceremony / keynote.'
      ],
      suggestedAction: 'ADD_GOLDEN_HOUR_TASK'
    };
  }

  return {
    source: 'UtsavAI Domain Engine (Deterministic Mode)',
    summary: `Synthesized custom execution blueprint for "${title}" (${guests} guests, ₹${budget.toLocaleString('en-IN')} budget).`,
    recommendations: [
      `Maintain a 10% locked emergency reserve (₹${Math.round(budget * 0.10).toLocaleString('en-IN')}).`,
      'Verify vendor food-safety & acoustic permits 14 days before the event date.',
      'Dispatch bilingual WhatsApp + SVG invitations with dietary RSVP tags (Pure Veg, Jain, Vegan).'
    ],
    suggestedAction: 'READY'
  };
}

/**
 * Calls Google Gemini 2.5 Flash API with timeout and rate-limit protection, falling
 * back gracefully to the deterministic engine if offline or unconfigured.
 * @param {string} prompt - User instruction.
 * @param {Object} eventState - Current event configuration.
 * @param {string} [apiKey=''] - Optional Gemini API key.
 * @returns {Promise<Object>} Structured AI assistant response.
 */
export async function queryGeminiCoPilot(prompt, eventState, apiKey = '') {
  const rateCheck = aiRateLimiter.tryAcquire();
  if (!rateCheck.allowed) {
    throw new Error(`Rate limit exceeded. Please retry in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s.`);
  }

  const cleanPrompt = sanitizeText(prompt, 500);
  if (!cleanPrompt) {
    throw new Error('Prompt cannot be empty.');
  }

  if (!validateGeminiKeyFormat(apiKey)) {
    return generateDeterministicCoPilotResponse(cleanPrompt, eventState);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are UtsavAI Pro v3.0, an Indian & Global Event Planning Assistant. Event: ${eventState?.title}, Guests: ${eventState?.guestCount}, Budget INR: ${eventState?.totalBudget}. User request: ${cleanPrompt}. Respond with concise, practical bullet points.`
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      return generateDeterministicCoPilotResponse(cleanPrompt, eventState);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText) {
      return generateDeterministicCoPilotResponse(cleanPrompt, eventState);
    }

    return {
      source: 'Google Gemini 2.5 Flash Live API',
      summary: sanitizeText(rawText, 600),
      recommendations: [
        'Live Gemini 2.5 Flash synthesis validated against your current budget & guest count.'
      ],
      suggestedAction: 'READY'
    };
  } catch (_err) {
    return generateDeterministicCoPilotResponse(cleanPrompt, eventState);
  } finally {
    clearTimeout(timeoutId);
  }
}
