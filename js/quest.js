// Quest system

function generateQuest() {
    console.log('generateQuest called');
    console.log('questCooldown:', gameState.questCooldown);

    if (gameState.questCooldown) {
        console.log('Quest on cooldown');
        return;
    }

    const rod = RODS[gameState.currentRod];
    console.log('Current rod:', rod.name, 'strength:', rod.strength);

    // Get all fish from unlocked regions that player can catch
    const availableFish = Object.entries(FISH_DB).filter(([id, fish]) => {
        // Check if fish is in an unlocked location
        const inUnlockedRegion = fish.regions.some(region => LAKES[region].unlocked);
        // Check if rod is strong enough
        const canCatch = fish.strength <= rod.strength;
        return inUnlockedRegion && canCatch;
    });

    console.log('Available fish for quests:', availableFish.length);

    if (availableFish.length === 0) {
        // No catchable fish available
        console.log('No catchable fish available for quests');
        return null;
    }

    // Pick random fish
    const [fishId, fishData] = availableFish[Math.floor(Math.random() * availableFish.length)];
    console.log('Selected fish:', fishData.name);

    // Determine quantity based on rarity
    const rarityQuantity = {
        common: [10, 20],
        uncommon: [8, 15],
        rare: [5, 12],
        epic: [3, 8],
        legendary: [1, 3]
    };

    const [min, max] = rarityQuantity[fishData.rarity];
    const quantity = Math.floor(Math.random() * (max - min + 1)) + min;

    // 30% chance for a constraint
    let constraint = null;
    if (Math.random() < 0.3) {
        const constraintType = Math.random() < 0.5 ? 'weight' : 'size';
        if (constraintType === 'weight') {
            // Require fish above 70% of base weight
            const minWeight = fishData.baseWeight * 0.7;
            constraint = { type: 'weight', value: parseFloat(minWeight.toFixed(2)) };
        } else {
            // Require fish above certain size
            const minSize = fishData.baseWeight * 10 * 0.7;
            constraint = { type: 'size', value: parseFloat(minSize.toFixed(1)) };
        }
    }

    // Calculate rewards
    const baseReward = fishData.baseValue * quantity;
    const rarityMultiplier = RARITY_ORDER[fishData.rarity];
    const constraintBonus = constraint ? 1.5 : 1;

    const reward = {
        money: Math.floor(baseReward * rarityMultiplier * constraintBonus),
        xp: Math.floor(baseReward * rarityMultiplier * constraintBonus * 0.5),
        tokens: Math.max(1, Math.floor(rarityMultiplier * constraintBonus * 0.5))
    };

    gameState.quest = {
        active: true,
        fishId: fishId,
        targetName: fishData.name,
        quantity: quantity,
        caught: 0,
        constraint: constraint,
        reward: reward
    };

    console.log('Quest generated:', gameState.quest);
    addLog(`New quest: Catch ${quantity} ${fishData.name}${constraint ? ` (${formatConstraint(constraint)})` : ''}!`);

    // Force save immediately to prevent refresh-scumming
    saveGame(true);

    updateQuestDisplay();
}

function formatConstraint(constraint) {
    if (!constraint) return '';
    if (constraint.type === 'weight') {
        return gameState.useImperial ?
            `over ${convertWeight(constraint.value)} lbs` :
            `over ${constraint.value} kg`;
    } else {
        return gameState.useImperial ?
            `over ${convertSize(constraint.value)} in` :
            `over ${constraint.value} cm`;
    }
}

function checkQuestProgress(fish) {
    if (!gameState.quest || !gameState.quest.active) return;

    // Check if it's the right fish
    if (fish.id !== gameState.quest.fishId) return;

    // Check constraints
    if (gameState.quest.constraint) {
        const c = gameState.quest.constraint;
        if (c.type === 'weight' && fish.weight < c.value) return;
        if (c.type === 'size' && fish.size < c.value) return;
    }

    // Valid catch for quest
    gameState.quest.caught++;
    addLog(`Quest progress: ${gameState.quest.caught}/${gameState.quest.quantity} ${gameState.quest.targetName}`);

    // Check if quest complete
    if (gameState.quest.caught >= gameState.quest.quantity) {
        completeQuest();
    }

    updateQuestDisplay();
}

function completeQuest() {
    if (!gameState.quest) return;

    const reward = gameState.quest.reward;
    gameState.money += reward.money;
    gameState.xp += reward.xp;
    gameState.questTokens += reward.tokens;
    gameState.stats.questsCompleted++;

    addLog(`Quest complete! +${reward.money}, +${reward.xp} XP, +${reward.tokens} Quest Token${reward.tokens > 1 ? 's' : ''}`);

    gameState.quest = null;

    // Force save before generating new quest
    saveGame(true);

    generateQuest();
    updateDisplay();
}

function abandonQuest() {
    if (!gameState.quest || gameState.questCooldown) return;

    if (!confirm('Abandon this quest? You will not be able to take another quest until the season changes.')) {
        return;
    }

    addLog(`Quest abandoned. New quest available next season.`);
    gameState.quest = null;
    gameState.questCooldown = true;

    // Force save to lock in the cooldown
    saveGame(true);

    updateQuestDisplay();
}

function checkQuestCooldown() {
    if (gameState.questCooldown) {
        gameState.questCooldown = false;
        generateQuest();
    }
}

function updateQuestDisplay() {
    const container = document.getElementById('quest-panel');
    if (!container) return;

    if (gameState.questCooldown) {
        container.innerHTML = `
            <div class="quest-cooldown">
                <div class="quest-title">⏳ Quest Cooldown</div>
                <div style="color: #93c5fd; font-size: 0.875rem; margin-top: 0.5rem;">
                    New quest available next season
                </div>
            </div>
        `;
        return;
    }

    if (!gameState.quest) {
        container.innerHTML = `
            <div class="quest-empty">
                <div class="quest-title">No Active Quest</div>
                <button onclick="generateQuest()" class="small-button" style="margin-top: 0.5rem;">Generate Quest</button>
            </div>
        `;
        return;
    }

    const q = gameState.quest;
    const progress = (q.caught / q.quantity) * 100;

    container.innerHTML = `
        <div class="quest-active">
            <div class="quest-header">
                <div class="quest-title">📜 Active Quest</div>
                <button onclick="abandonQuest()" class="abandon-button">Abandon</button>
            </div>
            <div class="quest-target">
                Catch ${q.quantity} ${q.targetName}
                ${q.constraint ? `<br><span style="color: #fbbf24; font-size: 0.875rem;">${formatConstraint(q.constraint)}</span>` : ''}
            </div>
            <div class="quest-progress-container">
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="quest-progress-text">${q.caught} / ${q.quantity}</div>
            </div>
            <div class="quest-rewards">
                <div style="color: #93c5fd; font-size: 0.875rem; margin-bottom: 0.25rem;">Rewards:</div>
                <div style="display: flex; gap: 1rem; font-size: 0.875rem;">
                    <span>💰 $${q.reward.money}</span>
                    <span>⭐ ${q.reward.xp} XP</span>
                    <span>🎫 ${q.reward.tokens} Token${q.reward.tokens > 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    `;
}