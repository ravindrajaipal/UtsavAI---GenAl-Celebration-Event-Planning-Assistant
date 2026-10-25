'use strict';

/**
 * @fileoverview Master Timeline & Run-of-Show Engine with critical-path tracking,
 * conflict detection, and RFC 5545 (.ics) calendar export generation.
 * @module modules/timelineEngine
 */

import { escapeHTML } from '../utils/security.js';

/**
 * Calculates timeline completion metrics and identifies critical-path bottlenecks.
 * @param {Array<Object>} tasks - List of timeline tasks.
 * @returns {{ total: number, completed: number, inProgress: number, pending: number, completionPct: number, criticalPending: number }}
 */
export function analyzeTimelineProgress(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { total: 0, completed: 0, inProgress: 0, pending: 0, completionPct: 0, criticalPending: 0 };
  }

  let completed = 0;
  let inProgress = 0;
  let pending = 0;
  let criticalPending = 0;

  for (const item of tasks) {
    if (item.status === 'completed') {
      completed += 1;
    } else if (item.status === 'in-progress') {
      inProgress += 1;
    } else {
      pending += 1;
      if (item.critical) {
        criticalPending += 1;
      }
    }
  }

  const completionPct = Math.round(((completed + inProgress * 0.5) / tasks.length) * 100);
  return {
    total: tasks.length,
    completed,
    inProgress,
    pending,
    completionPct,
    criticalPending
  };
}

/**
 * Detects duplicate time slots in Event Day tasks to prevent operational collisions.
 * @param {Array<Object>} tasks - List of timeline items.
 * @returns {Array<{ time: string, conflictingTasks: string[] }>}
 */
export function detectScheduleConflicts(tasks) {
  if (!Array.isArray(tasks)) {
    return [];
  }
  const slotMap = new Map();
  for (const t of tasks) {
    const key = `${t.phase || 'Event Day'}__${t.time || 'TBD'}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, []);
    }
    slotMap.get(key).push(escapeHTML(t.task));
  }

  const conflicts = [];
  for (const [key, list] of slotMap.entries()) {
    if (list.length > 1) {
      const [, time] = key.split('__');
      conflicts.push({ time, conflictingTasks: list });
    }
  }
  return conflicts;
}

/**
 * Generates an RFC 5545 compliant iCalendar (.ics) string for the event schedule.
 * @param {Object} event - Event metadata and timeline array.
 * @returns {string} Valid .ics calendar payload.
 */
export function exportToICSFormat(event) {
  const safeTitle = (event?.title || 'UtsavAI Celebration').replace(/[\r\n,;]/g, ' ');
  const safeVenue = (event?.venue || 'Jaipur Venue').replace(/[\r\n,;]/g, ' ');
  const dateCompact = (event?.date || '2026-12-12').replace(/-/g, '');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UtsavAI Pro v3.0//PromptWars Challenge 5//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:utsavai-${dateCompact}@promptwars.google`,
    `DTSTAMP:${dateCompact}T090000Z`,
    `DTSTART:${dateCompact}T100000Z`,
    `DTEND:${dateCompact}T220000Z`,
    `SUMMARY:${safeTitle}`,
    `LOCATION:${safeVenue}`,
    `DESCRIPTION:Managed by UtsavAI Pro v3.0 | Guests: ${event?.guestCount || 100}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\r\n');
}
