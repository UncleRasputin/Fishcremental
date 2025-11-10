var FISHING_CONDITIONS = [];
function getFishingModifier(lake, spot, season, bait, fishId)
{
    const condition = FISHING_CONDITIONS.find(c =>
        c.lake === lake &&
        c.spot === spot &&
        c.season === season &&
        c.fish === fishId
    );
    return (condition ? condition.modifier : 0) + getBaitAdjustment(bait, fishId);
}

function getBaitAdjustment(baitid, fishId)
{
    var adjusment = 0;
    var bait = BAITS[baitid];
    if (bait.attracts.includes(fishId)) 
        adjusment = bait.strength * 10;
    else if (bait.repels.includes(fishId))
        adjusment = bait.strength * -10;
    return adjusment;
}

function getCurrentConditions(lake, spot, season)
{
    return FISHING_CONDITIONS.filter(c =>
        c.lake === lake &&
        c.spot === spot &&
        c.season === season
    );
}
