/* ============================================================
   gallery.js — Photo Gallery with Lightbox
   NayePankh 3D Volunteer Nexus
   ============================================================ */

(function () {
  'use strict';

  var galleryItems = document.querySelectorAll('.gallery-item');
  if (!galleryItems.length) return;

  /* ---------- Build lightbox overlay if not in DOM ---------- */
  var lightbox = document.querySelector('.lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML =
      '<div class="lightbox-overlay"></div>' +
      '<div class="lightbox-content">' +
        '<button class="lightbox-close" aria-label="Close">&times;</button>' +
        '<button class="lightbox-prev" aria-label="Previous">&#10094;</button>' +
        '<img class="lightbox-image" src="" alt="Gallery image">' +
        '<button class="lightbox-next" aria-label="Next">&#10095;</button>' +
        '<div class="lightbox-caption"></div>' +
      '</div>';
    document.body.appendChild(lightbox);
  }

  var lightboxImage = lightbox.querySelector('.lightbox-image');
  var lightboxCaption = lightbox.querySelector('.lightbox-caption');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var prevBtn = lightbox.querySelector('.lightbox-prev');
  var nextBtn = lightbox.querySelector('.lightbox-next');
  var overlay = lightbox.querySelector('.lightbox-overlay');

  var currentIndex = 0;
  var items = Array.from(galleryItems);

  /* ---------- Helpers ---------- */
  function getImageSrc(item) {
    var img = item.querySelector('img');
    return img ? (img.getAttribute('data-full') || img.src) : '';
  }

  function getCaption(item) {
    var cap = item.querySelector('.gallery-caption, figcaption');
    return cap ? cap.textContent : (item.getAttribute('data-caption') || '');
  }

  function showImage(index) {
    currentIndex = index;
    var src = getImageSrc(items[index]);
    var caption = getCaption(items[index]);

    lightboxImage.src = src;
    lightboxImage.alt = caption || 'Gallery image ' + (index + 1);
    if (lightboxCaption) lightboxCaption.textContent = caption;

    // Update button visibility
    prevBtn.style.display = index > 0 ? '' : 'none';
    nextBtn.style.display = index < items.length - 1 ? '' : 'none';
  }

  function openLightbox(index) {
    showImage(index);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function prevImage() {
    if (currentIndex > 0) {
      showImage(currentIndex - 1);
    } else {
      showImage(items.length - 1);
    }
  }

  function nextImage() {
    if (currentIndex < items.length - 1) {
      showImage(currentIndex + 1);
    } else {
      showImage(0);
    }
  }

  /* ---------- Event Listeners ---------- */
  items.forEach(function (item, idx) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      openLightbox(idx);
    });
    item.style.cursor = 'pointer';
  });

  closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', prevImage);
  nextBtn.addEventListener('click', nextImage);

  /* ---------- Keyboard Navigation ---------- */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        prevImage();
        break;
      case 'ArrowRight':
        nextImage();
        break;
    }
  });

  /* ---------- Touch swipe support ---------- */
  var touchStartX = 0;
  var touchEndX = 0;

  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  }, { passive: true });
})();
