// LeanGPT Popup Script - OPTIMIZATION LEVELS VERSION

document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const elements = {
        statusIndicator: document.getElementById('statusIndicator'),
        statusDot: document.getElementById('statusDot'),
        statusText: document.getElementById('statusText'),
        messageCount: document.getElementById('messageCount'),
        performanceGain: document.getElementById('performanceGain'),
        performanceFill: document.getElementById('performanceFill'),
        performanceBadge: document.getElementById('performanceBadge'),
        enableToggle: document.getElementById('enableToggle'),
        maxMessagesSlider: document.getElementById('maxMessagesSlider'),
        maxMessagesValue: document.getElementById('maxMessagesValue'),
        openChatgpt: document.getElementById('openChatgpt'),
        refreshPage: document.getElementById('refreshPage'),
        siteStatus: document.getElementById('siteStatus'),
        levelBadge: document.getElementById('levelBadge'),
        
        // Optimization level buttons
        lightBtn: document.getElementById('lightBtn'),
        mediumBtn: document.getElementById('mediumBtn'),
        aggressiveBtn: document.getElementById('aggressiveBtn'),
        ultraBtn: document.getElementById('ultraBtn'),
        
        performanceInfo: document.getElementById('performanceInfo')
    };

    // State
    let currentSettings = {
        enabled: true,
        maxMessages: 5,
        debugMode: false,
        optimizationLevel: 'medium'
    };

    let currentStatus = {
        isActive: false,
        messageCount: 0,
        onChatGPT: false,
        performanceGain: 0,
        version: '1.0.0-OPTIMIZED',
        optimizationLevel: 'medium'
    };

    // Initialize popup
    async function init() {
        try {
            await loadSettings();
            await updateStatus();
            setupEventListeners();
            updateUI();
            
            // Auto-refresh status every 2 seconds
            setInterval(updateStatus, 2000);
        } catch (error) {
            console.error('[LeanGPT Popup] Initialization error:', error);
            showError('Failed to load popup');
        }
    }

    // Load settings from storage
    async function loadSettings() {
        try {
            const stored = await chrome.storage.sync.get(['enabled', 'maxMessages', 'debugMode', 'optimizationLevel']);
            currentSettings = {
                enabled: stored.enabled !== false,
                maxMessages: stored.maxMessages || 5,
                debugMode: stored.debugMode || false,
                optimizationLevel: stored.optimizationLevel || 'medium'
            };
        } catch (error) {
            console.error('[LeanGPT Popup] Error loading settings:', error);
        }
    }

    // Update current status from active tab and content script
    async function updateStatus() {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                currentStatus.onChatGPT = false;
                updateUI();
                return;
            }

            // Check if we're on ChatGPT
            currentStatus.onChatGPT = tab.url && (
                tab.url.includes('chat.openai.com') ||
                tab.url.includes('openai.com') ||
                tab.url.includes('chatgpt.com')
            );
            
            if (currentStatus.onChatGPT) {
                try {
                    console.log('[LeanGPT Popup] Attempting to communicate with content script...');
                    // Try to get status from content script
                    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
                    
                    console.log('[LeanGPT Popup] Content script response:', response);
                    
                    if (response && response.status === 'success') {
                        currentStatus = {
                            ...currentStatus,
                            ...response.data
                        };
                    } else {
                        console.warn('[LeanGPT Popup] Content script responded with error:', response);
                        currentStatus.isActive = false;
                        currentStatus.messageCount = 0;
                    }
                } catch (error) {
                    // Content script might not be ready
                    console.error('[LeanGPT Popup] Content script not responding:', error);
                    currentStatus.isActive = false;
                    currentStatus.messageCount = 0;
                }
            } else {
                currentStatus.isActive = false;
                currentStatus.messageCount = 0;
            }

            updateUI();
        } catch (error) {
            console.error('[LeanGPT Popup] Error updating status:', error);
            updateUI();
        }
    }

    // Update UI based on current state
    function updateUI() {
        // Status indicator
        if (currentStatus.isActive && currentSettings.enabled) {
            elements.statusIndicator.className = 'status-indicator status-active';
            elements.statusText.textContent = 'Active';
            elements.statusDot.style.backgroundColor = '#10a37f';
        } else if (!currentSettings.enabled) {
            elements.statusIndicator.className = 'status-indicator status-inactive';
            elements.statusText.textContent = 'Disabled';
            elements.statusDot.style.backgroundColor = '#ef4444';
        } else {
            elements.statusIndicator.className = 'status-indicator status-inactive';
            elements.statusText.textContent = 'Inactive';
            elements.statusDot.style.backgroundColor = '#ef4444';
        }

        // Update level badge
        elements.levelBadge.textContent = currentStatus.optimizationLevel.toUpperCase();
        elements.levelBadge.className = `level-btn ${currentStatus.optimizationLevel}`;
        
        // Stats
        elements.messageCount.textContent = currentStatus.messageCount || '-';
        
        // Performance gain
        elements.performanceGain.textContent = currentStatus.performanceGain + '%';
        elements.performanceFill.style.width = currentStatus.performanceGain + '%';
        
        // Show/hide performance badge
        if (currentStatus.performanceGain > 0) {
            elements.performanceBadge.style.display = 'inline-block';
        } else {
            elements.performanceBadge.style.display = 'none';
        }

        // Enable toggle
        elements.enableToggle.classList.toggle('active', currentSettings.enabled);

        // Max messages slider
        elements.maxMessagesSlider.value = currentSettings.maxMessages;
        elements.maxMessagesValue.textContent = currentSettings.maxMessages;

        // Site status
        elements.siteStatus.textContent = currentStatus.onChatGPT ? 'On ChatGPT' : 'Not on ChatGPT';

        // Button states
        elements.refreshPage.disabled = !currentStatus.onChatGPT;
        
        // Update performance info
        updatePerformanceInfo();
        
        // Update level buttons
        updateLevelButtons();
    }

    // Update level buttons
    function updateLevelButtons() {
        [lightBtn, mediumBtn, aggressiveBtn, ultraBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Set active button
        const activeBtn = document.getElementById(currentSettings.optimizationLevel + 'Btn');
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // Update performance info text
    function updatePerformanceInfo() {
        const info = getPerformanceInfo(currentStatus.optimizationLevel, currentStatus.performanceGain);
        elements.performanceInfo.textContent = info;
    }

    // Get performance info for level
    function getPerformanceInfo(level, gain) {
        if (gain <= 10) return `${level.toUpperCase()} level (light optimization)`;
        if (gain <= 30) return `${level.toUpperCase()} level (moderate optimization)`;
        if (gain <= 50) return `${level.toUpperCase()} level (heavy optimization)`;
        return `${level.toUpperCase()} level (extreme optimization) - ${gain}%+ performance improvement!`;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Enable/disable toggle
        elements.enableToggle.addEventListener('click', async function() {
            currentSettings.enabled = !currentSettings.enabled;
            await saveSettings();
            
            // Send toggle message to content script if on ChatGPT
            if (currentStatus.onChatGPT) {
                try {
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs && tabs.length > 0) {
                        await chrome.tabs.sendMessage(tabs[0].id, { action: 'toggle' });
                    }
                } catch (error) {
                    console.log('[LeanGPT Popup] Error toggling content script:', error);
                }
            }
            
            updateUI();
        });

        // Max messages slider
        elements.maxMessagesSlider.addEventListener('input', function() {
            const value = parseInt(this.value);
            currentSettings.maxMessages = value;
            elements.maxMessagesValue.textContent = value;
        });

        elements.maxMessagesSlider.addEventListener('change', async function() {
            await saveSettings();
            
            // Send updated settings to content script
            if (currentStatus.onChatGPT) {
                try {
                    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                    if (tabs && tabs.length > 0) {
                        await chrome.tabs.sendMessage(tabs[0].id, { 
                            action: 'updateSettings',
                            settings: { maxMessages: currentSettings.maxMessages }
                        });
                    }
                } catch (error) {
                    console.log('[LeanGPT Popup] Error updating settings:', error);
                }
            }
        });

        // Optimization level buttons
        [lightBtn, mediumBtn, aggressiveBtn, ultraBtn].forEach(btn => {
            btn.addEventListener('click', async function() {
                const level = this.id.replace('Btn', '');
                currentSettings.optimizationLevel = level;
                await saveSettings();
                
                // Update UI
                updateLevelButtons();
                updatePerformanceInfo();
                
                console.log(`[LeanGPT] Optimization level changed to: ${level}`);
            });
        });

        // Open ChatGPT button
        elements.openChatgpt.addEventListener('click', function() {
            chrome.tabs.create({ url: 'https://chat.openai.com' });
            window.close(); // Close popup
        });

        // Refresh page button
        elements.refreshPage.addEventListener('click', function() {
            chrome.tabs.reload();
            window.close(); // Close popup
        });
    }

    // Save settings to storage
    async function saveSettings() {
        try {
            await chrome.storage.sync.set(currentSettings);
        } catch (error) {
            console.error('[LeanGPT Popup] Error saving settings:', error);
        }
    }

    // Show error state
    function showError(message) {
        elements.statusText.textContent = 'Error';
        elements.statusIndicator.className = 'status-indicator status-inactive';
        elements.messageCount.textContent = '-';
        elements.performanceGain.textContent = '-';
        elements.performanceBadge.style.display = 'none';
        elements.levelBadge.style.display = 'none';
    }

    // Initialize popup
    init();
});