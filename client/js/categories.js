document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});

async function loadCategories() {
    AppUtils.showLoading('loadingCategories');
    AppUtils.hideError('errorCategories');
    
    try {
        const categories = await AppUtils.fetchApi('/api/categories');
        renderCategories(categories);
    } catch (error) {
        AppUtils.showError('errorCategories', 'Failed to load categories. Please try again later.');
    } finally {
        AppUtils.hideLoading('loadingCategories');
    }
}

function renderCategories(categories) {
    const container = document.getElementById('categoriesList');
    container.innerHTML = '';
    
    if (!categories || categories.length === 0) {
        container.innerHTML = '<p>No categories available.</p>';
        return;
    }
    
    categories.forEach(cat => {
        const card = document.createElement('a');
        card.href = `items.html?category=${cat.slug}`;
        card.className = 'card';
        card.innerHTML = `
            <h3>${cat.name}</h3>
        `;
        container.appendChild(card);
    });
}
