'use strict';

/**
 * @fileoverview Accessible SVG Invitation Card Renderer & Bilingual Copy Engine.
 * @module modules/inviteEngine
 */

import { escapeHTML } from '../utils/security.js';

/**
 * Builds a WCAG-compliant SVG invitation card with <title>, <desc>, and role="img".
 * @param {Object} event - Event metadata.
 * @param {string} [customMessage=''] - Custom host note.
 * @returns {string} Accessible SVG markup string.
 */
export function generateAccessibleInviteSVG(event, customMessage = '') {
  const title = escapeHTML(event?.title || 'Royal Celebration');
  const subtitle = escapeHTML(event?.subtitle || 'A Joyous Gathering');
  const date = escapeHTML(event?.date || '2026-12-12');
  const venue = escapeHTML(event?.venue || 'Jaipur Heritage Venue');
  const theme = escapeHTML(event?.theme || 'Festive Elegance');
  const note = escapeHTML(customMessage || 'Your presence and blessings are our greatest joy.');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" role="img" aria-labelledby="invite-svg-title invite-svg-desc">
  <title id="invite-svg-title">Official Invitation: ${title}</title>
  <desc id="invite-svg-desc">Invitation card for ${title} on ${date} at ${venue}. Theme: ${theme}.</desc>
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="55%" stop-color="#311042"/>
      <stop offset="100%" stop-color="#451a03"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fde68a"/>
    </linearGradient>
  </defs>
  <rect width="600" height="380" rx="20" fill="url(#bgGrad)"/>
  <rect x="16" y="16" width="568" height="348" rx="14" fill="none" stroke="url(#goldGrad)" stroke-width="2" stroke-dasharray="8 4"/>
  <rect x="26" y="26" width="548" height="328" rx="10" fill="none" stroke="#f59e0b" stroke-opacity="0.35" stroke-width="1"/>
  <text x="300" y="68" text-anchor="middle" fill="#fde68a" font-family="Georgia, serif" font-size="13" letter-spacing="3">✨ SHUBH NIMANTRAN • CORDIAL INVITATION ✨</text>
  <text x="300" y="118" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="25" font-weight="bold">${title}</text>
  <text x="300" y="148" text-anchor="middle" fill="#fcd34d" font-family="sans-serif" font-size="13">${subtitle}</text>
  <line x1="160" y1="168" x2="440" y2="168" stroke="url(#goldGrad)" stroke-width="1.5"/>
  <text x="300" y="202" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="15" font-weight="bold">📅 Date: ${date}</text>
  <text x="300" y="232" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="14">📍 Venue: ${venue}</text>
  <text x="300" y="262" text-anchor="middle" fill="#fde68a" font-family="sans-serif" font-size="12">🎨 Dress &amp; Theme: ${theme}</text>
  <text x="300" y="302" text-anchor="middle" fill="#cbd5e1" font-family="Georgia, serif" font-style="italic" font-size="13">"${note}"</text>
  <text x="300" y="338" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="11">Generated via UtsavAI Pro v3.0 • Instant RSVP Enabled</text>
</svg>`;
}

/**
 * Generates bilingual (English + Hindi) WhatsApp/Email invitation copy.
 * @param {Object} event - Event configuration.
 * @returns {{ englishCopy: string, hindiCopy: string }}
 */
export function generateBilingualInviteCopy(event) {
  const title = escapeHTML(event?.title || 'Celebration');
  const date = escapeHTML(event?.date || '2026-12-12');
  const venue = escapeHTML(event?.venue || 'Jaipur');
  const theme = escapeHTML(event?.theme || 'Festive');

  return {
    englishCopy: `✨ You're Cordially Invited to ${title}! ✨\n📅 Date: ${date}\n📍 Venue: ${venue}\n👗 Theme & Dress Code: ${theme}\nKindly confirm your RSVP & dietary preference (Pure Veg / Jain / Vegan) via our UtsavAI digital pass.`,
    hindiCopy: `🙏 स्नेहिल निमंत्रण: ${title} 🙏\n📅 दिनांक: ${date}\n📍 स्थान: ${venue}\n🎨 थीम: ${theme}\nकृपया पधारकर समारोह की शोभा बढ़ाएं और अपनी भोजन प्राथमिकता (Pure Veg / Jain / Vegan) RSVP लिंक पर साझा करें।`
  };
}
