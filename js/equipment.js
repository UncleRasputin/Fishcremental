// Equipment and token shop management

function changeInventoryTab(tab) {
    document.querySelectorAll('.inventory-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.inventory-tab-content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById('inventory-tab-' + tab).classList.add('active');

    if (tab === 'consumables') {
        updateConsumablesInventory();
    } else if (tab === 'equipment') {
        updateEquipmentSlots();
    } else if (tab === 'upgrades') {
        updateUpgradesOwned();
    }
}

function updateTokenShop() {
    updateEquipmentShop();
    updateUpgradesShop();
    updateConsumablesShop();
}

function updateEquipmentShop() {
    const container = document.getElementById('equipment-shop-container');
    if (!container) {
        return;
    }

    let html = '';

    Object.entries(EQUIPMENT).forEach(([slot, items]) => {
        Object.entries(items).forEach(([id, item]) => {
            if (id === 'none') return; // Skip "none" items

            const isOwned = item.unlocked;
            const isEquipped = gameState.equipped[slot] === id;
            const canAfford = gameState.questTokens >= item.cost;

            let buttonText, buttonClass, disabled;
            if (isEquipped) {
                buttonText = 'Equipped';
                buttonClass = 'shop-item-button equipped';
                disabled = 'disabled';
            } else if (isOwned) {
                buttonText = 'Equip';
                buttonClass = 'shop-item-button owned';
                disabled = '';
            } else {
                buttonText = `Buy ${item.cost} 🎫`;
                buttonClass = 'shop-item-button';
                disabled = canAfford ? '' : 'disabled';
            }

            html += `
                <div class="shop-item">
                    <div class="shop-item-info">
                        <div class="shop-item-name">${item.name}</div>
                        <div class="shop-item-stats">${item.description}</div>
                    </div>
                    <button class="${buttonClass}" onclick="handleEquipmentClick('${slot}', '${id}')" ${disabled}>${buttonText}</button>
                </div>
            `;
        });
    });

    container.innerHTML = html;
}

function updateUpgradesShop() {
    const container = document.getElementById('upgrades-shop-container');
    let html = '';

    Object.entries(UPGRADES).forEach(([id, upgrade]) => {
        const isOwned = gameState.upgrades[id];
        const canAfford = gameState.questTokens >= upgrade.cost;

        let buttonText, buttonClass, disabled;
        if (isOwned) {
            buttonText = 'Owned';
            buttonClass = 'shop-item-button owned';
            disabled = 'disabled';
        } else {
            buttonText = `Buy ${upgrade.cost} 🎫`;
            buttonClass = 'shop-item-button';
            disabled = canAfford ? '' : 'disabled';
        }

        html += `
            <div class="shop-item">
                <div class="shop-item-info">
                    <div class="shop-item-name">${upgrade.name}</div>
                    <div class="shop-item-stats">${upgrade.description}</div>
                </div>
                <button class="${buttonClass}" onclick="handleUpgradeClick('${id}')" ${disabled}>${buttonText}</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function updateConsumablesShop() {
    const container = document.getElementById('consumables-shop-container');
    let html = '';

    Object.entries(CONSUMABLES).forEach(([id, consumable]) => {
        const canAfford = gameState.questTokens >= consumable.cost;

        html += `
            <div class="shop-item">
                <div class="shop-item-info">
                    <div class="shop-item-name">${consumable.name}</div>
                    <div class="shop-item-stats">${consumable.description}</div>
                </div>
                <button class="shop-item-button" onclick="handleConsumablePurchase('${id}')" ${!canAfford ? 'disabled' : ''}>Buy ${consumable.cost} 🎫</button>
            </div>
        `;
    });

    container.innerHTML = html;
}

function handleEquipmentClick(slot, id) {
    const item = EQUIPMENT[slot][id];

    if (!item.unlocked) {
        // Purchase
        if (gameState.questTokens >= item.cost) {
            gameState.questTokens -= item.cost;
            item.unlocked = true;
            gameState.equipped[slot] = id;
            addLog(`Purchased and equipped ${item.name}!`);
            saveGame(true);
        }
    } else {
        // Equip
        gameState.equipped[slot] = id;
        addLog(`Equipped ${item.name}`);
        saveGame(true);
    }

    updateDisplay();
    updateTokenShop();
}

function handleUpgradeClick(id) {
    const upgrade = UPGRADES[id];

    if (gameState.questTokens >= upgrade.cost) {
        gameState.questTokens -= upgrade.cost;
        gameState.upgrades[id] = true;
        addLog(`Purchased ${upgrade.name}!`);
        saveGame(true);
        updateDisplay();
        updateTokenShop();
    }
}

function handleConsumablePurchase(id) {
    const consumable = CONSUMABLES[id];

    if (gameState.questTokens >= consumable.cost) {
        gameState.questTokens -= consumable.cost;

        if (!gameState.consumableInventory[id]) {
            gameState.consumableInventory[id] = 0;
        }
        gameState.consumableInventory[id]++;

        addLog(`Purchased ${consumable.name}!`);
        saveGame(true);
        updateDisplay();
        updateTokenShop();
    }
}

function useConsumable(id) {
    if (!gameState.consumableInventory[id] || gameState.consumableInventory[id] <= 0) return;
    if (gameState.casting || gameState.waiting || gameState.reeling) {
        addLog("Can't use consumables while fishing!");
        return;
    }

    gameState.consumableInventory[id]--;
    if (gameState.consumableInventory[id] === 0) {
        delete gameState.consumableInventory[id];
    }

    const consumable = CONSUMABLES[id];
    gameState.activeConsumables[id] = consumable.uses;

    addLog(`Activated ${consumable.name}! (${consumable.uses} casts)`);
    saveGame(true);
    updateConsumablesInventory();
}

function decrementConsumables() {
    Object.keys(gameState.activeConsumables).forEach(id => {
        gameState.activeConsumables[id]--;
        if (gameState.activeConsumables[id] <= 0) {
            delete gameState.activeConsumables[id];
            addLog(`${CONSUMABLES[id].name} expired`);
        }
    });
}

function updateConsumablesInventory() {
    const container = document.getElementById('consumables-inventory-container');

    const allConsumables = { ...gameState.consumableInventory };
    Object.keys(gameState.activeConsumables).forEach(id => {
        if (!allConsumables[id]) allConsumables[id] = 0;
    });

    if (Object.keys(allConsumables).length === 0) {
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: #93c5fd;">No consumables. Purchase from Token Shop!</div>';
        return;
    }

    container.innerHTML = Object.entries(allConsumables).map(([id, count]) => {
        const consumable = CONSUMABLES[id];
        const isActive = gameState.activeConsumables[id];
        const activeClass = isActive ? 'consumable-active' : '';

        return `
            <div class="consumable-item ${activeClass}">
                <div>
                    <div style="font-weight: bold;">${consumable.name}</div>
                    <div style="font-size: 0.875rem; color: #93c5fd;">
                        ${isActive ? `Active: ${isActive} casts remaining` : `Owned: ${count}`}
                    </div>
                </div>
                ${!isActive && count > 0 ? `<button class="small-button" onclick="useConsumable('${id}')">Use</button>` : ''}
            </div>
        `;
    }).join('');
}

function updateEquipmentSlots() {
    const container = document.getElementById('equipment-slots-container');

    container.innerHTML = `
        <div class="equipment-slots">
            ${Object.entries(gameState.equipped).map(([slot, itemId]) => {
        const item = EQUIPMENT[slot][itemId];
        const bonusText = Object.entries(item.bonus).map(([key, value]) => {
            if (key === 'rareChance') return `+${value}% rare fish`;
            if (key === 'xpBonus') return `+${value}% XP`;
            if (key === 'sellValue') return `+${value}% sell value`;
            if (key === 'weightBonus') return `+${value}% weight`;
            if (key === 'baitPower') return `+${value}x bait power`;
            if (key === 'waitReduction') return `-${value}% wait time`;
            if (key === 'sizeBonus') return `+${value}% size`;
            if (key === 'castSpeed') return `+${value}x cast speed`;
            return '';
        }).filter(Boolean).join(', ');

        return `
                    <div class="equipment-slot">
                        <div class="equipment-slot-name">${slot}</div>
                        <div class="equipment-slot-item">${item.name}</div>
                        ${bonusText ? `<div class="equipment-slot-bonus">${bonusText}</div>` : ''}
                    </div>
                `;
    }).join('')}
        </div>
    `;
}

function updateUpgradesOwned() {
    const container = document.getElementById('upgrades-owned-container');

    const ownedUpgrades = Object.entries(gameState.upgrades).filter(([id, owned]) => owned);

    if (ownedUpgrades.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: #93c5fd;">No upgrades purchased yet. Visit the Token Shop!</div>';
        return;
    }

    container.innerHTML = ownedUpgrades.map(([id]) => {
        const upgrade = UPGRADES[id];
        return `
            <div class="upgrade-item">
                <div class="upgrade-item-name">${upgrade.name}</div>
                <div class="upgrade-item-description">${upgrade.description}</div>
            </div>
        `;
    }).join('');
}

function getEquipmentBonuses() {
    const bonuses = {
        rareChance: 0,
        xpBonus: 0,
        sellValue: 0,
        weightBonus: 0,
        baitPower: 0,
        waitReduction: 0,
        sizeBonus: 0,
        castSpeed: 0
    };

    Object.entries(gameState.equipped).forEach(([slot, itemId]) => {
        const item = EQUIPMENT[slot][itemId];
        Object.entries(item.bonus).forEach(([key, value]) => {
            bonuses[key] += value;
        });
    });

    return bonuses;
}