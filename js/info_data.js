// Game information and content data

const GAME_INFO = {
    version: "1.0.0",
    
    intro: {
        title: "Welcome to Fishcremental!",
        content: `
            <p>Welcome, angler! Ready to catch some fish?</p>
            
            <h4>Getting Started:</h4>
            <ul>
                <li><strong>Cast your line</strong> - Click the "Cast Line" button to start fishing</li>
                <li><strong>Catch fish</strong> - Wait for a bite, then reel it in!</li>
                <li><strong>Sell your catch</strong> - Visit the Inventory tab to sell fish for money</li>
                <li><strong>Upgrade gear</strong> - Buy better rods and bait in the Shop</li>
                <li><strong>Explore locations</strong> - Travel to new lakes to find rare fish</li>
                <li><strong>Complete quests</strong> - Earn Quest Tokens for special equipment and upgrades</li>
            </ul>
            
            <h4>Tips:</h4>
            <ul>
                <li>Bigger fish = more money and XP</li>
                <li>Better rods let you catch stronger fish without breaking your line</li>
                <li>Different lakes have different fish species</li>
                <li>Seasons change as you fish - some fish are more common in certain seasons</li>
                <li>Complete quests to earn Quest Tokens for powerful upgrades!</li>
            </ul>
            
            <p style="text-align: center; margin-top: 1.5rem;"><strong>Good luck and tight lines! 🎣</strong></p>
        `
    },
    
    changelog: [
        {
            version: "1.0.0",
            date: "2024-11-07",
            changes: [
                "Initial release",
                "12 fishing locations across the United States",
                "50+ fish species with varying rarities",
                "Quest system with dynamic objectives",
                "Equipment system with hats, vests, tackle boxes, and boots",
                "Permanent upgrades available via Quest Tokens",
                "Consumable items for tactical advantages",
                "Season progression system",
                "Comprehensive statistics and records tracking",
                "Imperial/Metric unit switching",
                "Audio system with sound effects",
                "Auto-save functionality"
            ]
        }
    ],
    
    roadmap: [
        {
            status: "planned",
            title: "Tournaments & Events",
            description: "Timed fishing tournaments with special rewards and leaderboards"
        },
        {
            status: "planned",
            title: "Achievement System",
            description: "Unlock achievements for completing various challenges"
        },
        {
            status: "planned",
            title: "Prestige System",
            description: "Reset progress for permanent bonuses and new content"
        },
        {
            status: "planned",
            title: "More Locations",
            description: "Additional lakes, rivers, and ocean fishing spots"
        },
        {
            status: "considering",
            title: "Fishing Techniques",
            description: "Learn and master different fishing techniques for bonuses"
        }
    ],
    
    about: {
        credits: [
            "Game Design & Development: UncleRasputin",
            "AI Implementation by: Claude (Anthropic)"
        ],
        links: [
            { text: "GitHub Repository", url: "https://github.com/UncleRasputin/Fishcremental" },
            { text: "Report a Bug", url: "https://github.com/UncleRasputin/Fishcremental/issues" }
        ],
        attributions: [
            { 
                item: "Line Snap Sound Effect",
                source: "<br>Converted from : Maquina_de_escribirRoyal_Front_Roll_Snap by byronabadia<br><a target='_blank'href='https://freesound.org/s/724764/'>FreeSound Link</a>",
                license: "Attribution 4.0"
            },
            {
                item: "Other Sound Effects",
                source: "All sounds converted from CC0 sounds except where explicitly attributed.<br> <a target='_blank'href='https://freesound.org/people/KieranKeegan/sounds/418850/'> Reel </a>&nbsp;<a target='_blank'href='https://freesound.org/people/BranndyBottle/sounds/464697/'> Cast </a>&nbsp;<a target='_blank'href='https://freesound.org/people/Logicogonist/sounds/807961/'> Splash </a>",
                license: "CC0"
            }
        ]
    }
};
