# Quick Reference: Adding Fishing Conditions

## File Location:
`js/fishingConditions.js`

## How to Add a New Condition:

Simply add a new object to the `FISHING_CONDITIONS` array:

```javascript
{ 
    lake: "lake_id",     // Must match key in LAKES object
    spot: 0,             // Spot index: 0, 1, or 2
    season: 1,           // 0=Spring, 1=Summer, 2=Fall, 3=Winter
    fish: "fish_id",     // Must match key in FISH_DB
    modifier: 20         // Percentage: positive boosts, negative reduces
}
```

## Examples:

### Boost a common fish in a specific spot:
```javascript
{ lake: "fork", spot: 2, season: 0, fish: "bluegill", modifier: 20 }
// Bluegill at Little Fish Creek in Spring gets +20% spawn chance
```

### Create a seasonal trophy hotspot:
```javascript
{ lake: "okeechobee", spot: 0, season: 3, fish: "trophy_largemouth", modifier: 25 }
// Trophy Largemouth at Monkey Box in Winter gets +25% spawn chance
```

### Reduce unwanted fish during quests:
```javascript
{ lake: "michigan", spot: 1, season: 2, fish: "common_carp", modifier: -30 }
// Carp at Ludington in Fall gets -30% spawn chance (less annoying!)
```

## Lake IDs:
- fork, texoma, amistad (Texas)
- okeechobee (Florida)
- michigan, erie, superior (Great Lakes)
- santee (South Carolina)
- ozarks (Missouri)
- champlain (Vermont/New York)
- mead, powell (Southwest)

## Spot Indices:
Each lake has 3 spots (indices 0, 1, 2). Check LAKES object in data.js for spot names.

## Season Indices:
- 0 = Spring
- 1 = Summer
- 2 = Fall
- 3 = Winter

## Fish IDs:
Check FISH_DB in data.js for all fish IDs. Common ones:
- bluegill, largemouth, trophy_largemouth
- striped_bass, trophy_striped_bass
- walleye, northern_pike, muskie
- lake_trout, chinook_salmon
- channel_cat, blue_cat, monster_blue

## Modifier Guidelines:

- **+10% to +15%** - Slight advantage, common fish
- **+20% to +25%** - Strong advantage, quest helpers
- **+30% or more** - Major hotspot, trophy/legendary fish
- **-10% to -20%** - Mild reduction, less annoying spawns
- **-30% or more** - Major reduction, quest optimization

## Pro Tips:

1. **Create patterns** - Make spots known for certain fish types
2. **Seasonal variation** - Same spot, different fish each season
3. **Quest friendly** - Boost fish types players need for quests
4. **Trophy concentrations** - High modifiers for rare fish in specific spots
5. **Balance** - Don't boost EVERYTHING, creates no-brainer choices

## Testing:

After adding conditions, test by:
1. Travel to the location
2. Set season (or wait for season change)
3. Click "🎯 Check Odds" button
4. Verify modifier shows correctly
5. Cast a bunch and confirm spawn rates feel right

---

The system is live and working! Enjoy fine-tuning the fishing experience! 🎣
