(() => {
  "use strict";

  const FREE_SHIPPING_THRESHOLD = 459000;
  const VAT_RATE = 0.1;

  const cartItemsWrap = document.querySelector(".cart-items");
  const shippingTipStrong = document.querySelector(".cart-shipping-tip strong");
  const progressBar = document.querySelector(".cart-progress-bar");
  const progressFill = document.querySelector(".cart-progress-fill");
  const promoForm = document.querySelector(".cart-promo");
  const promoInput = document.getElementById("cart-promo-input");
  const promoHint = document.querySelector(".cart-promo-hint");
  const checkoutBtn = document.querySelector(".checkout-btn");
  const CART_SNAPSHOT_KEY = "lelabo-cart-snapshot-v1";

  if (!cartItemsWrap) return;

  const summaryRows = Array.from(document.querySelectorAll(".cart-summary .summary-row"));
  const subtotalValue = findSummaryValue(summaryRows, "Subtotal");
  const shippingValue = findSummaryValue(summaryRows, "Shipping");
  const vatValue = findSummaryValue(summaryRows, "VAT (10%)");
  const totalValue = findSummaryValue(summaryRows, "Estimated Total");

  let promoDiscountRate = 0;

  function findSummaryValue(rows, label) {
    const row = rows.find((item) => {
      const key = item.querySelector("span:first-child");
      return key && key.textContent.trim() === label;
    });
    return row?.querySelector("span:last-child") || null;
  }

  function toNumber(text) {
    return Number((text || "").replace(/[^\d]/g, "")) || 0;
  }

  function toPrice(value) {
    return `₩ ${Math.max(0, Math.round(value)).toLocaleString("ko-KR")}`;
  }

  function getItems() {
    return Array.from(cartItemsWrap.querySelectorAll(".cart-item"));
  }

  function getItemUnitPrice(item) {
    const priceEl = item.querySelector(".cart-item-price");
    const saved = item.dataset.unitPrice;
    if (saved) return Number(saved);
    const parsed = toNumber(priceEl?.textContent);
    item.dataset.unitPrice = String(parsed);
    return parsed;
  }

  function getItemQuantity(item) {
    const qtyEl = item.querySelector(".qty-val");
    return Number(qtyEl?.textContent || "1") || 1;
  }

  function setItemQuantity(item, quantity) {
    const qty = Math.max(1, Math.min(99, quantity));
    const qtyEl = item.querySelector(".qty-val");
    if (qtyEl) qtyEl.textContent = String(qty);

    const priceEl = item.querySelector(".cart-item-price");
    const unitPrice = getItemUnitPrice(item);
    if (priceEl) priceEl.textContent = toPrice(unitPrice * qty);
  }

  function updateSummary() {
    const items = getItems();
    const rawSubtotal = items.reduce((acc, item) => acc + getItemUnitPrice(item) * getItemQuantity(item), 0);
    const discount = rawSubtotal * promoDiscountRate;
    const subtotal = rawSubtotal - discount;
    const vat = subtotal * VAT_RATE;
    const total = subtotal + vat;

    if (subtotalValue) subtotalValue.textContent = toPrice(subtotal);
    if (vatValue) vatValue.textContent = toPrice(vat);
    if (totalValue) totalValue.textContent = toPrice(total);

    if (shippingValue) {
      shippingValue.textContent = "Complimentary";
      shippingValue.classList.add("accent");
    }

    updateShippingMeter(subtotal);
    updateCheckoutLabel(total);
    syncCartSnapshot({ subtotal, vat, total });
  }

  function updateShippingMeter(subtotal) {
    const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    if (progressFill) progressFill.style.width = `${progress}%`;
    if (progressBar) progressBar.setAttribute("aria-valuenow", String(Math.round(progress)));

    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    if (shippingTipStrong) {
      shippingTipStrong.textContent = remaining === 0 ? "무료 배송 적용됨" : toPrice(remaining);
    }
  }

  function updateCheckoutLabel(total) {
    if (!checkoutBtn) return;
    checkoutBtn.setAttribute("aria-label", `총 결제금액 ${toPrice(total).replace("₩ ", "")}원으로 결제 진행`);
  }

  function syncCartSnapshot(totals) {
    const items = getItems().map((item) => {
      const name = item.querySelector(".cart-item-title")?.textContent?.trim() || "";
      const meta = item.querySelector(".cart-item-meta")?.textContent?.trim() || "";
      const image = item.querySelector(".cart-item-img img")?.getAttribute("src") || "";
      const quantity = getItemQuantity(item);
      const unitPrice = getItemUnitPrice(item);
      return { name, meta, image, quantity, unitPrice };
    });

    const payload = {
      items,
      subtotal: totals.subtotal,
      vat: totals.vat,
      total: totals.total,
      updatedAt: Date.now()
    };
    window.sessionStorage.setItem(CART_SNAPSHOT_KEY, JSON.stringify(payload));
  }

  function handleQtyClick(event) {
    const button = event.target.closest(".qty-btn");
    if (!button) return;
    const item = button.closest(".cart-item");
    if (!item) return;

    const current = getItemQuantity(item);
    const isIncrease = button.textContent.includes("+");
    setItemQuantity(item, isIncrease ? current + 1 : current - 1);
    updateSummary();
  }

  function handleRemoveClick(event) {
    const removeBtn = event.target.closest(".cart-item-remove");
    if (!removeBtn) return;
    const item = removeBtn.closest(".cart-item");
    if (!item) return;

    item.remove();
    if (getItems().length === 0) {
      cartItemsWrap.innerHTML = `<p class="shop-empty-title">장바구니가 비어 있습니다.</p>`;
    }
    updateSummary();
  }

  function handlePromo(event) {
    event.preventDefault();
    const code = (promoInput?.value || "").trim().toUpperCase();
    promoDiscountRate = code === "FIRSTLAB10" ? 0.1 : 0;

    if (promoHint) {
      promoHint.textContent = promoDiscountRate
        ? "프로모션이 적용되었습니다 · FIRSTLAB10 (10% 할인)"
        : "유효하지 않은 코드입니다. 사용 가능 코드: FIRSTLAB10";
    }
    updateSummary();
  }

  cartItemsWrap.addEventListener("click", handleQtyClick);
  cartItemsWrap.addEventListener("click", handleRemoveClick);
  promoForm?.addEventListener("submit", handlePromo);

  // Initialize from markup values.
  getItems().forEach((item) => setItemQuantity(item, getItemQuantity(item)));
  updateSummary();
})();
