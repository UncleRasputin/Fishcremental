function autoSave()
{
    if (!autoSave.lastSave || Date.now() - autoSave.lastSave > 3000)
    {
        saveGame(true);
        autoSave.lastSave = Date.now();
    }
}

function saveGame(silent = false)
{
    try
    {
        const saveData = {
            version: SAVE_VERSION,
            gameState: {
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
                    unlockedEquipment: extractUnlockedEquipment(EQUIPMENT),
                    unlockedAchievements: extractUnlockedData(ACHIEVEMENTS),
                }
            }
        };

        localStorage.setItem('fishcremental_save', JSON.stringify(saveData));
        if (!silent)
            addLog('Game saved successfully!');
    }
    catch (error) { console.error('Save error:', error); }
}

function loadGame()
{
    try
    {
        const saveData = localStorage.getItem('fishcremental_save');
        if (!saveData) 
            return false;

        const data = JSON.parse(saveData);
        const saveVersion = data.version;
        if (!saveVersion)
        {
            console.log('Migrating save from v1 to v2...');
            const baitToHookMapping = {
                'worm': 'basic',
                'cricket': 'basic',
                'minnow': 'wide_gap',
                'lure': 'circle',
                'premium': 'octopus'
            };
            
            if (data.gameState.currentBait) 
                gameState.currentHook = baitToHookMapping[data.gameState.currentBait] || 'basic';

            if (data.baits)
            {
                HOOKS['basic'].unlocked = true;
                addLog('Save migrated: Old bait system converted to hooks. Check the shop!');
            }
        }
        else 
            gameState.currentHook = data.gameState.currentHook || 'basic';

        gameState.money = data.gameState.money;
        gameState.xp = data.gameState.xp;
        gameState.level = data.gameState.level;
        gameState.season = data.gameState.season;
        gameState.seasonProgress = data.gameState.seasonProgress || 0;
        gameState.currentLake = data.gameState.currentLake;
        gameState.currentSpot = data.gameState.currentSpot;
        gameState.currentRod = data.gameState.currentRod;
        gameState.travelIndex = data.gameState.travelIndex || 0;
        gameState.inventory = data.gameState.inventory;
        gameState.lastCatch = data.gameState.lastCatch || null;
        gameState.useImperial = data.gameState.useImperial !== undefined ? data.gameState.useImperial : true;
        gameState.questTokens = data.gameState.questTokens || 0;
        gameState.quest = data.gameState.quest || null;
        gameState.questCooldown = data.gameState.questCooldown || false;
        gameState.equipped = data.gameState.equipped || { hat: 'none', vest: 'none', tackle: 'none', boots: 'none' };
        gameState.upgrades = data.gameState.upgrades || { recaster: false };
        gameState.activeConsumables = data.gameState.activeConsumables || {};
        gameState.consumableInventory = data.gameState.consumableInventory || {};
        gameState.stats = data.gameState.stats;
        gameState.records = data.gameState.records;

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

        updateDisplay();
        return true;
    }
    catch (error)
    {
        console.error('Load error:', error);
        return false;
    }
}

function hardReset()
{
    if (!confirm('Are you sure you want to HARD RESET? This will delete ALL progress and cannot be undone!'))
        return;
    if (!confirm('Really? This will permanently delete everything!')) 
        return;

    localStorage.removeItem('fishcremental_save');
    location.reload();
}
