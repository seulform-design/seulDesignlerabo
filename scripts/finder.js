(function () {
  "use strict";

  const state = {
    scent: "",
    situation: "",
    season: "",
    mood: "",
    density: "",
    recommended: null,
  };

  const weight = { scent: 5, mood: 3, season: 3, situation: 3, density: 4 };

  const label = {
    scent: { woody: "Woody", floral: "Floral", citrus: "Citrus", smoky: "Smoky" },
    situation: { daily: "Daily", office: "Office", date: "Date", night: "Night" },
    season: { spring: "Spring", summer: "Summer", fall: "Fall", winter: "Winter" },
    mood: { warm: "Warm", fresh: "Fresh", calm: "Calm", deep: "Deep" },
    density: { light: "Light", soft: "Soft", balanced: "Balanced", deep: "Deep", intense: "Intense" },
  };

  const scents = [
    {
      id: "santal33",
      name: "Santal 33",
      image: "./images/common/santal33.png",
      family: "Woody",
      notes: ["Sandalwood", "Cardamom", "Leather"],
      moods: ["warm", "deep", "calm"],
      seasons: ["fall", "winter"],
      situations: ["night", "date", "office"],
      density: "deep",
      bestFor: "저녁, 겨울, 깊은 인상을 원하는 날",
      description: "도시적인 우드 시그니처를 완성하는 대표 향.",
      story: {
        atmosphere: "저녁의 나무결과 은은한 스모크가 겹쳐지는 고요한 공간.",
        first: "스파이시한 카다멈이 단단한 우드로 빠르게 이어집니다.",
        dry: "가죽과 샌달우드가 따뜻하고 길게 남습니다.",
        best: "차분한 저녁 미팅 또는 겨울 산책.",
        lab: "우디 계열 입문자와 애호가 모두를 설득하는 중심 배치.",
      },
      similarScents: ["theNoir29", "gaiac10", "another13"],
    },
    {
      id: "another13",
      name: "Another 13",
      image: "./images/common/an13.png",
      family: "Musky",
      notes: ["Ambrox", "Jasmine", "Moss"],
      moods: ["fresh", "calm"],
      seasons: ["spring", "summer", "fall"],
      situations: ["daily", "office"],
      density: "soft",
      bestFor: "데일리, 오피스, 깨끗한 무드",
      description: "깨끗하고 현대적인 스킨-머스크 계열.",
      story: {
        atmosphere: "깨끗한 리넨과 종이 사이를 흐르는 미니멀한 공기.",
        first: "투명한 머스크가 선명하게 열립니다.",
        dry: "피부 위에서 맑은 잔향이 오래 지속됩니다.",
        best: "실내 업무, 셔츠 기반의 단정한 스타일.",
        lab: "향을 크게 드러내지 않지만 존재감은 분명한 구조.",
      },
      similarScents: ["matcha26", "bergamote22", "baie19"],
    },
    {
      id: "theNoir29",
      name: "Thé Noir 29",
      image: "./images/common/noir29.png",
      family: "Woody",
      notes: ["Black Tea", "Fig", "Cedar"],
      moods: ["deep", "calm", "warm"],
      seasons: ["fall", "winter", "spring"],
      situations: ["date", "night", "office"],
      density: "deep",
      bestFor: "가을/겨울, 저녁, 차분한 무드",
      description: "티 어코드와 우드의 조용한 긴장감.",
      story: {
        atmosphere: "따뜻한 차향과 마른 우드가 겹치는 서재의 밤.",
        first: "블랙티의 드라이한 깊이가 시작을 만듭니다.",
        dry: "피그의 부드러움이 잔향의 균형을 만듭니다.",
        best: "저녁 식사, 집중이 필요한 작업 시간.",
        lab: "차분함과 존재감 사이를 정교하게 맞춘 배치.",
      },
      similarScents: ["santal33", "rose31", "gaiac10"],
    },
    {
      id: "bergamote22",
      name: "Bergamote 22",
      image: "./images/common/베이1111.jpg",
      family: "Citrus",
      notes: ["Bergamot", "Petitgrain", "Musk"],
      moods: ["fresh", "calm"],
      seasons: ["spring", "summer"],
      situations: ["daily", "office", "date"],
      density: "light",
      bestFor: "봄/여름, 데일리, 라이트한 시작",
      description: "맑고 세련된 시트러스의 정석.",
      story: {
        atmosphere: "햇빛이 번지는 아침, 깨끗한 코튼 셔츠의 첫 인상.",
        first: "베르가못의 투명한 시트러스가 빠르게 열립니다.",
        dry: "가벼운 머스크가 피부에 얇게 남습니다.",
        best: "낮 시간, 따뜻한 계절, 첫 만남.",
        lab: "가볍지만 날아가지 않는 시트러스 균형의 기준.",
      },
      similarScents: ["another13", "matcha26", "baie19"],
    },
    {
      id: "rose31",
      name: "Rose 31",
      image: "./images/common/rose11.png",
      family: "Floral",
      notes: ["Rose", "Cumin", "Cedar"],
      moods: ["warm", "deep", "calm"],
      seasons: ["spring", "fall", "winter"],
      situations: ["date", "night", "daily"],
      density: "balanced",
      bestFor: "데이트, 저녁, 따뜻한 플로럴 무드",
      description: "로즈를 현대적으로 재해석한 우디 플로럴.",
      story: {
        atmosphere: "꽃의 부드러움 위로 스파이시한 온기가 스며드는 무드.",
        first: "로즈가 선명하게 열리며 즉시 시선을 잡습니다.",
        dry: "우디와 스파이스가 꽃의 결을 단단히 받쳐줍니다.",
        best: "데이트, 저녁 약속, 레이어드 스타일.",
        lab: "플로럴을 성숙하게 해석한 배치.",
      },
      similarScents: ["theNoir29", "santal33", "baie19"],
    },
    {
      id: "baie19",
      name: "Baie 19",
      image: "./images/common/am9.png",
      family: "Green",
      notes: ["Juniper", "Green Leaves", "Musk"],
      moods: ["fresh", "calm"],
      seasons: ["spring", "summer", "fall"],
      situations: ["daily", "office"],
      density: "soft",
      bestFor: "데일리, 오피스, 자연스러운 청량감",
      description: "비 온 뒤의 공기를 닮은 젠틀한 그린 프로파일.",
      story: {
        atmosphere: "비 온 뒤 젖은 흙과 초록 잎의 공기가 공존하는 순간.",
        first: "젖은 그린 노트가 차분하게 시작됩니다.",
        dry: "클린 머스크가 자연스럽게 마무리됩니다.",
        best: "낮 시간, 실내외를 오가는 일정.",
        lab: "청량함과 안정감을 동시에 담은 그린 계열.",
      },
      similarScents: ["bergamote22", "another13", "matcha26"],
    },
    {
      id: "matcha26",
      name: "Matcha 26",
      image: "./images/common/the+matcha.webp",
      family: "Green",
      notes: ["Matcha", "Fig", "Vetiver"],
      moods: ["calm", "fresh", "warm"],
      seasons: ["spring", "fall"],
      situations: ["daily", "date", "office"],
      density: "balanced",
      bestFor: "봄/가을, 차분한 데일리 무드",
      description: "그린티의 정제된 결을 현대적으로 풀어낸 향.",
      story: {
        atmosphere: "부드러운 그린 티가 흐르는 낮은 채도의 실내 공간.",
        first: "말차의 부드러운 쌉쌀함이 은은하게 시작됩니다.",
        dry: "베티버가 미세한 깊이를 더해 균형을 만듭니다.",
        best: "오후 미팅, 조용한 데이트, 서점.",
        lab: "그린과 우드의 균형점을 찾는 배치.",
      },
      similarScents: ["another13", "baie19", "bergamote22"],
    },
    {
      id: "gaiac10",
      name: "Gaiac 10",
      image: "./images/common/oud27.png",
      family: "Smoky",
      notes: ["Gaiac Wood", "Musk", "Incense"],
      moods: ["deep", "calm"],
      seasons: ["fall", "winter"],
      situations: ["night", "date"],
      density: "intense",
      bestFor: "겨울, 저녁, 강한 존재감",
      description: "짙은 우드와 스모크가 만드는 심도 있는 여운.",
      story: {
        atmosphere: "어두운 우드와 잔향이 천천히 겹치는 밤의 공기.",
        first: "드라이한 스모키 우드가 단단하게 시작됩니다.",
        dry: "머스크와 인센스가 길게 이어집니다.",
        best: "겨울 밤, 집중이 필요한 긴 시간.",
        lab: "강한 밀도를 선호하는 사용자를 위한 집중형 배치.",
      },
      similarScents: ["santal33", "theNoir29", "rose31"],
    },
  ];

  const els = {
    stepButtons: document.querySelectorAll("[data-step]"),
    stepCards: document.querySelectorAll("[data-step-card]"),
    progressWrap: document.getElementById("finder-progress"),
    progressNum: document.querySelector(".finder-progress-num"),
    progressHint: document.getElementById("finder-progress-hint"),
    progressBar: document.getElementById("finder-progress-bar"),
    progressFill: document.getElementById("finder-progress-fill"),
    selectionSummary: document.getElementById("finder-selection-summary"),
    feedback: document.getElementById("finder-feedback"),
    recommendBtn: document.getElementById("recommend-btn"),
    resetBtn: document.getElementById("reset-btn"),
    densityReset: document.getElementById("density-reset"),
    densityCount: document.getElementById("density-count"),
    densityCopy: document.getElementById("density-copy"),
    liveCard: document.getElementById("live-preview-card"),
    liveState: document.getElementById("live-state-label"),
    liveSummary: document.getElementById("live-summary"),
    liveDirection: document.getElementById("live-direction"),
    liveBestFor: document.getElementById("live-best-for"),
    liveAccord: document.getElementById("live-accord"),
    liveDensity: document.getElementById("live-density"),
    liveConfidence: document.getElementById("live-confidence"),
    liveConfidenceBar: document.getElementById("live-confidence-track-fill"),
    liveChips: document.getElementById("live-chip-wrap"),
    resultPrimary: document.getElementById("result-primary"),
    resultBadge: document.getElementById("result-badge"),
    resultName: document.getElementById("result-name"),
    resultFamily: document.getElementById("result-family"),
    resultDensity: document.getElementById("result-density"),
    resultEditorial: document.getElementById("result-editorial"),
    resultBestFor: document.getElementById("result-best-for"),
    resultNotes: document.getElementById("result-notes"),
    resultGuidance: document.getElementById("result-guidance"),
    resultDetailLink: document.getElementById("result-detail-link"),
    resultPrimaryImg: document.getElementById("result-primary-img"),
    resultPrimaryCaption: document.getElementById("result-primary-caption"),
    noteFitText: document.getElementById("note-fit-text"),
    noteFitMeta: document.getElementById("note-fit-meta"),
    usageFitText: document.getElementById("usage-fit-text"),
    usageFitMeta: document.getElementById("usage-fit-meta"),
    batchFitText: document.getElementById("batch-fit-text"),
    batchFitMeta: document.getElementById("batch-fit-meta"),
    similarGrid: document.getElementById("similar-scents-grid"),
    storyTitle: document.getElementById("story-title"),
    storyAtmosphere: document.getElementById("story-atmosphere"),
    storyFirst: document.getElementById("story-first"),
    storyDry: document.getElementById("story-dry"),
    storyBest: document.getElementById("story-best"),
    storyLab: document.getElementById("story-lab"),
    storyFigureImg: document.getElementById("story-figure-img"),
    storyVisualCaption: document.getElementById("story-visual-caption"),
    finalSummary: document.getElementById("final-summary"),
    finalBadge: document.getElementById("final-scent-badge"),
  };

  function countStepSelections() {
    return ["scent", "situation", "season", "mood"].filter((k) => !!state[k]).length;
  }

  function updateButtonGroup(step, value) {
    document.querySelectorAll(`button[data-step="${step}"]`).forEach((btn) => {
      const selected = btn.dataset.value === value;
      btn.classList.toggle("is-selected", selected);
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function updateStepCards() {
    els.stepCards.forEach((card) => {
      const key = card.getAttribute("data-step-card");
      card.classList.toggle("is-done", !!state[key]);
    });
  }

  function getProgressHint() {
    if (!state.scent) return "1단계 · 향 계열을 먼저 고르면 나머지 공식이 열립니다.";
    if (!state.situation) return "2단계 · 사용 상황을 채우면 착용 장면이 선명해집니다.";
    if (!state.season) return "3단계 · 계절감을 맞추면 발향 곡선이 정교해집니다.";
    if (!state.mood) return "4단계 · 무드를 선택하면 메인 추천과 근거 카드가 완성됩니다.";
    return "4개 항목을 모두 선택했습니다. 밀도를 조정한 뒤 「추천 결과 보기」로 결과를 확인하세요.";
  }

  function selectionSummaryText() {
    const parts = [];
    ["scent", "situation", "season", "mood", "density"].forEach((k) => {
      if (state[k]) parts.push(label[k][state[k]]);
    });
    return parts.length ? `현재 선택: ${parts.join(" / ")}` : "현재 선택: 없음";
  }

  function confidenceValue() {
    const steps = countStepSelections();
    let score = steps * 20;
    if (state.density) score += 15;
    return Math.min(score, 95);
  }

  function densityText() {
    return state.density ? label.density[state.density] : "Balanced";
  }

  function bestForText() {
    const parts = [];
    if (state.situation) parts.push(label.situation[state.situation]);
    if (state.season) parts.push(label.season[state.season]);
    if (state.mood) parts.push(label.mood[state.mood]);
    return parts.length ? `Best for: ${parts.join(" · ")}` : "Best for: 방향을 선택하는 중";
  }

  function estimatedDirectionText() {
    const parts = [];
    if (state.scent) parts.push(`${label.scent[state.scent]} axis`);
    if (state.mood) parts.push(`${label.mood[state.mood]} tone`);
    if (state.season) parts.push(`${label.season[state.season]} climate`);
    if (state.situation) parts.push(`${label.situation[state.situation]} context`);
    return parts.length ? parts.join(" · ") : "Direction pending";
  }

  function updateLivePreview() {
    const selected = countStepSelections();
    if (selected === 0) {
      els.liveCard?.setAttribute("data-state", "empty");
      els.liveState.textContent = "라이브 상태 · 대기";
      els.liveSummary.textContent = "아직 선택된 정보가 없습니다.";
      els.liveDirection.textContent = "향 계열부터 고르면 예상 어코드와 신뢰도가 즉시 반영됩니다.";
    } else if (selected < 4) {
      els.liveCard?.setAttribute("data-state", "partial");
      els.liveState.textContent = `라이브 상태 · ${selected}/4 구성 중`;
      els.liveSummary.textContent = `현재 ${selected}개의 선택으로 ${estimatedDirectionText()} 방향이 형성되고 있습니다.`;
      els.liveDirection.textContent = "남은 단계를 채울수록 추천 근거와 유사 향 매칭이 정밀해집니다.";
    } else {
      els.liveCard?.setAttribute("data-state", "complete");
      els.liveState.textContent = "라이브 상태 · 공식 완성";
      els.liveSummary.textContent = `${estimatedDirectionText()} 기반으로 추천 준비가 완료되었습니다.`;
      els.liveDirection.textContent = "밀도를 조정한 뒤 「추천 결과 보기」를 누르면 이미지·근거·스토리가 같은 순서로 갱신됩니다.";
    }

    els.liveBestFor.textContent = bestForText();
    els.liveAccord.textContent = state.scent
      ? `${label.scent[state.scent]} / ${state.mood ? label.mood[state.mood] : "Neutral"}`
      : "미정의";
    els.liveDensity.textContent = densityText();

    const confidence = confidenceValue();
    els.liveConfidence.textContent = `${confidence}%`;
    if (els.liveConfidenceBar) {
      els.liveConfidenceBar.style.width = `${confidence}%`;
    }

    const chips = [];
    ["scent", "situation", "season", "mood", "density"].forEach((k) => {
      if (state[k]) chips.push(`<span class="live-chip">${label[k][state[k]]}</span>`);
    });
    els.liveChips.innerHTML = chips.length ? chips.join("") : '<span class="live-chip is-empty">선택 없음</span>';
  }

  function score(item) {
    let s = 0;
    if (state.scent && item.family.toLowerCase() === state.scent) s += weight.scent;
    if (state.mood && item.moods.includes(state.mood)) s += weight.mood;
    if (state.season && item.seasons.includes(state.season)) s += weight.season;
    if (state.situation && item.situations.includes(state.situation)) s += weight.situation;
    if (state.density && item.density === state.density) s += weight.density;
    return s;
  }

  function topRecommendation() {
    return scents
      .map((item) => ({ item, score: score(item) }))
      .sort((a, b) => b.score - a.score)[0];
  }

  function renderGuidedState() {
    els.resultPrimary?.classList.add("is-pending");
    if (els.resultPrimaryImg) {
      els.resultPrimaryImg.src = "./images/common/베스트향수.jpg";
      els.resultPrimaryImg.alt = "추천 향 참고 이미지";
    }
    if (els.resultPrimaryCaption) els.resultPrimaryCaption.textContent = "추천 전 · 플레이스홀더";
    els.resultBadge.textContent = "Need more direction";
    els.resultName.textContent = "More Input Required";
    els.resultFamily.textContent = "Family · 선택을 최소 3개 이상 완료해 주세요.";
    els.resultDensity.textContent = `Density · ${densityText()}`;
    els.resultEditorial.textContent = "향 계열, 상황, 계절, 무드 중 최소 세 가지 선택이 필요합니다.";
    els.resultBestFor.textContent = "Best for · 선택 진행 단계";
    els.resultNotes.textContent = "Key notes · 선택 후 표시";
    els.resultGuidance.textContent = "향 계열을 포함한 3개 이상 선택 시 추천 결과를 안정적으로 생성할 수 있습니다.";
    els.resultDetailLink.classList.add("is-disabled");
    els.resultDetailLink.setAttribute("aria-disabled", "true");
    els.noteFitText.textContent = "선택된 기준이 충분하지 않아 노트 적합도를 계산할 수 없습니다.";
    els.noteFitMeta.textContent = "Select 3+ steps";
    els.usageFitText.textContent = "상황/계절 기반 사용 맥락을 만들기 위해 더 많은 입력이 필요합니다.";
    els.usageFitMeta.textContent = "Guided completion needed";
    els.batchFitText.textContent = "밀도와 무드가 결합되면 배치 성향을 제시합니다.";
    els.batchFitMeta.textContent = "Density + mood required";
    els.finalSummary.textContent = "아직 추천을 확정하기 전입니다. 최소 3단계 이상 선택 후 다시 시도해 주세요.";
    els.finalBadge.textContent = "Current Direction · In Progress";
  }

  function renderSimilar(item) {
    const list = item.similarScents
      .map((id) => scents.find((s) => s.id === id))
      .filter(Boolean)
      .slice(0, 3);

    els.similarGrid.innerHTML = list
      .map(
        (s) => `
        <article class="card similar-card">
          <div class="card-media similar-card-media">
            <img src="${s.image}" alt="${s.name} 제품 이미지" loading="lazy" decoding="async" />
          </div>
          <div class="card-body similar-card-body">
            <h3 class="card-title">${s.name}</h3>
            <p class="card-desc">${s.description}</p>
            <p class="similar-meta">Family · ${s.family}</p>
            <p class="similar-tags">Notes · ${s.notes.join(" / ")}</p>
            <p class="similar-density">Density · ${label.density[s.density]}</p>
            <div class="similar-actions">
              <a href="detail.html" class="btn btn-secondary">View Detail</a>
              <button type="button" class="btn btn-ghost">Compare</button>
              <button type="button" class="btn btn-ghost">Save for Later</button>
            </div>
          </div>
        </article>`
      )
      .join("");
  }

  function renderStory(item) {
    els.storyTitle.textContent = `${item.name} Atmosphere`;
    els.storyAtmosphere.textContent = item.story.atmosphere;
    els.storyFirst.textContent = item.story.first;
    els.storyDry.textContent = item.story.dry;
    els.storyBest.textContent = item.story.best;
    els.storyLab.textContent = item.story.lab;
    if (els.storyFigureImg) {
      els.storyFigureImg.src = item.image;
      els.storyFigureImg.alt = `${item.name} 분위기 참고 이미지`;
    }
    if (els.storyVisualCaption) els.storyVisualCaption.textContent = `Atmosphere · ${item.name}`;
  }

  function renderRecommendation(entry) {
    const item = entry.item;
    const confidence = Math.min(100, 35 + entry.score * 8);
    state.recommended = item;

    els.resultPrimary?.classList.remove("is-pending");
    if (els.resultPrimaryImg) {
      els.resultPrimaryImg.src = item.image;
      els.resultPrimaryImg.alt = `${item.name} 제품 이미지`;
    }
    if (els.resultPrimaryCaption) els.resultPrimaryCaption.textContent = `Editorial · ${item.name}`;
    els.resultBadge.textContent = `Crafted for your mood · ${confidence}%`;
    els.resultName.textContent = item.name;
    els.resultFamily.textContent = `Family · ${item.family}`;
    els.resultDensity.textContent = `Density · ${label.density[item.density]}`;
    els.resultEditorial.textContent = item.description;
    els.resultBestFor.textContent = `Best for · ${item.bestFor}`;
    els.resultNotes.textContent = `Key notes · ${item.notes.join(" / ")}`;
    els.resultGuidance.textContent = `${item.name}는 현재 선택과 높은 정합성을 보입니다. 유사 향과 스토리를 함께 비교해 최종 결정을 완성하세요.`;
    els.resultDetailLink.textContent = `View ${item.name}`;
    els.resultDetailLink.setAttribute("href", "detail.html");
    els.resultDetailLink.classList.remove("is-disabled");
    els.resultDetailLink.removeAttribute("aria-disabled");

    els.noteFitText.textContent = `${label.scent[state.scent] || item.family} 계열과 ${label.mood[state.mood] || "mood"} 톤이 ${item.name}의 핵심 노트와 정합합니다.`;
    els.noteFitMeta.textContent = item.notes.join(" · ");
    els.usageFitText.textContent = `${label.situation[state.situation] || "Daily"} 상황에서 ${item.name}의 잔향 전개가 가장 자연스럽게 유지됩니다.`;
    els.usageFitMeta.textContent = `${label.season[state.season] || "All Season"} · ${item.bestFor}`;
    els.batchFitText.textContent = `${label.density[item.density]} 밀도 기준에서 ${item.name} 배치가 안정적인 발향 곡선을 만듭니다.`;
    els.batchFitMeta.textContent = `${item.id.toUpperCase()} · Small Batch Character`;

    els.finalSummary.textContent = `${item.name}는 ${item.family} 기반에 ${label.mood[state.mood] || "balanced"} 무드를 더한 방향입니다. 지금 컬렉션에서 바로 확인해 보세요.`;
    els.finalBadge.textContent = `Current Direction · ${item.name}`;
    els.feedback.textContent = `${item.name} 추천이 생성되었습니다. Similar Scents와 Scent Story를 함께 확인해 보세요.`;

    renderSimilar(item);
    renderStory(item);
  }

  function renderDensity() {
    els.densityCount.textContent = state.density ? "1 / 5" : "0 / 5";
    els.densityCopy.textContent = state.density
      ? `${label.density[state.density]} 밀도가 적용되었습니다. 라이브 해석과 최종 추천에 반영됩니다.`
      : "밀도를 선택하면 라이브 해석과 최종 추천의 잔향 방향이 함께 조정됩니다.";
  }

  function renderProgress() {
    const selected = countStepSelections();
    if (els.progressNum) els.progressNum.textContent = String(selected);
    if (els.progressHint) els.progressHint.textContent = getProgressHint();
    if (els.progressBar) els.progressBar.setAttribute("aria-valuenow", String(selected));
    if (els.progressFill) els.progressFill.style.width = `${(selected / 4) * 100}%`;
    if (els.selectionSummary) els.selectionSummary.textContent = selectionSummaryText();
  }

  function rerenderRealtime() {
    updateStepCards();
    renderProgress();
    renderDensity();
    updateLivePreview();

    if (state.recommended) return;

    if (!state.scent) {
      els.feedback.textContent = "가장 먼저 향 계열을 선택해 주세요.";
    } else if (countStepSelections() < 4) {
      els.feedback.textContent = "남은 단계를 선택해 추천 정확도를 더 높여보세요.";
    } else {
      els.feedback.textContent = "추천 준비가 완료되었습니다. Get Recommendation 버튼을 눌러 결과를 확인하세요.";
    }
  }

  function resetAll() {
    state.scent = "";
    state.situation = "";
    state.season = "";
    state.mood = "";
    state.density = "";
    state.recommended = null;

    ["scent", "situation", "season", "mood", "density"].forEach((k) => updateButtonGroup(k, ""));
    rerenderRealtime();
    renderGuidedState();

    els.similarGrid.innerHTML = `
      <article class="card similar-card"><div class="card-media similar-card-media"><img src="./images/common/나만의향.jpg" alt="유사 향 자리 표시 이미지" loading="lazy" decoding="async" /></div><div class="card-body similar-card-body"><h3 class="card-title">추천 대기 중</h3><p class="card-desc">최종 추천이 확정되면 유사 향 3종을 표시합니다.</p></div></article>
      <article class="card similar-card"><div class="card-media similar-card-media"><img src="./images/common/Floral.png" alt="유사 향 자리 표시 이미지" loading="lazy" decoding="async" /></div><div class="card-body similar-card-body"><h3 class="card-title">Related Profiles</h3><p class="card-desc">향 선택 결과에 따라 동적으로 구성됩니다.</p></div></article>
      <article class="card similar-card"><div class="card-media similar-card-media"><img src="./images/common/woody.png" alt="유사 향 자리 표시 이미지" loading="lazy" decoding="async" /></div><div class="card-body similar-card-body"><h3 class="card-title">Explore More</h3><p class="card-desc">추천 결과 이후 대안 탐색을 시작할 수 있습니다.</p></div></article>
    `;

    if (els.storyFigureImg) {
      els.storyFigureImg.src = "./images/common/story.jpg";
      els.storyFigureImg.alt = "향 분위기 참고 이미지";
    }
    if (els.storyVisualCaption) els.storyVisualCaption.textContent = "Atmosphere · 대기 중";

    els.storyTitle.textContent = "추천 대기 중";
    els.storyAtmosphere.textContent = "추천이 확정되면 향이 만들어내는 공기와 인상을 보여드립니다.";
    els.storyFirst.textContent = "추천 확정 후 첫 인상 노트를 제공합니다.";
    els.storyDry.textContent = "잔향 전개는 선택된 무드와 밀도를 기반으로 안내됩니다.";
    els.storyBest.textContent = "추천 확정 후 가장 어울리는 착용 장면을 제시합니다.";
    els.storyLab.textContent = "선택이 완료되면 배치 관점의 코멘트가 표시됩니다.";
  }

  function onRecommendClick() {
    if (!state.scent || countStepSelections() < 3) {
      renderGuidedState();
      els.feedback.textContent = !state.scent
        ? "향 계열(Scent) 선택은 필수입니다. 먼저 향의 중심을 선택해 주세요."
        : "추천 생성을 위해 향 계열 포함 최소 3개 항목을 선택해 주세요.";
      return;
    }

    const best = topRecommendation();
    if (!best || best.score <= 0) {
      renderGuidedState();
      els.feedback.textContent = "현재 입력으로는 추천 신뢰도가 낮습니다. 선택을 보강한 뒤 다시 시도해 주세요.";
      return;
    }

    renderRecommendation(best);
    document.getElementById("finder-result-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getStepImage(step) {
    return document.getElementById("finder-step-img-" + step);
  }

  function applyStepImage(step, value) {
    const img = getStepImage(step);
    if (!img) return;
    if (!value) {
      const fallback = img.dataset.default || img.getAttribute("src");
      img.src = fallback;
      return;
    }
    const btn = document.querySelector(
      '[data-step="' + step + '"][data-value="' + value + '"]'
    );
    if (!btn) return;
    const nextSrc = btn.dataset.image;
    const nextAlt = btn.dataset.imageAlt;
    if (nextSrc && img.getAttribute("src") !== nextSrc) {
      img.src = nextSrc;
    }
    if (nextAlt) img.alt = nextAlt;
  }

  function resetStepImages() {
    ["scent", "situation", "season", "mood"].forEach((step) => applyStepImage(step, ""));
  }

  function bindEvents() {
    els.stepButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const step = btn.dataset.step;
        const value = btn.dataset.value;
        state.recommended = null;
        state[step] = state[step] === value ? "" : value;
        updateButtonGroup(step, state[step]);
        applyStepImage(step, state[step]);
        rerenderRealtime();
        renderGuidedState();
      });
    });

    els.recommendBtn?.addEventListener("click", onRecommendClick);
    els.resetBtn?.addEventListener("click", () => {
      resetAll();
      resetStepImages();
    });
    els.densityReset?.addEventListener("click", () => {
      state.density = "";
      updateButtonGroup("density", "");
      state.recommended = null;
      rerenderRealtime();
      renderGuidedState();
    });
  }

  function init() {
    if (!els.recommendBtn) return;
    bindEvents();
    resetAll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
