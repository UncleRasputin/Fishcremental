// Unit conversion utilities

function convertWeight(kg) {
    if (gameState.useImperial) {
        return (kg * 2.20462).toFixed(2);
    }
    return kg.toFixed(2);
}

function convertSize(cm) {
    if (gameState.useImperial) {
        return (cm / 2.54).toFixed(1);
    }
    return cm.toFixed(1);
}

function getWeightUnit() {
    return gameState.useImperial ? 'lbs' : 'kg';
}

function getSizeUnit() {
    return gameState.useImperial ? 'in' : 'cm';
}

function formatFishMeasurements(fish) {
    return `${convertWeight(fish.weight)}${getWeightUnit()}, ${convertSize(fish.size)}${getSizeUnit()}`;
}

function toggleUnits() {
    gameState.useImperial = !gameState.useImperial;
    localStorage.setItem('fishcremental_units', gameState.useImperial ? 'imperial' : 'metric');

    addLog(`Switched to ${gameState.useImperial ? 'Imperial' : 'Metric'} units`);
    updateUnitsButton();
    updateDisplay();

    // Update any open screens
    if (gameState.currentScreen === 'inventory') {
        updateInventoryDisplay();
    } else if (gameState.currentScreen === 'stats') {
        updateStatsDisplay();
    }

    updateQuestDisplay();
}

function updateUnitsButton() {
    const btn = document.getElementById('units-button');
    if (btn) {
        btn.textContent = gameState.useImperial ? '🇺🇸' : '🇬🇧';
        btn.title = gameState.useImperial ? 'Switch to Metric' : 'Switch to Imperial';
    }
}

function loadUnitsPreference() {
    const savedUnits = localStorage.getItem('fishcremental_units');
    if (savedUnits === 'metric') {
        gameState.useImperial = false;
    } else {
        gameState.useImperial = true; // Default to Imperial
    }
    updateUnitsButton();
}