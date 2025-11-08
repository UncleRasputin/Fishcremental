// Fishing odds modal system

function openOddsModal() {
    document.getElementById('odds-modal').style.display = 'flex';
    updateOddsDisplay();
}

function closeOddsModal() {
    document.getElementById('odds-modal').style.display = 'none';
}

function updateOddsDisplay() {
    const content = document.getElementById('odds-content');
    const lake = LAKES[gameState.currentLake];
    const spot = lake.spots[gameState.currentSpot];
    const season = SEASONS[gameState.season];
    const rod = RODS[gameState.currentRod];
    const bait = BAITS[gameState.currentBait];
    
    // Get current conditions for this location
    const conditions = getCurrentConditions(gameState.currentLake, gameState.currentSpot, gameState.season);
    
    // Get all fish available at this location
    const availableFish = Object.entries(FISH_DB).filter(([_, fish]) =>
        fish.regions.includes(gameState.currentLake)
    );
    
    // Separate into catchable and too strong
    const catchable = [];
    const tooStrong = [];
    
    availableFish.forEach(([fishId, fish]) => {
        const modifier = getFishingModifier(gameState.currentLake, gameState.currentSpot, gameState.season, fishId);
        const fishData = {
            id: fishId,
            ...fish,
            modifier: modifier
        };
        
        if (fish.strength <= rod.strength) {
            catchable.push(fishData);
        } else {
            tooStrong.push(fishData);
        }
    });
    
    // Sort by modifier (highest first), then by rarity
    catchable.sort((a, b) => {
        if (b.modifier !== a.modifier) return b.modifier - a.modifier;
        return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
    });
    
    // Build HTML
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
                    <span class="odds-value">${rod.name} (Str: ${rod.strength})</span>
                </div>
                <div class="odds-info-row">
                    <span class="odds-label">Bait:</span>
                    <span class="odds-value">${bait.name} (Power: ${bait.power}x)</span>
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
                        
                        return `
                            <div class="odds-fish-item ${modifierClass}">
                                <div class="odds-fish-name">
                                    <span class="rarity-${fish.rarity}">${fish.name}</span>
                                    <span class="odds-fish-rarity">(${fish.rarity})</span>
                                </div>
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
                            ${tooStrong.map(fish => `
                                <div class="odds-fish-item too-strong-item">
                                    <div class="odds-fish-name">
                                        <span style="color: #6b7280;">${fish.name}</span>
                                        <span class="odds-fish-rarity" style="color: #6b7280;">(${fish.rarity})</span>
                                    </div>
                                    <span class="odds-modifier" style="color: #6b7280;">Str: ${fish.strength}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    content.innerHTML = html;
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('odds-modal');
    if (e.target === modal) {
        closeOddsModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('odds-modal');
        if (modal && modal.style.display === 'flex') {
            closeOddsModal();
        }
    }
});
