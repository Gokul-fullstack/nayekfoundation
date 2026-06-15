/* ============================================================
   cursor.js — Custom Animated Cursor
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  // Only on devices with a fine pointer (mouse)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  /* ---------- Create cursor element ---------- */
  var cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);

  /* ---------- State ---------- */
  var mouseX = 0;
  var mouseY = 0;
  var cursorX = 0;
  var cursorY = 0;
  var visible = false;
  var lerpFactor = 0.15;

  /* ---------- Mouse tracking ---------- */
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      cursor.style.opacity = '1';
    }
  });

  document.addEventListener('mouseleave', function () {
    visible = false;
    cursor.style.opacity = '0';
  });

  document.addEventListener('mouseenter', function () {
    visible = true;
    cursor.style.opacity = '1';
  });

  /* ---------- Smooth follow loop ---------- */
  function updateCursor() {
    cursorX += (mouseX - cursorX) * lerpFactor;
    cursorY += (mouseY - cursorY) * lerpFactor;

    cursor.style.transform = 'translate(' + cursorX + 'px, ' + cursorY + 'px) translate(-50%, -50%)';

    requestAnimationFrame(updateCursor);
  }

  requestAnimationFrame(updateCursor);

  /* ---------- Hover detection ---------- */
  var hoverSelectors = 'a, button, .btn, input, textarea, select, .gallery-item, .tilt-card, [role="button"]';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(hoverSelectors)) {
      cursor.classList.add('hover');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(hoverSelectors)) {
      cursor.classList.remove('hover');
    }
  });

  /* ---------- Click effect ---------- */
  document.addEventListener('mousedown', function () {
    cursor.classList.add('click');
  });

  document.addEventListener('mouseup', function () {
    cursor.classList.remove('click');
  });
})();
