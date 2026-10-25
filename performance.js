'use strict';

/**
 * @fileoverview High-efficiency performance utilities including bounded LRU memoization,
 * debounce, throttle, and telemetry tracking for 60fps UI responsiveness.
 * @module utils/performance
 */

/**
 * Creates a bounded LRU-memoized version of a pure function.
 * @template T
 * @param {(...args: any[]) => T} fn - Pure computation function.
 * @param {number} [maxCacheSize=128] - Maximum entries retained in cache.
 * @returns {((...args: any[]) => T) & { getStats: () => { hits: number, misses: number, size: number }, clear: () => void }}
 */
export function memoize(fn, maxCacheSize = 128) {
  const cache = new Map();
  let hits = 0;
  let misses = 0;

  const memoized = function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      hits += 1;
      const val = cache.get(key);
      // Refresh LRU order
      cache.delete(key);
      cache.set(key, val);
      return val;
    }

    misses += 1;
    const result = fn.apply(this, args);
    if (cache.size >= maxCacheSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    cache.set(key, result);
    return result;
  };

  memoized.getStats = () => ({
    hits,
    misses,
    size: cache.size,
    hitRatePercent: hits + misses === 0 ? 100 : Math.round((hits / (hits + misses)) * 100)
  });

  memoized.clear = () => {
    cache.clear();
    hits = 0;
    misses = 0;
  };

  return memoized;
}

/**
 * Delays invoking `fn` until after `waitMs` milliseconds have elapsed since the last call.
 * @param {Function} fn - Callback to debounce.
 * @param {number} [waitMs=120] - Delay in milliseconds.
 * @returns {Function & { cancel: () => void }}
 */
export function debounce(fn, waitMs = 120) {
  let timerId = null;

  const debounced = function (...args) {
    if (timerId !== null) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      timerId = null;
      fn.apply(this, args);
    }, waitMs);
  };

  debounced.cancel = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  };

  return debounced;
}

/**
 * Throttles execution of `fn` to at most once every `limitMs` milliseconds.
 * @param {Function} fn - Callback to throttle.
 * @param {number} [limitMs=100] - Minimum interval in ms.
 * @returns {Function}
 */
export function throttle(fn, limitMs = 100) {
  let inThrottle = false;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limitMs);
    }
  };
}
