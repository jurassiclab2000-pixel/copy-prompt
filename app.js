/**
 * CopyPrompt - Core Application Logic
 */

(function () {
  'use strict';

  // State Management
  const state = {
    lang: 'en-US',
    translations: {},
    prompts: [],
    selectedCategory: 'all',
    searchQuery: '',
    favorites: new Set(),
    onlyFavorites: false,
  };

  // Category Emoji Mapping
  const categoryEmojis = {
    all: '✨',
    image: '📸',
    writing: '✍️',
    productivity: '💼',
    coding: '💻',
    learning: '📚',
    business: '📈',
    translation: '🌐',
    creativity: '🎨',
    'daily-life': '🧠',
    favorites: '❤️'
  };

  // DOM Elements
  const elements = {
    searchBox: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear'),
    categoriesContainer: document.getElementById('categories-container'),
    promptsGrid: document.getElementById('prompts-grid'),
    resultsCount: document.getElementById('results-count'),
    langSwitchBtn: document.getElementById('lang-switch-btn'),
    favNavBtn: document.getElementById('fav-nav-btn'),
    favBadge: document.getElementById('fav-count-badge'),
    toastContainer: document.getElementById('toast-container'),
  };

  /**
   * Determine initial language from URL param -> localStorage -> default ('en-US')
   */
  function detectLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang === 'zh-TW' || urlLang === 'en-US') {
      return urlLang;
    }
    const saved = localStorage.getItem('copyprompt_lang');
    if (saved === 'zh-TW' || saved === 'en-US') {
      return saved;
    }
    // Check browser language
    const navLang = navigator.language || navigator.userLanguage;
    if (navLang && navLang.startsWith('zh')) {
      return 'zh-TW';
    }
    return 'en-US';
  }

  /**
   * Load Locale JSON
   */
  async function loadLocale(lang) {
    try {
      const res = await fetch(`locales/${lang}.json`);
      if (!res.ok) throw new Error(`Failed to load ${lang} translations`);
      state.translations = await res.json();
      state.lang = lang;
      localStorage.setItem('copyprompt_lang', lang);
      applyTranslations();
      updateLanguageButton();
    } catch (err) {
      console.error('Error loading locale:', err);
    }
  }

  /**
   * Translate static UI elements with data-i18n
   */
  function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (state.translations[key]) {
        el.textContent = state.translations[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (state.translations[key]) {
        el.setAttribute('placeholder', state.translations[key]);
      }
    });

    document.documentElement.lang = state.lang === 'zh-TW' ? 'zh-Hant-TW' : 'en';
  }

  /**
   * Update Lang Switch Button text
   */
  function updateLanguageButton() {
    if (elements.langSwitchBtn) {
      const targetLabel = state.lang === 'en-US' ? '繁體中文' : 'English';
      elements.langSwitchBtn.innerHTML = `🌐 <span>${targetLabel}</span>`;
    }
  }

  /**
   * Toggle between en-US and zh-TW
   */
  async function toggleLanguage() {
    const nextLang = state.lang === 'en-US' ? 'zh-TW' : 'en-US';
    // Update URL query string without reloading page
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLang);
    window.history.pushState({}, '', url.toString());

    await loadLocale(nextLang);
    renderCategories();
    renderPrompts();
  }

  /**
   * Load Favorites from localStorage
   */
  function loadFavorites() {
    try {
      const stored = localStorage.getItem('copyprompt_favorites');
      if (stored) {
        state.favorites = new Set(JSON.parse(stored));
      }
    } catch (e) {
      state.favorites = new Set();
    }
    updateFavoritesBadge();
  }

  /**
   * Toggle a prompt favorite
   */
  function toggleFavorite(id) {
    if (state.favorites.has(id)) {
      state.favorites.delete(id);
      showToast(t('btn.favorite') + ' - ' + (state.lang === 'zh-TW' ? '已取消收藏' : 'Removed from favorites'));
    } else {
      state.favorites.add(id);
      showToast('❤️ ' + (state.lang === 'zh-TW' ? '已加入收藏！' : 'Saved to favorites!'));
    }
    localStorage.setItem('copyprompt_favorites', JSON.stringify([...state.favorites]));
    updateFavoritesBadge();
    renderPrompts();
  }

  /**
   * Update Navbar Favorites Badge count
   */
  function updateFavoritesBadge() {
    if (!elements.favBadge) return;
    const count = state.favorites.size;
    if (count > 0) {
      elements.favBadge.textContent = count;
      elements.favBadge.classList.add('active');
    } else {
      elements.favBadge.classList.remove('active');
    }
  }

  /**
   * Helper translation accessor
   */
  function t(key, fallback = '') {
    return state.translations[key] || fallback || key;
  }

  /**
   * Load Prompts Data
   */
  async function loadPrompts() {
    try {
      const res = await fetch('data/prompts.json');
      if (!res.ok) throw new Error('Failed to load prompts.json');
      state.prompts = await res.json();
      renderCategories();
      renderPrompts();
    } catch (err) {
      console.error('Error loading prompts:', err);
      if (elements.promptsGrid) {
        elements.promptsGrid.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <div class="empty-state-title">Error Loading Prompts</div>
            <div class="empty-state-desc">Unable to retrieve prompts list. Please refresh the page.</div>
          </div>
        `;
      }
    }
  }

  /**
   * Render Category Chips
   */
  function renderCategories() {
    if (!elements.categoriesContainer) return;

    const categories = [
      { id: 'all', labelKey: 'filter.all' },
      { id: 'image', labelKey: 'cat.image' },
      { id: 'writing', labelKey: 'cat.writing' },
      { id: 'productivity', labelKey: 'cat.productivity' },
      { id: 'coding', labelKey: 'cat.coding' },
      { id: 'learning', labelKey: 'cat.learning' },
      { id: 'business', labelKey: 'cat.business' },
      { id: 'translation', labelKey: 'cat.translation' },
      { id: 'creativity', labelKey: 'cat.creativity' },
      { id: 'daily-life', labelKey: 'cat.daily-life' },
    ];

    let html = '';
    categories.forEach((cat) => {
      const emoji = categoryEmojis[cat.id] || '📌';
      const label = t(cat.labelKey, cat.id);
      const isActive = !state.onlyFavorites && state.selectedCategory === cat.id;
      html += `
        <button class="cat-chip ${isActive ? 'active' : ''}" data-cat="${cat.id}">
          <span>${emoji}</span>
          <span>${label}</span>
        </button>
      `;
    });

    // Add Favorites chip
    const favActive = state.onlyFavorites;
    const favLabel = t('filter.favorites', 'My Favorites');
    html += `
      <button class="cat-chip ${favActive ? 'active' : ''}" data-cat="favorites">
        <span>❤️</span>
        <span>${favLabel}</span>
      </button>
    `;

    elements.categoriesContainer.innerHTML = html;

    // Attach click handlers
    elements.categoriesContainer.querySelectorAll('.cat-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        if (cat === 'favorites') {
          state.onlyFavorites = true;
          state.selectedCategory = 'all';
        } else {
          state.onlyFavorites = false;
          state.selectedCategory = cat;
        }
        renderCategories();
        renderPrompts();
      });
    });
  }

  /**
   * Filter and search prompts
   */
  function getFilteredPrompts() {
    const q = state.searchQuery.trim().toLowerCase();

    return state.prompts.filter((item) => {
      // 1. Favorites check
      if (state.onlyFavorites && !state.favorites.has(item.id)) {
        return false;
      }

      // 2. Category check
      if (state.selectedCategory !== 'all' && item.category !== state.selectedCategory) {
        return false;
      }

      // 3. Search query check
      if (!q) return true;

      const localeData = item.locales[state.lang] || item.locales['en-US'];
      const title = (localeData.title || '').toLowerCase();
      const desc = (localeData.description || '').toLowerCase();
      const prompt = (localeData.prompt || '').toLowerCase();
      const tags = (localeData.tags || []).map((t) => t.toLowerCase()).join(' ');

      return (
        title.includes(q) ||
        desc.includes(q) ||
        tags.includes(q) ||
        prompt.includes(q)
      );
    });
  }

  /**
   * Render Prompts List into the Grid
   */
  function renderPrompts() {
    if (!elements.promptsGrid) return;

    const filtered = getFilteredPrompts();

    // Update result count
    if (elements.resultsCount) {
      const countText = state.lang === 'zh-TW' 
        ? `顯示 ${filtered.length} 個提示詞`
        : `Showing ${filtered.length} prompt${filtered.length === 1 ? '' : 's'}`;
      elements.resultsCount.textContent = countText;
    }

    if (filtered.length === 0) {
      const noResultsMsg = state.onlyFavorites
        ? (state.lang === 'zh-TW' ? '目前沒有收藏的提示詞。點擊卡片右上角的愛心即可收藏！' : 'No saved prompts yet. Click the heart icon on any card to save it!')
        : t('no_results', 'No prompts found. Try a different keyword.');

      elements.promptsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${state.onlyFavorites ? '💔' : '🔍'}</div>
          <div class="empty-state-title">${state.onlyFavorites ? (state.lang === 'zh-TW' ? '尚無收藏' : 'No Favorites Yet') : (state.lang === 'zh-TW' ? '找不到結果' : 'No Prompts Found')}</div>
          <div class="empty-state-desc">${noResultsMsg}</div>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach((item) => {
      const localeData = item.locales[state.lang] || item.locales['en-US'];
      const isFav = state.favorites.has(item.id);
      const catEmoji = categoryEmojis[item.category] || '📌';
      const catName = t(`cat.${item.category}`, item.category);

      // Escape HTML to prevent injection
      const safeTitle = escapeHTML(localeData.title);
      const safeDesc = escapeHTML(localeData.description);
      const safePrompt = escapeHTML(localeData.prompt);

      const tagsHtml = (localeData.tags || [])
        .map((tag) => `<span class="tag-item">#${escapeHTML(tag)}</span>`)
        .join('');

      html += `
        <article class="prompt-card" data-id="${item.id}">
          <div class="card-top-row">
            <span class="card-badge">
              <span>${catEmoji}</span>
              <span>${catName}</span>
            </span>
            <button class="fav-toggle-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${item.id}" title="${isFav ? t('btn.unfavorite') : t('btn.favorite')}" aria-label="Toggle Favorite">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </button>
          </div>

          <h3 class="card-title">${safeTitle}</h3>
          <p class="card-desc">${safeDesc}</p>

          <div class="card-tags">${tagsHtml}</div>

          <!-- Prompt Preview Box -->
          <div class="prompt-preview-block">
            <div class="preview-content" id="preview-${item.id}">${safePrompt}</div>
            <button class="preview-toggle-btn" data-toggle-target="preview-${item.id}">
              ${t('preview.show', 'Show Prompt ▾')}
            </button>
          </div>

          <!-- Copy Button -->
          <button class="copy-action-btn" data-copy-id="${item.id}">
            <svg class="copy-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
              <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
            </svg>
            <span class="btn-text">${t('btn.copy', 'Copy Prompt')}</span>
          </button>
        </article>
      `;
    });

    elements.promptsGrid.innerHTML = html;
    attachCardListeners();
  }

  /**
   * Attach interactive listeners to prompt cards
   */
  function attachCardListeners() {
    // 1. Preview toggle buttons
    document.querySelectorAll('.preview-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-toggle-target');
        const previewEl = document.getElementById(targetId);
        if (previewEl) {
          const isExpanded = previewEl.classList.toggle('expanded');
          btn.textContent = isExpanded 
            ? t('preview.hide', 'Hide Prompt ▴') 
            : t('preview.show', 'Show Prompt ▾');
        }
      });
    });

    // 2. Favorite buttons
    document.querySelectorAll('.fav-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-fav-id');
        toggleFavorite(id);
      });
    });

    // 3. Copy buttons
    document.querySelectorAll('.copy-action-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-copy-id');
        const item = state.prompts.find((p) => p.id === id);
        if (!item) return;

        const localeData = item.locales[state.lang] || item.locales['en-US'];
        const promptText = localeData.prompt;

        const success = await copyToClipboard(promptText);
        if (success) {
          // Visual feedback on button
          const originalText = btn.querySelector('.btn-text').textContent;
          btn.classList.add('copied');
          btn.querySelector('.btn-text').textContent = t('btn.copied', '✓ Copied!');

          showToast('📋 ' + (state.lang === 'zh-TW' ? '已複製提示詞到剪貼簿！' : 'Prompt copied to clipboard!'));

          setTimeout(() => {
            btn.classList.remove('copied');
            btn.querySelector('.btn-text').textContent = originalText;
          }, 2000);
        } else {
          showToast('❌ ' + (state.lang === 'zh-TW' ? '複製失敗，請手動複製' : 'Failed to copy prompt'));
        }
      });
    });
  }

  /**
   * Clipboard Copy with Fallback
   */
  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Navigator clipboard failed, trying fallback:', err);
      }
    }

    // Fallback for non-https or older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  }

  /**
   * Toast notification display
   */
  let toastTimer = null;
  function showToast(message) {
    if (!elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2400);
  }

  /**
   * Basic HTML Escape helper
   */
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Event Listeners Setup
   */
  function setupEventListeners() {
    // 1. Language switcher
    if (elements.langSwitchBtn) {
      elements.langSwitchBtn.addEventListener('click', toggleLanguage);
    }

    // 2. Navbar favorites click
    if (elements.favNavBtn) {
      elements.favNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        state.onlyFavorites = true;
        state.selectedCategory = 'all';
        renderCategories();
        renderPrompts();
        // Smooth scroll to prompts
        const section = document.getElementById('prompts-section');
        if (section) section.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 3. Search input with debounce
    if (elements.searchBox) {
      let debounceTimeout = null;
      elements.searchBox.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        const val = e.target.value;
        state.searchQuery = val;

        if (elements.searchClearBtn) {
          if (val) {
            elements.searchClearBtn.classList.add('visible');
          } else {
            elements.searchClearBtn.classList.remove('visible');
          }
        }

        debounceTimeout = setTimeout(() => {
          renderPrompts();
        }, 150);
      });
    }

    // 4. Search clear button
    if (elements.searchClearBtn) {
      elements.searchClearBtn.addEventListener('click', () => {
        elements.searchBox.value = '';
        state.searchQuery = '';
        elements.searchClearBtn.classList.remove('visible');
        renderPrompts();
        elements.searchBox.focus();
      });
    }

    // 5. Handle browser back/forward buttons with ?lang
    window.addEventListener('popstate', async () => {
      const currentUrlLang = detectLanguage();
      if (currentUrlLang !== state.lang) {
        await loadLocale(currentUrlLang);
        renderCategories();
        renderPrompts();
      }
    });
  }

  /**
   * Initialization
   */
  async function init() {
    const initialLang = detectLanguage();
    loadFavorites();
    setupEventListeners();
    await loadLocale(initialLang);
    await loadPrompts();
  }

  // Start app on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
