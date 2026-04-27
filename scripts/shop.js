/**
 * LE LABO - shop.js
 * Stable filtering / sorting / progressive reveal for shop grid.
 */

class ShopSystem {
    constructor() {
        this.state = {
            scent: 'all',
            situation: 'all',
            sort: 'featured',
            visibleCount: 8
        };

        this.elements = {
            chips: Array.from(document.querySelectorAll('.filter-chip-list .chip')),
            productGrid: document.getElementById('shop-product-grid'),
            productCards: Array.from(document.querySelectorAll('#shop-product-grid .product-card')),
            totalCount: document.getElementById('shop-count'),
            resultCountStrong: document.querySelector('#shop-result-count strong'),
            resultCountTotal: document.querySelector('#shop-result-count span'),
            activeFilterCount: document.getElementById('shop-filter-count'),
            resetButton: document.getElementById('shop-filter-reset'),
            emptyState: document.getElementById('shop-empty'),
            loadMoreButton: document.getElementById('shop-load-more'),
            loadProgress: document.getElementById('shop-load-progress')
        };

        this.initialOrder = new Map();
        this.elements.productCards.forEach((card, idx) => this.initialOrder.set(card, idx));
    }

    init() {
        if (!this.elements.productGrid || this.elements.productCards.length === 0) return;
        this.bindEvents();
        this.applyViewState();
    }

    bindEvents() {
        this.elements.chips.forEach((chip) => {
            chip.addEventListener('click', () => this.handleChipClick(chip));
        });

        if (this.elements.resetButton) {
            this.elements.resetButton.addEventListener('click', () => this.resetFilters());
        }

        if (this.elements.loadMoreButton) {
            this.elements.loadMoreButton.addEventListener('click', () => {
                this.state.visibleCount += 4;
                this.applyViewState();
            });
        }
    }

    handleChipClick(chip) {
        const group = chip.dataset.filterGroup;
        if (!group) return;

        this.elements.chips
            .filter((item) => item.dataset.filterGroup === group)
            .forEach((item) => item.setAttribute('aria-pressed', 'false'));

        chip.setAttribute('aria-pressed', 'true');

        if (group === 'sort') {
            this.state.sort = chip.dataset.sort || 'featured';
        } else {
            this.state[group] = chip.dataset.filterValue || 'all';
        }

        this.state.visibleCount = 8;
        this.applyViewState();
    }

    resetFilters() {
        this.state = { scent: 'all', situation: 'all', sort: 'featured', visibleCount: 8 };

        this.elements.chips.forEach((chip) => {
            const isDefault =
                (chip.dataset.filterGroup === 'sort' && chip.dataset.sort === 'featured') ||
                (chip.dataset.filterGroup !== 'sort' && chip.dataset.filterValue === 'all');
            chip.setAttribute('aria-pressed', isDefault ? 'true' : 'false');
        });

        this.applyViewState();
    }

    getFilteredCards() {
        return this.elements.productCards.filter((card) => {
            const scent = card.dataset.scent || '';
            const situations = (card.dataset.situation || '')
                .split(',')
                .map((item) => item.trim())
                .filter(Boolean);

            const scentMatch = this.state.scent === 'all' || this.state.scent === scent;
            const situationMatch = this.state.situation === 'all' || situations.includes(this.state.situation);

            return scentMatch && situationMatch;
        });
    }

    getSortedCards(cards) {
        const sorted = [...cards];

        if (this.state.sort === 'best-sellers') {
            sorted.sort((a, b) => Number(b.dataset.reviews || 0) - Number(a.dataset.reviews || 0));
            return sorted;
        }

        if (this.state.sort === 'newest') {
            sorted.sort((a, b) => Number(b.dataset.releaseOrder || 0) - Number(a.dataset.releaseOrder || 0));
            return sorted;
        }

        if (this.state.sort === 'price-asc') {
            sorted.sort((a, b) => Number(a.dataset.price || 0) - Number(b.dataset.price || 0));
            return sorted;
        }

        if (this.state.sort === 'price-desc') {
            sorted.sort((a, b) => Number(b.dataset.price || 0) - Number(a.dataset.price || 0));
            return sorted;
        }

        sorted.sort((a, b) => (this.initialOrder.get(a) || 0) - (this.initialOrder.get(b) || 0));
        return sorted;
    }

    applyViewState() {
        const filtered = this.getFilteredCards();
        const sorted = this.getSortedCards(filtered);

        this.elements.productCards.forEach((card) => {
            card.hidden = true;
            card.classList.remove('is-visible');
        });

        sorted.forEach((card, index) => {
            this.elements.productGrid.appendChild(card);
            const shouldShow = index < this.state.visibleCount;
            card.hidden = !shouldShow;
            if (shouldShow) card.classList.add('is-visible');
        });

        const shownCount = Math.min(this.state.visibleCount, filtered.length);

        if (this.elements.totalCount) {
            this.elements.totalCount.textContent = String(filtered.length);
        }

        if (this.elements.resultCountStrong) {
            this.elements.resultCountStrong.textContent = String(shownCount);
        }

        if (this.elements.resultCountTotal) {
            this.elements.resultCountTotal.textContent = String(filtered.length);
        }

        if (this.elements.activeFilterCount) {
            const count = [this.state.scent, this.state.situation].filter((value) => value !== 'all').length;
            this.elements.activeFilterCount.textContent = String(count);
        }

        if (this.elements.emptyState) {
            this.elements.emptyState.hidden = filtered.length > 0;
        }

        if (this.elements.loadMoreButton) {
            const canLoadMore = filtered.length > this.state.visibleCount;
            const loadMoreWrap = this.elements.loadMoreButton.closest('.shop-load-more');
            if (loadMoreWrap) {
                loadMoreWrap.dataset.state = canLoadMore ? 'ready' : 'complete';
            }

            this.elements.loadMoreButton.hidden = !canLoadMore;
            this.elements.loadMoreButton.disabled = !canLoadMore;
            this.elements.loadMoreButton.setAttribute('aria-disabled', String(!canLoadMore));
            if (canLoadMore) {
                const remaining = filtered.length - this.state.visibleCount;
                this.elements.loadMoreButton.textContent = `Load More (${Math.min(remaining, 4)})`;
            } else {
                this.elements.loadMoreButton.textContent = 'All Scents Shown';
            }
        }

        if (this.elements.loadProgress) {
            this.elements.loadProgress.innerHTML = `<strong>${shownCount}</strong> of ${filtered.length} scents shown${filtered.length === shownCount ? ' · 모든 향을 확인하셨습니다' : ' · 더 보기를 눌러 계속 확인하세요'}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ShopSystem().init();
});
