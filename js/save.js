// Save, load, and reset functionality

function autoSave() {
    if (!autoSave.lastSave || Date.now() - autoSave.lastSave > 3000) {
        saveGame(true);
        autoSave.lastSave = Date.now();
    }
}

function saveGame(silent = false) {
    try {
        const saveData = {
            gameState: {
                money: gameState.money,
                xp: gameState.xp,
                level: gameState.level,
                season: gameState.season,
                seasonProgress: gameState.seasonProgress,
                currentLake: gameState.currentLake,
                currentSpot: gameState.currentSpot,
                currentBait: gameState.currentBait,
                currentRod: gameState.currentRod,
                inventory: gameState.inventory,
                lastCatch: gameState.lastCatch,
                stats: gameState.stats,
                records: gameState.records
            },
            lakes: LAKES,
            baits: BAITS,
            rods: RODS,
            timestamp: Date.now()
        };
        
        localStorage.setItem('fishcremental_save', JSON.stringify(saveData));
        if (!silent) {
            addLog('Game saved successfully!');
        }
    } catch (error) {
        console.error('Save error:', error);
    }
}

function loadGame() {
    try {
        const saveData = localStorage.getItem('fishcremental_save');
        if (!saveData) {
            return false;
        }
        
        const data = JSON.parse(saveData);
        
        gameState.money = data.gameState.money;
        gameState.xp = data.gameState.xp;
        gameState.level = data.gameState.level;
        gameState.season = data.gameState.season;
        gameState.seasonProgress = data.gameState.seasonProgress || 0;
        gameState.currentLake = data.gameState.currentLake;
        gameState.currentSpot = data.gameState.currentSpot;
        gameState.currentBait = data.gameState.currentBait;
        gameState.currentRod = data.gameState.currentRod;
        gameState.inventory = data.gameState.inventory;
        gameState.lastCatch = data.gameState.lastCatch || null;
        gameState.stats = data.gameState.stats;
        gameState.records = data.gameState.records;
        
        Object.keys(data.lakes).forEach(id => {
            LAKES[id].unlocked = data.lakes[id].unlocked;
        });
        Object.keys(data.baits).forEach(id => {
            BAITS[id].unlocked = data.baits[id].unlocked;
        });
        Object.keys(data.rods).forEach(id => {
            RODS[id].unlocked = data.rods[id].unlocked;
        });
        
        updateDisplay();
        return true;
    } catch (error) {
        console.error('Load error:', error);
        return false;
    }
}

function hardReset() {
    if (!confirm('Are you sure you want to HARD RESET? This will delete ALL progress and cannot be undone!')) {
        return;
    }
    
    if (!confirm('Really? This will permanently delete everything!')) {
        return;
    }
    
    localStorage.removeItem('fishcremental_save');
    location.reload();
}