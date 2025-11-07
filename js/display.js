// UI update functions

function addLog(msg) {
    gameState.log.unshift({ msg, time: Date.now() });
    gameState.log = gameState.log.slice(0, 15);
    updateLogDisplay();
}

function updateLogDisplay() {
    const container = document.getElementById('log-container');
    container.innerHTML = gameState.log.map(entry =>
        `<div class="log-entry">${entry.msg}</div>`
    ).join('');
}

function updateDisplay() {
    document.getElementById('money').textContent = '$' + gameState.money + " 💰";
    document.getElementById('level').textContent = 'Level '+gameState.level;
    //document.getElementById('xp-text').textContent = `XP ${gameState.xp}/${gameState.level * 100}`;
    const expProgressPercent = (gameState.xp / (gameState.level * 100)) * 100;
    document.getElementById('exp-progress').style.width = expProgressPercent + '%';
    document.getElementById('exp-progress-bar').title = "XP "+gameState.xp+" / " + (gameState.level * 100);
    document.getElementById('season').textContent = SEASONS[gameState.season];
    document.getElementById('header-tokens').textContent = gameState.questTokens +" 🎫";

    const seasonProgressPercent = (gameState.seasonProgress / gameState.seasonThreshold) * 100;
    document.getElementById('season-progress').style.width = seasonProgressPercent + '%';

    const lake = LAKES[gameState.currentLake];
    document.getElementById('location-name').textContent =
        `${lake.name} - ${lake.spots[gameState.currentSpot]}`;

    const rod = RODS[gameState.currentRod];
    const bait = BAITS[gameState.currentBait];
    document.getElementById('rod-name').textContent = rod.name;
    document.getElementById('rod-stat').textContent = `(Str: ${rod.strength})`;
    document.getElementById('bait-name').textContent = bait.name;
    document.getElementById('bait-stat').textContent = `(Power: ${bait.power}x)`;

    document.getElementById('inventory-count').textContent = gameState.inventory.length;
    document.getElementById('sell-all-button').style.display =
        gameState.inventory.length > 0 ? 'block' : 'none';

    updateLastCatchDisplay();

    const xpNeeded = gameState.level * 100;
    if (gameState.xp >= xpNeeded) {
        gameState.level++;
        gameState.xp = 0;
        addLog(`Level up! You are now level ${gameState.level}`);
        updateDisplay();
    }

    autoSave();
}

function updateLastCatchDisplay() {
    const container = document.getElementById('last-catch-display');
    if (!container) return;

    if (gameState.lastCatch) {
        const fish = gameState.lastCatch;
        container.style.display = 'block';
        container.innerHTML = `
            <div class="last-catch-title">Last Catch</div>
            <div class="rarity-${fish.rarity}" style="font-weight: bold; font-size: 1.125rem;">${fish.name}</div>
            <div style="color: #93c5fd; margin-top: 0.25rem;">
                ${formatFishMeasurements(fish)} | $${fish.value}
            </div>
        `;
    } else {
        container.style.display = 'none';
    }
}

function updateInventoryDisplay() {
    const grid = document.getElementById('inventory-grid');
    if (gameState.inventory.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #93c5fd;">No fish caught yet. Go fishing!</div>';
    } else {
        grid.innerHTML = gameState.inventory.map((fish, i) => `
            <div class="inventory-item">
                <div class="rarity-${fish.rarity}">${fish.name}</div>
                <div>${formatFishMeasurements(fish)}</div>
                <button class="sell-button" onclick="sellFish(${i})">Sell $${fish.value}</button>
            </div>
        `).join('');
    }
}

function updateShopDisplay() {
    const rodsContainer = document.getElementById('rods-container');
    rodsContainer.innerHTML = Object.entries(RODS).map(([id, rod]) => {
        const isEquipped = gameState.currentRod === id;
        const isOwned = rod.unlocked;
        const canAfford = gameState.money >= rod.cost;

        let buttonText = '';
        let buttonClass = 'shop-item-button';
        let disabled = '';

        if (isEquipped) {
            buttonText = 'Equipped';
            buttonClass += ' equipped';
            disabled = 'disabled';
        } else if (isOwned) {
            buttonText = 'Equip';
            buttonClass += ' owned';
        } else {
            buttonText = `Buy $${rod.cost}`;
            if (!canAfford) disabled = 'disabled';
        }

        return `
            <div class="shop-item">
                <div class="shop-item-info">
                    <div class="shop-item-name">${rod.name}</div>
                    <div class="shop-item-stats">Strength: ${rod.strength} | Cast Speed: ${rod.castSpeed}x</div>
                </div>
                <button class="${buttonClass}" onclick="handleRodClick('${id}')" ${disabled}>${buttonText}</button>
            </div>
        `;
    }).join('');

    const baitContainer = document.getElementById('bait-container');
    baitContainer.innerHTML = Object.entries(BAITS).map(([id, bait]) => {
        const isEquipped = gameState.currentBait === id;
        const isOwned = bait.unlocked;
        const canAfford = gameState.money >= bait.cost;

        let buttonText = '';
        let buttonClass = 'shop-item-button';
        let disabled = '';

        if (isEquipped) {
            buttonText = 'Equipped';
            buttonClass += ' equipped';
            disabled = 'disabled';
        } else if (isOwned) {
            buttonText = 'Equip';
            buttonClass += ' owned';
        } else {
            buttonText = `Buy $${bait.cost}`;
            if (!canAfford) disabled = 'disabled';
        }

        return `
            <div class="shop-item">
                <div class="shop-item-info">
                    <div class="shop-item-name">${bait.name}</div>
                    <div class="shop-item-stats">Rare Fish Power: ${bait.power}x</div>
                </div>
                <button class="${buttonClass}" onclick="handleBaitClick('${id}')" ${disabled}>${buttonText}</button>
            </div>
        `;
    }).join('');

    updateTokenShop();
}

function updateTravelDisplay() {
    const container = document.getElementById('travel-container');
    const currentRod = RODS[gameState.currentRod];

    const lakeKeys = Object.keys(LAKES);
    const currentLakeKey = lakeKeys[gameState.travelIndex];
    const lake = LAKES[currentLakeKey];

    const prevDisabled = gameState.travelIndex === 0;
    const nextDisabled = gameState.travelIndex === lakeKeys.length - 1;

    let mainContent = '';

    if (lake.unlocked) {
        const regionFish = Object.entries(FISH_DB).filter(([_, fish]) =>
            fish.regions.includes(currentLakeKey)
        );

        const catchable = regionFish.filter(([_, fish]) => fish.strength <= currentRod.strength);
        const tooStrong = regionFish.filter(([_, fish]) => fish.strength > currentRod.strength);

        mainContent = `
            <div class="travel-main-card">
                <div class="travel-card-header">
                    <h3>Available Fish</h3>
                    <span class="travel-fish-summary">${catchable.length}/${regionFish.length} catchable</span>
                </div>
                
                <div class="travel-fish-list">
                    ${catchable.map(([fishId, fish]) => `
                        <div class="travel-fish-item catchable">
                            <span class="travel-fish-icon">✓</span>
                            <span class="rarity-${fish.rarity}">${fish.name}</span>
                            <span class="travel-fish-rarity">(${fish.rarity})</span>
                        </div>
                    `).join('')}
                    ${tooStrong.map(([fishId, fish]) => `
                        <div class="travel-fish-item too-strong">
                            <span class="travel-fish-icon">✗</span>
                            <span style="color: #6b7280;">${fish.name}</span>
                            <span class="travel-fish-rarity" style="color: #6b7280;">(${fish.rarity}) - Rod too weak</span>
                        </div>
                    `).join('')}
                    ${regionFish.length === 0 ? '<div style="text-align: center; color: #93c5fd; padding: 1rem;">No fish data available</div>' : ''}
                </div>
                
                <div class="travel-spots-section">
                    <h4>Fishing Spots</h4>
                    <div class="travel-spots">
                        ${lake.spots.map((spot, idx) => {
            const isCurrent = gameState.currentLake === currentLakeKey && gameState.currentSpot === idx;
            return `
                                <button class="travel-spot-button ${isCurrent ? 'current' : ''}" 
                                        onclick="travelTo('${currentLakeKey}', ${idx})"
                                        ${isCurrent ? 'disabled' : ''}>
                                    ${spot}
                                </button>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;
    } else {
        mainContent = `
            <div class="travel-main-card locked">
                <div class="travel-locked-content">
                    <div class="travel-lock-icon">🔒</div>
                    <div class="travel-locked-text">This location is locked</div>
                    <button class="unlock-button" onclick="unlockLake('${currentLakeKey}')" ${gameState.money < lake.unlockCost ? 'disabled' : ''}>
                        Unlock for $${lake.unlockCost}
                    </button>
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="travel-carousel">
            <div class="travel-nav-header">
                <button class="travel-nav-button" onclick="changeTravelLocation(-1)" ${prevDisabled ? 'disabled' : ''}>
                    ◀ Previous
                </button>
                <h2 class="travel-current-lake">${lake.name}</h2>
                <button class="travel-nav-button" onclick="changeTravelLocation(1)" ${nextDisabled ? 'disabled' : ''}>
                    Next ▶
                </button>
            </div>
            ${mainContent}
        </div>
    `;
}

function changeTravelLocation(direction) {
    const lakeKeys = Object.keys(LAKES);
    gameState.travelIndex += direction;

    if (gameState.travelIndex < 0) gameState.travelIndex = 0;
    if (gameState.travelIndex >= lakeKeys.length) gameState.travelIndex = lakeKeys.length - 1;

    updateTravelDisplay();
}

function updateStatsDisplay() {
    document.getElementById('stat-casts').textContent = gameState.stats.totalCasts;
    document.getElementById('stat-caught').textContent = gameState.stats.fishCaught;
    document.getElementById('stat-thrown-back').textContent = gameState.stats.fishThrownBack;
    document.getElementById('stat-breaks').textContent = gameState.stats.lineBreaks;
    document.getElementById('stat-money-earned').textContent = '$' + gameState.stats.totalMoneyEarned;
    document.getElementById('stat-quests').textContent = gameState.stats.questsCompleted;
    document.getElementById('stat-tokens').textContent = gameState.questTokens;

    const formatRecord = (fish) => {
        if (!fish) return 'None';
        return `${fish.name} (${formatFishMeasurements(fish)})`;
    };

    document.getElementById('record-heaviest').textContent = formatRecord(gameState.records.heaviestFish);
    document.getElementById('record-largest').textContent = formatRecord(gameState.records.largestFish);
    document.getElementById('record-valuable').textContent =
        gameState.records.mostValuable ?
            `${gameState.records.mostValuable.name} ($${gameState.records.mostValuable.value})` :
            'None';
    document.getElementById('record-rarest').textContent =
        gameState.records.rarestCatch ?
            `${gameState.records.rarestCatch.name} (${gameState.records.rarestCatch.rarity})` :
            'None';

    const locationRecords = document.getElementById('location-records');
    locationRecords.innerHTML = Object.entries(gameState.records.byLocation).map(([lakeId, records]) => {
        const lake = LAKES[lakeId];
        return `
            <div class="location-record">
                <div class="location-record-name">${lake.name}</div>
                <div class="location-record-stats">
                    <div>Total Caught: ${records.totalCaught}</div>
                    <div>Heaviest: ${formatRecord(records.heaviest)}</div>
                    <div>Largest: ${formatRecord(records.largest)}</div>
                </div>
            </div>
        `;
    }).join('') || '<div style="color: #93c5fd; text-align: center; padding: 1rem;">No records yet. Go fishing!</div>';
}