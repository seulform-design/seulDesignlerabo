/**
 * LE LABO - global.js
 * Global scripts applied across all pages.
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initScrollProgress();
  initNewsletter();
  initStickySave();
});

/**
 * Sticky Save Toggle
 */
function initStickySave() {
  const stickySave = document.getElementById('sticky-save');
  if (!stickySave) return;

  stickySave.addEventListener('click', () => {
    const nextPressed = stickySave.getAttribute('aria-pressed') !== 'true';
    stickySave.setAttribute('aria-pressed', String(nextPressed));
    stickySave.textContent = nextPressed ? 'SAVED' : 'SAVE';
    stickySave.setAttribute(
      'aria-label',
      nextPressed ? '위시리스트에서 제거' : '위시리스트에 저장'
    );
  });
}

/**
 * Newsletter Form Submission
 */
function initNewsletter() {
  const newsletterForm = document.querySelector('.footer-news-form');
  if (!newsletterForm) return;

  newsletterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = newsletterForm.querySelector('input[type="email"]');
    const submit = newsletterForm.querySelector('button[type="submit"]');
    const value = input?.value.trim();

    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      input?.focus();
      return;
    }

    if (submit) {
      const originalText = submit.textContent;
      submit.textContent = 'Subscribed ✓';
      submit.disabled = true;
      input.value = '';
      window.setTimeout(() => {
        submit.textContent = originalText;
        submit.disabled = false;
      }, 2400);
    }
  });
}

/**
 * Scroll Progress Bar
 */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const windowScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (windowScroll / height) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

/**
 * Intersection Observer for .fade-up elements
 * Adds 'is-visible' class when elements enter the viewport.
 * Content is visible by default — the observer provides progressive enhancement.
 */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-up');
  if (fadeElements.length === 0) return;

  // Respect user motion preference: don't hide content at all.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    fadeElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  // Turn on the "hidden until revealed" starting state only now that JS is alive.
  document.documentElement.classList.add('js-animations');

  // Any element already in the viewport on load should reveal immediately.
  const revealIfVisible = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-visible');
      return true;
    }
    return false;
  };

  if (!('IntersectionObserver' in window)) {
    fadeElements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  fadeElements.forEach(el => {
    if (!revealIfVisible(el)) observer.observe(el);
  });

  // Final safety net — if anything is still hidden after 2s, reveal it.
  setTimeout(() => {
    document.querySelectorAll('.fade-up:not(.is-visible)').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.5) el.classList.add('is-visible');
    });
  }, 2000);
}
