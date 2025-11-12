function addLog(msg)
{
    gameState.log.unshift({ msg, time: Date.now() });
    gameState.log = gameState.log.slice(0, 15);
    updateLogDisplay();
}

function updateLogDisplay()
{
    UI.logContainer.innerHTML = gameState.log.map(entry =>
        `<div class="log-entry">${entry.msg}</div>`
    ).join('');
}
function showVersion() {
    UI.gameVersion.textContent = 'v' + GAME_INFO.version;
    UI.gameVersion.addEventListener('click',() => {openInfoModal('changelog')});
}
function updateDisplay()
{
    UI.money.textContent = '$' + gameState.money + " 💰";
    UI.level.textContent = 'Level '+gameState.level;

    const expProgressPercent = (gameState.xp / (gameState.level * 100)) * 100;
    UI.expProgress.style.width = expProgressPercent + '%';
    UI.expProgressBar.title = "XP " + gameState.xp + " / " + (gameState.level * 100);

    UI.season.textContent = SEASONS[gameState.season];
    UI.headerTokens.textContent = gameState.questTokens + " 🎫";

    const seasonProgressPercent = (gameState.seasonProgress / gameState.seasonThreshold) * 100;
    UI.seasonProgressBar.style.width = seasonProgressPercent + '%';

    const lake = LAKES[gameState.currentLake];
    UI.locationName.textContent = `${lake.name} - ${lake.spots[gameState.currentSpot]}`;

    const rod = RODS[gameState.currentRod];
    const hook = HOOKS[gameState.currentHook];
    UI.rodName.textContent = rod.name;
    UI.rodStat.textContent = `(Str: ${rod.strength})`;
    UI.hookName.textContent = hook.name;
    UI.hookStat.textContent = `(Size: ${hook.sizeMultiplier}x)`;
    UI.inventoryCount.textContent = gameState.inventory.length;

    let total = 0;
    gameState.inventory.forEach((fish) => total += fish.value);
    UI.inventoryTotal.textContent = '$' + total;

    UI.sellAll.style.display = (gameState.inventory.length > 0) ? 'block' : 'none';

    updateLastCatchDisplay();

    const xpNeeded = gameState.level * 100;
    if (gameState.xp >= xpNeeded)
    {
        gameState.level++;
        gameState.xp = 0;
        addLog(`Level up! You are now level ${gameState.level}`);
        updateDisplay();
    }

    autoSave();
}

function updateLastCatchDisplay()
{
    if (!UI.lastCatchDisplay)
        return;

    if (gameState.lastCatch)
    {
        const fish = gameState.lastCatch;
        UI.lastCatchDisplay.style.display = 'block';
        UI.lastCatchDisplay.innerHTML = `
            <div class="last-catch-title">Last Catch</div>
            <div class="rarity-${fish.rarity}" style="font-weight: bold; font-size: 1.125rem;">${fish.name}</div>
            <div style="color: #93c5fd; margin-top: 0.25rem;">
                ${formatFishMeasurements(fish)} | $${fish.value}
            </div>`;
    }
    else
    {
        UI.lastCatchDisplay.style.display = 'none';
    }
}

function updateInventoryDisplay()
{
    if (gameState.inventory.length === 0)
    {
        UI.inventoryGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #93c5fd;">No fish caught yet. Go fishing!</div>';
    }
    else
    {
        UI.inventoryGrid.innerHTML = gameState.inventory.map((fish, i) => `
            <div class="inventory-item">
                <div class="rarity-${fish.rarity}">${fish.name}</div>
                <div>${formatFishMeasurements(fish)}</div>
                <button class="sell-button" onclick="sellFish(${i})">Sell $${fish.value}</button>
            </div>`).join('');
    }
}

const renderFish = fishid =>
{
    const f = FISH_DB[fishid];
    return `<span class="rarity-${f.rarity}">${f.name}</span>`;
};

const renderFishList = (label, list = []) =>
    list.length ? `<div class="shop-item-stats">${label}: ${list.map(renderFish).join(", ")}</div>` : "";

const renderBait = bait => `
    <div class="shop-item-info">
        <div class="shop-item-name">${bait.name}</div>
        ${renderFishList("Attracts", bait.attracts)}
        ${renderFishList("Repels", bait.repels)}
        <div class="shop-item-stats">Strength: ${bait.strength}</div>
    </div>
`;

const renderHook = hook => `
    <div class="shop-item-info">
        <div class="shop-item-name">${hook.name}</div>
        <div class="shop-item-stats">Fish Size Multiplier: ${hook.sizeMultiplier}x</div>
    </div>
`;

const renderRod = rod => `
    <div class="shop-item-info">
        <div class="shop-item-name">${rod.name}</div>
        <div class="shop-item-stats">
            Strength: ${rod.strength} | Cast Speed: ${rod.castSpeed}x
        </div>
    </div>
`;

const getShopButtonState = (item, id, currentId, money) => {
    const isEquipped = currentId === id;
    const isOwned = item.unlocked;
    const canAfford = money >= item.cost;

    if (isEquipped)
        return { text: "Equipped", class: "shop-item-button equipped", disabled: true };
    if (isOwned)
        return { text: "Equip", class: "shop-item-button owned", disabled: false };
    return { text: `Buy $${item.cost}`, class: "shop-item-button", disabled: !canAfford };
};

function updateShopDisplay() {
    const { currentRod, currentHook, currentBait, money } = gameState;
    const renderShopSection = (containerId, data, renderItem, currentId, clickHandler) => {
        const container = document.getElementById(containerId);
        container.innerHTML = Object.entries(data)
            .map(([id, item]) => {
                const btn = getShopButtonState(item, id, currentId, money);
                return `
                    <div class="shop-item">
                        ${renderItem(item)}
                        <button class="${btn.class}" onclick="${clickHandler}('${id}')" ${btn.disabled ? "disabled" : ""}>
                            ${btn.text}
                        </button>
                    </div>
                `;
            })
            .join("");
    };
    renderShopSection("rods-container", RODS, renderRod, currentRod, "handleRodClick");
    renderShopSection("hooks-container", HOOKS, renderHook, currentHook, "handleHookClick");
    renderShopSection("baits-container", BAITS, renderBait, currentBait, "handleBaitClick");
    updateTokenShop();
}


function updateTravelDisplay() {
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
                    <div class="travel-spots">
                    <h4>Spots</h4>
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

    UI.travelContainer.innerHTML = `
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
    UI.statCasts.textContent = gameState.stats.totalCasts;
    UI.statCaught.textContent = gameState.stats.fishCaught;
    UI.statThrownBack.textContent = gameState.stats.fishThrownBack;
    UI.statBreaks.textContent = gameState.stats.lineBreaks;
    UI.statMoneyEarned.textContent = '$' + gameState.stats.totalMoneyEarned;
    UI.statQuests.textContent = gameState.stats.questsCompleted;
    UI.statTokens.textContent = gameState.questTokens;

    const formatRecord = (fish) => {
        if (!fish) return 'None';
        return `${fish.name} (${formatFishMeasurements(fish)})`;
    };

    UI.recordHeaviest.textContent = formatRecord(gameState.records.heaviestFish);
    UI.recordLargest.textContent = formatRecord(gameState.records.largestFish);
    UI.recordValuable.textContent =
        gameState.records.mostValuable ?
            `${gameState.records.mostValuable.name} ($${gameState.records.mostValuable.value})` :
            'None';
    UI.recordRarest.textContent =
        gameState.records.rarestCatch ?
            `${gameState.records.rarestCatch.name} (${gameState.records.rarestCatch.rarity})` :
            'None';

    UI.locationRecords.innerHTML = Object.entries(gameState.records.byLocation).map(([lakeId, records]) => {
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