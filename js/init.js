// Data Loading System with Progress Modal

// List of all data files to load
const DATA_FILES = [
    { name: 'Lakes', path: './data/lakes.json', target: 'LAKES' },
    { name: 'Fish', path: './data/fish.json', target: 'FISH_DB' },
    { name: 'Hooks', path: './data/hooks.json', target: 'HOOKS' },
    { name: 'Rods', path: './data/rods.json', target: 'RODS' },
    { name: 'Rarity Weights', path: './data/rarity_weights.json', target: 'RARITY_WEIGHTS' },
    { name: 'Rarity Order', path: './data/rarity_order.json', target: 'RARITY_ORDER' },
    { name: 'Consumables', path: './data/consumables.json', target: 'CONSUMABLES' },
    { name: 'Equipment', path: './data/equipment.json', target: 'EQUIPMENT' },
    { name: 'Upgrades', path: './data/upgrades.json', target: 'UPGRADES' },
    { name: 'Fishing Conditions', path: './data/fishing_conditions.json', target: 'FISHING_CONDITIONS' },
    { name: 'Game Information', path: './data/info.json', target: 'GAME_INFO' }
];

// Show loading modal
function showLoadingModal() {
    const modalHTML = `
        <div id="loading-modal" class="modal-overlay" style="display: flex;">
            <div class="modal-container" style="max-width: 500px;">
                <div class="modal-header">
                    <h2>🎣 Loading Fishcremental</h2>
                </div>
                <div class="modal-content" style="text-align: center;">
                    <div style="margin-bottom: 1rem;">
                        <div id="loading-status" style="color: #93c5fd; font-size: 1.125rem; margin-bottom: 0.5rem;">
                            Preparing your tackle box...
                        </div>
                        <div id="loading-file" style="color: #60a5fa; font-size: 0.875rem;">
                            Starting...
                        </div>
                    </div>
                    <div class="progress-bar" style="margin-bottom: 0.5rem;">
                        <div class="progress-fill" id="loading-progress" style="background: linear-gradient(90deg, #22c55e, #4ade80); width: 0%; transition: width 0.3s ease;"></div>
                    </div>
                    <div id="loading-percent" style="color: #93c5fd; font-weight: 600;">
                        0%
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Update loading progress
function updateLoadingProgress(loaded, total, currentFile) {
    const percent = Math.round((loaded / total) * 100);
    document.getElementById('loading-progress').style.width = percent + '%';
    document.getElementById('loading-percent').textContent = percent + '%';
    document.getElementById('loading-file').textContent = `Loading ${currentFile}...`;

    // Update status message based on progress
    const statusEl = document.getElementById('loading-status');
    if (percent < 30) {
        statusEl.textContent = 'Preparing your tackle box...';
    } else if (percent < 60) {
        statusEl.textContent = 'Checking the weather...';
    } else if (percent < 90) {
        statusEl.textContent = 'Finding the best fishing spots...';
    } else {
        statusEl.textContent = 'Almost ready to cast!';
    }
}

// Remove loading modal
function hideLoadingModal() {
    const modal = document.getElementById('loading-modal');
    if (modal) {
        // Fade out effect
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
}

// Load all data files with progress tracking
async function LoadAllData() {
    showLoadingModal();

    let loaded = 0;
    const total = DATA_FILES.length;

    try {
        // Create promises for all files with progress tracking
        const promises = DATA_FILES.map(file =>
            fetch(file.path)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to load ${file.name}: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    loaded++;
                    updateLoadingProgress(loaded, total, file.name);
                    return { target: file.target, data };
                })
        );

        // Wait for all files to load
        const results = await Promise.all(promises);

        // Assign to global variables
        results.forEach(({ target, data }) => {
            window[target] = data;
        });

        // Small delay to show 100% completion
        await new Promise(resolve => setTimeout(resolve, 300));

        // Hide loading modal
        hideLoadingModal();

        // Initialize game
        AllLoaded();

    } catch (error) {
        console.error('Failed to load game data:', error);

        // Show error in loading modal
        document.getElementById('loading-status').textContent = 'Failed to load game data';
        document.getElementById('loading-status').style.color = '#ef4444';
        document.getElementById('loading-file').textContent = error.message;
        document.getElementById('loading-progress').style.background = '#dc2626';

        // Add retry button
        const content = document.querySelector('#loading-modal .modal-content');
        content.innerHTML += `
            <button onclick="location.reload()" class="small-button" style="margin-top: 1rem;">
                Retry
            </button>
        `;
    }
}

function AllLoaded() {
    initAudio();
    const gameLoaded = loadGame();
    if (gameLoaded) {
        addLog('Welcome back! Game loaded.');
    } else {
        addLog('Welcome to Fishcremental!');
    }
    loadUnitsPreference();
    updateDisplay();
    setTimeout(() => {
        updateQuestDisplay();
        if (!gameState.quest && !gameState.questCooldown) {
            generateQuest();
        }
        checkFirstTimePlayer();
    }, 100);
}

// Start loading when page loads
LoadAllData();