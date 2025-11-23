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
        playSound('sell');
    }
    updateDisplay();
    updateShopDisplay();
    checkAllAchievements();
}
function handleHookClick(id) {
    const hook = HOOKS[id];
    if (hook.unlocked) {
        gameState.currentHook = id;
        addLog(`Equipped ${hook.name}`);
    } else if (gameState.money >= hook.cost) {
        gameState.money -= hook.cost;
        hook.unlocked = true;
        gameState.currentHook = id;
        addLog(`Purchased and equipped ${hook.name}!`);
        playSound('sell');
    }
    updateDisplay();
    updateShopDisplay();
    checkAllAchievements();
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
        playSound('sell');
    }
    updateDisplay();
    updateShopDisplay();
    checkAllAchievements();
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
    if (lake.levelRequired && gameState.level < lake.levelRequired) {
        addLog(`You need to be level ${lake.levelRequired} to unlock ${lake.name}`);
        return;
    }
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
        playSound('season');
        popPanel(UI.season, ["attention"]);
        trackSeasonChange(oldSeason); // Track season and check achievements

        // Check quest cooldown on season change
        checkQuestCooldown();
    }

    updateDisplay();
}




function getFishPool() {
    const availableFish = Object.entries(FISH_DB).filter(([_, fish]) =>
        fish.regions.includes(gameState.currentLake)
    );
    let pool = [];
    availableFish.forEach(([id, fish]) => {
        let weight = RARITY_WEIGHTS[fish.rarity];

        // Note: Hook size doesn't affect rarity weights (future: baits will modify these)
        //if (fish.rarity === 'epic') weight *= baitPower * 0.6;
        //if (fish.rarity === 'legendary') weight *= baitPower * 0.4;

        // Apply fishing conditions modifier (location + season specific)
        const conditionModifier = getFishingModifier(
            gameState.currentLake,
            gameState.currentSpot,
            gameState.season,
            gameState.currentBait,
            id
        );
        if (conditionModifier !== 0) {
            weight *= (1 + conditionModifier / 100);
        }

        for (let i = 0; i < weight; i++) pool.push(id);
    });
    return pool;
}

function getPoolOdds(pool) {
    const counts = pool.reduce((acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
    }, {});

    // Convert to percentages
    const total = pool.length;
    const result = Object.entries(counts).map(([value, count]) => ({
        value,
        count,
        percent: (count / total) * 100
    }));
    result.sort((a, b) => b.count - a.count);
    return result;
}

function generateFishStats_LengthFirst(fishData, hookSizeMultiplier = 1) {
    const lengthVariance = 0.7 + Math.random() * 0.6; 
    const size = parseFloat((fishData.baseLength * lengthVariance * hookSizeMultiplier).toFixed(1));
    const weight = parseFloat((fishData.lengthWeightA * Math.pow(size, fishData.lengthWeightB)).toFixed(2));

    return { size, weight };
}

// Fish generation
function rollFish() {
    const region = gameState.currentLake;
    const hookSizeMultiplier = HOOKS[gameState.currentHook].sizeMultiplier;

    const availableFish = Object.entries(FISH_DB).filter(([_, fish]) =>
        fish.regions.includes(region)
    );

    let pool = getFishPool();

    const fishId = pool[Math.floor(Math.random() * pool.length)];
    const fishData = FISH_DB[fishId];

    const stats = generateFishStats_LengthFirst(fishData, hookSizeMultiplier);
    const weight = stats.weight;
    const size = stats.size;

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
        common: "You feel a light tug on the line..."
    };
    return hints[rarity] || "Something bit!";
}

// Fishing actions
function startCast() {
    if (gameState.casting || gameState.waiting || gameState.reeling) return;

    updateLastCatchDisplay();

    gameState.stats.totalCasts++;
    gameState.casting = true;
    gameState.progress = 0;

    document.querySelectorAll('.nav-button').forEach(btn => {
        if (btn.dataset.screen !== 'fish') btn.disabled = true;
    });

    UI.castButton.disabled = true;
    UI.castButton.textContent = 'Casting...';
    //UI.progressContainer.style.display = 'block';

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
        UI.progressFill.style.width = gameState.progress + '%';
    }, 50);
}

function calculateBiteTime() {
    const biteTime = 3000 + Math.random() * 7000;
    return biteTime;
}

function startWaiting() {
    gameState.waiting = true;
    gameState.progress = 0;
    UI.castButton.textContent = 'Waiting for a bite';
    addLog("Line cast! Waiting for a bite...");
    const waitTime = calculateBiteTime();
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
        UI.progressFill.style.width = gameState.progress + '%';
    }, 100);
}

function getBite() {
    const fish = rollFish();
    gameState.currentFish = fish;
    const hint = getFishHint(fish.rarity);
    addLog(hint);
    popPanel(UI.fishDisplay);
    UI.fishStats.className = `rarity-${fish.rarity}`;
    UI.fishStats.textContent = hint;

    startReel(fish);
}

function startReel(fish) {
    gameState.reeling = true;
    gameState.progress = 0;
    UI.castButton.textContent = 'Reeling in...';

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
        UI.progressFill.style.width = gameState.progress + '%';
    }, 50);
}

function TryRecast() {
    // Auto-recast if recaster is active
    if (gameState.upgrades.recaster) {
        if (!gameState.recasting) {
            gameState.recasting = true;
            setTimeout(() => startCast(), 500);
        }
        else {
            gameState.recasting = false;
        }

    }
}

function completeCatch(fish) {
    const rod = RODS[gameState.currentRod];
    stopReelSound();
    decrementConsumables();
    //UI.progressContainer.style.display = 'none';
    UI.castButton.disabled = false;
    UI.castButton.textContent = 'Cast Line';
    UI.fishStats.innerHTML = `&nbsp;`;

    document.querySelectorAll('.nav-button').forEach(btn => btn.disabled = false);
    const hasLuckyCoin = gameState.activeConsumables['lucky_coin'];

    if (rod.strength < fish.actualStrength && !hasLuckyCoin) {
        gameState.stats.lineBreaks++;
        playSound('snap');
        checkAllAchievements(); // Check for line break achievements
        addLog(`The line snapped! The ${fish.name} was too strong (${fish.actualStrength} vs ${rod.strength}).`);
        gameState.currentFish = null;
        gameState.progress = 0;
        TryRecast();
        return;
    }
    const bonuses = getEquipmentBonuses();

    const staticValueMultiplier = 1.35;
    const modifiedWeight = fish.weight * (1 + bonuses.weightBonus / 100);
    const modifiedSize = fish.size * (1 + bonuses.sizeBonus / 100);
    fish.weight = parseFloat(modifiedWeight.toFixed(2));
    fish.size = parseFloat(modifiedSize.toFixed(1));

    const value = Math.floor(fish.baseValue * (fish.weight / fish.baseWeight) * (1 + bonuses.sellValue / 100) * staticValueMultiplier);
    if (value === 0) {
        gameState.stats.fishThrownBack++;
        checkAllAchievements(); // Check for thrown back achievements
        playSound('splash');
        addLog(`The ${fish.name} was too small to keep. You threw it back.`);
        gameState.currentFish = null;
        gameState.progress = 0;
        TryRecast();
        return;
    }

    gameState.stats.fishCaught++;
    let xpGain = Math.floor(value / ((Math.random() * 1.5) + 0.5));

    if (bonuses.xpBonus)
        xpGain = Math.floor(xpGain * (1 + bonuses.xpBonus / 100));

    if (gameState.activeConsumables['xp_boost'])
        xpGain *= 2;

    gameState.xp += xpGain;

    const caughtFish = { ...fish, value, caughtAt: Date.now() };
    gameState.inventory.push(caughtFish);
    gameState.lastCatch = caughtFish;

    playSound('splash');

    checkQuestProgress(fish);
    updateRecords(fish, value);
    trackFishCaught(fish.id); // Track species and check achievements
    addLog(`Caught a ${fish.name}! (${formatFishMeasurements(fish)})`);
    gameState.currentFish = null;
    gameState.progress = 0;
    updateDisplay();
    popPanel(UI.lastCatchDisplay, ["attention-pop"]);
    checkAllAchievements(); // Check for level up, etc. achievements
    TryRecast();
}

function updateRecords(fish, value) {
    if (!gameState.records.heaviestFish || fish.weight > gameState.records.heaviestFish.weight)
        gameState.records.heaviestFish = { ...fish, value };

    if (!gameState.records.largestFish || fish.size > gameState.records.largestFish.size)
        gameState.records.largestFish = { ...fish, value };

    if (!gameState.records.mostValuable || value > gameState.records.mostValuable.value)
        gameState.records.mostValuable = { ...fish, value };

    if (!gameState.records.rarestCatch || RARITY_ORDER[fish.rarity] > RARITY_ORDER[gameState.records.rarestCatch.rarity])
        gameState.records.rarestCatch = { ...fish, value };

    const location = gameState.currentLake;
    if (!gameState.records.byLocation[location]) {
        gameState.records.byLocation[location] =
        {
            heaviest: null,
            largest: null,
            totalCaught: 0
        };
    }

    const locRecords = gameState.records.byLocation[location];
    locRecords.totalCaught++;

    if (!locRecords.heaviest || fish.weight > locRecords.heaviest.weight)
        locRecords.heaviest = { ...fish, value };

    if (!locRecords.largest || fish.size > locRecords.largest.size)
        locRecords.largest = { ...fish, value };
}

function sellFish(idx) {
    const fish = gameState.inventory[idx];
    gameState.money += fish.value;
    gameState.stats.totalMoneyEarned += fish.value;
    gameState.inventory.splice(idx, 1);
    addLog(`Sold ${fish.name} for $${fish.value}`);
    playSound('sell');
    checkAllAchievements();
    updateDisplay();
    popPanel(UI.money, ["pop", "attention"]);
    updateInventoryDisplay();
}

function sellAll() {
    const total = gameState.inventory.reduce((sum, fish) => sum + fish.value, 0);
    gameState.money += total;
    gameState.stats.totalMoneyEarned += total;
    gameState.inventory = [];
    addLog(`Sold all fish for $${total}`);
    playSound('sell');
    checkAllAchievements();
    updateDisplay();
    popPanel(UI.money, ["pop", "attention"]);
    updateInventoryDisplay();
}

function getHeaviestFishWeightLB() {
    if (!gameState.records.heaviestFish)
        return 0;
    return (gameState.records.heaviestFish.weight * 2.20462).toFixed(2);
}