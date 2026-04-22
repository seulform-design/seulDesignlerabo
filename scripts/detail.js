/**
 * LE LABO - detail.js
 * Handles interactions specific to the Product Detail Page.
 */

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initSizeSelector();
  initGiftCustomizer();
  initStickyBarVisibility();
});

/**
 * Product Image Gallery
 * Swaps the main image when a thumbnail is clicked.
 */
function initGallery() {
  const mainImage = document.getElementById('main-product-image');
  const thumbnails = document.querySelectorAll('.thumb-btn');

  if (!mainImage || thumbnails.length === 0) return;

  thumbnails.forEach(btn => {
    btn.addEventListener('click', function () {
      // Remove active class from all
      thumbnails.forEach(t => t.classList.remove('is-active'));
      // Add active class to clicked
      this.classList.add('is-active');

      // Swap image with smooth opacity transition
      const newSrc = this.querySelector('img').src;
      
      mainImage.style.opacity = '0';
      setTimeout(() => {
        mainImage.src = newSrc;
        mainImage.style.opacity = '1';
      }, 200); // 200ms matches CSS transition if added
    });
  });

  // Add transition to main image for smooth swap
  mainImage.style.transition = 'opacity 0.2s ease';
}

/**
 * Size Selector
 * Updates price and sticky bar data when a new size is selected.
 */
function initSizeSelector() {
  const sizeButtons = document.querySelectorAll('.btn-size');
  const priceDisplay = document.querySelector('.detail-info .detail-price');
  const stickyPrice = document.getElementById('sticky-price');
  
  // Le Labo typical pricing mockup
  const pricing = {
    '15ml': '₩115,000',
    '50ml': '₩210,000',
    '100ml': '₩310,000'
  };

  if (sizeButtons.length === 0 || !priceDisplay) return;

  sizeButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      // Update ARIA states
      sizeButtons.forEach(b => b.setAttribute('aria-checked', 'false'));
      this.setAttribute('aria-checked', 'true');

      // Get selected size text
      const selectedSize = this.textContent.trim().toLowerCase();
      
      // Update Prices if match found in dictionary
      if (pricing[selectedSize]) {
        priceDisplay.textContent = pricing[selectedSize];
        if (stickyPrice) {
          stickyPrice.textContent = pricing[selectedSize];
        }
      }
    });
  });
}

/**
 * Gift Label Customizer Preview
 * Updates the preview box in real-time as the user types their name.
 */
function initGiftCustomizer() {
  const giftInput = document.getElementById('gift-name');
  const giftPreviewText = document.querySelector('.gift-preview-text');

  if (!giftInput || !giftPreviewText) return;

  const defaultText = 'add label msg';

  giftInput.addEventListener('input', function () {
    const value = this.value.trim();
    if (value.length > 0) {
      giftPreviewText.textContent = `for ${value}`;
      giftPreviewText.style.color = 'var(--color-primary)';
    } else {
      giftPreviewText.textContent = defaultText;
      giftPreviewText.style.color = 'var(--color-text-muted)';
    }
  });
}

/**
 * Sticky Buy Bar Visibility
 * Shows the sticky bar only when scrolling past the main add to cart button
 * and hides it near the footer.
 */
function initStickyBarVisibility() {
  const stickyBar = document.getElementById('sticky-buy');
  const detailActions = document.querySelector('.detail-actions');
  const footer = document.querySelector('.footer');

  if (!stickyBar || !detailActions) return;

  // Initialize data-visible to false
  stickyBar.setAttribute('data-visible', 'false');

  const handleScroll = () => {
    const actionsRect = detailActions.getBoundingClientRect();
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const windowHeight = window.innerHeight;

    // Show sticky bar when user scrolls past the primary action buttons
    let shouldShow = actionsRect.bottom < 0;

    // Hide if reached footer to prevent overlap
    if (footerRect && footerRect.top < windowHeight) {
      shouldShow = false;
    }

    stickyBar.setAttribute('data-visible', shouldShow ? 'true' : 'false');
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
  
  // Initial check
  handleScroll();
}
