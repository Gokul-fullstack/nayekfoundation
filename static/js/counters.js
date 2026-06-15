/* ============================================================
   counters.js — Animated Number Counters
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  /* ---------- easeOutExpo ---------- */
  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  /* ---------- Animate a single counter ---------- */
  function animateCounter(el) {
    if (el.getAttribute('data-counted') === 'true') return;
    el.setAttribute('data-counted', 'true');

    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    var duration = 2000; // ms
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var easedProgress = easeOutExpo(progress);
      var current = Math.floor(easedProgress * target);

      el.textContent = current.toLocaleString() + '+';

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString() + '+';
      }
    }

    requestAnimationFrame(step);
  }

  /* ---------- IntersectionObserver ---------- */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Also listen for GSAP-dispatched event ---------- */
  window.addEventListener('startCounting', function () {
    counters.forEach(function (el) {
      animateCounter(el);
    });
  });
})();
