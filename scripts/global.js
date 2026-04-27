/**
 * LE LABO - global.js
 * Global scripts applied across all pages.
 */

document.addEventListener('DOMContentLoaded', () => {
  optimizeImages();
  initScrollAnimations();
  initScrollProgress();
  initStickySave();
  runQaChecks();
});

/**
 * Sticky Save Toggle
 */
function initStickySave() {
  const stickySave = document.getElementById('sticky-save');
  if (!stickySave || stickySave.dataset.bound === 'true') return;
  stickySave.dataset.bound = 'true';

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
 * Scroll Progress Bar
 */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;

  let ticking = false;
  const updateProgress = () => {
    const windowScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (windowScroll / height) * 100 : 0;
    progressBar.style.width = `${Math.max(0, Math.min(100, scrolled))}%`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }, { passive: true });

  updateProgress();
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

/**
 * Image Optimization Pass
 * - Keeps hero/above-the-fold media eager
 * - Applies lazy loading and async decoding by default
 * - Prevents layout shift for non-decorative content images with unknown dimensions
 */
function optimizeImages() {
  const images = document.querySelectorAll('img');
  if (!images.length) return;

  images.forEach((img) => {
    const inHero = !!img.closest('.hero, .detail-hero, .login-visual');
    const isThumb = img.classList.contains('order-item-thumb') || img.classList.contains('checkout-item-thumb');

    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }

    if (!img.hasAttribute('loading') && !inHero) {
      img.setAttribute('loading', 'lazy');
    }

    if (!img.hasAttribute('fetchpriority') && inHero) {
      img.setAttribute('fetchpriority', 'high');
    }

    // Keep utility thumbs decorative when empty-alt is intentional.
    if (isThumb && img.getAttribute('alt') === '') return;
  });
}

/**
 * QA Runtime Checks (opt-in)
 * Enable via URL: ?qa=1
 * - Missing alt on images
 * - Placeholder links (#, javascript:)
 * - Buttons without accessible names
 */
function runQaChecks() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('qa') !== '1') return;

  const findings = [];

  const images = Array.from(document.querySelectorAll('img'));
  images.forEach((img) => {
    if (!img.hasAttribute('alt')) {
      findings.push({ type: 'image-alt-missing', el: img, detail: img.getAttribute('src') || '(no src)' });
    }
  });

  const links = Array.from(document.querySelectorAll('a[href]'));
  links.forEach((link) => {
    const href = (link.getAttribute('href') || '').trim().toLowerCase();
    if (href === '#' || href.startsWith('javascript:')) {
      findings.push({ type: 'placeholder-link', el: link, detail: href });
    }
  });

  const buttons = Array.from(document.querySelectorAll('button'));
  buttons.forEach((btn) => {
    const label = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
    if (!label) {
      findings.push({ type: 'button-name-missing', el: btn, detail: btn.className || '(no class)' });
    }
  });

  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const h1Count = headings.filter((h) => h.tagName.toLowerCase() === 'h1').length;
  if (h1Count !== 1) {
    findings.push({ type: 'heading-h1-count', el: document.body, detail: `h1 count = ${h1Count}` });
  }

  headings.forEach((heading, index) => {
    if (index === 0) return;
    const prev = headings[index - 1];
    const prevLevel = Number(prev.tagName[1]);
    const currentLevel = Number(heading.tagName[1]);
    if (currentLevel - prevLevel > 1) {
      findings.push({
        type: 'heading-level-skip',
        el: heading,
        detail: `${prev.tagName.toLowerCase()} -> ${heading.tagName.toLowerCase()}`
      });
    }
  });

  const contrastCandidates = Array.from(
    document.querySelectorAll(
      'p, li, a, button, label, span, h1, h2, h3, h4, h5, h6, .card-desc, .card-meta, .section-desc'
    )
  ).slice(0, 500);

  contrastCandidates.forEach((node) => {
    const text = (node.textContent || '').trim();
    if (!text) return;
    const style = window.getComputedStyle(node);
    const parentStyle = window.getComputedStyle(node.parentElement || node);
    const fg = parseRgb(style.color);
    const bg = parseRgb(style.backgroundColor) || parseRgb(parentStyle.backgroundColor);
    if (!fg || !bg) return;
    const ratio = getContrastRatio(fg, bg);
    if (ratio < 4.5) {
      findings.push({
        type: 'contrast-low',
        el: node,
        detail: `${ratio.toFixed(2)}:1 · "${text.slice(0, 32)}${text.length > 32 ? '…' : ''}"`
      });
    }
  });

  const grouped = findings.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  // eslint-disable-next-line no-console
  console.groupCollapsed(`[QA] Runtime checks: ${findings.length} issue(s)`);
  // eslint-disable-next-line no-console
  console.table(grouped);
  findings.forEach((issue, index) => {
    // eslint-disable-next-line no-console
    console.warn(`[QA:${index + 1}] ${issue.type} → ${issue.detail}`, issue.el);
  });
  // eslint-disable-next-line no-console
  console.groupEnd();
}

function parseRgb(value) {
  if (!value || value === 'transparent') return null;
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match) return null;
  const parts = match[1].split(',').map((v) => Number(v.trim()));
  if (parts.length < 3) return null;
  const alpha = parts.length > 3 ? parts[3] : 1;
  if (alpha === 0) return null;
  return { r: parts[0], g: parts[1], b: parts[2] };
}

function toLuminance({ r, g, b }) {
  const norm = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * norm[0] + 0.7152 * norm[1] + 0.0722 * norm[2];
}

function getContrastRatio(fg, bg) {
  const l1 = toLuminance(fg);
  const l2 = toLuminance(bg);
  const light = Math.max(l1, l2);
  const dark = Math.min(l1, l2);
  return (light + 0.05) / (dark + 0.05);
}
