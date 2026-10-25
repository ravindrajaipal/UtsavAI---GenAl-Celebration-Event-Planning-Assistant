'use strict';

/**
 * @fileoverview 2D Venue Floorplan, Spatial Table Seating & Dietary Matrix Calculator.
 * @module modules/floorplanEngine
 */

import { memoize } from '../utils/performance.js';

/**
 * Computes exact catering plates (including 8% buffer), beverage liters, and table distribution.
 * @param {number} guestCount - Total expected guests.
 * @param {Object<string, number>} dietarySplit - Percentages for pureVeg, jainSpecial, veganGF, kidsMenu.
 * @returns {Object} Complete catering & spatial floorplan matrix.
 */
function computeDietaryAndTablesRaw(guestCount, dietarySplit) {
  const safeGuests = Math.max(10, Math.round(Number(guestCount) || 100));
  const bufferGuests = Math.ceil(safeGuests * 1.08); // 8% hospitality buffer

  const split = {
    pureVeg: Number(dietarySplit?.pureVeg ?? 50),
    jainSpecial: Number(dietarySplit?.jainSpecial ?? 25),
    veganGF: Number(dietarySplit?.veganGF ?? 15),
    kidsMenu: Number(dietarySplit?.kidsMenu ?? 10)
  };

  const plates = {
    pureVeg: Math.round((bufferGuests * split.pureVeg) / 100),
    jainSpecial: Math.round((bufferGuests * split.jainSpecial) / 100),
    veganGF: Math.round((bufferGuests * split.veganGF) / 100),
    kidsMenu: Math.round((bufferGuests * split.kidsMenu) / 100)
  };

  const zones = [
    { id: 'T1', name: 'VIP Family & Elders Front Lounge', share: 0.16, wheelchairAccessible: true, dietaryTag: 'Jain & Pure Veg Priority' },
    { id: 'T2', name: 'Bride & Groom / Host Inner Circle', share: 0.18, wheelchairAccessible: true, dietaryTag: 'All-Diet Curated Platter' },
    { id: 'T3', name: 'Friends & Colleagues Central Deck', share: 0.20, wheelchairAccessible: true, dietaryTag: 'Pure Veg & Vegan Fusion' },
    { id: 'T4', name: 'Outstation Guests & Dignitaries', share: 0.16, wheelchairAccessible: true, dietaryTag: 'Traditional Thali & Jain' },
    { id: 'T5', name: 'Interactive Live-Counter Patio', share: 0.16, wheelchairAccessible: false, dietaryTag: 'Millet, Vegan & Chaat Bar' },
    { id: 'T6', name: 'Kids & Family Acoustic Zone', share: 0.14, wheelchairAccessible: true, dietaryTag: 'Low-Spice & Kids Special' }
  ].map((z) => {
    const capacity = Math.max(8, Math.ceil((safeGuests * z.share) / 8) * 8);
    const seated = Math.min(capacity, Math.round(safeGuests * z.share));
    return {
      ...z,
      capacity,
      seated,
      occupancyPct: Math.round((seated / capacity) * 100)
    };
  });

  return {
    guestCount: safeGuests,
    bufferedPlatesTotal: bufferGuests,
    plates,
    welcomeMocktailsLiters: Math.ceil(safeGuests * 0.45),
    hydrationWaterLiters: Math.ceil(safeGuests * 1.2),
    accessibleZonesCount: zones.filter((z) => z.wheelchairAccessible).length,
    zones
  };
}

/**
 * Memoized 2D floorplan & dietary matrix calculator.
 */
export const calculateDietaryMatrix = memoize(computeDietaryAndTablesRaw, 64);
