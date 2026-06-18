// Global Application State
let allReleases = [];
let selectedIndices = new Set();
let activeFilter = 'all';
let searchKeyword = '';

// Emoji map for categories
const EMOJI_MAP = {
    'feature': '🚀',
    'announcement': '📢',
    'breaking': '⚠️',
    'issue': '🐛',
    'change': '🔄',
    'deprecated': '🚫'
};

// Colors for selection glow matching the category
const CATEGORY_STYLE_MAP = {
    'feature': {
        border: 'rgba(16, 185, 129, 0.4)',
        bg: 'rgba(16, 185, 129, 0.05)',
        shadow: 'rgba(16, 185, 129, 0.15)',
        badgeColor: 'var(--color-feature)'
    },
    'announcement': {
        border: 'rgba(139, 92, 246, 0.4)',
        bg: 'rgba(139, 92, 246, 0.05)',
        shadow: 'rgba(139, 92, 246, 0.15)',
        badgeColor: 'var(--color-announcement)'
    },
    'breaking': {
        border: 'rgba(239, 68, 68, 0.4)',
        bg: 'rgba(239, 68, 68, 0.05)',
        shadow: 'rgba(239, 68, 68, 0.15)',
        badgeColor: 'var(--color-breaking)'
    },
    'issue': {
        border: 'rgba(245, 158, 11, 0.4)',
        bg: 'rgba(245, 158, 11, 0.05)',
        shadow: 'rgba(245, 158, 11, 0.15)',
        badgeColor: 'var(--color-issue)'
    },
    'change': {
        border: 'rgba(59, 130, 246, 0.4)',
        bg: 'rgba(59, 130, 246, 0.05)',
        shadow: 'rgba(59, 130, 246, 0.15)',
        badgeColor: 'var(--color-change)'
    }
};

// DOM Elements
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const filterPills = document.querySelectorAll('.pill');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const timeline = document.getElementById('timeline');
const selectionBar = document.getElementById('selectionBar');
const selectionCount = document.getElementById('selectionCount');
const clearSelectionBtn = document.getElementById('clearSelectionBtn');
const tweetSelectedBtn = document.getElementById('tweetSelectedBtn');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    fetchReleases();
});

// Event Listeners setup
function setupEventListeners() {
    refreshBtn.addEventListener('click', fetchReleases);
    
    // Live Search with Debounce
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            searchKeyword = e.target.value.toLowerCase().trim();
            renderReleases();
        }, 150);
    });

    // Filters selection
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeFilter = pill.getAttribute('data-filter');
            renderReleases();
        });
    });

    // Floating selection bar actions
    clearSelectionBtn.addEventListener('click', clearSelection);
    tweetSelectedBtn.addEventListener('click', tweetSelected);
}

// Fetch from backend API
async function fetchReleases() {
    toggleLoading(true);
    clearSelection();
    
    try {
        const response = await fetch('/api/releases');
        if (!response.ok) {
            throw new Error('Failed to retrieve release notes');
        }
        allReleases = await response.json();
        renderReleases();
    } catch (error) {
        console.error('Error:', error);
        alert('Could not fetch the release notes. Please check the backend connection.');
    } finally {
        toggleLoading(false);
    }
}

// Render the updates in the timeline
function renderReleases() {
    timeline.innerHTML = '';
    
    // Filter items based on active pill and search query
    const filtered = allReleases.filter((item, index) => {
        // Category filter
        const matchesCategory = activeFilter === 'all' || item.type.toLowerCase() === activeFilter;
        
        // Search filter
        const matchesSearch = !searchKeyword || 
            item.date.toLowerCase().includes(searchKeyword) ||
            item.type.toLowerCase().includes(searchKeyword) ||
            item.content.toLowerCase().includes(searchKeyword);
            
        return matchesCategory && matchesSearch;
    });

    // Handle empty state
    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
        timeline.classList.add('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
        timeline.classList.remove('hidden');
    }

    // Group items by Date
    const grouped = {};
    filtered.forEach(item => {
        // Track the original index in allReleases so we can select it correctly
        const originalIndex = allReleases.findIndex(r => r.content === item.content && r.date === item.date);
        item.originalIndex = originalIndex;

        if (!grouped[item.date]) {
            grouped[item.date] = [];
        }
        grouped[item.date].push(item);
    });

    // Render grouped dates
    Object.keys(grouped).forEach(date => {
        const groupEl = document.createElement('div');
        groupEl.className = 'timeline-group';

        // Date header marker
        const dateMarker = document.createElement('div');
        dateMarker.className = 'timeline-date-marker';
        dateMarker.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-date-text">${date}</div>
        `;
        groupEl.appendChild(dateMarker);

        // Render card for each update on this date
        grouped[date].forEach(item => {
            const typeLower = item.type.toLowerCase();
            const emoji = EMOJI_MAP[typeLower] || '📢';
            const styles = CATEGORY_STYLE_MAP[typeLower] || { badgeColor: 'var(--primary)' };
            
            const card = document.createElement('article');
            card.className = 'release-card';
            card.id = `card-${item.originalIndex}`;
            card.style.setProperty('--type-badge-color', styles.badgeColor);

            const isChecked = selectedIndices.has(item.originalIndex);
            if (isChecked) {
                card.classList.add('selected');
                card.style.setProperty('--selected-color-border', styles.border);
                card.style.setProperty('--selected-color-bg', styles.bg);
                card.style.setProperty('--selected-color-shadow', styles.shadow);
            }

            card.innerHTML = `
                <div class="card-header-row">
                    <div class="badge-wrapper">
                        <label class="checkbox-container" title="Select for tweeting">
                            <input type="checkbox" data-index="${item.originalIndex}" ${isChecked ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Select Update
                        </label>
                        <span class="type-badge type-badge-${typeLower}">
                            <span>${emoji}</span> ${item.type}
                        </span>
                    </div>
                    ${item.link ? `
                    <a href="${item.link}" target="_blank" class="external-link" rel="noopener noreferrer">
                        <span>Original Doc</span>
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                    </a>` : ''}
                </div>
                <div class="card-content-body">
                    ${item.content}
                </div>
                <div class="card-actions-row">
                    <button class="btn btn-secondary btn-card-tweet" data-index="${item.originalIndex}">
                        <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>Tweet</span>
                    </button>
                </div>
            `;

            // Setup card specific interactivity
            const checkbox = card.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', (e) => {
                handleCardSelection(item.originalIndex, e.target.checked, card, styles);
            });

            // Tweet button directly on the card
            const cardTweetBtn = card.querySelector('.btn-card-tweet');
            cardTweetBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tweetSingle(item);
            });

            // Clicking card background triggers select checkbox (unless clicking link/button)
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'A' && 
                    e.target.tagName !== 'BUTTON' && 
                    e.target.tagName !== 'INPUT' && 
                    e.target.tagName !== 'SPAN' &&
                    !e.target.closest('a') && 
                    !e.target.closest('button') && 
                    !e.target.closest('.checkbox-container')) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });

            groupEl.appendChild(card);
        });

        timeline.appendChild(groupEl);
    });
}

// Handle checkbox selection and visual states
function handleCardSelection(index, isChecked, card, styles) {
    if (isChecked) {
        selectedIndices.add(index);
        card.classList.add('selected');
        card.style.setProperty('--selected-color-border', styles.border);
        card.style.setProperty('--selected-color-bg', styles.bg);
        card.style.setProperty('--selected-color-shadow', styles.shadow);
    } else {
        selectedIndices.delete(index);
        card.classList.remove('selected');
    }
    updateSelectionBar();
}

// Update the floating action bar
function updateSelectionBar() {
    const count = selectedIndices.size;
    selectionCount.textContent = count;
    
    if (count > 0) {
        selectionBar.classList.remove('hidden');
    } else {
        selectionBar.classList.add('hidden');
    }
}

// Clear all selections
function clearSelection() {
    selectedIndices.clear();
    updateSelectionBar();
    document.querySelectorAll('.release-card').forEach(card => {
        card.classList.remove('selected');
        const checkbox = card.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = false;
    });
}

// Tweet a single update
function tweetSingle(item) {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(item.tweet_text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Compile and tweet multiple selected updates
function tweetSelected() {
    if (selectedIndices.size === 0) return;
    
    const selectedItems = Array.from(selectedIndices).map(idx => allReleases[idx]);
    
    let tweetText = '';
    
    if (selectedItems.length === 1) {
        tweetText = selectedItems[0].tweet_text;
    } else {
        // Multi-selection compilation format
        const base = "📢 Multiple #BigQuery Updates:\n";
        const suffix = "\nRead details at: https://cloud.google.com/bigquery/docs/release-notes #GoogleCloud #GCP";
        
        let itemsText = "";
        selectedItems.forEach(item => {
            const emoji = EMOJI_MAP[item.type.toLowerCase()] || '📢';
            // Short date (strip the year for extra char savings)
            const shortDate = item.date.replace(/, 20\d{2}/, '');
            itemsText += `• ${shortDate}: ${emoji} ${item.type}\n`;
        });
        
        // Character count capping
        const maxListLen = 280 - base.length - suffix.length;
        if (itemsText.length > maxListLen) {
            itemsText = itemsText.substring(0, maxListLen - 4) + "...\n";
        }
        
        tweetText = `${base}${itemsText}${suffix}`;
    }
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
}

// Loader UI controls
function toggleLoading(isLoading) {
    if (isLoading) {
        loadingState.classList.remove('hidden');
        timeline.classList.add('hidden');
        refreshBtn.setAttribute('disabled', 'true');
        refreshBtn.querySelector('svg').classList.add('spinning');
    } else {
        loadingState.classList.add('hidden');
        refreshBtn.removeAttribute('disabled');
        refreshBtn.querySelector('svg').classList.remove('spinning');
    }
}
