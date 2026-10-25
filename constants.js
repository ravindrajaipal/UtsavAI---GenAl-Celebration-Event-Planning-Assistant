'use strict';

/**
 * @fileoverview Immutable application constants, event archetype presets,
 * budget allocation matrices, dietary ratios, and security/accessibility thresholds.
 * @module config/constants
 */

/** @constant {number} DEFAULT_CONTINGENCY_RATE - Mandatory 10% emergency reserve */
export const DEFAULT_CONTINGENCY_RATE = 0.10;

/** @constant {number} AI_OPTIMIZATION_SAVINGS_RATE - Target 15% AI cost optimization */
export const AI_OPTIMIZATION_SAVINGS_RATE = 0.15;

/** @constant {number} GST_TAX_RATE - Standard 18% hospitality & event services GST */
export const GST_TAX_RATE = 0.18;

/** @constant {number} MAX_GUEST_CAPACITY - Upper bound for guest validation */
export const MAX_GUEST_CAPACITY = 10000;

/** @constant {number} MIN_GUEST_CAPACITY - Lower bound for guest validation */
export const MIN_GUEST_CAPACITY = 10;

/** @constant {number} MAX_BUDGET_INR - Upper bound for budget validation (10 Crore INR) */
export const MAX_BUDGET_INR = 100000000;

/** @constant {number} MIN_BUDGET_INR - Lower bound for budget validation */
export const MIN_BUDGET_INR = 10000;

/** @constant {Object} RATE_LIMIT_CONFIG - Token bucket rate limiting parameters */
export const RATE_LIMIT_CONFIG = Object.freeze({
  maxRequestsPerMinute: 12,
  windowMs: 60000,
  maxPromptLength: 600
});

/** @constant {Object} EVENT_SCENARIOS - Pre-configured Challenge 5 celebration templates */
export const EVENT_SCENARIOS = Object.freeze({
  wedding: Object.freeze({
    id: 'wedding',
    title: 'Royal Jaipur Palace Wedding',
    category: 'Wedding',
    subtitle: '3-Day Heritage Celebration • Rambagh & Nahargarh Courtyard',
    date: '2026-12-12',
    venue: 'Jaipur Heritage Palace Lawns, Rajasthan',
    theme: 'Regal Marigold, Emerald Velvet & Brass Lanterns',
    totalBudget: 2500000,
    guestCount: 350,
    contingencyPercent: 10,
    splits: Object.freeze({
      venueCatering: 42,
      decorLighting: 22,
      entertainmentAV: 14,
      photographyMedia: 12,
      logisticsHospitality: 10
    }),
    dietarySplit: Object.freeze({
      pureVeg: 50,
      jainSpecial: 25,
      veganGF: 15,
      kidsMenu: 10
    }),
    subFunctions: Object.freeze([
      { id: 'sf-1', name: 'Mehendi & Folk Carnival', time: 'Day 1 • 11:00 AM', dressCode: 'Lime & Mustard Bandhani', sharePct: 18 },
      { id: 'sf-2', name: 'Sufi Sangeet & Royal Dinner', time: 'Day 1 • 07:30 PM', dressCode: 'Indo-Western Sequins & Velvet', sharePct: 32 },
      { id: 'sf-3', name: 'Haldi Courtyard Splash', time: 'Day 2 • 10:00 AM', dressCode: 'Sunlit Marigold Cotton', sharePct: 12 },
      { id: 'sf-4', name: 'Royal Baraat, Pheras & Grand Reception', time: 'Day 2 • 05:30 PM', dressCode: 'Heritage Sabyasachi / Sherwani', sharePct: 38 }
    ]),
    timeline: Object.freeze([
      { id: 'tl-1', phase: '90 Days Out', time: '09:00 AM', task: 'Lock Heritage Palace Venue & 50% Catering Escrow', owner: 'Lead Planner', status: 'completed', critical: true },
      { id: 'tl-2', phase: '45 Days Out', time: '11:30 AM', task: 'Finalize Marigold Floral Mandap & Cold-Pyro Permits', owner: 'Decor Architect', status: 'completed', critical: true },
      { id: 'tl-3', phase: '14 Days Out', time: '02:00 PM', task: 'Confirm 350 Guest Dietary Matrix (Pure Veg / Jain / Vegan)', owner: 'F&B Director', status: 'in-progress', critical: true },
      { id: 'tl-4', phase: 'Event Day', time: '04:30 PM', task: 'Soundcheck 62.5 kVA Acoustic Backup & Vintage Baraat Procession', owner: 'AV & Logistics', status: 'pending', critical: true },
      { id: 'tl-5', phase: 'Event Day', time: '07:45 PM', task: 'Royal Varmala at Sunset Pavilion & Live Rajasthani Folk Ensemble', owner: 'Show Caller', status: 'pending', critical: false }
    ]),
    vendors: Object.freeze([
      { id: 'v-1', name: 'Rajputana Royal Banquets & Catering', category: 'Venue & Catering', quoted: 1050000, negotiated: 935000, slaVerified: true, status: 'Booked', rating: 4.9 },
      { id: 'v-2', name: 'Pushkar Floral & Heritage Decor Studio', category: 'Decor & Lighting', quoted: 550000, negotiated: 485000, slaVerified: true, status: 'Booked', rating: 4.8 },
      { id: 'v-3', name: 'Desert Symphony Sufi & Folk Collective', category: 'Entertainment & AV', quoted: 350000, negotiated: 310000, slaVerified: true, status: 'Negotiating', rating: 4.7 },
      { id: 'v-4', name: 'Cinematic Frames & Drone Storytellers', category: 'Photography & Media', quoted: 300000, negotiated: 265000, slaVerified: false, status: 'Shortlisted', rating: 4.9 }
    ]),
    ideas: Object.freeze([
      { id: 'id-1', category: 'Sustainable Decor', title: 'Upcycled Brass Urli & Potted Marigold Mandap', impact: 'Saves ₹42,000 + Zero Floral Waste', costDelta: -42000 },
      { id: 'id-2', category: 'Culinary Experience', title: 'Live Dal Baati Churma & Millet Chaat Artisan Carts', impact: '+28% Guest Engagement Score', costDelta: 25000 },
      { id: 'id-3', category: 'Guest Hospitality', title: 'QR-Based WhatsApp Concierge & Instant Shuttle Tracker', impact: 'Eliminates Check-In Queues', costDelta: 8000 }
    ])
  }),
  birthday: Object.freeze({
    id: 'birthday',
    title: '25th Silver Jubilee Neon Rooftop Gala',
    category: 'Birthday',
    subtitle: 'Evening Skyline Celebration • SkyDeck Lounge',
    date: '2026-11-21',
    venue: 'Astra SkyDeck Lounge, C-Scheme, Jaipur',
    theme: 'Cyberpunk Gold, Neon Botanicals & Vinyl Retro Lounge',
    totalBudget: 350000,
    guestCount: 90,
    contingencyPercent: 10,
    splits: Object.freeze({
      venueCatering: 45,
      decorLighting: 20,
      entertainmentAV: 18,
      photographyMedia: 10,
      logisticsHospitality: 7
    }),
    dietarySplit: Object.freeze({
      pureVeg: 45,
      jainSpecial: 15,
      veganGF: 25,
      kidsMenu: 15
    }),
    subFunctions: Object.freeze([
      { id: 'sf-b1', name: 'Golden Hour Mocktail & Acoustic Sundowner', time: '06:00 PM', dressCode: 'Smart Monochrome & Metallics', sharePct: 30 },
      { id: 'sf-b2', name: '25-Year Memory Reel & Artisanal Cake Ceremony', time: '08:30 PM', dressCode: 'Neon Glamour', sharePct: 30 },
      { id: 'sf-b3', name: 'Silent Disco & Vinyl DJ Afterparty', time: '09:45 PM', dressCode: 'LED Wristbands & Street Luxe', sharePct: 40 }
    ]),
    timeline: Object.freeze([
      { id: 'tl-b1', phase: '30 Days Out', time: '10:00 AM', task: 'Reserve Rooftop Glass House & Acoustic Curfew Permit', owner: 'Host', status: 'completed', critical: true },
      { id: 'tl-b2', phase: '10 Days Out', time: '04:00 PM', task: 'Approve Custom 3-Tier Belgian Hazelnut & Vegan Berry Cake', owner: 'Pastry Chef', status: 'completed', critical: true },
      { id: 'tl-b3', phase: 'Event Day', time: '05:30 PM', task: 'Calibrate DMX Neon Tunnel, Polaroid Booth & Mocktail Bar', owner: 'AV Crew', status: 'in-progress', critical: true },
      { id: 'tl-b4', phase: 'Event Day', time: '08:30 PM', task: 'Projector Tribute Montage & Sparkler Cake Cutting', owner: 'MC / Host', status: 'pending', critical: true }
    ]),
    vendors: Object.freeze([
      { id: 'v-b1', name: 'Astra SkyDeck Tapas & Craft Mocktail Kitchen', category: 'Venue & Catering', quoted: 157500, negotiated: 142000, slaVerified: true, status: 'Booked', rating: 4.8 },
      { id: 'v-b2', name: 'LumenGlow Neon & Acrylic Installations', category: 'Decor & Lighting', quoted: 70000, negotiated: 61000, slaVerified: true, status: 'Booked', rating: 4.7 },
      { id: 'v-b3', name: 'DJ Pulse & Silent Disco 100-Headset Rig', category: 'Entertainment & AV', quoted: 63000, negotiated: 55000, slaVerified: true, status: 'Negotiating', rating: 4.9 }
    ]),
    ideas: Object.freeze([
      { id: 'id-b1', category: 'Interactive Tech', title: 'AI Instant Caricature & QR Digital Memory Wall', impact: 'Instant Viral Reels Download', costDelta: 6500 },
      { id: 'id-b2', category: 'Budget Saver', title: 'Switch post-10 PM Open Bar to Curated Signature Pitchers', impact: 'Saves ₹24,500 on F&B', costDelta: -24500 }
    ])
  }),
  community: Object.freeze({
    id: 'community',
    title: 'Jaipur Indie Makers & GenAI Community Summit',
    category: 'Community Event',
    subtitle: 'Full-Day Developer & Cultural Innovation Fest',
    date: '2026-11-28',
    venue: 'Bhamashah Techno Hub Auditorium, Jaipur',
    theme: 'Open-Source Bauhaus, Sustainable Kraft & Live Demo Pods',
    totalBudget: 600000,
    guestCount: 500,
    contingencyPercent: 10,
    splits: Object.freeze({
      venueCatering: 38,
      decorLighting: 14,
      entertainmentAV: 24,
      photographyMedia: 12,
      logisticsHospitality: 12
    }),
    dietarySplit: Object.freeze({
      pureVeg: 55,
      jainSpecial: 20,
      veganGF: 20,
      kidsMenu: 5
    }),
    subFunctions: Object.freeze([
      { id: 'sf-c1', name: 'Keynote Arena & Live GenAI Prompt Battle', time: '09:30 AM', dressCode: 'Community Tees & Smart Casual', sharePct: 35 },
      { id: 'sf-c2', name: 'Networking High-Tea & 24 Indie Maker Demo Booths', time: '01:00 PM', dressCode: 'Smart Casual', sharePct: 35 },
      { id: 'sf-c3', name: 'Lightning Demos, Jury Awards & Acoustic Jam', time: '04:30 PM', dressCode: 'Hackathon Hoodies', sharePct: 30 }
    ]),
    timeline: Object.freeze([
      { id: 'tl-c1', phase: '45 Days Out', time: '09:00 AM', task: 'Confirm Auditorium, Dual 1Gbps Fiber Lines & Sponsor Booths', owner: 'Community Lead', status: 'completed', critical: true },
      { id: 'tl-c2', phase: '15 Days Out', time: '12:00 PM', task: 'Lock 500 Zero-Plastic Boxed Lunches & Specialty Cold Brew', owner: 'Ops Lead', status: 'completed', critical: true },
      { id: 'tl-c3', phase: 'Event Day', time: '08:15 AM', task: 'Open QR Fast-Track Badge Kiosks & Test Stage HDMI Matrix', owner: 'Volunteer Core', status: 'in-progress', critical: true },
      { id: 'tl-c4', phase: 'Event Day', time: '04:30 PM', task: 'Top-10 Live Demo Pitch Finale & Automated Certificate Dispatch', owner: 'Jury Chair', status: 'pending', critical: true }
    ]),
    vendors: Object.freeze([
      { id: 'v-c1', name: 'GreenPlate Sustainable Boxed Catering & Coffee Bar', category: 'Venue & Catering', quoted: 228000, negotiated: 198000, slaVerified: true, status: 'Booked', rating: 4.9 },
      { id: 'v-c2', name: 'ProStage LED Wall & Dual-Stream Broadcast Rig', category: 'Entertainment & AV', quoted: 144000, negotiated: 128000, slaVerified: true, status: 'Booked', rating: 4.8 },
      { id: 'v-c3', name: 'EcoBadge Recycled Seed-Paper Lanyards & Swag', category: 'Logistics & Hospitality', quoted: 72000, negotiated: 62000, slaVerified: true, status: 'Booked', rating: 4.8 }
    ]),
    ideas: Object.freeze([
      { id: 'id-c1', category: 'Zero-Waste Ops', title: 'Plantable Seed-Paper Badges + Refillable Steel Flask Stations', impact: 'Eliminates 1,500 Plastic Bottles', costDelta: -12000 },
      { id: 'id-c2', category: 'Engagement', title: 'Live QR Audience Voting & Real-Time Leaderboard Screen', impact: '94% Attendee Participation', costDelta: 5000 }
    ])
  })
});
