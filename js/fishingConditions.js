// Fishing conditions - location, season, and species-specific modifiers
// Positive modifiers increase spawn chance, negative decrease it

var FISHING_CONDITIONS = [];

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
