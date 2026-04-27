(function () {
  "use strict";

  const cardNumInput = document.getElementById("card-num");
  const cardDateInput = document.getElementById("card-date");
  const cardCvvInput = document.getElementById("card-cvv");
  const cardBrandHint = document.getElementById("card-brand-hint");
  const shippingButtons = document.querySelectorAll("[data-shipping-method]");
  const promoToggle = document.getElementById("promo-toggle");
  const promoWrap = document.getElementById("promo-code-wrap");
  const form = document.querySelector(".checkout-form");
  const checkoutGiftLabel = document.getElementById("checkout-gift-label");
  const GIFT_LABEL_KEY = "lelabo-gift-label-v1";
  const ORDER_LABEL_KEY = "lelabo-order-gift-label-v1";
  const ORDER_SHIPPING_KEY = "lelabo-order-shipping-v1";
  const ORDER_TOTAL_KEY = "lelabo-order-total-v1";
  const CART_SNAPSHOT_KEY = "lelabo-cart-snapshot-v1";
  const deliveryDateEl = document.querySelector(".delivery-date");
  const totalRowEl = document.querySelector(".checkout-total-row span:last-child");
  const subtotalRowEl = document.querySelector('.summary-row span:last-child');
  const vatRowEl = document.querySelectorAll('.summary-row span:last-child')[2] || null;
  const itemListWrap = document.querySelector(".checkout-items");
  const submitBtn = document.querySelector(".checkout-submit-btn");

  function detectCardBrand(value) {
    if (/^4/.test(value)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(value)) return "MasterCard";
    if (/^3[47]/.test(value)) return "AMEX";
    if (/^(35)/.test(value)) return "JCB";
    return "Card";
  }

  function formatCardNumber(value, brand = "Card") {
    const maxDigits = brand === "AMEX" ? 15 : 16;
    const digits = value.replace(/\D/g, "").slice(0, maxDigits);
    if (brand === "AMEX") {
      return digits.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, p1, p2, p3) =>
        [p1, p2, p3].filter(Boolean).join(" ")
      );
    }
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function formatExpiry(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)} / ${digits.slice(2, 4)}`;
  }

  function setShippingMethod(target) {
    shippingButtons.forEach((btn) => {
      const selected = btn === target;
      btn.classList.toggle("is-selected", selected);
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    if (target && deliveryDateEl) {
      const method = target.dataset.shippingMethod === "express" ? "Express" : "Standard";
      deliveryDateEl.textContent = method === "Express" ? "Express · Next day dispatch" : "Standard · 2-3 business days";
    }
  }

  function isCardNumberValid(rawDigits, brand) {
    if (brand === "AMEX") return rawDigits.length === 15;
    return rawDigits.length === 16;
  }

  function isExpiryValid(value) {
    const clean = value.replace(/\s/g, "");
    const match = clean.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match) return false;
    const month = Number(match[1]);
    const year = Number(`20${match[2]}`);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    return year > currentYear || (year === currentYear && month >= currentMonth);
  }

  cardNumInput?.addEventListener("input", (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    const brand = detectCardBrand(digits);
    const formatted = formatCardNumber(digits, brand);
    e.target.value = formatted;
    if (cardBrandHint) {
      cardBrandHint.textContent = `Supported: Visa · MasterCard · AMEX · Detected: ${brand}`;
    }
    e.target.classList.remove("is-invalid");
  });

  cardDateInput?.addEventListener("input", (e) => {
    e.target.value = formatExpiry(e.target.value);
    e.target.classList.remove("is-invalid");
  });

  cardCvvInput?.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.classList.remove("is-invalid");
  });

  shippingButtons.forEach((btn) => {
    btn.addEventListener("click", () => setShippingMethod(btn));
  });

  promoToggle?.addEventListener("click", () => {
    const expanded = promoToggle.getAttribute("aria-expanded") === "true";
    promoToggle.setAttribute("aria-expanded", expanded ? "false" : "true");
    if (promoWrap) {
      promoWrap.hidden = expanded;
    }
  });

  const savedGiftLabel = (window.localStorage.getItem(GIFT_LABEL_KEY) || "").trim();
  if (checkoutGiftLabel && savedGiftLabel) {
    checkoutGiftLabel.hidden = false;
    checkoutGiftLabel.textContent = `Gift Label · LE LABO / ${savedGiftLabel}`;
  }

  const cartSnapshotRaw = window.sessionStorage.getItem(CART_SNAPSHOT_KEY);
  if (cartSnapshotRaw) {
    try {
      const snapshot = JSON.parse(cartSnapshotRaw);
      if (itemListWrap && Array.isArray(snapshot.items) && snapshot.items.length) {
        itemListWrap.innerHTML = snapshot.items.map((item) => {
          const lineTotal = item.unitPrice * item.quantity;
          return `
            <div class="checkout-item">
              <div class="checkout-item-main">
                <img class="checkout-item-thumb" src="${item.image}" alt="${item.name} 썸네일" width="44" height="44" loading="lazy" decoding="async" />
                <div class="checkout-item-text">
                  <span class="checkout-item-name">${item.name}</span>
                  <span class="checkout-item-meta">${item.meta.split("/")[1]?.trim() || "50ml"} · Qty ${item.quantity}</span>
                </div>
              </div>
              <span class="checkout-item-price">₩ ${Number(lineTotal).toLocaleString("ko-KR")}</span>
            </div>
          `;
        }).join("");
      }

      const summaryValues = document.querySelectorAll(".checkout-summary-calc .summary-row span:last-child");
      if (summaryValues[0] && Number.isFinite(snapshot.subtotal)) summaryValues[0].textContent = `₩ ${Number(snapshot.subtotal).toLocaleString("ko-KR")}`;
      if (summaryValues[2] && Number.isFinite(snapshot.vat)) summaryValues[2].textContent = `₩ ${Number(snapshot.vat).toLocaleString("ko-KR")}`;
      if (totalRowEl && Number.isFinite(snapshot.total)) totalRowEl.textContent = `₩ ${Number(snapshot.total).toLocaleString("ko-KR")}`;
      if (submitBtn && Number.isFinite(snapshot.total)) {
        submitBtn.textContent = `Authorize Payment · ₩ ${Number(snapshot.total).toLocaleString("ko-KR")}`;
      }
    } catch (_) {
      // Ignore malformed snapshot and fall back to static markup.
    }
  }

  form?.addEventListener("submit", (e) => {
    const requiredFields = form.querySelectorAll("input[required], textarea[required]");
    let hasError = false;

    requiredFields.forEach((field) => {
      const empty = !field.value.trim();
      field.classList.toggle("is-invalid", empty);
      if (empty) hasError = true;
    });

    if (hasError) {
      e.preventDefault();
      const firstInvalid = form.querySelector(".is-invalid");
      firstInvalid?.focus();
      return;
    }

    const cardDigits = (cardNumInput?.value || "").replace(/\D/g, "");
    const brand = detectCardBrand(cardDigits);
    if (cardNumInput && !isCardNumberValid(cardDigits, brand)) {
      e.preventDefault();
      cardNumInput.classList.add("is-invalid");
      cardNumInput.focus();
      return;
    }

    if (cardDateInput && !isExpiryValid(cardDateInput.value)) {
      e.preventDefault();
      cardDateInput.classList.add("is-invalid");
      cardDateInput.focus();
      return;
    }

    if (cardCvvInput) {
      const cvvLength = cardCvvInput.value.replace(/\D/g, "").length;
      if (cvvLength < 3) {
        e.preventDefault();
        cardCvvInput.classList.add("is-invalid");
        cardCvvInput.focus();
        return;
      }
    }

    if (savedGiftLabel) {
      window.sessionStorage.setItem(ORDER_LABEL_KEY, savedGiftLabel);
    } else {
      window.sessionStorage.removeItem(ORDER_LABEL_KEY);
    }

    const selectedShipping = Array.from(shippingButtons).find((btn) => btn.getAttribute("aria-pressed") === "true");
    const shippingMethod = selectedShipping?.dataset.shippingMethod === "express" ? "Express · Next day dispatch" : "Standard · 2-3 business days";
    window.sessionStorage.setItem(ORDER_SHIPPING_KEY, shippingMethod);

    if (totalRowEl) {
      window.sessionStorage.setItem(ORDER_TOTAL_KEY, totalRowEl.textContent.trim());
    }
  });
})();
