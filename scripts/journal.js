(() => {
  /* ==========================================================
     1) Topic Filter  (existing behavior, preserved)
     ========================================================== */
  const filterButtons = document.querySelectorAll("[data-journal-filter]");
  const archiveCards = document.querySelectorAll("#section-archive .journal-card[data-topic]");
  const archiveGrid = document.querySelector("#section-archive .card-grid");
  const emptyEl = document.querySelector("#journal-empty");
  const statusEl = document.querySelector("#journal-filter-status");
  const visibleCountEl = document.querySelector("#journal-visible-count");
  const totalCountEl = document.querySelector("#journal-total-count");
  const validTopics = new Set(["all", "craft", "lab", "ingredient", "scent", "seasonal", "material"]);

  if (filterButtons.length && archiveCards.length && archiveGrid) {
    const totalCount = archiveCards.length;
    if (totalCountEl) totalCountEl.textContent = String(totalCount);

    const applyFilter = (topic) => {
      let visibleCount = 0;
      archiveCards.forEach((card) => {
        const match = topic === "all" || card.dataset.topic === topic;
        card.hidden = !match;
        if (match) visibleCount += 1;
      });

      if (emptyEl) emptyEl.hidden = visibleCount !== 0;
      if (archiveGrid) archiveGrid.hidden = visibleCount === 0;
      if (visibleCountEl) visibleCountEl.textContent = String(visibleCount);

      if (statusEl) {
        statusEl.textContent = topic === "all"
          ? `전체 아카이브를 표시 중입니다 · ${visibleCount}편의 기록`
          : `${topic.toUpperCase()} 주제 ${visibleCount}편을 표시 중입니다.`;
      }
    };

    const syncButtons = (topic) => {
      filterButtons.forEach((btn) => {
        const selected = btn.dataset.journalFilter === topic;
        btn.classList.toggle("is-selected", selected);
        btn.setAttribute("aria-pressed", String(selected));
      });
    };

    const updateUrl = (topic) => {
      const url = new URL(window.location.href);
      if (topic === "all") {
        url.searchParams.delete("topic");
      } else {
        url.searchParams.set("topic", topic);
      }
      window.history.replaceState({}, "", url.toString());
    };

    const getTopicFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const topic = (params.get("topic") || "all").toLowerCase();
      return validTopics.has(topic) ? topic : "all";
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const { journalFilter } = button.dataset;
        if (!journalFilter || !validTopics.has(journalFilter)) return;
        syncButtons(journalFilter);
        applyFilter(journalFilter);
        updateUrl(journalFilter);
      });
    });

    const initialTopic = getTopicFromUrl();
    syncButtons(initialTopic);
    applyFilter(initialTopic);
  }

  /* ==========================================================
     2) Save buttons  — localStorage toggle per article
     ========================================================== */
  const SAVE_KEY = "lelabo-journal-saved-v1";

  const readSaved = () => {
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (_) {
      return new Set();
    }
  };

  const writeSaved = (set) => {
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(Array.from(set)));
    } catch (_) {
      /* ignore private-mode storage errors */
    }
  };

  const getArticleId = (btn) => {
    const card = btn.closest(".journal-card");
    if (!card) return null;
    const title = card.querySelector(".card-title");
    return title ? title.textContent.trim() : null;
  };

  const paintSaveState = (btn, isSaved) => {
    btn.classList.toggle("is-saved", isSaved);
    btn.setAttribute("aria-pressed", String(isSaved));
    const icon = btn.querySelector("[aria-hidden='true']");
    const label = btn.querySelector(".journal-icon-btn-label");
    if (icon) icon.textContent = isSaved ? "♥" : "♡";
    if (label) label.textContent = isSaved ? "Saved" : "Save";
  };

  const saveButtons = document.querySelectorAll(".journal-icon-btn[data-save]");
  if (saveButtons.length) {
    const saved = readSaved();

    saveButtons.forEach((btn) => {
      const id = getArticleId(btn);
      if (id && saved.has(id)) paintSaveState(btn, true);

      btn.addEventListener("click", () => {
        const articleId = getArticleId(btn);
        if (!articleId) return;
        const current = readSaved();
        if (current.has(articleId)) {
          current.delete(articleId);
          paintSaveState(btn, false);
        } else {
          current.add(articleId);
          paintSaveState(btn, true);
        }
        writeSaved(current);
      });
    });
  }

  /* ==========================================================
     3) Share buttons  — Web Share API with clipboard fallback
     ========================================================== */
  const announce = (btn, message) => {
    const label = btn.querySelector(".journal-icon-btn-label");
    if (!label) return;
    const original = label.textContent;
    label.textContent = message;
    btn.classList.add("is-feedback");
    window.setTimeout(() => {
      label.textContent = original;
      btn.classList.remove("is-feedback");
    }, 1600);
  };

  const shareButtons = document.querySelectorAll(".journal-icon-btn[data-share]");
  if (shareButtons.length) {
    shareButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const card = btn.closest(".journal-card");
        const title = card?.querySelector(".card-title")?.textContent?.trim() || document.title;
        const link = card?.querySelector(".journal-read-link, .btn")?.href || window.location.href;

        if (navigator.share) {
          try {
            await navigator.share({ title, url: link, text: `${title} — LE LABO Journal` });
            return;
          } catch (_) {
            /* user cancelled — fall through to clipboard */
          }
        }

        try {
          await navigator.clipboard.writeText(link);
          announce(btn, "Copied");
        } catch (_) {
          announce(btn, "Failed");
        }
      });
    });
  }

  /* ==========================================================
     4) Subscribe form  — validation + local success state
     ========================================================== */
  const SUBSCRIBE_KEY = "lelabo-journal-subscribed-v1";
  const form = document.querySelector("#journal-subscribe-form");
  const emailInput = document.querySelector("#journal-subscribe-email");
  const subscribeStatus = document.querySelector("#journal-subscribe-status");

  if (form && emailInput && subscribeStatus) {
    const setStatus = (message, tone) => {
      subscribeStatus.textContent = message;
      subscribeStatus.dataset.tone = tone || "";
    };

    // Re-surface prior subscription state
    try {
      const prior = window.localStorage.getItem(SUBSCRIBE_KEY);
      if (prior) {
        setStatus(`이미 구독 중입니다 · ${prior}`, "success");
      }
    } catch (_) { /* ignore */ }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = (emailInput.value || "").trim();

      if (!value || !emailInput.checkValidity()) {
        setStatus("올바른 이메일 주소를 입력해 주세요.", "error");
        emailInput.focus();
        return;
      }

      try {
        window.localStorage.setItem(SUBSCRIBE_KEY, value);
      } catch (_) { /* ignore */ }

      setStatus(`구독 신청이 완료되었습니다 · ${value}로 다음 호를 보내드립니다.`, "success");
      form.reset();
    });
  }
})();
