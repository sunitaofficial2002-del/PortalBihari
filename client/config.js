const config = {
    API_BASE_URL: 'http://localhost:8080'
};

// Global Real-time Update Listener
(function() {
    const sseUrl = `${config.API_BASE_URL}/api/events`;
    let evtSource;

    function connectSSE() {
        evtSource = new EventSource(sseUrl);
        
        evtSource.onmessage = function(event) {
            if (event.data === 'update') {
                console.log('Real-time update received! Refreshing data...');
                // Trigger a global custom event that other scripts can listen to
                window.dispatchEvent(new Event('appDataUpdated'));
            }
        };

        evtSource.onerror = function() {
            evtSource.close();
            setTimeout(connectSSE, 3000); // Reconnect on error
        };
    }

    connectSSE();
})();
