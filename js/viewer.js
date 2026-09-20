document.addEventListener('DOMContentLoaded', () => {
    const categorySlug = AppUtils.getParam('category');
    const itemSlug = AppUtils.getParam('item');
    
    if (categorySlug && itemSlug) {
        setupBreadcrumbs(categorySlug, itemSlug);
        loadContent(categorySlug, itemSlug);
    } else {
        AppUtils.showError('errorContent', 'Invalid content parameters.');
        AppUtils.hideLoading('loadingContent');
    }
});

function setupBreadcrumbs(categorySlug, itemSlug) {
    const formattedCategory = categorySlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const headerTitle = document.getElementById('headerCategoryName');
    if (headerTitle) {
        headerTitle.textContent = formattedCategory;
    }
    
    const itemBreadcrumb = document.getElementById('itemBreadcrumb');
    if (itemBreadcrumb) {
        itemBreadcrumb.textContent = itemSlug.replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}

async function loadContent(categorySlug, itemSlug) {
    AppUtils.showLoading('loadingContent');
    AppUtils.hideError('errorContent');
    
    try {
        const data = await AppUtils.fetchApi(`/api/content/${categorySlug}/${itemSlug}`);
        renderMarkdown(data.content);
    } catch (error) {
        AppUtils.showError('errorContent', 'Failed to load content. Please check if the URL is correct.');
    } finally {
        AppUtils.hideLoading('loadingContent');
    }
}

function renderMarkdown(markdownText) {
    const viewer = document.getElementById('markdownViewer');
    if (typeof marked !== 'undefined') {
        viewer.innerHTML = marked.parse(markdownText);
    } else {
        viewer.innerHTML = '<pre>' + markdownText + '</pre>';
        console.error('Marked.js library not loaded');
    }
}
