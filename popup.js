document.addEventListener('DOMContentLoaded', function() {
    const statusEl = document.getElementById('status');
    
    async function updateStatus() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0) {
                const tab = tabs[0];
                console.log('Testing communication with tab:', tab.id);
                
                try {
                    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
                    console.log('Popup got response:', response);
                    
                    if (response && response.status === 'success') {
                        statusEl.textContent = 'Active ✅';
                        statusEl.className = 'status active';
                    } else {
                        statusEl.textContent = 'Error ❌';
                        statusEl.className = 'status inactive';
                    }
                } catch (error) {
                    console.error('Popup communication error:', error);
                    statusEl.textContent = 'Communication Error ❌';
                    statusEl.className = 'status inactive';
                }
            }
        } catch (error) {
            console.error('Popup error:', error);
            statusEl.textContent = 'Popup Error ❌';
            statusEl.className = 'status inactive';
        }
    }
    
    window.testPopup = function() {
        console.log('Test popup function called');
        updateStatus();
    };
    
    // Update status immediately
    updateStatus();
});
