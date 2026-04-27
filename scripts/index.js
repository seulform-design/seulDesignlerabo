(() => {
  // ------------------------------------------------------------
  // Finder Core State / Data
  // ------------------------------------------------------------
  const STORAGE_KEY = "lelabo-finder-state-v1";
  const state = { scent: "", situation: "", season: "", mood: "", current: null };

  const productDb = [
    { id: "santal-33", name: "Santal 33", scent: "woody", situation: "night", season: "winter", mood: "deep", notes: "Sandalwood / Cedar / Leather", usage: "Night / Winter", batch: "24W", image: "./images/common/santal33.png", price: "₩210,000" },
    { id: "rose-31", name: "Rose 31", scent: "floral", situation: "daily", season: "spring", mood: "calm", notes: "Rose / Cumin / Musk", usage: "Daily / Spring", batch: "31R", image: "./images/common/rose11.png", price: "₩190,000" },
    { id: "another-13", name: "Another 13", scent: "citrus", situation: "office", season: "summer", mood: "fresh", notes: "Pear / Ambrox / Moss", usage: "Office / Summer", batch: "13A", image: "./images/common/an13.png", price: "₩180,000" },
    { id: "the-noir-29", name: "The Noir 29", scent: "smoky", situation: "date", season: "fall", mood: "warm", notes: "Tea / Fig / Tobacco", usage: "Date / Fall", batch: "29N", image: "./images/common/noir29.png", price: "₩205,000" }
  ];

  // ------------------------------------------------------------
  // DOM References
  // ------------------------------------------------------------
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
  // Header · announcement · mega menu shell is owned by layout-system.js.
  // Do not re-query or bind them here.
  const sortChips = document.querySelectorAll(
    '.filter-group[aria-labelledby="filter-sort-group-title"] .chip'
  );

  const emptyUi = document.querySelector('[data-ui="empty"]');
  const loadingUi = document.querySelector('[data-ui="loading"]');
  const errorUi = document.querySelector('[data-ui="error"]');
  const stickyPrice = document.querySelector("#sticky-price");
  const stickySave = document.querySelector("#sticky-save");
  const filterCountEl = document.querySelector("#filter-count strong");
  const filterResetBtn = document.querySelector("#filter-reset-btn");
  const summaryProgressStatus = document.querySelector(".summary-progress-status");
  const summaryProgressHint = document.querySelector(".summary-progress-hint");
  const summaryProgressEl = document.querySelector("#summary-progress");
  const finderProgressHint = document.querySelector("#finder-progress-hint");

  const stepHints = {
    0: "향 계열을 먼저 선택해주세요.",
    1: "다음 단계 — 사용 상황을 선택하세요.",
    2: "절반 완료 — 계절감을 선택하세요.",
    3: "마지막 단계 — 무드를 선택하면 추천이 생성됩니다.",
    4: "모든 단계 완료. 추천 결과와 근거를 함께 확인하세요."
  };

  const finderStepImages = {
    scent: {
      woody: "./images/common/DryWoody.png",
      floral: "./images/common/Soft Floral.png",
      citrus: "./images/common/Fresh Citrus.png",
      smoky: "./images/common/Smoky Woody.png"
    },
    situation: {
      daily: "./images/common/situation1.jpg",
      office: "./images/common/situation2.jpg",
      date: "./images/common/situation3.jpg",
      night: "./images/common/situation4.jpg"
    },
    season: {
      spring: "./images/common/Spring.jpg",
      summer: "./images/common/summer.jpg",
      fall: "./images/common/Fall.jpg",
      winter: "./images/common/winter.jpg"
    },
    mood: {
      warm: "./images/common/mood1.jpg",
      fresh: "./images/common/mood2.jpg",
      calm: "./images/common/mood3.jpg",
      deep: "./images/common/mood4.jpg"
    }
  };

  // ------------------------------------------------------------
  // State Helpers
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // UI Render Helpers
  // ------------------------------------------------------------
  const setUiState = (key) => {
    const normalized = key === "idle" ? "empty" : key;
    finderWrap.dataset.state = normalized;
    emptyUi.hidden = normalized !== "empty";
    loadingUi.hidden = normalized !== "loading";
    errorUi.hidden = normalized !== "error";
    resultList.hidden = normalized !== "result";
    if (recommendBtn) recommendBtn.disabled = normalized === "loading";
  };

  const updateSummary = () => {
    if (!summaryGrid) return;
    ["scent", "situation", "season", "mood"].forEach((key) => {
      const card = summaryGrid.querySelector(`[data-key="${key}"] .card-desc`);
      if (card) {
        card.textContent = formatValue(state[key]);
        const parentCard = card.closest(".card");
        if (parentCard) parentCard.classList.toggle("is-filled", !!state[key]);
      }
    });
  };

  const updateProgress = () => {
    const done = requiredKeys.filter((k) => state[k]).length;
    const complete = done === 4;
    progressEl.textContent = `Step ${done} / 4`;
    progressBox.setAttribute("aria-valuenow", String(done));
    progressBar.style.width = `${(done / 4) * 100}%`;
    if (finderProgressHint) finderProgressHint.textContent = stepHints[done] ?? stepHints[0];
    if (summaryProgressStatus) summaryProgressStatus.textContent = `${done} / 4 완성`;
    if (summaryProgressHint) {
      summaryProgressHint.textContent = done === 4
        ? "공식이 완성되었습니다. 추천을 확인하세요."
        : "4개 항목을 모두 선택하면 공식이 완성됩니다.";
    }
    if (summaryProgressEl) summaryProgressEl.dataset.complete = String(complete);
    if (filterCountEl) filterCountEl.textContent = String(done);
  };

  // 필터 섹션 칩에도 선택된 값 반영 (data-filter-step/value 기반)
  const syncFilterChips = (step, value) => {
    document.querySelectorAll(`.chip[data-filter-step="${step}"]`).forEach((chip) => {
      const selected = chip.dataset.filterValue === value;
      chip.classList.toggle("is-selected", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
  };

  // Finder step 카드에 완료 상태(.is-done) 적용 — step이 채워지면 카드 시각 시그널
  const syncStepCardState = () => {
    document.querySelectorAll(".finder-step").forEach((card) => {
      const firstBtn = card.querySelector(".finder-options button[data-step]");
      const step = firstBtn?.dataset.step;
      if (!step) return;
      card.classList.toggle("is-done", Boolean(state[step]));
    });
  };

  const updateFinderStepImage = (step, value) => {
    if (!step || !value) return;
    const src = finderStepImages[step]?.[value];
    if (!src) return;
    const card = document.querySelector(`.finder-step[data-finder-step="${step}"]`);
    const image = card?.querySelector(".finder-step-media img");
    if (image) image.src = src;
  };

  const syncFinderStepImages = () => {
    requiredKeys.forEach((step) => {
      if (!state[step]) return;
      updateFinderStepImage(step, state[step]);
    });
  };

  // Apply a single option selection in a step.
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

    syncFilterChips(step, value);
    syncStepCardState();
    updateFinderStepImage(step, value);

    updateSummary();
    updateProgress();
    saveState();
  };

  const makeResultCard = (product) => {
    const usage = (product.usage || "").replace(/\s*\/\s*/g, " · ");
    return `
    <article class="card product-card">
      <div class="card-media"><img src="${product.image}" alt="${product.name} 제품 이미지" /></div>
      <div class="card-body">
        <h3 class="card-title">${product.name}</h3>
        <p class="card-desc">${product.notes}</p>
        <p class="card-meta">${usage} · Batch ${product.batch} · ${product.price}</p>
        <div class="card-action"><button type="button" class="btn btn-secondary" data-pick="${product.id}">Select</button></div>
      </div>
    </article>`;
  };

  // Weighted matching score for decision quality.
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
    personalGrid.innerHTML = items.slice(0, 3).map((item, index) => {
      const usage = (item.usage || "").replace(/\s*\/\s*/g, " · ");
      return `
      <article class="card">
        <div class="card-media card-media-note">
          <span>REC 0${index + 1}</span>
          <img src="${item.image}" alt="${item.name} 추천 이미지" loading="lazy" decoding="async" />
        </div>
        <div class="card-body">
          <h3 class="card-title">${item.name}</h3>
          <p class="card-desc">${item.notes}</p>
          <p class="card-meta">${usage} · Batch ${item.batch}</p>
          <div class="card-action"><button type="button" class="btn btn-secondary" data-pick="${item.id}">Select</button></div>
        </div>
      </article>
      `;
    }).join("");
  };

  const applyDecisionReason = (product, secondProduct) => {
    const whyCards = document.querySelectorAll("#why-grid .card");
    if (!product) return;
    const matchScore = scoreProduct(product);
    const confidence = Math.round((matchScore / 12) * 100);
    const usage = (product.usage || "").replace(/\s*\/\s*/g, " · ");

    // DOM이 존재하는 경우에만 텍스트를 업데이트하도록 안전망(Null Safe) 처리
    if (whyCards.length >= 3) {
      whyCards[0].querySelector(".card-desc").textContent = `${formatValue(state.scent)} 축과 ${product.notes.split(" / ")[0]} 노트의 결이 일치합니다. 노트 전개가 과하지 않아 첫 인상 대비 잔향 밸런스가 안정적입니다.`;
      whyCards[1].querySelector(".card-desc").textContent = `${formatValue(state.situation)} 상황 기준으로 ${usage} 사용 패턴과 적합합니다. 외출/업무/모임 맥락에서 발향 강도 변동이 적은 편입니다.`;
      whyCards[2].querySelector(".card-desc").textContent = `${formatValue(state.season)} · ${formatValue(state.mood)} 조합에 맞춘 배치 ${product.batch} 프로파일입니다. 추천 신뢰도 ${confidence}% (Match ${matchScore}/12).`;

      const whyImages = [
        product.image,
        (secondProduct && secondProduct.image) || product.image,
        "./images/common/manufacturing.jpg"
      ];
      whyCards.forEach((card, index) => {
        const image = card.querySelector(".card-media img");
        if (image && whyImages[index]) image.src = whyImages[index];
      });
    }

    const setElText = (selector, text) => {
      const el = document.querySelector(selector);
      if (el) el.textContent = text;
    };

    const formatUsage = (u) => (u || "").replace(/\s*\/\s*/g, " · ");

    setElText("#compare-left-title", product.name);
    setElText("#compare-left-desc", `${formatValue(product.scent)} · ${formatValue(product.mood)} · ${product.notes.split(" / ")[0]}`);
    setElText("#compare-left-meta", formatUsage(product.usage));
    if (secondProduct) {
      setElText("#compare-right-title", secondProduct.name);
      setElText("#compare-right-desc", `${formatValue(secondProduct.scent)} · ${formatValue(secondProduct.mood)} · ${secondProduct.notes.split(" / ")[0]}`);
      setElText("#compare-right-meta", formatUsage(secondProduct.usage));
    }

    const compareLeftImg = document.querySelector(".compare-card-primary .card-media img");
    const compareRightImg = document.querySelector(".compare-card-alt .card-media img");
    if (compareLeftImg) compareLeftImg.src = product.image;
    if (compareRightImg && secondProduct) compareRightImg.src = secondProduct.image;

    if (stickyProduct) stickyProduct.textContent = product.name;
    if (stickyPrice) stickyPrice.textContent = product.price;
    state.current = product;
  };

  // ------------------------------------------------------------
  // Recommendation Flow
  // ------------------------------------------------------------
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
    // 필터 섹션 칩도 함께 해제 (sort chips 제외)
    document.querySelectorAll(".chip[data-filter-step]").forEach((chip) => {
      chip.classList.remove("is-selected");
      chip.setAttribute("aria-pressed", "false");
    });
    document.querySelectorAll(".finder-step.is-done").forEach((card) => {
      card.classList.remove("is-done");
    });
    resultList.innerHTML = "";
    updateSummary();
    updateProgress();
    setUiState("idle");
    saveState();
  };

  // ------------------------------------------------------------
  // Event Wiring
  // ------------------------------------------------------------
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
        // 추천 리스트나 다른 곳에서 선택 시 비교 카드의 오른쪽(비교군)으로 Rose 31을 기본 제공하여 Decision Flow 유지
        const fallbackRight = productDb.find(item => item.id === "rose-31") || productDb[1];

        // 선택한 항목이 겹치지 않게 조율
        const rightProduct = selected.id === fallbackRight.id
          ? (productDb.find(item => item.id === "santal-33") || productDb[0])
          : fallbackRight;

        applyDecisionReason(selected, rightProduct);
        saveState();
      }
    }
  });

  if (recommendBtn) recommendBtn.addEventListener("click", recommend);
  if (resetBtn) resetBtn.addEventListener("click", resetFinder);

  // 필터 섹션의 Reset All: 파인더 상태 및 정렬 칩까지 동시에 초기화
  if (filterResetBtn) {
    filterResetBtn.addEventListener("click", () => {
      resetFinder();
      sortChips.forEach((chip, idx) => {
        chip.setAttribute("aria-pressed", idx === 0 ? "true" : "false");
      });
    });
  }

  // Sticky Save 토글 (aria-pressed 기반 + aria-label 동기화)
  if (stickySave) {
    stickySave.addEventListener("click", () => {
      const nextPressed = stickySave.getAttribute("aria-pressed") !== "true";
      stickySave.setAttribute("aria-pressed", String(nextPressed));
      stickySave.textContent = nextPressed ? "SAVED" : "SAVE";
      stickySave.setAttribute(
        "aria-label",
        nextPressed ? "위시리스트에서 제거" : "위시리스트에 저장"
      );
    });
  }

  sortChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      sortChips.forEach((btn) => {
        const selected = btn === chip;
        btn.setAttribute("aria-pressed", String(selected));
      });
    });
  });

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
      if (lt && rt) [lt.textContent, rt.textContent] = [rt.textContent, lt.textContent];
      if (ld && rd) [ld.textContent, rd.textContent] = [rd.textContent, ld.textContent];
      if (lm && rm) [lm.textContent, rm.textContent] = [rm.textContent, lm.textContent];
    });
  }
  if (setCurrentBtn) {
    setCurrentBtn.addEventListener("click", () => {
      const clTitle = document.querySelector("#compare-left-title");
      if (stickyProduct && clTitle) stickyProduct.textContent = clTitle.textContent;
      if (setCurrentBtn) setCurrentBtn.textContent = "확정됨";
      window.setTimeout(() => {
        if (setCurrentBtn) setCurrentBtn.textContent = "이 향으로 확정";
      }, 1200);
      saveState();
    });
  }

  const giftInput = document.querySelector("#gift-label-input");
  const giftBtn = document.querySelector("#gift-create-btn");
  const giftPreview = document.querySelector("#gift-preview");
  if (giftBtn && giftInput && giftPreview) {
    const renderLabel = () => {
      // 줄바꿈/연속 공백 제거, 최대 24자 제한 (input maxlength와 일치)
      const value = giftInput.value.replace(/\s+/g, " ").trim().slice(0, 24);
      giftPreview.textContent = `LE LABO / ${value || "YOUR NAME"}`;
    };
    giftBtn.addEventListener("click", renderLabel);
    giftInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        renderLabel();
      }
    });
  }

  // Announcement bar, mega menu, and Escape/outside-click behaviour are all
  // owned by layout-system.js — keep this file focused on the finder + sticky CTA.

  if (sticky) {
    window.addEventListener("scroll", () => {
      sticky.dataset.visible = window.scrollY > 600 ? "true" : "false";
    }, { passive: true });
  }

  // ------------------------------------------------------------
  // One-Page ScrollSpy (GNB Active State)
  // ------------------------------------------------------------
  const sections = document.querySelectorAll("section[id]");
  const navLinks = Array.from(document.querySelectorAll(".gnb-item a"))
    .filter((link) => (link.getAttribute("href") || "").startsWith("#"));

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px", // 화면 상단 20~30% 영역에 닿을 때 활성화
    threshold: 0
  };

  if (sections.length && navLinks.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          navLinks.forEach((link) => {
            const href = link.getAttribute("href").replace("#", "");
            link.classList.toggle("is-active", href === id);
          });
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
  }

  // ------------------------------------------------------------
  // Initial Boot: restore persisted state and paint UI.
  // ------------------------------------------------------------
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
    syncFilterChips(key, state[key]);
  });
  syncStepCardState();
  syncFinderStepImages();
  if (state.current && stickyProduct) {
    stickyProduct.textContent = state.current.name;
    if (stickyPrice) stickyPrice.textContent = state.current.price;
  }
})();
