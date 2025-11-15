const CURRENT_SAVE_VERSION = 3;
const SAVE_KEY = 'fishcremental_save';

// Save version history:
// v1: Original unversioned save (baits system)
// v2: Hooks + baits separation
// v3: Phase-based structure (freshwater, etc.)
function autoSave() {
    if (!autoSave.lastSave || Date.now() - autoSave.lastSave > 3000) {
        saveGame(true);
        autoSave.lastSave = Date.now();
    }
}
function saveGame(silent = false) {
    try {
        const saveData = {
            version: CURRENT_SAVE_VERSION,
            timestamp: Date.now(),

            player: {
                money: gameState.money,
                xp: gameState.xp,
                level: gameState.level,
                questTokens: gameState.questTokens,
                useImperial: gameState.useImperial
            },

            phases: {
                freshwater: {
                    season: gameState.season,
                    seasonProgress: gameState.seasonProgress,
                    currentLake: gameState.currentLake,
                    currentSpot: gameState.currentSpot,
                    travelIndex: gameState.travelIndex,

                    currentRod: gameState.currentRod,
                    currentHook: gameState.currentHook,
                    currentBait: gameState.currentBait,
                    equipped: gameState.equipped,

                    inventory: gameState.inventory,
                    lastCatch: gameState.lastCatch,

                    quest: gameState.quest,
                    questCooldown: gameState.questCooldown,

                    activeConsumables: gameState.activeConsumables,
                    consumableInventory: gameState.consumableInventory,

                    upgrades: gameState.upgrades,

                    stats: gameState.stats,
                    records: gameState.records,

                    unlockedLakes: extractUnlockedData(LAKES),
                    unlockedRods: extractUnlockedData(RODS),
                    unlockedHooks: extractUnlockedData(HOOKS),
                    unlockedBaits: extractUnlockedData(BAITS),
                    unlockedEquipment: extractUnlockedEquipment(EQUIPMENT)
                    unlockedAchievements: extractUnlockedData(ACHIEVEMENTS),
                }
            }
        };

        localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
        if (!silent)
            addLog('Game saved successfully!');
    }
    catch (error) {
        console.error('Save error:', error);
        if (!silent)
            addLog('Failed to save game!');
    }
}

function loadGame() {
    try {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData)
            return false;

        const data = JSON.parse(saveData);

        const saveVersion = data.version || 1;
        console.log(`Loading save version ${saveVersion}`);

        let migratedData = data;

        if (saveVersion < CURRENT_SAVE_VERSION) {
            console.log(`Migrating from v${saveVersion} to v${CURRENT_SAVE_VERSION}`);

            if (saveVersion === 1)
                migratedData = migrateV1toV2(migratedData);
            if (saveVersion <= 2)
                migratedData = migrateV2toV3(migratedData);
        }

        applySaveData(migratedData);

        updateDisplay();
        return true;
    }
    catch (error) {
        console.error('Load error:', error);
        return false;
    }
}

function migrateV1toV2(oldData) {
    console.log('Migrating v1 -> v2: Converting bait system to hooks + baits');

    const baitToHookMapping = {
        'worm': 'basic',
        'cricket': 'basic',
        'minnow': 'wide_gap',
        'lure': 'circle',
        'premium': 'octopus'
    };

    if (oldData.gameState && oldData.gameState.currentBait) {
        oldData.gameState.currentHook = baitToHookMapping[oldData.gameState.currentBait] || 'basic';
        oldData.gameState.currentBait = 'worm'; 
    }

    if (oldData.baits) {
        oldData.hooks = {};
        Object.keys(oldData.baits).forEach(oldBaitId => {
            const hookId = baitToHookMapping[oldBaitId];
            if (hookId && oldData.baits[oldBaitId].unlocked) {
                oldData.hooks[hookId] = { unlocked: true };
            }
        });
        delete oldData.baits;
    }

    oldData.version = 2;
    addLog('Save migrated: Old bait system converted to hooks + baits');

    return oldData;
}

function migrateV2toV3(oldData) {
    console.log('Migrating v2 -> v3: Restructuring to phase-based save');

    const gs = oldData.gameState || {};

    const newData = {
        version: 3,
        timestamp: oldData.timestamp || Date.now(),

        player: {
            money: gs.money || 0,
            xp: gs.xp || 0,
            level: gs.level || 1,
            questTokens: gs.questTokens || 0,
            useImperial: gs.useImperial !== undefined ? gs.useImperial : true
        },

        phases: {
            freshwater: {
                season: gs.season || 0,
                seasonProgress: gs.seasonProgress || 0,
                currentLake: gs.currentLake || 'fork',
                currentSpot: gs.currentSpot || 0,
                travelIndex: gs.travelIndex || 0,

                currentRod: gs.currentRod || 'basic',
                currentHook: gs.currentHook || 'basic',
                currentBait: gs.currentBait || 'worm',
                equipped: gs.equipped || { hat: 'none', vest: 'none', tackle: 'none', boots: 'none' },

                inventory: gs.inventory || [],
                lastCatch: gs.lastCatch || null,

                quest: gs.quest || null,
                questCooldown: gs.questCooldown || false,

                activeConsumables: gs.activeConsumables || {},
                consumableInventory: gs.consumableInventory || {},

                upgrades: gs.upgrades || { recaster: false },

                stats: gs.stats || {
                    totalCasts: 0,
                    fishCaught: 0,
                    fishThrownBack: 0,
                    lineBreaks: 0,
                    totalMoneyEarned: 0,
                    questsCompleted: 0
                },

                records: gs.records || {
                    heaviestFish: null,
                    largestFish: null,
                    mostValuable: null,
                    rarestCatch: null,
                    byLocation: {}
                },

                unlockedLakes: oldData.lakes || {},
                unlockedRods: oldData.rods || {},
                unlockedHooks: oldData.hooks || {},
                unlockedBaits: oldData.baits || {},
                unlockedEquipment: oldData.equipment || {}
            }
        }
    };

    addLog('Save migrated to new phase-based structure!');

    return newData;
}

function applySaveData(data) {
    if (data.player) {
        gameState.money = data.player.money;
        gameState.xp = data.player.xp;
        gameState.level = data.player.level;
        gameState.questTokens = data.player.questTokens;
        gameState.useImperial = data.player.useImperial;
    }

    if (data.phases && data.phases.freshwater) {
        const fw = data.phases.freshwater;

        gameState.season = fw.season;
        gameState.seasonProgress = fw.seasonProgress;
        gameState.currentLake = fw.currentLake;
        gameState.currentSpot = fw.currentSpot;
        gameState.travelIndex = fw.travelIndex;

        gameState.currentRod = fw.currentRod;
        gameState.currentHook = fw.currentHook;
        gameState.currentBait = fw.currentBait || 'worm';
        gameState.equipped = fw.equipped;

        gameState.inventory = fw.inventory;
        gameState.lastCatch = fw.lastCatch;

        gameState.quest = fw.quest;
        gameState.questCooldown = fw.questCooldown;

        gameState.activeConsumables = fw.activeConsumables;
        gameState.consumableInventory = fw.consumableInventory;

        gameState.upgrades = fw.upgrades;

        gameState.stats = fw.stats;
        gameState.records = fw.records;

        applyUnlockedData(LAKES, fw.unlockedLakes);
        applyUnlockedData(RODS, fw.unlockedRods);
        applyUnlockedData(HOOKS, fw.unlockedHooks);
        applyUnlockedData(BAITS, fw.unlockedBaits);
        applyUnlockedEquipment(EQUIPMENT, fw.unlockedEquipment);
        applyUnlockedData(ACHIEVEMENTS, fw.unlockedAchievements);
    }
}

function extractUnlockedData(dataObj) {
    const unlocked = {};
    Object.keys(dataObj).forEach(id => {
        if (dataObj[id].unlocked)
            unlocked[id] = { unlocked: true };
    });
    return unlocked;
}

function extractUnlockedEquipment(equipmentObj) {
    const unlocked = {};
    Object.keys(equipmentObj).forEach(slot => {
        unlocked[slot] = {};
        Object.keys(equipmentObj[slot]).forEach(id => {
            if (equipmentObj[slot][id].unlocked)
                unlocked[slot][id] = { unlocked: true };
        });
    });
    return unlocked;
}
function applyUnlockedData(dataObj, unlockedData) {
    if (!unlockedData) return;

    Object.keys(unlockedData).forEach(id => {
        if (dataObj[id])
            dataObj[id].unlocked = true;
    });
}

function applyUnlockedEquipment(equipmentObj, unlockedData) {
    if (!unlockedData) return;

    Object.keys(unlockedData).forEach(slot => {
        if (equipmentObj[slot]) {
            Object.keys(unlockedData[slot]).forEach(id => {
                if (equipmentObj[slot][id])
                    equipmentObj[slot][id].unlocked = true;
            });
        }
    });
}

function hardReset() {
    if (!confirm('Are you sure you want to HARD RESET? This will delete ALL progress and cannot be undone!'))
        return;
    if (!confirm('Really? This will permanently delete everything!'))
        return;

    localStorage.removeItem(SAVE_KEY);
    location.reload();
}