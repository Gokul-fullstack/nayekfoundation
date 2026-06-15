/* ============================================================
   gsap-scroll.js — GSAP ScrollTrigger Animations
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  /* ----------------------------------------------------------
     Reveal Animations
     ---------------------------------------------------------- */
  function revealAnimation(selector, fromVars) {
    var elements = document.querySelectorAll(selector);
    elements.forEach(function (el) {
      gsap.from(el, Object.assign({}, fromVars, {
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }));
    });
  }

  revealAnimation('.reveal-up', { opacity: 0, y: 50 });
  revealAnimation('.reveal-left', { opacity: 0, x: -50 });
  revealAnimation('.reveal-right', { opacity: 0, x: 50 });
  revealAnimation('.reveal-down', { opacity: 0, y: -50 });
  revealAnimation('.reveal-scale', { opacity: 0, scale: 0.8 });

  /* ----------------------------------------------------------
     Stagger Containers
     ---------------------------------------------------------- */
  document.querySelectorAll('.stagger-container').forEach(function (container) {
    var items = container.querySelectorAll('.stagger-item');
    if (!items.length) return;

    gsap.from(items, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });

  /* ----------------------------------------------------------
     Parallax Sections
     ---------------------------------------------------------- */
  document.querySelectorAll('.parallax-section').forEach(function (section) {
    var bg = section.querySelector('.parallax-bg');
    if (!bg) return;

    gsap.to(bg, {
      yPercent: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  /* ----------------------------------------------------------
     Stats Counter Trigger
     ---------------------------------------------------------- */
  var statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    ScrollTrigger.create({
      trigger: statsSection,
      start: 'top 80%',
      onEnter: function () {
        window.dispatchEvent(new CustomEvent('startCounting'));
      },
      once: true
    });
  }

  /* ----------------------------------------------------------
     Navbar Background on Scroll (redundant safety)
     ---------------------------------------------------------- */
  var navbar = document.querySelector('.navbar');
  if (navbar) {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top -50',
      onUpdate: function (self) {
        if (self.scroll() > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    });
  }

  /* ----------------------------------------------------------
     Section Titles — subtle slide-up
     ---------------------------------------------------------- */
  document.querySelectorAll('.section-title, .section-subtitle').forEach(function (el) {
    gsap.from(el, {
      opacity: 0,
      y: 25,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none'
      }
    });
  });
})();
