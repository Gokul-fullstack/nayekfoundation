/* ============================================================
   typed-hero.js — Typed.js Typewriter Effect
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  if (typeof Typed === 'undefined') return;
  if (!document.getElementById('typed-output')) return;

  new Typed('#typed-output', {
    strings: [
      'Giving Wings to Every Dream',
      'Empowering Youth, Transforming Communities',
      '200,000+ Lives Impacted Across India',
      'Join India\'s Largest Student-Led Movement'
    ],
    typeSpeed: 50,
    backSpeed: 30,
    backDelay: 2000,
    loop: true,
    showCursor: true,
    cursorChar: '|'
  });
})();
