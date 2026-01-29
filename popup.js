document.addEventListener('DOMContentLoaded', function() {
        const statusEl = document.getElementById('status');
        const tabInfoEl = document.getElementById('tabInfo');
        const errorInfoEl = document.getElementById('errorInfo');
    
    async function updateStatus() {
        try {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs && tabs.length > 0) {
                const tab = tabs[0];
                console.log('Current tab:', tab.url);
                console.log('Is ChatGPT:', tab.url && (tab.url.includes('chat.openai.com') || tab.url.includes('openai.com')));
                console.log('Testing communication with tab:', tab.id);
                
                // Update tab info
                tabInfoEl.textContent = `Tab: ${tab.url.substring(0, 50)}...`;
                errorInfoEl.textContent = 'No error yet';
                
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
                    statusEl.textContent = `Error: ${error.message} ❌`;
                    statusEl.className = 'status inactive';
                    errorInfoEl.textContent = `Error: ${error.message}`;
                }
        } else {
            console.log('No active tab found');
            statusEl.textContent = 'No Tab Found ❌';
            statusEl.className = 'status inactive';
            tabInfoEl.textContent = 'No active tab';
            errorInfoEl.textContent = 'No tab available';
        }
        } catch (error) {
            console.error('Popup error:', error);
            statusEl.textContent = `Error: ${error.message} ❌`;
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
