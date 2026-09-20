// Shared Utilities
const AppUtils = {
    async fetchApi(endpoint) {
        try {
            const url = `${config.API_BASE_URL}${endpoint}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    async fetchText(endpoint) {
        try {
            const url = `${config.API_BASE_URL}${endpoint}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
        }
    },

    getParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    showLoading(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'block';
    },

    hideLoading(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'none';
    },

    showError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) {
            el.textContent = message;
            el.style.display = 'block';
        }
    },

    hideError(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.style.display = 'none';
    }
};
