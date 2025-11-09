// Clean, modern approach
async function LoadAllData() {
    try {
        // Load all JSON files in parallel
        const [
            lakesData,
            fishData,
            hooksData,
            rodsData,
            weightsData,
            orderData,
            consumablesData,
            equipmentData,
            upgradesData,
            conditionsData
        ] = await Promise.all([
            fetch('./data/lakes.json').then(r => r.json()),
            fetch('./data/fish.json').then(r => r.json()),
            fetch('./data/hooks.json').then(r => r.json()),
            fetch('./data/rods.json').then(r => r.json()),
            fetch('./data/rarity_weights.json').then(r => r.json()),
            fetch('./data/rarity_order.json').then(r => r.json()),
            fetch('./data/consumables.json').then(r => r.json()),
            fetch('./data/equipment.json').then(r => r.json()),
            fetch('./data/upgrades.json').then(r => r.json()),
            fetch('./data/fishing_conditions.json').then(r => r.json())
        ]);

        // Assign to global variables (all loaded at this point!)
        LAKES = lakesData;
        FISH_DB = fishData;
        BAITS = hooksData;
        RODS = rodsData;
        RARITY_WEIGHTS = weightsData;
        RARITY_ORDER = orderData;
        CONSUMABLES = consumablesData;
        EQUIPMENT = equipmentData;
        UPGRADES = upgradesData;
        FISHING_CONDITIONS = conditionsData;

        // All data loaded - initialize game!
        AllLoaded();

    } catch (error) {
        console.error('Failed to load game data:', error);
        // Show user-friendly error
        document.body.innerHTML = '<div style="color: white; text-align: center; padding: 2rem;">Failed to load game data. Please refresh the page.</div>';
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

// Start the loading process
LoadAllData();