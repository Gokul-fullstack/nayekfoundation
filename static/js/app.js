/* ============================================================
   app.js — Main Application Controller
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Theme: Dark / Light toggle
     ---------------------------------------------------------- */
  function initTheme() {
    const saved = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);

    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;

    function updateIcon() {
      const current = document.documentElement.getAttribute('data-theme');
      btn.textContent = current === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
    updateIcon();

    btn.addEventListener('click', function () {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon();
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: next } }));
    });
  }

  /* ----------------------------------------------------------
     Scroll Progress Bar
     ---------------------------------------------------------- */
  function initScrollProgress() {
    const bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ----------------------------------------------------------
     Back-to-Top Button
     ---------------------------------------------------------- */
  function initBackToTop() {
    const btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     Navbar: scrolled class on scroll
     ---------------------------------------------------------- */
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Check if we are on a page that should always have a solid navbar
    const alwaysSolidPaths = ['/register', '/login', '/dashboard', '/admin'];
    const isAlwaysSolid = alwaysSolidPaths.some(path => window.location.pathname.endsWith(path));

    if (isAlwaysSolid) {
      navbar.classList.add('scrolled', 'navbar-solid');
      return;
    }

    function check() {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ----------------------------------------------------------
     Smooth Scroll for anchor links
     ---------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        const id = this.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close mobile nav if open
        var navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
        var toggle = document.querySelector('.nav-toggle');
        if (toggle) toggle.classList.remove('active');
      });
    });
  }

  /* ----------------------------------------------------------
     Scroll-Spy: highlight active nav link
     ---------------------------------------------------------- */
  function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!sections.length || !navLinksAll.length) return;

    function onScroll() {
      const scrollY = window.scrollY + 120;
      let currentId = '';

      sections.forEach(function (section) {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          currentId = section.getAttribute('id');
        }
      });

      navLinksAll.forEach(function (link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentId) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------
     Mobile Navigation Toggle
     ---------------------------------------------------------- */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
      document.body.classList.toggle('nav-open');
      toggle.classList.toggle('active');
    });

    // Close on clicking outside
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
        toggle.classList.remove('active');
      }
    });
  }

  /* ----------------------------------------------------------
     Page Loader
     ---------------------------------------------------------- */
  function initPageLoader() {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;

    window.addEventListener('load', function () {
      loader.classList.add('loaded');
      setTimeout(function () {
        loader.style.display = 'none';
      }, 600);
    });
  }

  /* ----------------------------------------------------------
     Toast Notification System
     ---------------------------------------------------------- */
  function initToastSystem() {
    // Create container if missing
    var container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    window.showToast = function (message, type) {
      type = type || 'info';

      var icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
      };

      var toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.innerHTML =
        '<span class="toast-icon">' + (icons[type] || icons.info) + '</span>' +
        '<span class="toast-message">' + message + '</span>' +
        '<button class="toast-close" aria-label="Close">&times;</button>';

      container.appendChild(toast);

      // Trigger reflow then add visible class for animation
      toast.offsetHeight; // eslint-disable-line no-unused-expressions
      toast.classList.add('toast-visible');

      var timer = setTimeout(function () {
        removeToast(toast);
      }, 3000);

      toast.querySelector('.toast-close').addEventListener('click', function () {
        clearTimeout(timer);
        removeToast(toast);
      });
    };

    function removeToast(toast) {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-exit');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }
  }

  /* ----------------------------------------------------------
     Navbar Auth Injection
     ---------------------------------------------------------- */
  function updateNavbarAuth() {
    var token = localStorage.getItem('token');
    var role = localStorage.getItem('role');
    var navLinks = document.getElementById('navLinks');
    if (!navLinks) return;

    if (token) {
      var ctaLi = navLinks.querySelector('li:last-child');
      if (ctaLi) {
        var dashboardUrl = role === 'admin' ? '/admin' : '/dashboard';
        var dashboardText = role === 'admin' ? 'Admin Panel' : 'Dashboard';
        
        ctaLi.innerHTML =
          '<div style="display: flex; gap: 0.5rem; align-items: center;">' +
            '<a href="' + dashboardUrl + '" class="btn btn-primary btn-sm nav-cta">' + dashboardText + '</a>' +
            '<a href="#" class="btn btn-secondary btn-sm btn-logout" data-action="logout">Sign Out</a>' +
          '</div>';
      }

      // Attach click handlers to any logout buttons (navbar or page body)
      document.querySelectorAll('.btn-logout, [data-action="logout"]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/login';
        });
      });
    }
  }

  /* ----------------------------------------------------------
     DOMContentLoaded — bootstrap everything
     ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initScrollProgress();
    initBackToTop();
    initNavbarScroll();
    initSmoothScroll();
    initScrollSpy();
    initMobileNav();
    initPageLoader();
    initToastSystem();
    updateNavbarAuth();
  });
})();
