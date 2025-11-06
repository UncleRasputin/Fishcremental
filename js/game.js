// Main game logic (requires data.js, display.js, save.js to be loaded first)

// Screen management
function changeScreen(screen) {
    if ((gameState.casting || gameState.waiting || gameState.reeling) && screen !== 'fish') {
        addLog("Can't leave while fishing!");
        return;
    }

    gameState.currentScreen = screen;

    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + screen).classList.add('active');

    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.screen === screen) {
            btn.classList.add('active');
        }
    });

    if (screen === 'inventory') {
        updateInventoryDisplay();
    } else if (screen === 'shop') {
        updateShopDisplay();
    } else if (screen === 'travel') {
        updateTravelDisplay();
    } else if (screen === 'stats') {
        updateStatsDisplay();
    }
}

function changeShopTab(tab) {
    document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.shop-tab-content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById('shop-tab-' + tab).classList.add('active');
}

// Shop actions
function handleRodClick(id) {
    const rod = RODS[id];
    if (rod.unlocked) {
        gameState.currentRod = id;
        addLog(`Equipped ${rod.name}`);
    } else if (gameState.money >= rod.cost) {
        gameState.money -= rod.cost;
        rod.unlocked = true;
        gameState.currentRod = id;
        addLog(`Purchased and equipped ${rod.name}!`);
    }
    updateDisplay();
    updateShopDisplay();
}

function handleBaitClick(id) {
    const bait = BAITS[id];
    if (bait.unlocked) {
        gameState.currentBait = id;
        addLog(`Equipped ${bait.name}`);
    } else if (gameState.money >= bait.cost) {
        gameState.money -= bait.cost;
        bait.unlocked = true;
        gameState.currentBait = id;
        addLog(`Purchased and equipped ${bait.name}!`);
    }
    updateDisplay();
    updateShopDisplay();
}

// Travel
function travelTo(lakeId, spotIdx) {
    gameState.currentLake = lakeId;
    gameState.currentSpot = spotIdx;
    addLog(`Traveled to ${LAKES[lakeId].name} - ${LAKES[lakeId].spots[spotIdx]}`);
    changeScreen('fish');
    updateDisplay();
}

function unlockLake(id) {
    const lake = LAKES[id];
    if (!lake.unlocked && gameState.money >= lake.unlockCost) {
        gameState.money -= lake.unlockCost;
        lake.unlocked = true;
        addLog(`Unlocked ${lake.name}!`);
        updateDisplay();
        updateTravelDisplay();
    }
}

// Season progression
function advanceTime(amount) {
    const oldSeason = gameState.season;
    gameState.seasonProgress += amount;

    if (gameState.seasonProgress >= gameState.seasonThreshold) {
        gameState.seasonProgress = 0;
        gameState.season = (gameState.season + 1) % 4;
        addLog(`Season changed to ${SEASONS[gameState.season]}!`);

        // Check quest cooldown on season change
        checkQuestCooldown();
    }

    updateDisplay();
}

// Fish generation
function rollFish() {
    const region = gameState.currentLake;
    const baitPower = BAITS[gameState.currentBait].power;

    const availableFish = Object.entries(FISH_DB).filter(([_, fish]) =>
        fish.regions.includes(region)
    );

    let pool = [];
    availableFish.forEach(([id, fish]) => {
        let weight = RARITY_WEIGHTS[fish.rarity];
        if (fish.rarity === 'rare') weight *= baitPower * 0.8;
        if (fish.rarity === 'epic') weight *= baitPower * 0.6;
        if (fish.rarity === 'legendary') weight *= baitPower * 0.4;

        if (gameState.season === 2) weight *= 1.2;

        for (let i = 0; i < weight; i++) pool.push(id);
    });

    const fishId = pool[Math.floor(Math.random() * pool.length)];
    const fishData = FISH_DB[fishId];

    const weightVariance = 0.5 + Math.random() * 1.5;
    const weight = parseFloat((fishData.baseWeight * weightVariance).toFixed(2));
    const size = parseFloat((weight * 10 + Math.random() * 20).toFixed(1));

    return {
        id: fishId,
        ...fishData,
        weight,
        size,
        actualStrength: Math.floor(fishData.strength * (0.8 + Math.random() * 0.4))
    };
}

function getFishHint(rarity) {
    const hints = {
        legendary: "Something HUGE is fighting! This could be legendary!",
        epic: "Something big is on the line!",
        rare: "Feels like a good catch!",
        uncommon: "You've hooked something decent...",
        common: "Light tug on the line..."
    };
    return hints[rarity] || "Something bit!";
}

// Fishing actions
function startCast() {
    if (gameState.casting || gameState.waiting || gameState.reeling) return;

    // Clear last catch when starting new cast
    gameState.lastCatch = null;
    updateLastCatchDisplay();

    gameState.stats.totalCasts++;
    gameState.casting = true;
    gameState.progress = 0;

    document.querySelectorAll('.nav-button').forEach(btn => {
        if (btn.dataset.screen !== 'fish') btn.disabled = true;
    });

    document.getElementById('cast-button').disabled = true;
    document.getElementById('cast-button').textContent = 'Casting...';
    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('progress-label').textContent = 'Casting';

    const rod = RODS[gameState.currentRod];
    const castTime = 2000 / rod.castSpeed;
    const step = 100 / (castTime / 50);

    // Play cast sound
    playSound('cast');

    gameState.progressInterval = setInterval(() => {
        gameState.progress += step;
        advanceTime(step * 2);
        if (gameState.progress >= 100) {
            gameState.progress = 100;
            clearInterval(gameState.progressInterval);
            gameState.casting = false;
            startWaiting();
        }
        document.getElementById('progress-fill').style.width = gameState.progress + '%';
    }, 50);
}

function startWaiting() {
    gameState.waiting = true;
    gameState.progress = 0;
    document.getElementById('cast-button').textContent = 'Waiting...';
    document.getElementById('progress-label').textContent = 'Waiting for bite';

    addLog("Line cast! Waiting for a bite...");

    const waitTime = 3000 + Math.random() * 12000;
    const step = 100 / (waitTime / 100);

    gameState.progressInterval = setInterval(() => {
        gameState.progress += step;
        advanceTime(step);
        if (gameState.progress >= 100) {
            gameState.progress = 100;
            clearInterval(gameState.progressInterval);
            gameState.waiting = false;
            getBite();
        }
        document.getElementById('progress-fill').style.width = gameState.progress + '%';
    }, 100);
}

function getBite() {
    const fish = rollFish();
    gameState.currentFish = fish;

    const hint = getFishHint(fish.rarity);
    addLog(hint);

    // Show mystery fish info (no exact details)
    document.getElementById('fish-display').style.display = 'block';
    document.getElementById('fish-name').textContent = `??? (${fish.rarity})`;
    document.getElementById('fish-name').className = `rarity-${fish.rarity}`;
    document.getElementById('fish-stats').textContent = hint;
    document.getElementById('fish-strength').textContent =
        `Your rod strength: ${RODS[gameState.currentRod].strength}`;

    startReel(fish);
}

function startReel(fish) {
    gameState.reeling = true;
    gameState.progress = 0;
    document.getElementById('cast-button').textContent = 'Reeling...';
    document.getElementById('progress-label').textContent = 'Reeling in';

    // Play reel sound
    playSound('reel');

    const reelTime = 3000;
    const step = 100 / (reelTime / 50);

    gameState.progressInterval = setInterval(() => {
        gameState.progress += step;
        advanceTime(step * 3);
        if (gameState.progress >= 100) {
            gameState.progress = 100;
            clearInterval(gameState.progressInterval);
            gameState.reeling = false;
            completeCatch(fish);
        }
        document.getElementById('progress-fill').style.width = gameState.progress + '%';
    }, 50);
}

function completeCatch(fish) {
    const rod = RODS[gameState.currentRod];

    // Stop reel sound
    stopReelSound();

    // Decrement active consumables
    decrementConsumables();

    document.getElementById('progress-container').style.display = 'none';
    document.getElementById('fish-display').style.display = 'none';
    document.getElementById('cast-button').disabled = false;
    document.getElementById('cast-button').textContent = 'Cast Line';

    document.querySelectorAll('.nav-button').forEach(btn => btn.disabled = false);

    // Check Lucky Coin (prevents line breaks)
    const hasLuckyCoin = gameState.activeConsumables['lucky_coin'];

    if (rod.strength < fish.actualStrength && !hasLuckyCoin) {
        gameState.stats.lineBreaks++;
        playSound('snap');
        addLog(`The line snapped! The ${fish.name} was too strong (${fish.actualStrength} vs ${rod.strength}).`);
        gameState.currentFish = null;
        gameState.progress = 0;

        // Auto-recast if recaster is active
        if (gameState.upgrades.recaster) {
            setTimeout(() => startCast(), 500);
        }
        return;
    }

    // Get equipment bonuses
    const bonuses = getEquipmentBonuses();

    // Apply weight and size bonuses
    const modifiedWeight = fish.weight * (1 + bonuses.weightBonus / 100);
    const modifiedSize = fish.size * (1 + bonuses.sizeBonus / 100);
    fish.weight = parseFloat(modifiedWeight.toFixed(2));
    fish.size = parseFloat(modifiedSize.toFixed(1));

    const value = Math.floor(fish.baseValue * (fish.weight / fish.baseWeight) * (1 + bonuses.sellValue / 100));

    if (value === 0) {
        gameState.stats.fishThrownBack++;
        playSound('splash');
        addLog(`The ${fish.name} was too small to keep. You threw it back.`);
        gameState.currentFish = null;
        gameState.progress = 0;

        // Auto-recast if recaster is active
        if (gameState.upgrades.recaster) {
            setTimeout(() => startCast(), 500);
        }
        return;
    }

    gameState.stats.fishCaught++;

    // Apply XP bonus from equipment and consumables
    let xpGain = Math.floor(value / 2);
    if (bonuses.xpBonus) {
        xpGain = Math.floor(xpGain * (1 + bonuses.xpBonus / 100));
    }
    if (gameState.activeConsumables['xp_boost']) {
        xpGain *= 2;
    }

    gameState.xp += xpGain;

    const caughtFish = { ...fish, value, caughtAt: Date.now() };
    gameState.inventory.push(caughtFish);
    gameState.lastCatch = caughtFish;

    playSound('splash');

    checkQuestProgress(fish);
    updateRecords(fish, value);

    addLog(`Caught a ${fish.name}! (${formatFishMeasurements(fish)})`);
    gameState.currentFish = null;
    gameState.progress = 0;

    updateDisplay();

    // Auto-recast if recaster is active
    if (gameState.upgrades.recaster) {
        setTimeout(() => startCast(), 500);
    }
}

// Records tracking
function updateRecords(fish, value) {
    if (!gameState.records.heaviestFish || fish.weight > gameState.records.heaviestFish.weight) {
        gameState.records.heaviestFish = { ...fish, value };
    }

    if (!gameState.records.largestFish || fish.size > gameState.records.largestFish.size) {
        gameState.records.largestFish = { ...fish, value };
    }

    if (!gameState.records.mostValuable || value > gameState.records.mostValuable.value) {
        gameState.records.mostValuable = { ...fish, value };
    }

    if (!gameState.records.rarestCatch ||
        RARITY_ORDER[fish.rarity] > RARITY_ORDER[gameState.records.rarestCatch.rarity]) {
        gameState.records.rarestCatch = { ...fish, value };
    }

    const location = gameState.currentLake;
    if (!gameState.records.byLocation[location]) {
        gameState.records.byLocation[location] = {
            heaviest: null,
            largest: null,
            totalCaught: 0
        };
    }

    const locRecords = gameState.records.byLocation[location];
    locRecords.totalCaught++;

    if (!locRecords.heaviest || fish.weight > locRecords.heaviest.weight) {
        locRecords.heaviest = { ...fish, value };
    }

    if (!locRecords.largest || fish.size > locRecords.largest.size) {
        locRecords.largest = { ...fish, value };
    }
}

// Inventory management
function sellFish(idx) {
    const fish = gameState.inventory[idx];
    gameState.money += fish.value;
    gameState.stats.totalMoneyEarned += fish.value;
    gameState.inventory.splice(idx, 1);
    addLog(`Sold ${fish.name} for $${fish.value}`);
    updateDisplay();
    updateInventoryDisplay();
}

function sellAll() {
    const total = gameState.inventory.reduce((sum, fish) => sum + fish.value, 0);
    gameState.money += total;
    gameState.stats.totalMoneyEarned += total;
    gameState.inventory = [];
    addLog(`Sold all fish for $${total}`);
    updateDisplay();
    updateInventoryDisplay();
}

// Initialize game
console.log('Initializing game...');

// Load saved game FIRST
const gameLoaded = loadGame();

if (gameLoaded) {
    addLog('Welcome back! Game loaded.');
} else {
    addLog('Welcome to Fishcremental!');
}

// Load unit preferences
loadUnitsPreference();

// Update display with loaded data
updateDisplay();

// Small delay to ensure everything is rendered
setTimeout(() => {
    updateQuestDisplay();

    // Generate quest if none exists and not on cooldown
    if (!gameState.quest && !gameState.questCooldown) {
        console.log('No quest found, generating initial quest...');
        generateQuest();
    } else if (gameState.quest) {
        console.log('Quest already exists:', gameState.quest.targetName);
    } else if (gameState.questCooldown) {
        console.log('Quest on cooldown');
    }
}, 100);