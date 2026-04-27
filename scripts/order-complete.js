(() => {
  const ORDER_LABEL_KEY = "lelabo-order-gift-label-v1";
  const ORDER_SHIPPING_KEY = "lelabo-order-shipping-v1";
  const ORDER_TOTAL_KEY = "lelabo-order-total-v1";
  const giftLabelEl = document.querySelector("#order-gift-label");
  const deliveryDateEl = document.querySelector(".delivery-date");
  const totalValueEl = document.querySelector(".total-value");

  const savedLabel = (window.sessionStorage.getItem(ORDER_LABEL_KEY) || "").trim();
  if (giftLabelEl && savedLabel) {
    giftLabelEl.hidden = false;
    giftLabelEl.textContent = `Gift Label · LE LABO / ${savedLabel}`;
  }

  const savedShipping = (window.sessionStorage.getItem(ORDER_SHIPPING_KEY) || "").trim();
  if (deliveryDateEl && savedShipping) {
    deliveryDateEl.textContent = savedShipping;
  }

  const savedTotal = (window.sessionStorage.getItem(ORDER_TOTAL_KEY) || "").trim();
  if (totalValueEl && savedTotal) {
    totalValueEl.textContent = savedTotal;
  }
})();
