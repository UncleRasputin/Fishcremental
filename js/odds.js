function openOddsModal()
{
    UI.oddsModal.style.display = 'flex';
    updateOddsDisplay();
}

function closeOddsModal()
{
    UI.oddsModal.style.display = 'none';
}
function truncateToTwoDecimals(number) {
    return Math.trunc(number * 100) / 100;
}
function updateOddsDisplay()
{
    const lake = LAKES[gameState.currentLake];
    const spot = lake.spots[gameState.currentSpot];
    const season = SEASONS[gameState.season];
    const rod = RODS[gameState.currentRod];
    const hook = HOOKS[gameState.currentHook];
    const conditions = getCurrentConditions(gameState.currentLake, gameState.currentSpot, gameState.season);
    const availableFish = Object.entries(FISH_DB).filter(([_, fish]) =>fish.regions.includes(gameState.currentLake));

    const catchable = [];
    const tooStrong = [];

    let fishpoolodds = getPoolOdds(getFishPool())
    const percentLookup = Object.fromEntries(
        fishpoolodds.map(r => [r.value, r])
    );

    availableFish.forEach(([fishId, fish]) =>
    {
        const modifier = getFishingModifier(gameState.currentLake, gameState.currentSpot, gameState.season, gameState.currentBait, fishId);
        const oddspercent = percentLookup[fishId] || { count: 0, percent: 0 };
        const fishData = {
            id: fishId,
            ...fish,
            modifier: modifier,
            ...oddspercent
        };
        
        if (fish.strength <= rod.strength) 
            catchable.push(fishData);
        else
            tooStrong.push(fishData);
    });
    
    catchable.sort((a, b) => {
        if (b.modifier !== a.modifier) return b.modifier - a.modifier;
        return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    });
    
    let html = `
        <div class="odds-info-section">
            <div class="odds-location-info">
                <div class="odds-info-row">
                    <span class="odds-label">Location:</span>
                    <span class="odds-value">${lake.name} - ${spot}</span>
                </div>
                <div class="odds-info-row">
                    <span class="odds-label">Season:</span>
                    <span class="odds-value">${season}</span>
                </div>
                <div class="odds-info-row">
                    <span class="odds-label">Rod:</span>
                    <span class="odds-value">${rod.name} - Strength: ${rod.strength} Cast Speed: ${rod.castSpeed}x</span>
                </div>
                <div class="odds-info-row">
                    <span class="odds-label">Hook:</span>
                    <span class="odds-value">${hook.name} - Power: ${hook.sizeMultiplier}x</span>
                </div>
            </div>
            
            <div class="odds-fish-section">
                <h3>Available Fish at This Spot</h3>
                ${catchable.length === 0 ? 
                    '<p style="text-align: center; color: #93c5fd; padding: 1rem;">No fish available with current equipment</p>' :
                    '<div class="odds-fish-list">' + 
                    catchable.map(fish => {
                        let modifierHTML = '';
                        let modifierClass = '';
                        
                        if (fish.modifier > 0) {
                            modifierHTML = `<span class="odds-modifier positive">⬆️ +${fish.modifier}%</span>`;
                            modifierClass = 'fish-boosted';
                        } else if (fish.modifier < 0) {
                            modifierHTML = `<span class="odds-modifier negative">⬇️ ${fish.modifier}%</span>`;
                            modifierClass = 'fish-penalized';
                        } else {
                            modifierHTML = `<span class="odds-modifier neutral">—</span>`;
                        }

                        let percentOdds = `<span></span>`;
                        if (gameState.upgrades["fishfinder"])
                            percentOdds = `<span class="odds-percentage">${truncateToTwoDecimals(fish.percent)}%</span>`;

                        
                        return `
                            <div class="odds-fish-item ${modifierClass}">
                                <div class="odds-fish-name">
                                    <span class="rarity-${fish.rarity}">${fish.name}</span>
                                    <span class="odds-fish-rarity">(${fish.rarity})</span>
                                </div>
                                ${percentOdds}
                                ${modifierHTML}
                            </div>
                        `;
                    }).join('') +
                    '</div>'
                }
                
                ${tooStrong.length > 0 ? `
                    <div class="odds-too-strong-section">
                        <h4>Too Strong for Current Rod</h4>
                        <div class="odds-fish-list">
                            ${tooStrong.map(fish => {
                                let percentOdds = `<span></span>`;
                                if (gameState.upgrades["fishfinder"])
                                    percentOdds = `<span class="odds-percentage">${truncateToTwoDecimals(fish.percent)}%</span>`;
                                return `
                                <div class="odds-fish-item too-strong-item">
                                    <div class="odds-fish-name">
                                        <span style="color: #6b7280;">${fish.name}</span>
                                        <span class="odds-fish-rarity" style="color: #6b7280;">(${fish.rarity})</span>
                                    </div>
                                    ${percentOdds}
                                    <span class="odds-modifier" style="color: #6b7280;">Str: ${fish.strength}</span>
                                </div>
                            `}).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    UI.oddsContent.innerHTML = html;
}

document.addEventListener('click', (e) => {
    const modal = UI.oddsModal;
    if (e.target === modal) {
        closeOddsModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = UI.oddsModal;
        if (modal && modal.style.display === 'flex') {
            closeOddsModal();
        }
    }
});
