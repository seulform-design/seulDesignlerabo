(() => {
  const STORAGE_KEY = "lelabo-gift-label-v1";
  const MAX_LENGTH = 24;
  const NEAR_LIMIT = 20;

  const input = document.querySelector("#gift-label-input");
  const button = document.querySelector("#gift-create-btn");
  const clearBtn = document.querySelector("#gift-clear-btn");
  const preview = document.querySelector("#gift-preview");
  const counter = document.querySelector("#gift-label-count");
  const counterWrap = document.querySelector("#gift-label-counter");

  if (!input || !button || !preview) return;

  // Strip anything that isn't ASCII letter/number/space/hyphen (honors the hint text).
  const sanitize = (value) =>
    (value || "")
      .replace(/[^A-Za-z0-9 \-]/g, "")
      .replace(/\s+/g, " ")
      .replace(/-+/g, "-")
      .slice(0, MAX_LENGTH);

  const renderPreview = (value) => {
    const display = (value || "").toUpperCase();
    preview.textContent = `LE LABO / ${display || "YOUR NAME"}`;
  };

  const renderCounter = (value) => {
    if (!counter) return;
    const len = value.length;
    counter.textContent = String(len);
    if (counterWrap) {
      counterWrap.classList.toggle("is-near", len >= NEAR_LIMIT);
    }
  };

  const toggleClear = (value) => {
    if (!clearBtn) return;
    clearBtn.hidden = value.length === 0;
  };

  const save = (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (_) {
      /* storage may be unavailable (private mode) — silently ignore */
    }
  };

  const load = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) || "";
    } catch (_) {
      return "";
    }
  };

  const syncAll = (value) => {
    renderPreview(value);
    renderCounter(value);
    toggleClear(value);
  };

  // Commit (button / Enter): persist to storage + canonical form
  const apply = () => {
    const normalized = sanitize(input.value);
    input.value = normalized;
    syncAll(normalized);
    save(normalized);
  };

  // Live feedback while typing (no persistence until commit)
  const handleInput = () => {
    const cleaned = sanitize(input.value);
    if (cleaned !== input.value) {
      input.value = cleaned;
    }
    syncAll(cleaned);
  };

  const clear = () => {
    input.value = "";
    syncAll("");
    save("");
    input.focus();
  };

  // Hydrate from storage
  const restored = sanitize(load());
  if (restored) input.value = restored;
  syncAll(restored);

  button.addEventListener("click", apply);
  input.addEventListener("input", handleInput);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      apply();
    } else if (event.key === "Escape" && input.value) {
      event.preventDefault();
      clear();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", clear);
  }
})();
