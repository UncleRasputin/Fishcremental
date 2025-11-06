// Game constants and data definitions

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];

const LAKES = {
    pond: { name: "Willow Pond", spots: ['Lily Pads', 'Old Dock', 'Deep End'], unlocked: true },
    river: { name: "Crystal River", spots: ['Rapids', 'Bridge', 'Bend'], unlocked: false, unlockCost: 50 },
    lake: { name: "Azure Lake", spots: ['Shore', 'Boat Launch', 'Island'], unlocked: false, unlockCost: 200 },
    ocean: { name: "Endless Ocean", spots: ['Pier', 'Reef', 'Deep Sea'], unlocked: false, unlockCost: 1000 }
};

const BAITS = {
    worm: { name: "Worm", cost: 0, power: 1, unlocked: true },
    cricket: { name: "Cricket", cost: 10, power: 1.5, unlocked: false },
    minnow: { name: "Minnow", cost: 50, power: 2, unlocked: false },
    lure: { name: "Fancy Lure", cost: 200, power: 3, unlocked: false },
    premium: { name: "Premium Lure", cost: 1000, power: 5, unlocked: false }
};

const RODS = {
    basic: { name: "Basic Rod", strength: 10, castSpeed: 1, cost: 0, unlocked: true },
    bamboo: { name: "Bamboo Rod", strength: 25, castSpeed: 1.2, cost: 100, unlocked: false },
    fiberglass: { name: "Fiberglass Rod", strength: 50, castSpeed: 1.5, cost: 500, unlocked: false },
    carbon: { name: "Carbon Fiber Rod", strength: 100, castSpeed: 2, cost: 2000, unlocked: false },
    legendary: { name: "Legendary Rod", strength: 250, castSpeed: 3, cost: 10000, unlocked: false }
};

const FISH_DB = {
    guppy: { name: "Guppy", rarity: "common", baseValue: 1, baseWeight: 0.1, strength: 1, regions: ['pond'] },
    bluegill: { name: "Bluegill", rarity: "common", baseValue: 3, baseWeight: 0.5, strength: 3, regions: ['pond'] },
    sunfish: { name: "Sunfish", rarity: "uncommon", baseValue: 8, baseWeight: 0.8, strength: 5, regions: ['pond'] },
    bass: { name: "Bass", rarity: "uncommon", baseValue: 15, baseWeight: 2, strength: 10, regions: ['pond', 'river', 'lake'] },
    catfish: { name: "Catfish", rarity: "rare", baseValue: 40, baseWeight: 5, strength: 20, regions: ['pond', 'river'] },
    koi: { name: "Golden Koi", rarity: "epic", baseValue: 150, baseWeight: 3, strength: 15, regions: ['pond'] },
    trout: { name: "Trout", rarity: "common", baseValue: 12, baseWeight: 1.5, strength: 8, regions: ['river'] },
    salmon: { name: "Salmon", rarity: "uncommon", baseValue: 35, baseWeight: 8, strength: 25, regions: ['river'] },
    pike: { name: "Pike", rarity: "rare", baseValue: 80, baseWeight: 10, strength: 40, regions: ['river', 'lake'] },
    sturgeon: { name: "Sturgeon", rarity: "epic", baseValue: 300, baseWeight: 50, strength: 80, regions: ['river'] },
    walleye: { name: "Walleye", rarity: "uncommon", baseValue: 25, baseWeight: 4, strength: 15, regions: ['lake'] },
    muskie: { name: "Muskie", rarity: "rare", baseValue: 120, baseWeight: 20, strength: 60, regions: ['lake'] },
    lake_trout: { name: "Lake Trout", rarity: "rare", baseValue: 90, baseWeight: 15, strength: 50, regions: ['lake'] },
    giant_bass: { name: "Giant Bass", rarity: "epic", baseValue: 400, baseWeight: 12, strength: 70, regions: ['lake'] },
    mackerel: { name: "Mackerel", rarity: "common", baseValue: 20, baseWeight: 3, strength: 12, regions: ['ocean'] },
    tuna: { name: "Tuna", rarity: "uncommon", baseValue: 100, baseWeight: 40, strength: 80, regions: ['ocean'] },
    swordfish: { name: "Swordfish", rarity: "rare", baseValue: 350, baseWeight: 80, strength: 150, regions: ['ocean'] },
    marlin: { name: "Marlin", rarity: "epic", baseValue: 800, baseWeight: 150, strength: 200, regions: ['ocean'] },
    whale: { name: "Baby Whale", rarity: "legendary", baseValue: 5000, baseWeight: 500, strength: 400, regions: ['ocean'] },
    dragon_fish: { name: "Dragon Fish", rarity: "legendary", baseValue: 10000, baseWeight: 100, strength: 500, regions: ['pond', 'river', 'lake', 'ocean'] }
};

const RARITY_WEIGHTS = {
    common: 50,
    uncommon: 25,
    rare: 15,
    epic: 8,
    legendary: 2
};

const RARITY_ORDER = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
};

// Game state
let gameState = {
    money: 0,
    xp: 0,
    level: 1,
    season: 0,
    seasonProgress: 0,
    seasonThreshold: 10000,
    currentLake: 'pond',
    currentSpot: 0,
    currentBait: 'worm',
    currentRod: 'basic',
    currentScreen: 'fish',
    casting: false,
    waiting: false,
    reeling: false,
    currentFish: null,
    lastCatch: null,
    progress: 0,
    log: [],
    inventory: [],
    progressInterval: null,
    useImperial: true, // Default to Imperial measurements
    questTokens: 0,
    quest: null,
    questCooldown: false,
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