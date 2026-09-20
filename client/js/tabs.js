document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabViews = document.querySelectorAll('.tab-view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Subtle haptic feedback (vibration)
            if (navigator.vibrate) {
                navigator.vibrate(15);
            }

            // Remove active class from all
            navButtons.forEach(b => b.classList.remove('active'));
            tabViews.forEach(v => {
                v.classList.remove('active');
                v.style.display = 'none';
            });

            // Add active class to clicked
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
                targetView.style.display = 'block';
            }

            // Save state so it persists on refresh
            sessionStorage.setItem('activeTab', targetId);

            // Update top header text based on active tab
            const logoEl = document.querySelector('.main-header .logo');
            const backBtn = document.getElementById('headerBackBtn');
            if (logoEl) {
                if (targetId === 'view-categories') {
                    logoEl.textContent = 'Categories';
                    if(backBtn) backBtn.style.display = 'flex';
                } else if (targetId === 'view-search') {
                    logoEl.textContent = 'Search';
                    if(backBtn) backBtn.style.display = 'flex';
                } else {
                    logoEl.textContent = 'Bihar Portal';
                    if(backBtn) backBtn.style.display = 'none';
                }
            }

            // If Home tab is active, load latest updates
            if (targetId === 'view-home') {
                loadLatestUpdates();
            }
        });
    });

    const headerBackBtn = document.getElementById('headerBackBtn');
    if (headerBackBtn) {
        headerBackBtn.addEventListener('click', () => {
            const homeBtn = document.querySelector('.nav-btn[data-target="view-home"]');
            if (homeBtn) homeBtn.click();
        });
    }

    // Determine which tab to load initially
    let initialTab = sessionStorage.getItem('activeTab') || 'view-home';

    // URL parameter overrides session storage (e.g. from back button)
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam) {
        initialTab = `view-${tabParam}`;
        // Clean URL so it looks nice
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Activate the appropriate tab
    const initialBtn = document.querySelector(`.nav-btn[data-target="${initialTab}"]`);
    if (initialBtn) {
        initialBtn.click();
    } else {
        // Fallback to home
        const homeBtn = document.querySelector('.nav-btn[data-target="view-home"]');
        if (homeBtn) homeBtn.click();
    }

    // Real-time update hook
    window.addEventListener('appDataUpdated', () => {
        const activeTarget = sessionStorage.getItem('activeTab') || 'view-home';
        if (activeTarget === 'view-home') {
            document.getElementById('homeItemsList').innerHTML = '';
            loadLatestUpdates();
        } else if (activeTarget === 'view-categories') {
            if (typeof loadCategories === 'function') {
                document.getElementById('categoriesGrid').innerHTML = '';
                loadCategories();
            }
        }
    });
});

async function loadLatestUpdates() {
    const listContainer = document.getElementById('homeItemsList');
    if (listContainer.innerHTML !== '') return;

    AppUtils.showLoading('loadingHome');
    AppUtils.hideError('errorHome');
    
    try {
        // Fetch both items and categories in parallel
        const [items, categories] = await Promise.all([
            AppUtils.fetchApi('/api/items'),
            AppUtils.fetchApi('/api/categories')
        ]);
        
        // Map category IDs to slugs
        const catMap = {};
        categories.forEach(c => { catMap[c.id] = c.slug; });

        // Sort descending by id
        const sortedItems = items.sort((a, b) => b.id - a.id);
        const latestItems = sortedItems.slice(0, 20);

        renderLatestUpdates(latestItems, catMap);
    } catch (error) {
        AppUtils.showError('errorHome', 'Failed to load latest updates.');
    } finally {
        AppUtils.hideLoading('loadingHome');
    }
}

function renderLatestUpdates(items, catMap) {
    const container = document.getElementById('homeItemsList');
    container.innerHTML = '';
    
    if (!items || items.length === 0) {
        container.innerHTML = '<p>No updates available at the moment.</p>';
        return;
    }
    
    items.forEach(item => {
        const itemEl = document.createElement('a');
        itemEl.href = `view.html?category=${catMap[item.category_id] || 'unknown'}&item=${item.slug}`;
        itemEl.style.textDecoration = 'none';
        itemEl.style.color = 'inherit';
        itemEl.className = 'list-item';
        
        const categorySlug = catMap[item.category_id] || 'unknown';
        const badgeText = categorySlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const categoryBadge = `<span class="keyword-badge" style="font-size:0.75rem; background:var(--surface-chip-translucent, #D5D9F0); color:var(--primary-focus, #4338CA); padding:2px 8px; border-radius:12px; margin-right:5px; font-weight: 500;">${badgeText}</span>`;

        let formattedDate = 'Just now';
        if (item.created_at) {
            const d = new Date(item.created_at);
            if (!isNaN(d.getTime())) {
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
                formattedDate = `${d.getDate()} ${months[d.getMonth()]}`;
            } else {
                formattedDate = item.created_at.split(' ')[0];
            }
        }

        itemEl.innerHTML = `
            <div class="list-item-content" style="width: 100%;">
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

