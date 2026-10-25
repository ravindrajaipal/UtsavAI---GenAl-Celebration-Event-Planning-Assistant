'use strict';

/**
 * @fileoverview Pure functional Smart Budget Engine with memoized calculations,
 * 15% AI cost optimization, contingency reserve lock, and GST breakdown.
 * @module modules/budgetEngine
 */

import {
  DEFAULT_CONTINGENCY_RATE,
  AI_OPTIMIZATION_SAVINGS_RATE,
  GST_TAX_RATE
} from '../config/constants.js';
import { memoize } from '../utils/performance.js';

/**
 * Computes full budget allocation across 5 core event pillars plus reserve & GST.
 * @param {number} totalBudget - Total gross budget in INR.
 * @param {number} guestCount - Total expected guests.
 * @param {Object<string, number>} splits - Percentage split object summing to 100.
 * @param {boolean} [aiOptimized=false] - Whether 15% AI optimization is active.
 * @returns {Object} Structured financial breakdown.
 */
function computeBudgetBreakdownRaw(totalBudget, guestCount, splits, aiOptimized = false) {
  const safeBudget = Math.max(10000, Number(totalBudget) || 100000);
  const safeGuests = Math.max(1, Math.round(Number(guestCount) || 50));
  const contingencyPool = Math.round(safeBudget * DEFAULT_CONTINGENCY_RATE);
  const allocatablePool = safeBudget - contingencyPool;

  const optimizationMultiplier = aiOptimized ? 1 - AI_OPTIMIZATION_SAVINGS_RATE : 1;

  const categories = Object.entries(splits || {}).map(([key, pct]) => {
    const shareRatio = Math.max(0, Number(pct) || 0) / 100;
    const plannedINR = Math.round(allocatablePool * shareRatio);
    const actualINR = Math.round(plannedINR * optimizationMultiplier);
    const savedINR = plannedINR - actualINR;
    return {
      key,
      percent: Number(pct) || 0,
      plannedINR,
      actualINR,
      savedINR,
      perGuestINR: Math.round(actualINR / safeGuests)
    };
  });

  const totalPlannedAllocated = categories.reduce((sum, item) => sum + item.plannedINR, 0);
  const totalActualAllocated = categories.reduce((sum, item) => sum + item.actualINR, 0);
  const totalAiSavings = categories.reduce((sum, item) => sum + item.savedINR, 0);
  const estimatedGstINR = Math.round(totalActualAllocated * GST_TAX_RATE);

  return {
    grossBudgetINR: safeBudget,
    guestCount: safeGuests,
    contingencyReserveINR: contingencyPool,
    allocatablePoolINR: allocatablePool,
    totalPlannedINR: totalPlannedAllocated,
    totalActualINR: totalActualAllocated,
    totalAiSavingsINR: totalAiSavings,
    estimatedGstINR,
    netPerGuestINR: Math.round((totalActualAllocated + contingencyPool) / safeGuests),
    aiOptimized: Boolean(aiOptimized),
    categories
  };
}

/**
 * Memoized budget breakdown calculator for O(1) repeated lookups.
 */
export const calculateBudgetBreakdown = memoize(computeBudgetBreakdownRaw, 64);

/**
 * Generates actionable AI budget optimization recommendations per category.
 * @param {Object} breakdown - Output from calculateBudgetBreakdown.
 * @returns {Array<{ category: string, savingsINR: number, tactic: string }>}
 */
export function generateAiSavingsPlan(breakdown) {
  if (!breakdown || !Array.isArray(breakdown.categories)) {
    return [];
  }
  const tacticsMap = {
    venueCatering: 'Lock seasonal local produce menu & pre-negotiate 90% guaranteed plate floor',
    decorLighting: 'Swap imported cut florals for reusable brass urlis, marigold drapes & warm DMX LEDs',
    entertainmentAV: 'Bundle stage acoustics, lighting truss, and power backup with a single tier-1 vendor',
    photographyMedia: 'Select focused 2-camera cinema crew + cloud gallery over redundant print albums',
    logisticsHospitality: 'Consolidate hotel shuttle wave timings with QR WhatsApp boarding passes'
  };

  return breakdown.categories.map((cat) => ({
    category: cat.key,
    savingsINR: Math.round(cat.plannedINR * AI_OPTIMIZATION_SAVINGS_RATE),
    tactic: tacticsMap[cat.key] || 'Apply bulk milestone contract discount'
  }));
}
