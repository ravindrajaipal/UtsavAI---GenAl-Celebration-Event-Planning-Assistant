'use strict';

/**
 * @fileoverview Vendor Checklist, SLA Verification & Bilingual AI Negotiation Engine.
 * @module modules/vendorEngine
 */

import { escapeHTML } from '../utils/security.js';

/**
 * Evaluates vendor contract readiness, total savings, and SLA verification rate.
 * @param {Array<Object>} vendors - Array of vendor objects.
 * @returns {Object} Aggregated vendor metrics.
 */
export function evaluateVendorReadiness(vendors) {
  if (!Array.isArray(vendors) || vendors.length === 0) {
    return {
      totalVendors: 0,
      bookedCount: 0,
      slaVerifiedCount: 0,
      totalQuotedINR: 0,
      totalNegotiatedINR: 0,
      totalSavedINR: 0,
      readinessScorePct: 0
    };
  }

  let bookedCount = 0;
  let slaVerifiedCount = 0;
  let totalQuotedINR = 0;
  let totalNegotiatedINR = 0;

  for (const v of vendors) {
    if (v.status === 'Booked') bookedCount += 1;
    if (v.slaVerified) slaVerifiedCount += 1;
    totalQuotedINR += Number(v.quoted) || 0;
    totalNegotiatedINR += Number(v.negotiated) || 0;
  }

  const readinessScorePct = Math.round(
    ((bookedCount * 0.6 + slaVerifiedCount * 0.4) / vendors.length) * 100
  );

  return {
    totalVendors: vendors.length,
    bookedCount,
    slaVerifiedCount,
    totalQuotedINR,
    totalNegotiatedINR,
    totalSavedINR: Math.max(0, totalQuotedINR - totalNegotiatedINR),
    readinessScorePct
  };
}

/**
 * Generates a structured bilingual (English + Hindi) negotiation script for a vendor.
 * @param {Object} vendor - Vendor record.
 * @param {number} guestCount - Event guest count.
 * @returns {{ targetPriceINR: number, discountPct: number, englishScript: string, hindiScript: string }}
 */
export function generateNegotiationScript(vendor, guestCount = 200) {
  const safeName = escapeHTML(vendor?.name || 'Partner Vendor');
  const quoted = Math.max(1000, Number(vendor?.quoted) || 100000);
  const targetPriceINR = Math.round(quoted * 0.88);
  const discountPct = 12;

  return {
    targetPriceINR,
    discountPct,
    englishScript: `Hi ${safeName} Team, we love your portfolio for our ${guestCount}-guest celebration! If we lock the booking today with a 40% milestone advance and off-peak load-in window, can we close the all-inclusive package at ₹${targetPriceINR.toLocaleString('en-IN')} (${discountPct}% bundled discount) with complimentary backup coverage?`,
    hindiScript: `Namaste ${safeName} Team! Humare ${guestCount} guests ke celebration ke liye aapka kaam humein bahut pasand aaya. Agar hum aaj hi 40% advance milestone ke saath booking confirm karein, toh kya hum all-inclusive package ₹${targetPriceINR.toLocaleString('en-IN')} (${discountPct}% discount) mein final kar sakte hain?`
  };
}
