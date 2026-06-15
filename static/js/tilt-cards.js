/* ============================================================
   tilt-cards.js — Vanilla Tilt Card Effects
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  if (typeof VanillaTilt === 'undefined') return;

  // Do not initialise on touch devices
  if ('ontouchstart' in window) return;

  var cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  VanillaTilt.init(Array.from(cards), {
    max: 15,
    speed: 400,
    glare: true,
    'max-glare': 0.2,
    scale: 1.05
  });
})();
