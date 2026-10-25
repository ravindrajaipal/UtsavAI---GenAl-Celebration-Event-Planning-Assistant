'use strict';

/**
 * @fileoverview Enterprise security utilities for XSS prevention, input sanitization,
 * schema validation, API key masking, and client-side token-bucket rate limiting.
 * @module utils/security
 */

import {
  MIN_GUEST_CAPACITY,
  MAX_GUEST_CAPACITY,
  MIN_BUDGET_INR,
  MAX_BUDGET_INR,
  RATE_LIMIT_CONFIG
} from '../config/constants.js';

/** @constant {Object<string, string>} HTML_ESCAPE_MAP */
const HTML_ESCAPE_MAP = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;'
});

/**
 * Escapes potentially dangerous HTML characters to prevent DOM-based XSS attacks.
 * @param {unknown} rawInput - Untrusted value to sanitize.
 * @returns {string} Safe HTML-escaped string.
 */
export function escapeHTML(rawInput) {
  if (rawInput === null || rawInput === undefined) {
    return '';
  }
  const str = String(rawInput);
  return str.replace(/[&<>"'`/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Strips dangerous protocol schemes (javascript:, data:, vbscript:) and control chars.
 * @param {string} input - User text or URL input.
 * @param {number} [maxLength=600] - Maximum allowed character length.
 * @returns {string} Cleaned plain text.
 */
export function sanitizeText(input, maxLength = RATE_LIMIT_CONFIG.maxPromptLength) {
  if (typeof input !== 'string') {
    return '';
  }
  const trimmed = input
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/(?:javascript|vbscript|data)\s*:/gi, '')
    .trim();
  return trimmed.slice(0, Math.max(1, maxLength));
}

/**
 * Validates event configuration inputs against strict numeric and string bounds.
 * @param {Object} payload - Event input parameters.
 * @param {string} payload.title - Event title.
 * @param {number} payload.totalBudget - Total budget in INR.
 * @param {number} payload.guestCount - Number of guests.
 * @returns {{ valid: boolean, errors: string[], sanitized: Object }} Validation result.
 */
export function validateEventInput(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    return { valid: false, errors: ['Payload must be a non-null object.'], sanitized: null };
  }

  const cleanTitle = sanitizeText(payload.title || '', 120);
  if (cleanTitle.length < 3) {
    errors.push('Event title must be at least 3 characters long.');
  }

  const budget = Number(payload.totalBudget);
  if (!Number.isFinite(budget) || budget < MIN_BUDGET_INR || budget > MAX_BUDGET_INR) {
    errors.push(`Budget must be a finite number between ₹${MIN_BUDGET_INR} and ₹${MAX_BUDGET_INR}.`);
  }

  const guests = Number(payload.guestCount);
  if (!Number.isInteger(guests) || guests < MIN_GUEST_CAPACITY || guests > MAX_GUEST_CAPACITY) {
    errors.push(`Guest count must be an integer between ${MIN_GUEST_CAPACITY} and ${MAX_GUEST_CAPACITY}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      title: escapeHTML(cleanTitle),
      totalBudget: Number.isFinite(budget) ? Math.round(budget) : MIN_BUDGET_INR,
      guestCount: Number.isFinite(guests) ? Math.round(guests) : MIN_GUEST_CAPACITY
    }
  };
}

/**
 * Validates Google Gemini API key format without logging or exposing the raw key.
 * @param {string} apiKey - Candidate API key string.
 * @returns {boolean} True if key matches expected structure.
 */
export function validateGeminiKeyFormat(apiKey) {
  if (typeof apiKey !== 'string') {
    return false;
  }
  const trimmed = apiKey.trim();
  return /^AIza[0-9A-Za-z_-]{31,45}$/.test(trimmed);
}

/**
 * Masks an API key for safe UI display (e.g. "AIza••••••9xQ2").
 * @param {string} apiKey - Raw API key.
 * @returns {string} Masked representation.
 */
export function maskApiKey(apiKey) {
  if (typeof apiKey !== 'string' || apiKey.trim().length < 8) {
    return 'Not Configured';
  }
  const clean = apiKey.trim();
  return `${clean.slice(0, 4)}••••••••${clean.slice(-4)}`;
}

/**
 * Sliding-window rate limiter to protect AI and export endpoints from abuse.
 */
export class RateLimiter {
  /**
   * @param {number} [maxRequests=12] - Max allowed calls within window.
   * @param {number} [windowMs=60000] - Window duration in milliseconds.
   */
  constructor(
    maxRequests = RATE_LIMIT_CONFIG.maxRequestsPerMinute,
    windowMs = RATE_LIMIT_CONFIG.windowMs
  ) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    /** @type {number[]} */
    this.timestamps = [];
  }

  /**
   * Checks if a new action is permitted and records its timestamp.
   * @param {number} [now=Date.now()] - Current epoch timestamp.
   * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
   */
  tryAcquire(now = Date.now()) {
    const cutoff = now - this.windowMs;
    this.timestamps = this.timestamps.filter((t) => t > cutoff);

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0];
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: Math.max(0, oldest + this.windowMs - now)
      };
    }

    this.timestamps.push(now);
    return {
      allowed: true,
      remaining: this.maxRequests - this.timestamps.length,
      retryAfterMs: 0
    };
  }

  /**
   * Resets recorded timestamps.
   */
  reset() {
    this.timestamps = [];
  }
}
