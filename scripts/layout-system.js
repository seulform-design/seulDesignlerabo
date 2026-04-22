/**
 * LE LABO · Layout System Guardian
 * SINGLE SOURCE OF TRUTH for Global Shell (Announcement · Header · Footer)
 *
 * Responsibilities
 *  - Inject the shell on every page (announcement, header, mega menu, footer)
 *  - Persist announcement dismissal across sessions (localStorage)
 *  - Coordinate mutually-exclusive overlays (mega menu ↔ inline search)
 *  - Keep active GNB state in sync with the current path (with hash-aware match)
 *  - Directly compute the inline-search width so it NEVER collides with GIFT or SEARCH
 */

(function () {
    'use strict';

    const STORAGE = {
        announcementClosed: 'lelabo.announcementClosed'
    };

    const SELECTORS = {
        wrap: '#wrap',
        main: '#main-content',
        header: '#top',
        announcement: '#announcement-bar',
        announcementClose: '#announcement-close',
        megaToggle: '#mega-toggle',
        megaPanel: '#mega-menu-panel',
        searchToggle: '#search-toggle',
        searchForm: '#header-search-form',
        searchInput: '#global-search',
        gnb: '.gnb',
        actions: '.header-actions'
    };

    const debounce = (fn, wait = 120) => {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    };

    class LayoutSystemGuardian {
        constructor() {
            this.state = {
                megaOpen: false,
                searchOpen: false
            };
        }

        // ── INIT ───────────────────────────────────────────────────────────
        init() {
            try {
                this.injectAnnouncement();
                this.injectHeader();
                this.injectFooter();
                this.setActiveState();
                this.bindAnnouncement();
                this.bindMegaMenu();
                this.bindSearch();
                this.bindFooter();
                this.bindGlobal();
            } catch (err) {
                // Defensive: one broken page should not take the whole shell down.
                // eslint-disable-next-line no-console
                console.error('[LayoutSystem]', err);
            }
        }

        // ── INJECTION ──────────────────────────────────────────────────────
        injectAnnouncement() {
            const wrap = document.querySelector(SELECTORS.wrap);
            if (!wrap || document.querySelector(SELECTORS.announcement)) return;

            let dismissed = false;
            try { dismissed = localStorage.getItem(STORAGE.announcementClosed) === 'true'; } catch (_) {}
            if (dismissed) return;

            wrap.insertAdjacentHTML('afterbegin', `
                <aside class="announcement-bar" id="announcement-bar" role="region" aria-label="공지사항">
                    <div class="container">
                        <div class="announcement-content">
                            <p>전 상품 무료 배송 · 시그니처 선물 포장 서비스</p>
                            <button type="button" class="announcement-close" id="announcement-close" aria-label="공지사항 닫기">✕</button>
                        </div>
                    </div>
                </aside>
            `);
        }

        injectHeader() {
            const wrap = document.querySelector(SELECTORS.wrap);
            const main = document.querySelector(SELECTORS.main);
            if (!wrap || !main || document.querySelector(SELECTORS.header)) return;

            const path = (window.location.pathname || '').toLowerCase();
            const isMainPage = path.endsWith('/index.html') || path === '/' || path.endsWith('/');
            const logoTag = isMainPage ? 'h1' : 'div';

            main.insertAdjacentHTML('beforebegin', `
                <header class="header" id="top" role="banner">
                    <div class="container">
                        <div class="header-content">
                            <${logoTag} class="logo"><a href="index.html" aria-label="LE LABO 홈으로 이동">LE LABO</a></${logoTag}>
                            <nav class="gnb" aria-label="메인 메뉴">
                                <ul class="gnb-list">
                                    <li class="gnb-item"><a href="shop.html">SHOP</a></li>
                                    <li class="gnb-item"><a href="finder.html">SCENT FINDER</a></li>
                                    <li class="gnb-item"><a href="ingredient.html">INGREDIENT</a></li>
                                    <li class="gnb-item"><a href="journal.html">JOURNAL</a></li>
                                    <li class="gnb-item"><a href="gift.html">GIFT</a></li>
                                </ul>
                            </nav>
                            <div class="header-actions">
                                <div class="header-search-wrap">
                                    <form class="header-search" id="header-search-form" role="search" action="shop.html" method="get">
                                        <label for="global-search" class="sr-only">검색어 입력</label>
                                        <input type="search" id="global-search" name="q" class="search-input" placeholder="SEARCH" autocomplete="off" aria-hidden="true" />
                                    </form>
                                    <button type="button" class="icon-btn search-toggle" id="search-toggle" aria-expanded="false" aria-controls="header-search-form" aria-label="검색 열기">
                                        <span class="search-toggle-label" aria-hidden="true">SEARCH</span>
                                    </button>
                                </div>
                                <a href="cart.html" class="icon-btn" aria-label="장바구니 이동">CART</a>
                                <button type="button" class="icon-btn mega-toggle" id="mega-toggle" aria-expanded="false" aria-controls="mega-menu-panel" aria-label="메가 메뉴 열기">
                                    <span class="mega-toggle-label-open" aria-hidden="true">MENU</span>
                                    <span class="mega-toggle-label-close" aria-hidden="true">CLOSE</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="mega-menu" id="mega-menu-panel" aria-label="확장 메뉴" aria-hidden="true">
                        <div class="container">
                            <div class="mega-menu-content">
                                <section class="mega-primary" aria-labelledby="mega-primary-title">
                                    <p class="mega-primary-title" id="mega-primary-title">NAVIGATION</p>
                                    <ul class="mega-primary-list">
                                        <li><a href="shop.html">Shop</a></li>
                                        <li><a href="finder.html">Scent Finder</a></li>
                                        <li><a href="ingredient.html">Ingredient</a></li>
                                        <li><a href="journal.html">Journal</a></li>
                                        <li><a href="gift.html">Gift</a></li>
                                    </ul>
                                </section>
                                <section class="mega-col" aria-labelledby="mega-shop-title">
                                    <div class="mega-col-head"><h2 class="mega-title" id="mega-shop-title">SHOP</h2></div>
                                    <div class="mega-col-body">
                                        <ul class="mega-list">
                                            <li><a href="shop.html">Fragrance</a></li>
                                            <li><a href="shop.html">Body</a></li>
                                            <li><a href="shop.html">Home</a></li>
                                            <li><a href="shop.html">Best Sellers</a></li>
                                        </ul>
                                    </div>
                                </section>
                                <section class="mega-col" aria-labelledby="mega-scent-title">
                                    <div class="mega-col-head"><h2 class="mega-title" id="mega-scent-title">SCENT TYPE</h2></div>
                                    <div class="mega-col-body">
                                        <ul class="mega-list">
                                            <li><a href="shop.html?type=woody">Woody</a></li>
                                            <li><a href="shop.html?type=floral">Floral</a></li>
                                            <li><a href="shop.html?type=citrus">Citrus</a></li>
                                            <li><a href="shop.html?type=smoky">Smoky</a></li>
                                        </ul>
                                    </div>
                                </section>
                                <section class="mega-col" aria-labelledby="mega-discover-title">
                                    <div class="mega-col-head"><h2 class="mega-title" id="mega-discover-title">DISCOVER</h2></div>
                                    <div class="mega-col-body">
                                        <ul class="mega-list">
                                            <li><a href="finder.html">Scent Finder</a></li>
                                            <li><a href="ingredient.html">Ingredient</a></li>
                                            <li><a href="journal.html">Journal</a></li>
                                            <li><a href="gift.html">Gift</a></li>
                                        </ul>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </header>
            `);
        }

        injectFooter() {
            const wrap = document.querySelector(SELECTORS.wrap);
            if (!wrap || document.querySelector('footer')) return;

            const year = new Date().getFullYear();

            const instagramIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`;
            const youtubeIcon = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none"/></svg>`;

            wrap.insertAdjacentHTML('beforeend', `
                <footer class="footer" role="contentinfo">
                    <div class="container">
                        <div class="footer-top">
                            <div class="footer-brand">
                                <p class="footer-logo">LE LABO</p>
                                <p class="footer-tagline">The Forest Laboratory</p>
                                <p class="footer-copy">숲에서 시작된 원료가 연구소를 거쳐 당신의 향이 됩니다.</p>
                            </div>
                            <nav class="footer-nav" aria-label="사이트 메뉴">
                                <section class="footer-col" aria-labelledby="footer-shop-title">
                                    <h2 class="footer-title" id="footer-shop-title">SHOP</h2>
                                    <ul class="footer-list">
                                        <li><a href="shop.html">Fragrance</a></li>
                                        <li><a href="shop.html">Body Care</a></li>
                                        <li><a href="shop.html">Home Fragrance</a></li>
                                        <li><a href="shop.html">Limited Edition</a></li>
                                    </ul>
                                </section>
                                <section class="footer-col" aria-labelledby="footer-discover-title">
                                    <h2 class="footer-title" id="footer-discover-title">DISCOVER</h2>
                                    <ul class="footer-list">
                                        <li><a href="finder.html">Scent Finder</a></li>
                                        <li><a href="ingredient.html">Ingredients</a></li>
                                        <li><a href="index.html#lab">The Lab</a></li>
                                        <li><a href="journal.html">Journal</a></li>
                                    </ul>
                                </section>
                                <section class="footer-col" aria-labelledby="footer-care-title">
                                    <h2 class="footer-title" id="footer-care-title">CUSTOMER CARE</h2>
                                    <ul class="footer-list">
                                        <li><a href="#">Shipping & Returns</a></li>
                                        <li><a href="gift.html">Gift Customization</a></li>
                                        <li><a href="#">FAQ</a></li>
                                        <li><a href="#">Contact</a></li>
                                    </ul>
                                </section>
                                <section class="footer-col footer-col-news" aria-labelledby="footer-news-title">
                                    <h2 class="footer-title" id="footer-news-title">NEWSLETTER</h2>
                                    <p class="footer-news-desc">새로운 배치와 계절의 향 이야기를 가장 먼저 받아보세요.</p>
                                    <form class="footer-news-form" id="footer-news-form" novalidate>
                                        <label class="sr-only" for="footer-news-input">이메일 주소</label>
                                        <input type="email" id="footer-news-input" class="footer-news-input" placeholder="EMAIL ADDRESS" autocomplete="email" required />
                                        <button type="submit" class="footer-news-submit" aria-label="뉴스레터 구독">
                                            <span class="footer-news-submit-label">Subscribe</span>
                                            <span class="footer-news-submit-arrow" aria-hidden="true">→</span>
                                        </button>
                                        <p class="footer-news-feedback" id="footer-news-feedback" role="status" aria-live="polite"></p>
                                    </form>
                                </section>
                            </nav>
                        </div>
                        <div class="footer-bottom">
                            <div class="footer-bottom-inner">
                                <p class="footer-copyright">© <span id="footer-year">${year}</span> LE LABO Forest Laboratory. All rights reserved.</p>
                                <div class="footer-meta">
                                    <button type="button" class="region-selector" aria-haspopup="listbox" aria-expanded="false">
                                        <span>South Korea (KRW)</span>
                                        <span class="region-selector-caret" aria-hidden="true">▾</span>
                                    </button>
                                    <ul class="footer-legal">
                                        <li><a href="#">Privacy</a></li>
                                        <li><a href="#">Terms</a></li>
                                        <li><a href="#">Cookies</a></li>
                                    </ul>
                                    <ul class="footer-social" aria-label="소셜 링크">
                                        <li><a href="#" aria-label="Instagram">${instagramIcon}<span class="sr-only">Instagram</span></a></li>
                                        <li><a href="#" aria-label="YouTube">${youtubeIcon}<span class="sr-only">YouTube</span></a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            `);
        }

        // ── ACTIVE STATE ───────────────────────────────────────────────────
        setActiveState() {
            const rawPath = (window.location.pathname || '').toLowerCase();
            const file = rawPath.split('/').pop() || 'index.html';
            document.querySelectorAll('.gnb-list a, .mega-primary-list a').forEach(link => {
                const href = (link.getAttribute('href') || '').toLowerCase().split('#')[0];
                link.classList.toggle('is-active', !!href && href === file);
            });
        }

        // ── ANNOUNCEMENT ───────────────────────────────────────────────────
        bindAnnouncement() {
            const bar = document.querySelector(SELECTORS.announcement);
            const closeBtn = document.querySelector(SELECTORS.announcementClose);
            if (!bar || !closeBtn) return;

            closeBtn.addEventListener('click', () => {
                bar.setAttribute('hidden', '');
                try { localStorage.setItem(STORAGE.announcementClosed, 'true'); } catch (_) {}
                setTimeout(() => bar.remove(), 300);
            });
        }

        // ── MEGA MENU ──────────────────────────────────────────────────────
        bindMegaMenu() {
            const headerEl = document.querySelector(SELECTORS.header);
            const toggle = document.querySelector(SELECTORS.megaToggle);
            const menu = document.querySelector(SELECTORS.megaPanel);
            if (!headerEl || !toggle || !menu) return;

            let savedScrollY = 0;

            // iOS-safe scroll lock: pin body with fixed + top: -scrollY to freeze
            // the page. Falls back to overflow:hidden on other browsers.
            const lockScroll = () => {
                savedScrollY = window.scrollY || 0;
                document.body.style.position = 'fixed';
                document.body.style.top = `-${savedScrollY}px`;
                document.body.style.left = '0';
                document.body.style.right = '0';
                document.body.style.overflow = 'hidden';
            };
            const unlockScroll = () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.left = '';
                document.body.style.right = '';
                document.body.style.overflow = '';
                window.scrollTo(0, savedScrollY);
            };

            this.setMegaOpen = (open) => {
                if (this.state.megaOpen === !!open) return;     // no-op
                if (open) this.setSearchOpen?.(false);          // mutually exclusive with search
                this.state.megaOpen = !!open;
                headerEl.classList.toggle('is-menu-open', !!open);
                toggle.setAttribute('aria-expanded', String(!!open));
                toggle.setAttribute('aria-label', open ? '메가 메뉴 닫기' : '메가 메뉴 열기');
                menu.setAttribute('aria-hidden', String(!open));
                if (open) {
                    lockScroll();
                    setTimeout(() => menu.querySelector('a')?.focus(), 140);
                } else {
                    unlockScroll();
                }
            };

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setMegaOpen(!this.state.megaOpen);
            });

            // Focus trap — include the toggle itself so Shift+Tab from the first
            // link returns cleanly to the CLOSE button (which is the toggle).
            menu.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;
                const focusables = [toggle, ...menu.querySelectorAll('a, button')].filter(Boolean);
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            });

            // Close on link click
            menu.addEventListener('click', (e) => {
                if (e.target.closest('a')) this.setMegaOpen(false);
            });
        }

        // ── FOOTER (newsletter subscribe) ─────────────────────────────────
        bindFooter() {
            const form = document.getElementById('footer-news-form');
            const input = document.getElementById('footer-news-input');
            const feedback = document.getElementById('footer-news-feedback');
            if (!form || !input || !feedback) return;

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const value = input.value.trim();
                form.classList.remove('is-error', 'is-success');

                if (!value || !emailPattern.test(value)) {
                    form.classList.add('is-error');
                    feedback.textContent = '유효한 이메일 주소를 입력해주세요.';
                    input.focus();
                    return;
                }

                form.classList.add('is-success');
                feedback.textContent = '구독 신청이 완료되었습니다. 감사합니다.';
                input.value = '';
                input.blur();
            });

            input.addEventListener('input', () => {
                if (form.classList.contains('is-error')) {
                    form.classList.remove('is-error');
                    feedback.textContent = '';
                }
            });
        }

        // ── SEARCH (inline slide-out, collision-safe) ─────────────────────
        bindSearch() {
            const headerEl = document.querySelector(SELECTORS.header);
            const toggle = document.querySelector(SELECTORS.searchToggle);
            const form = document.querySelector(SELECTORS.searchForm);
            const input = document.querySelector(SELECTORS.searchInput);
            if (!headerEl || !toggle || !form || !input) return;

            // Measure the literal empty space between GNB's right edge and
            // the SEARCH TOGGLE button's left edge. Using the toggle (not the
            // whole .header-actions container) gives us the real empty gap.
            const computeWidth = () => {
                const gnb = headerEl.querySelector(SELECTORS.gnb);
                if (!gnb) return 0;
                const g = gnb.getBoundingClientRect();
                const t = toggle.getBoundingClientRect();
                // 24px total safety margin (12px each side) so GIFT & SEARCH never touch.
                const raw = t.left - g.right - 24;
                return Math.max(0, Math.min(260, raw));
            };

            this.setSearchOpen = (open) => {
                if (open) this.setMegaOpen?.(false);       // mutually exclusive with mega
                this.state.searchOpen = !!open;
                form.classList.toggle('is-open', !!open);
                toggle.setAttribute('aria-expanded', String(!!open));
                toggle.setAttribute('aria-label', open ? '검색 닫기' : '검색 열기');
                input.setAttribute('aria-hidden', String(!open));

                if (open) {
                    // Read layout AFTER the browser has applied any pending style changes
                    requestAnimationFrame(() => {
                        const w = computeWidth();
                        form.style.width = w + 'px';
                        setTimeout(() => input.focus({ preventScroll: true }), 120);
                    });
                } else {
                    form.style.width = '';
                    input.blur();
                }
            };

            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.setSearchOpen(!this.state.searchOpen);
            });

            form.addEventListener('submit', (e) => {
                if (!input.value.trim()) {
                    e.preventDefault();
                    input.focus();
                }
            });

            // Recompute on viewport resize while search stays open
            window.addEventListener('resize', debounce(() => {
                if (this.state.searchOpen) form.style.width = computeWidth() + 'px';
            }, 120));
        }

        // ── GLOBAL (ESC · outside click — centralised) ────────────────────
        bindGlobal() {
            const headerEl = document.querySelector(SELECTORS.header);

            // ESC closes whichever is open
            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Escape') return;
                if (this.state.megaOpen) {
                    this.setMegaOpen(false);
                    document.querySelector(SELECTORS.megaToggle)?.focus();
                } else if (this.state.searchOpen) {
                    this.setSearchOpen(false);
                    document.querySelector(SELECTORS.searchToggle)?.focus();
                }
            });

            // Outside click closes overlays
            document.addEventListener('click', (e) => {
                if (!headerEl) return;
                const insideHeader = headerEl.contains(e.target);

                if (this.state.megaOpen && !insideHeader) this.setMegaOpen(false);

                if (this.state.searchOpen) {
                    const form = document.querySelector(SELECTORS.searchForm);
                    const toggle = document.querySelector(SELECTORS.searchToggle);
                    if (!form?.contains(e.target) && !toggle?.contains(e.target)) {
                        this.setSearchOpen(false);
                    }
                }
            });
        }
    }

    const guardian = new LayoutSystemGuardian();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => guardian.init());
    } else {
        guardian.init();
    }
})();
