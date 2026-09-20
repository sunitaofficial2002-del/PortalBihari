document.addEventListener('DOMContentLoaded', () => {
    const categorySlug = AppUtils.getParam('category');
    
    if (categorySlug) {
        loadItems(categorySlug);
    } else {
        AppUtils.showError('errorItems', 'No category specified.');
        AppUtils.hideLoading('loadingItems');
    }

    // Real-time update hook
    window.addEventListener('appDataUpdated', () => {
        if (categorySlug) loadItems(categorySlug);
    });
});

async function loadItems(categorySlug) {
    AppUtils.showLoading('loadingItems');
    AppUtils.hideError('errorItems');
    
    const formattedTitle = categorySlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const headerTitle = document.getElementById('headerCategoryName');
    if (headerTitle) headerTitle.textContent = formattedTitle;
    
    try {
        const items = await AppUtils.fetchApi(`/api/items?category=${categorySlug}`);
        renderItems(items, categorySlug);
    } catch (error) {
        AppUtils.showError('errorItems', `Failed to load items for ${categorySlug}. Please try again later.`);
    } finally {
        AppUtils.hideLoading('loadingItems');
    }
}

function renderItems(items, categorySlug) {
    const container = document.getElementById('itemsList');
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p>No items found in this category.</p>';
        return;
    }
    
    items.forEach(item => {
        const itemEl = document.createElement('a');
        itemEl.href = `view.html?category=${categorySlug}&item=${item.slug}`;
        itemEl.style.textDecoration = 'none';
        itemEl.style.color = 'inherit';
        itemEl.className = 'list-item';
        
        let formattedDate = '';
        if (item.created_at) {
            const d = new Date(item.created_at);
            if (!isNaN(d.getTime())) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                formattedDate = `${d.getDate()} ${months[d.getMonth()]}`;
            } else {
                formattedDate = item.created_at.split(' ')[0];
            }
        }
        
        const badgeText = categorySlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const categoryBadge = `<span class="keyword-badge" style="font-size:0.75rem; background:var(--surface-chip-translucent, #D5D9F0); color:var(--primary-focus, #4338CA); padding:2px 8px; border-radius:12px; margin-right:5px; font-weight: 500;">${badgeText}</span>`;

        itemEl.innerHTML = `
            <div class="list-item-content" style="flex: 1; width: 100%;">
                <h3 style="margin-bottom: 8px; color: var(--ink);">${item.title}</h3>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    ${categoryBadge}
                    <span style="font-size: 0.85rem; color: var(--ink-muted-48, #636A8E); font-weight: 500;">${formattedDate}</span>
                </div>
            </div>
        `;
        container.appendChild(itemEl);
    });
}
