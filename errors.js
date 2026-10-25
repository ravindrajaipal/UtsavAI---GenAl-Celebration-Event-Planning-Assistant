'use strict';

/**
 * @fileoverview Structured custom error classes for predictable error handling
 * and clean operational diagnostics across all UtsavAI modules.
 * @module utils/errors
 */

/**
 * Base application error with structured error code and timestamp.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description.
   * @param {string} [code='ERR_INTERNAL'] - Machine-readable error code.
   */
  constructor(message, code = 'ERR_INTERNAL') {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Thrown when user input or configuration fails boundary or schema validation.
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - Validation failure detail.
   * @param {string[]} [fields=[]] - Invalid field names.
   */
  constructor(message, fields = []) {
    super(message, 'ERR_VALIDATION');
    this.name = 'ValidationError';
    this.fields = Array.isArray(fields) ? fields : [];
  }
}

/**
 * Thrown when client-side rate limits are exceeded.
 */
export class RateLimitError extends AppError {
  /**
   * @param {number} retryAfterMs - Milliseconds until next permitted request.
   */
  constructor(retryAfterMs) {
    const seconds = Math.max(1, Math.ceil(Number(retryAfterMs || 1000) / 1000));
    super(`Rate limit exceeded. Please retry in ${seconds}s.`, 'ERR_RATE_LIMIT');
    this.name = 'RateLimitError';
    this.retryAfterMs = Number(retryAfterMs) || 1000;
  }
}
