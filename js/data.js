// Game constants and data definitions

const SEASONS = ['Spring', 'Summer', 'Fall', 'Winter'];

const LAKES = {
    // Texas
    fork: { name: "Lake Fork, TX", spots: ['Main Lake', 'Big Fish Creek', 'Little Fish Creek'], unlocked: true },
    texoma: { name: "Lake Texoma, TX/OK", spots: ['Dam Area', 'Sandy Point', 'Little Mineral Creek'], unlocked: false, unlockCost: 50 },
    amistad: { name: "Lake Amistad, TX", spots: ['Diablo East', 'Rough Canyon', 'San Pedro'], unlocked: false, unlockCost: 100 },

    // Florida
    okeechobee: {
        name: "Lake Okeechobee, FL", spots: ['Monkey Box', 'King\'s Bar', 'Tin House Cove'], unlocked: false, unlockCost: 150 },

    // Great Lakes
    michigan: { name: "Lake Michigan", spots: ['Milwaukee Harbor', 'Ludington', 'Grand Haven'], unlocked: false, unlockCost: 200 },
            erie: { name: "Lake Erie", spots: ['Western Basin', 'Central Basin', 'Eastern Basin'], unlocked: false, unlockCost: 250 },
            superior: { name: "Lake Superior", spots: ['Apostle Islands', 'Grand Marais', 'Whitefish Bay'], unlocked: false, unlockCost: 300 },

            // Southern Lakes
            santee: { name: "Santee Cooper Lakes, SC", spots: ['Lake Marion', 'Lake Moultrie', 'Diversion Canal'], unlocked: false, unlockCost: 175 },

            // Midwest
            ozarks: { name: "Lake of the Ozarks, MO", spots: ['Grand Glaize Arm', 'Gravois Arm', 'Niangua Arm'], unlocked: false, unlockCost: 125 },

            // Northeast
            champlain: { name: "Lake Champlain, VT/NY", spots: ['Malletts Bay', 'South Lake', 'Inland Sea'], unlocked: false, unlockCost: 225 },

            // West
            mead: { name: "Lake Mead, NV/AZ", spots: ['Boulder Basin', 'Virgin Basin', 'Overton Arm'], unlocked: false, unlockCost: 275 },
            powell: { name: "Lake Powell, UT/AZ", spots: ['Wahweap Bay', 'Padre Bay', 'Rainbow Bridge'], unlocked: false, unlockCost: 325 }
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
    // Panfish - Common everywhere
    bluegill: { name: "Bluegill", rarity: "common", baseValue: 3, baseWeight: 0.5, strength: 3, regions: ['fork', 'texoma', 'amistad', 'okeechobee', 'ozarks', 'santee', 'champlain'] },
    green_sunfish: { name: "Green Sunfish", rarity: "common", baseValue: 2, baseWeight: 0.3, strength: 2, regions: ['fork', 'texoma', 'ozarks', 'santee'] },
    redear: { name: "Redear Sunfish", rarity: "common", baseValue: 4, baseWeight: 0.8, strength: 4, regions: ['fork', 'okeechobee', 'santee', 'ozarks'] },
    crappie_white: { name: "White Crappie", rarity: "uncommon", baseValue: 8, baseWeight: 1.2, strength: 6, regions: ['fork', 'texoma', 'okeechobee', 'ozarks', 'santee'] },
    crappie_black: { name: "Black Crappie", rarity: "uncommon", baseValue: 9, baseWeight: 1.5, strength: 7, regions: ['fork', 'champlain', 'michigan', 'erie', 'ozarks'] },

    // Bass - The stars
    largemouth: { name: "Largemouth Bass", rarity: "uncommon", baseValue: 20, baseWeight: 4, strength: 15, regions: ['fork', 'texoma', 'amistad', 'okeechobee', 'ozarks', 'santee', 'champlain', 'mead', 'powell'] },
    smallmouth: { name: "Smallmouth Bass", rarity: "uncommon", baseValue: 18, baseWeight: 3, strength: 18, regions: ['michigan', 'erie', 'superior', 'champlain', 'mead'] },
    spotted_bass: { name: "Spotted Bass", rarity: "uncommon", baseValue: 15, baseWeight: 2.5, strength: 12, regions: ['fork', 'amistad', 'ozarks'] },
    striped_bass: { name: "Striped Bass", rarity: "rare", baseValue: 45, baseWeight: 15, strength: 40, regions: ['texoma', 'santee', 'powell', 'mead'] },
    white_bass: { name: "White Bass", rarity: "common", baseValue: 7, baseWeight: 1.5, strength: 8, regions: ['texoma', 'fork', 'ozarks', 'erie'] },

    // Trophy Bass
    trophy_largemouth: { name: "Trophy Largemouth Bass", rarity: "epic", baseValue: 200, baseWeight: 10, strength: 50, regions: ['fork', 'okeechobee'] },
    trophy_smallmouth: { name: "Trophy Smallmouth Bass", rarity: "epic", baseValue: 180, baseWeight: 7, strength: 55, regions: ['champlain', 'erie'] },

    // Catfish
    channel_cat: { name: "Channel Catfish", rarity: "uncommon", baseValue: 15, baseWeight: 8, strength: 20, regions: ['fork', 'texoma', 'santee', 'ozarks', 'erie'] },
    blue_cat: { name: "Blue Catfish", rarity: "rare", baseValue: 50, baseWeight: 30, strength: 60, regions: ['texoma', 'santee', 'amistad'] },
    flathead_cat: { name: "Flathead Catfish", rarity: "rare", baseValue: 55, baseWeight: 35, strength: 65, regions: ['texoma', 'santee', 'ozarks'] },

    // Trophy Catfish
    monster_blue: { name: "Monster Blue Catfish", rarity: "epic", baseValue: 250, baseWeight: 80, strength: 120, regions: ['santee', 'texoma'] },

    // Walleye & Pike
    walleye: { name: "Walleye", rarity: "uncommon", baseValue: 30, baseWeight: 5, strength: 25, regions: ['michigan', 'erie', 'champlain', 'superior'] },
    sauger: { name: "Sauger", rarity: "common", baseValue: 12, baseWeight: 2, strength: 10, regions: ['erie', 'ozarks'] },
    northern_pike: { name: "Northern Pike", rarity: "rare", baseValue: 60, baseWeight: 15, strength: 50, regions: ['superior', 'champlain', 'michigan'] },
    muskie: { name: "Muskellunge", rarity: "epic", baseValue: 300, baseWeight: 30, strength: 100, regions: ['superior', 'champlain'] },

    // Trout & Salmon (Cold Water)
    lake_trout: { name: "Lake Trout", rarity: "uncommon", baseValue: 35, baseWeight: 8, strength: 30, regions: ['superior', 'michigan', 'champlain'] },
    brown_trout: { name: "Brown Trout", rarity: "uncommon", baseValue: 28, baseWeight: 4, strength: 22, regions: ['superior', 'michigan', 'powell', 'mead'] },
    rainbow_trout: { name: "Rainbow Trout", rarity: "uncommon", baseValue: 25, baseWeight: 3.5, strength: 20, regions: ['superior', 'michigan', 'powell', 'mead'] },
    chinook_salmon: { name: "Chinook Salmon", rarity: "rare", baseValue: 80, baseWeight: 20, strength: 70, regions: ['michigan', 'superior', 'erie'] },
    coho_salmon: { name: "Coho Salmon", rarity: "rare", baseValue: 65, baseWeight: 12, strength: 55, regions: ['michigan', 'superior'] },

    // Trophy Trout
    trophy_laker: { name: "Trophy Lake Trout", rarity: "epic", baseValue: 220, baseWeight: 35, strength: 95, regions: ['superior'] },

    // Perch
    yellow_perch: { name: "Yellow Perch", rarity: "common", baseValue: 6, baseWeight: 0.8, strength: 5, regions: ['michigan', 'erie', 'champlain', 'superior'] },

    // Specialized Southwest Species
    striped_bass_trophy: { name: "Trophy Striped Bass", rarity: "epic", baseValue: 280, baseWeight: 45, strength: 110, regions: ['powell', 'mead'] },
    smallmouth_buff: { name: "Smallmouth Buffalo", rarity: "rare", baseValue: 40, baseWeight: 25, strength: 45, regions: ['texoma', 'santee'] },

    // Gar (Texas/Southern specialty)
    longnose_gar: { name: "Longnose Gar", rarity: "uncommon", baseValue: 18, baseWeight: 10, strength: 35, regions: ['texoma', 'fork', 'santee'] },
    alligator_gar: { name: "Alligator Gar", rarity: "legendary", baseValue: 500, baseWeight: 120, strength: 200, regions: ['texoma'] },

    // Carp (Common invasive/rough fish)
    common_carp: { name: "Common Carp", rarity: "common", baseValue: 10, baseWeight: 12, strength: 30, regions: ['michigan', 'erie', 'texoma', 'powell', 'mead'] },

    // Legendary fish
    record_muskie: { name: "Record Muskellunge", rarity: "legendary", baseValue: 1000, baseWeight: 55, strength: 250, regions: ['champlain'] },
    giant_laker: { name: "Giant Lake Trout", rarity: "legendary", baseValue: 800, baseWeight: 60, strength: 220, regions: ['superior'] },
    monster_striper: { name: "Monster Striper", rarity: "legendary", baseValue: 900, baseWeight: 70, strength: 240, regions: ['powell'] }
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

// Equipment and items
const EQUIPMENT = {
    hat: {
        none: { name: "No Hat", bonus: {}, cost: 0, unlocked: true },
        lucky: { name: "Lucky Hat", bonus: { rareChance: 5 }, cost: 3, unlocked: false, description: "+5% rare fish chance" },
        scholar: { name: "Scholar's Cap", bonus: { xpBonus: 10 }, cost: 5, unlocked: false, description: "+10% XP gained" }
    },
    vest: {
        none: { name: "No Vest", bonus: {}, cost: 0, unlocked: true },
        fishing: { name: "Fishing Vest", bonus: { sellValue: 10 }, cost: 4, unlocked: false, description: "+10% sell value" },
        weighted: { name: "Weighted Vest", bonus: { weightBonus: 15 }, cost: 6, unlocked: false, description: "+15% fish weight" }
    },
    tackle: {
        none: { name: "No Tackle Box", bonus: {}, cost: 0, unlocked: true },
        basic: { name: "Basic Tackle Box", bonus: { baitPower: 0.5 }, cost: 5, unlocked: false, description: "+0.5x bait effectiveness" },
        pro: { name: "Pro Tackle Box", bonus: { waitReduction: 10 }, cost: 8, unlocked: false, description: "-10% wait time" }
    },
    boots: {
        none: { name: "No Boots", bonus: {}, cost: 0, unlocked: true },
        waders: { name: "Hip Waders", bonus: { sizeBonus: 10 }, cost: 4, unlocked: false, description: "+10% fish size" },
        speed: { name: "Speed Boots", bonus: { castSpeed: 0.2 }, cost: 6, unlocked: false, description: "+0.2x cast speed" }
    }
};

const UPGRADES = {
    recaster: { name: "Auto-Recaster", cost: 10, unlocked: false, description: "Automatically cast again after catching/losing a fish" }
};

const CONSUMABLES = {
    lucky_coin: { name: "Lucky Coin", cost: 2, uses: 5, description: "No line breaks for 5 casts" },
    xp_boost: { name: "XP Boost", cost: 3, uses: 10, description: "2x XP for 10 casts" },
    super_bait: { name: "Super Bait", cost: 5, uses: 1, description: "Guarantees Epic+ fish on next catch" }
};

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