(() => {
  const STORAGE_KEY = "lelabo-finder-state-v1";
  const state = { scent: "", situation: "", season: "", mood: "", current: null };

  const productDb = [
    { id: "santal-33", name: "Santal 33", scent: "woody", situation: "night", season: "winter", mood: "deep", notes: "Sandalwood / Cedar / Leather", usage: "Night / Winter", batch: "24W", image: "./img/p1.jpg", price: "₩210,000" },
    { id: "rose-31", name: "Rose 31", scent: "floral", situation: "daily", season: "spring", mood: "calm", notes: "Rose / Cumin / Musk", usage: "Daily / Spring", batch: "31R", image: "./img/p2.jpg", price: "₩190,000" },
    { id: "another-13", name: "Another 13", scent: "citrus", situation: "office", season: "summer", mood: "fresh", notes: "Pear / Ambrox / Moss", usage: "Office / Summer", batch: "13A", image: "./img/p3.jpg", price: "₩180,000" },
    { id: "the-noir-29", name: "The Noir 29", scent: "smoky", situation: "date", season: "fall", mood: "warm", notes: "Tea / Fig / Tobacco", usage: "Date / Fall", batch: "29N", image: "./img/p1.jpg", price: "₩205,000" }
  ];

  const progressEl = document.querySelector("#finder-progress");
  const progressBar = document.querySelector(".finder-progress-bar span");
  const progressBox = document.querySelector(".finder-progress-bar");
  const finderWrap = document.querySelector(".finder-wrap");
  const resultList = document.querySelector("#finder-result-list");
  const summaryGrid = document.querySelector("#summary-grid");
  const recommendBtn = document.querySelector("#recommend-btn");
  const resetBtn = document.querySelector("#reset-btn");
  const sticky = document.querySelector("#sticky-buy");
  const stickyProduct = document.querySelector("#sticky-product");
  const personalGrid = document.querySelector(".personal .card-grid");

  const emptyUi = document.querySelector('[data-ui="empty"]');
  const loadingUi = document.querySelector('[data-ui="loading"]');
  const errorUi = document.querySelector('[data-ui="error"]');

  const formatValue = (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not selected";
  const requiredKeys = ["scent", "situation", "season", "mood"];

  const saveState = () => {
    const payload = {
      scent: state.scent,
      situation: state.situation,
      season: state.season,
      mood: state.mood,
      currentId: state.current ? state.current.id : ""
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const loadState = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      requiredKeys.forEach((key) => {
        if (typeof parsed[key] === "string") state[key] = parsed[key];
      });
      if (typeof parsed.currentId === "string" && parsed.currentId) {
        state.current = productDb.find((item) => item.id === parsed.currentId) || null;
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const setUiState = (key) => {
    finderWrap.dataset.state = key;
    emptyUi.hidden = key !== "empty";
    loadingUi.hidden = key !== "loading";
    errorUi.hidden = key !== "error";
    resultList.hidden = key !== "result";
  };

  const updateSummary = () => {
    ["scent", "situation", "season", "mood"].forEach((key) => {
      const card = summaryGrid.querySelector(`[data-key="${key}"] .card-desc`);
      if (card) card.textContent = formatValue(state[key]);
    });
  };

  const updateProgress = () => {
    const done = requiredKeys.filter((k) => state[k]).length;
    progressEl.textContent = `Step ${done} / 4`;
    progressBox.setAttribute("aria-valuenow", String(done));
    progressBar.style.width = `${(done / 4) * 100}%`;
    if (done === 0) setUiState("empty");
  };

  const selectOption = (button) => {
    const step = button.dataset.step;
    const value = button.dataset.value;
    if (!step || !value) return;

    state[step] = value;
    document.querySelectorAll(`.finder-options button[data-step="${step}"]`).forEach((btn) => {
      const selected = btn === button;
      btn.classList.toggle("is-selected", selected);
      btn.setAttribute("aria-pressed", String(selected));
    });

    updateSummary();
    updateProgress();
    saveState();
  };

  const makeResultCard = (product) => `
    <article class="card product-card">
      <div class="card-media"><img src="${product.image}" alt="${product.name} 제품 이미지" /></div>
      <div class="card-body">
        <h3 class="card-title">${product.name}</h3>
        <p class="card-desc">${product.notes}</p>
        <p class="card-meta">${product.usage} / Batch ${product.batch} / ${product.price}</p>
        <div class="card-action"><button type="button" class="btn btn-secondary" data-pick="${product.id}">Select</button></div>
      </div>
    </article>`;

  const scoreProduct = (product) => {
    const weights = { scent: 4, situation: 3, season: 2, mood: 3 };
    let score = 0;
    if (product.scent === state.scent) score += weights.scent;
    if (product.situation === state.situation) score += weights.situation;
    if (product.season === state.season) score += weights.season;
    if (product.mood === state.mood) score += weights.mood;
    return score;
  };

  const buildPersonalCards = (items) => {
    if (!personalGrid) return;
    personalGrid.innerHTML = items.slice(0, 3).map((item, index) => `
      <article class="card">
        <div class="card-media card-media-note">REC 0${index + 1}</div>
        <div class="card-body">
          <h3 class="card-title">${item.name}</h3>
          <p class="card-desc">${item.notes}</p>
          <p class="card-meta">${item.usage} / Batch ${item.batch}</p>
          <div class="card-action"><button type="button" class="btn btn-secondary" data-pick="${item.id}">Select</button></div>
        </div>
      </article>
    `).join("");
  };

  const applyDecisionReason = (product, secondProduct) => {
    const whyCards = document.querySelectorAll("#why-grid .card");
    if (!product) return;
    const matchScore = scoreProduct(product);
    whyCards[0].querySelector(".card-desc").textContent = `${formatValue(state.scent)} 계열과 ${product.notes.split(" / ")[0]} 노트가 선호 축과 맞습니다.`;
    whyCards[1].querySelector(".card-desc").textContent = `${formatValue(state.situation)} 상황에서 ${product.usage} 사용성이 안정적입니다.`;
    whyCards[2].querySelector(".card-desc").textContent = `${formatValue(state.season)} / ${formatValue(state.mood)} 조합에 맞춘 배치 ${product.batch} 프로파일입니다. (Match ${matchScore}/12)`;

    document.querySelector("#compare-left-title").textContent = product.name;
    document.querySelector("#compare-left-desc").textContent = `${formatValue(product.scent)} / ${formatValue(product.mood)} / ${product.notes.split(" / ")[0]}`;
    document.querySelector("#compare-left-meta").textContent = `추천: ${product.usage}`;
    if (secondProduct) {
      document.querySelector("#compare-right-title").textContent = secondProduct.name;
      document.querySelector("#compare-right-desc").textContent = `${formatValue(secondProduct.scent)} / ${formatValue(secondProduct.mood)} / ${secondProduct.notes.split(" / ")[0]}`;
      document.querySelector("#compare-right-meta").textContent = `추천: ${secondProduct.usage}`;
    }

    stickyProduct.textContent = product.name;
    state.current = product;
  };

  const recommend = () => {
    const complete = requiredKeys.every((key) => state[key]);
    if (!complete) {
      setUiState("empty");
      return;
    }

    setUiState("loading");
    window.setTimeout(() => {
      if (state.scent === "smoky" && state.season === "summer" && state.mood === "fresh") {
        setUiState("error");
        return;
      }

      const ranked = [...productDb]
        .map((item) => ({ item, score: scoreProduct(item) }))
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item);

      const top = ranked.slice(0, 2);
      if (top.length === 0 || scoreProduct(top[0]) < 5) {
        setUiState("error");
        return;
      }
      resultList.innerHTML = top.map(makeResultCard).join("");
      setUiState("result");
      applyDecisionReason(top[0], top[1]);
      buildPersonalCards(ranked);
      saveState();
    }, 700);
  };

  const resetFinder = () => {
    Object.keys(state).forEach((key) => { state[key] = key === "current" ? null : ""; });
    document.querySelectorAll(".finder-options button").forEach((btn) => {
      btn.classList.remove("is-selected");
      btn.setAttribute("aria-pressed", "false");
    });
    resultList.innerHTML = "";
    updateSummary();
    updateProgress();
    setUiState("empty");
    saveState();
  };

  document.addEventListener("click", (event) => {
    const option = event.target.closest(".finder-options button");
    if (option) selectOption(option);

    const filterChip = event.target.closest("[data-filter-step][data-filter-value]");
    if (filterChip) {
      const { filterStep, filterValue } = filterChip.dataset;
      const target = document.querySelector(`.finder-options button[data-step="${filterStep}"][data-value="${filterValue}"]`);
      if (target) {
        target.focus();
        selectOption(target);
      }
    }

    if (event.target.matches('[data-action="focus-first"]')) {
      const first = document.querySelector('.finder-options button[data-step="scent"]');
      if (first) first.focus();
    }
    if (event.target.matches('[data-action="retry"]')) recommend();

    const picked = event.target.closest("[data-pick]");
    if (picked) {
      const selected = productDb.find((item) => item.id === picked.dataset.pick);
      if (selected) {
        applyDecisionReason(selected);
        saveState();
      }
    }
  });

  if (recommendBtn) recommendBtn.addEventListener("click", recommend);
  if (resetBtn) resetBtn.addEventListener("click", resetFinder);

  const swapBtn = document.querySelector("#swap-compare");
  const setCurrentBtn = document.querySelector("#set-left-current");
  if (swapBtn) {
    swapBtn.addEventListener("click", () => {
      const lt = document.querySelector("#compare-left-title");
      const ld = document.querySelector("#compare-left-desc");
      const lm = document.querySelector("#compare-left-meta");
      const rt = document.querySelector("#compare-right-title");
      const rd = document.querySelector("#compare-right-desc");
      const rm = document.querySelector("#compare-right-meta");
      [lt.textContent, rt.textContent] = [rt.textContent, lt.textContent];
      [ld.textContent, rd.textContent] = [rd.textContent, ld.textContent];
      [lm.textContent, rm.textContent] = [rm.textContent, lm.textContent];
    });
  }
  if (setCurrentBtn) {
    setCurrentBtn.addEventListener("click", () => {
      stickyProduct.textContent = document.querySelector("#compare-left-title").textContent;
      saveState();
    });
  }

  const giftInput = document.querySelector("#gift-label-input");
  const giftBtn = document.querySelector("#gift-create-btn");
  const giftPreview = document.querySelector("#gift-preview");
  if (giftBtn && giftInput && giftPreview) {
    giftBtn.addEventListener("click", () => {
      const value = giftInput.value.trim();
      giftPreview.textContent = `Label preview: LE LABO / ${value || "YOUR NAME"}`;
    });
  }

  window.addEventListener("scroll", () => {
    sticky.dataset.visible = window.scrollY > 600 ? "true" : "false";
  }, { passive: true });

  loadState();
  updateSummary();
  updateProgress();
  requiredKeys.forEach((key) => {
    if (!state[key]) return;
    const target = document.querySelector(`.finder-options button[data-step="${key}"][data-value="${state[key]}"]`);
    if (target) {
      target.classList.add("is-selected");
      target.setAttribute("aria-pressed", "true");
    }
  });
  if (state.current) {
    stickyProduct.textContent = state.current.name;
  }
})();
