document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            handleSearch(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('searchSuggestions').style.display = 'none';
                handleSearch(searchInput.value);
            }
        });

        searchInput.addEventListener('input', (e) => {
            handleLiveSearch(e.target.value);
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            const suggestionsBox = document.getElementById('searchSuggestions');
            if (suggestionsBox && !searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.style.display = 'none';
            }
        });
    }
});

let searchDebounceTimer;
let categoriesCache = null;

async function getCategories() {
    if (categoriesCache) return categoriesCache;
    try {
        const cats = await AppUtils.fetchApi('/api/categories');
        categoriesCache = {};
        cats.forEach(c => categoriesCache[c.id] = c.slug);
        return categoriesCache;
    } catch(e) {
        return {};
    }
}

async function handleLiveSearch(query) {
    const suggestionsBox = document.getElementById('searchSuggestions');
    if (!query || query.trim().length < 1) {
        suggestionsBox.style.display = 'none';
        return;
    }
    
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
        try {
            const [results, catMap] = await Promise.all([
                AppUtils.fetchApi(`/api/search?q=${encodeURIComponent(query.trim())}`),
                getCategories()
            ]);
            
            if (results && results.length > 0) {
                const top5 = results.slice(0, 5);
                suggestionsBox.innerHTML = '';
                top5.forEach(item => {
                    const catSlug = catMap[item.category_id] || 'general';
                    const suggestion = document.createElement('a');
                    suggestion.href = `view.html?category=${catSlug}&item=${item.slug}`;
                    suggestion.className = 'suggestion-item';
                    
                    const badgeText = catSlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    
                    suggestion.innerHTML = `
                        <div style="font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; color: var(--ink);">${item.title}</div>
                        <div style="font-size: 0.75rem; background: var(--surface-chip-translucent, #D5D9F0); color: var(--primary-focus, #4338CA); padding: 2px 8px; border-radius: 12px; font-weight: 500;">${badgeText}</div>
                    `;
                    suggestionsBox.appendChild(suggestion);
                });
                suggestionsBox.style.display = 'flex';
            } else {
                suggestionsBox.style.display = 'none';
            }
        } catch (error) {
            console.error('Live search error:', error);
            suggestionsBox.style.display = 'none';
        }
    }, 250);
}

async function handleSearch(query) {
    if (!query || query.trim() === '') return;
    
    const q = query.trim();
    
    const hero = document.querySelector('.hero');
    const categoriesSection = document.getElementById('categoriesSection');
    const itemsSection = document.getElementById('itemsSection');
    const contentSection = document.getElementById('contentSection');
    const searchResultsSection = document.getElementById('searchResultsSection');
    
    if (hero) hero.style.display = 'none';
    if (categoriesSection) categoriesSection.style.display = 'none';
    if (itemsSection) itemsSection.style.display = 'none';
    if (contentSection) contentSection.style.display = 'none';
    if (searchResultsSection) searchResultsSection.style.display = 'block';
    
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        const [results, catMap] = await Promise.all([
            AppUtils.fetchApi(`/api/search?q=${encodeURIComponent(q)}`),
            getCategories()
        ]);
        renderSearchResults(results, catMap);
    } catch (error) {
        resultsContainer.innerHTML = '<div class="error">Search failed. Please try again later.</div>';
    }
}

function renderSearchResults(results, catMap) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
        return;
    }
    
    results.forEach(item => {
        const catSlug = catMap[item.category_id] || 'general';
        const badgeText = catSlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        
        const card = document.createElement('a');
        card.href = `view.html?category=${catSlug}&item=${item.slug}`;
        card.className = 'card';
        card.innerHTML = `
            <h3 style="margin: 5px 0; color: var(--ink);">${item.title}</h3>
            <div style="font-size: 0.75rem; background: var(--surface-chip-translucent, #D5D9F0); color: var(--primary-focus, #4338CA); padding: 4px 12px; border-radius: 12px; font-weight: 500; display: inline-block; margin-top: 8px;">${badgeText}</div>
        `;
        resultsContainer.appendChild(card);
    });
}
