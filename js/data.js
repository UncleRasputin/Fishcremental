const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];
let LAKES = {};
let FISH_DB = {};
let BAITS = {};
let RODS = {};
let RARITY_WEIGHTS = {};
let RARITY_ORDER = {};
let EQUIPMENT = {};
let UPGRADES = {};
let CONSUMABLES = {};

// Game state
let gameState = {
    money: 0,
    xp: 0,
    level: 1,
    season: 0,
    seasonProgress: 0,
    seasonThreshold: 10000,
    currentLake: 'fork',
    currentSpot: 0,
    currentBait: 'worm',
    currentRod: 'basic',
    currentScreen: 'fish',
    travelIndex: 0,
    casting: false,
    waiting: false,
    reeling: false,
    recasting: false,
    currentFish: null,
    lastCatch: null,
    progress: 0,
    log: [],
    inventory: [],
    progressInterval: null,
    useImperial: true,
    questTokens: 0,
    quest: null,
    questCooldown: false,
    equipped: {
        hat: 'none',
        vest: 'none',
        tackle: 'none',
        boots: 'none'
    },
    upgrades: {
        recaster: false
    },
    activeConsumables: {},
    consumableInventory: {},
    stats: {
        totalCasts: 0,
        fishCaught: 0,
        fishThrownBack: 0,
        lineBreaks: 0,
        totalMoneyEarned: 0,
        questsCompleted: 0
    },
    records: {
        heaviestFish: null,
        largestFish: null,
        mostValuable: null,
        rarestCatch: null,
        byLocation: {}
    }
};