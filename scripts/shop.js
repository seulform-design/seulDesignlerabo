/**
 * LE LABO - shop.js
 * Handles product filtering, sorting, and comparison logic.
 */

class ShopSystem {
    constructor() {
        this.compareList = [];
        this.maxCompare = 3;
        
        this.elements = {
            tray: document.getElementById('compare-tray'),
            slots: document.querySelectorAll('.compare-slots .slot'),
            clearBtn: document.getElementById('clear-compare'),
            compareBtns: document.querySelectorAll('.btn-compare'),
            filterChips: document.querySelectorAll('.filter-chip'),
            productCards: document.querySelectorAll('.product-card')
        };
    }

    init() {
        this.bindEvents();
        this.updateTray();
    }

    bindEvents() {
        // Compare buttons on cards
        this.elements.compareBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.product-card');
                const productName = card.querySelector('.card-title').textContent;
                this.toggleCompare(productName, btn);
            });
        });

        // Clear all compare
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.clearCompare());
        }

        // Filter chips
        this.elements.filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const group = chip.closest('.filter-chip-list');
                group.querySelectorAll('.filter-chip').forEach(c => c.setAttribute('aria-pressed', 'false'));
                chip.setAttribute('aria-pressed', 'true');
                this.applyFilters();
            });
        });
    }

    toggleCompare(name, btn) {
        const index = this.compareList.indexOf(name);
        
        if (index > -1) {
            this.compareList.splice(index, 1);
            btn.classList.remove('is-active');
            btn.textContent = '비교';
        } else {
            if (this.compareList.length >= this.maxCompare) {
                alert(`최대 ${this.maxCompare}개까지만 비교 가능합니다.`);
                return;
            }
            this.compareList.push(name);
            btn.classList.add('is-active');
            btn.textContent = '제거';
        }

        this.updateTray();
    }

    updateTray() {
        if (!this.elements.tray) return;

        // Show/Hide Tray
        const isVisible = this.compareList.length > 0;
        this.elements.tray.setAttribute('data-visible', isVisible);

        // Update Slots
        this.elements.slots.forEach((slot, i) => {
            const name = this.compareList[i];
            if (name) {
                slot.innerHTML = `${name} <button class="slot-remove" data-index="${i}">✕</button>`;
                slot.classList.add('is-filled');
            } else {
                slot.innerHTML = `Slot ${i + 1}`;
                slot.classList.remove('is-filled');
            }
        });

        // Bind remove buttons in tray
        this.elements.tray.querySelectorAll('.slot-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                const nameToRemove = this.compareList[idx];
                
                // Find and update card button
                this.elements.productCards.forEach(card => {
                    if (card.querySelector('.card-title').textContent === nameToRemove) {
                        const cardBtn = card.querySelector('.btn-compare');
                        if (cardBtn) {
                            cardBtn.classList.remove('is-active');
                            cardBtn.textContent = '비교';
                        }
                    }
                });

                this.compareList.splice(idx, 1);
                this.updateTray();
            });
        });
    }

    clearCompare() {
        this.compareList = [];
        this.elements.compareBtns.forEach(btn => {
            btn.classList.remove('is-active');
            btn.textContent = '비교';
        });
        this.updateTray();
    }

    applyFilters() {
        const activeFilters = Array.from(this.elements.filterChips)
            .filter(c => c.getAttribute('aria-pressed') === 'true' && c.textContent !== 'All')
            .map(c => c.textContent.toLowerCase());

        this.elements.productCards.forEach(card => {
            if (activeFilters.length === 0) {
                card.style.display = '';
                return;
            }

            const scent = card.getAttribute('data-scent');
            const matches = activeFilters.includes(scent);
            card.style.display = matches ? '' : 'none';
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const shop = new ShopSystem();
    shop.init();
});
