// Fishing conditions - location, season, and species-specific modifiers
// Positive modifiers increase spawn chance, negative decrease it

const FISHING_CONDITIONS = [
    // Lake Fork, TX
    { lake: "fork", spot: 0, season: 1, fish: "largemouth", modifier: 15 }, // Main Lake, Summer
    { lake: "fork", spot: 0, season: 2, fish: "largemouth", modifier: 20 }, // Main Lake, Fall
    { lake: "fork", spot: 1, season: 0, fish: "trophy_largemouth", modifier: 10 }, // Big Fish Creek, Spring
    { lake: "fork", spot: 1, season: 1, fish: "trophy_largemouth", modifier: 15 }, // Big Fish Creek, Summer
    { lake: "fork", spot: 1, season: 3, fish: "trophy_largemouth", modifier: -10 }, // Big Fish Creek, Winter
    { lake: "fork", spot: 2, season: 0, fish: "bluegill", modifier: 20 }, // Little Fish Creek, Spring
    { lake: "fork", spot: 2, season: 1, fish: "bluegill", modifier: 15 }, // Little Fish Creek, Summer
    { lake: "fork", spot: 0, season: 3, fish: "crappie_white", modifier: 15 }, // Main Lake, Winter
    { lake: "fork", spot: 0, season: 3, fish: "crappie_black", modifier: 15 }, // Main Lake, Winter
    
    // Lake Texoma, TX/OK
    { lake: "texoma", spot: 0, season: 0, fish: "striped_bass", modifier: 25 }, // Dam Area, Spring
    { lake: "texoma", spot: 0, season: 2, fish: "striped_bass", modifier: 20 }, // Dam Area, Fall
    { lake: "texoma", spot: 0, season: 1, fish: "blue_cat", modifier: 15 }, // Dam Area, Summer
    { lake: "texoma", spot: 1, season: 1, fish: "white_bass", modifier: 20 }, // Sandy Point, Summer
    { lake: "texoma", spot: 2, season: 0, fish: "channel_cat", modifier: 15 }, // Little Mineral Creek, Spring
    { lake: "texoma", spot: 2, season: 2, fish: "channel_cat", modifier: 15 }, // Little Mineral Creek, Fall
    { lake: "texoma", spot: 1, season: 3, fish: "alligator_gar", modifier: 10 }, // Sandy Point, Winter
    
    // Lake Amistad, TX
    { lake: "amistad", spot: 0, season: 0, fish: "largemouth", modifier: 20 }, // Diablo East, Spring
    { lake: "amistad", spot: 1, season: 1, fish: "smallmouth_buff", modifier: 15 }, // Rough Canyon, Summer
    { lake: "amistad", spot: 2, season: 2, fish: "blue_cat", modifier: 20 }, // San Pedro, Fall
    { lake: "amistad", spot: 0, season: 1, fish: "spotted_bass", modifier: 15 }, // Diablo East, Summer
    
    // Lake Okeechobee, FL
    { lake: "okeechobee", spot: 0, season: 3, fish: "trophy_largemouth", modifier: 25 }, // Monkey Box, Winter
    { lake: "okeechobee", spot: 0, season: 0, fish: "trophy_largemouth", modifier: 20 }, // Monkey Box, Spring
    { lake: "okeechobee", spot: 1, season: 2, fish: "largemouth", modifier: 20 }, // King's Bar, Fall
    { lake: "okeechobee", spot: 2, season: 1, fish: "bluegill", modifier: 25 }, // Tin House Cove, Summer
    { lake: "okeechobee", spot: 2, season: 0, fish: "redear", modifier: 20 }, // Tin House Cove, Spring
    
    // Lake Michigan
    { lake: "michigan", spot: 0, season: 1, fish: "chinook_salmon", modifier: 30 }, // Milwaukee Harbor, Summer
    { lake: "michigan", spot: 0, season: 2, fish: "coho_salmon", modifier: 25 }, // Milwaukee Harbor, Fall
    { lake: "michigan", spot: 1, season: 0, fish: "lake_trout", modifier: 20 }, // Ludington, Spring
    { lake: "michigan", spot: 1, season: 3, fish: "lake_trout", modifier: 15 }, // Ludington, Winter
    { lake: "michigan", spot: 2, season: 1, fish: "smallmouth", modifier: 20 }, // Grand Haven, Summer
    { lake: "michigan", spot: 0, season: 1, fish: "yellow_perch", modifier: 15 }, // Milwaukee Harbor, Summer
    
    // Lake Erie
    { lake: "erie", spot: 0, season: 0, fish: "walleye", modifier: 30 }, // Western Basin, Spring
    { lake: "erie", spot: 0, season: 2, fish: "walleye", modifier: 25 }, // Western Basin, Fall
    { lake: "erie", spot: 1, season: 1, fish: "smallmouth", modifier: 25 }, // Central Basin, Summer
    { lake: "erie", spot: 1, season: 0, fish: "trophy_smallmouth", modifier: 15 }, // Central Basin, Spring
    { lake: "erie", spot: 2, season: 1, fish: "yellow_perch", modifier: 20 }, // Eastern Basin, Summer
    { lake: "erie", spot: 2, season: 2, fish: "yellow_perch", modifier: 20 }, // Eastern Basin, Fall
    
    // Lake Superior
    { lake: "superior", spot: 0, season: 1, fish: "lake_trout", modifier: 25 }, // Apostle Islands, Summer
    { lake: "superior", spot: 0, season: 2, fish: "trophy_laker", modifier: 20 }, // Apostle Islands, Fall
    { lake: "superior", spot: 1, season: 0, fish: "northern_pike", modifier: 20 }, // Grand Marais, Spring
    { lake: "superior", spot: 2, season: 2, fish: "muskie", modifier: 25 }, // Whitefish Bay, Fall
    { lake: "superior", spot: 2, season: 0, fish: "muskie", modifier: 15 }, // Whitefish Bay, Spring
    { lake: "superior", spot: 1, season: 3, fish: "giant_laker", modifier: 10 }, // Grand Marais, Winter
    
    // Santee Cooper Lakes, SC
    { lake: "santee", spot: 0, season: 0, fish: "monster_blue", modifier: 20 }, // Lake Marion, Spring
    { lake: "santee", spot: 0, season: 1, fish: "monster_blue", modifier: 25 }, // Lake Marion, Summer
    { lake: "santee", spot: 1, season: 2, fish: "striped_bass", modifier: 25 }, // Lake Moultrie, Fall
    { lake: "santee", spot: 2, season: 0, fish: "crappie_white", modifier: 20 }, // Diversion Canal, Spring
    { lake: "santee", spot: 1, season: 1, fish: "flathead_cat", modifier: 20 }, // Lake Moultrie, Summer
    
    // Lake of the Ozarks, MO
    { lake: "ozarks", spot: 0, season: 0, fish: "largemouth", modifier: 20 }, // Grand Glaize Arm, Spring
    { lake: "ozarks", spot: 0, season: 2, fish: "largemouth", modifier: 15 }, // Grand Glaize Arm, Fall
    { lake: "ozarks", spot: 1, season: 1, fish: "spotted_bass", modifier: 20 }, // Gravois Arm, Summer
    { lake: "ozarks", spot: 2, season: 3, fish: "crappie_black", modifier: 25 }, // Niangua Arm, Winter
    { lake: "ozarks", spot: 2, season: 0, fish: "crappie_black", modifier: 20 }, // Niangua Arm, Spring
    
    // Lake Champlain, VT/NY
    { lake: "champlain", spot: 0, season: 1, fish: "smallmouth", modifier: 25 }, // Malletts Bay, Summer
    { lake: "champlain", spot: 0, season: 0, fish: "trophy_smallmouth", modifier: 20 }, // Malletts Bay, Spring
    { lake: "champlain", spot: 1, season: 2, fish: "northern_pike", modifier: 20 }, // South Lake, Fall
    { lake: "champlain", spot: 2, season: 2, fish: "muskie", modifier: 25 }, // Inland Sea, Fall
    { lake: "champlain", spot: 2, season: 0, fish: "record_muskie", modifier: 15 }, // Inland Sea, Spring
    { lake: "champlain", spot: 1, season: 1, fish: "largemouth", modifier: 15 }, // South Lake, Summer
    
    // Lake Mead, NV/AZ
    { lake: "mead", spot: 0, season: 0, fish: "striped_bass_trophy", modifier: 25 }, // Boulder Basin, Spring
    { lake: "mead", spot: 0, season: 2, fish: "striped_bass_trophy", modifier: 20 }, // Boulder Basin, Fall
    { lake: "mead", spot: 1, season: 1, fish: "largemouth", modifier: 20 }, // Virgin Basin, Summer
    { lake: "mead", spot: 2, season: 3, fish: "rainbow_trout", modifier: 25 }, // Overton Arm, Winter
    { lake: "mead", spot: 1, season: 1, fish: "smallmouth", modifier: 15 }, // Virgin Basin, Summer
    
    // Lake Powell, UT/AZ
    { lake: "powell", spot: 0, season: 0, fish: "striped_bass", modifier: 25 }, // Wahweap Bay, Spring
    { lake: "powell", spot: 0, season: 2, fish: "monster_striper", modifier: 20 }, // Wahweap Bay, Fall
    { lake: "powell", spot: 1, season: 1, fish: "largemouth", modifier: 20 }, // Padre Bay, Summer
    { lake: "powell", spot: 2, season: 3, fish: "rainbow_trout", modifier: 25 }, // Rainbow Bridge, Winter
    { lake: "powell", spot: 2, season: 0, fish: "brown_trout", modifier: 20 } // Rainbow Bridge, Spring
];

// Helper function to get modifier for current conditions
function getFishingModifier(lake, spot, season, fishId) {
    const condition = FISHING_CONDITIONS.find(c => 
        c.lake === lake && 
        c.spot === spot && 
        c.season === season && 
        c.fish === fishId
    );
    return condition ? condition.modifier : 0;
}

// Get all conditions for current location/season (for display)
function getCurrentConditions(lake, spot, season) {
    return FISHING_CONDITIONS.filter(c =>
        c.lake === lake &&
        c.spot === spot &&
        c.season === season
    );
}
