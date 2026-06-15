/* ============================================================
   particles-config.js — tsParticles Setup
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  if (typeof tsParticles === 'undefined') return;
  if (!document.getElementById('hero-particles')) return;

  var isMobile = window.innerWidth < 768;
  var particleCount = isMobile ? 25 : 50;

  tsParticles.load('hero-particles', {
    particles: {
      number: {
        value: particleCount,
        density: {
          enable: true,
          area: 800
        }
      },
      color: {
        value: ['#FF6B35', '#FFD166', '#06D6A0']
      },
      shape: {
        type: 'circle'
      },
      opacity: {
        value: { min: 0.1, max: 0.5 },
        animation: {
          enable: true,
          speed: 1,
          sync: false
        }
      },
      size: {
        value: { min: 1, max: 3 }
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: 'none',
        random: true,
        straight: false,
        outModes: 'bounce'
      },
      links: {
        enable: true,
        distance: 150,
        color: '#FF6B35',
        opacity: 0.1,
        width: 1
      }
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab'
        },
        resize: true
      },
      modes: {
        grab: {
          distance: 200,
          links: {
            opacity: 0.3
          }
        }
      }
    },
    detectRetina: true,
    fpsLimit: 60
  }).catch(function (err) {
    console.warn('particles-config.js: tsParticles failed —', err);
  });
})();
