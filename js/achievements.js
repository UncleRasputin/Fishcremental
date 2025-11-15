// Achievement System
var ACHIEVEMENTS = {};

// Achievement notification queue
const achievementQueue = [];
let isShowingNotification = false;

// Helper functions for achievement conditions
function checkLakeCompletion(lakeId) {
    if (!gameState.stats.speciesCaught) return false;
    
    const lakeFish = Object.entries(FISH_DB)
        .filter(([_, fish]) => fish.regions.includes(lakeId))
        .map(([id, _]) => id);
    
    return lakeFish.every(fishId => gameState.stats.speciesCaught[fishId]);
}

function checkSpeciesCaught(fishId) {
    return gameState.stats.speciesCaught && gameState.stats.speciesCaught[fishId];
}

// Check a single achievement
function checkAchievement(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    
    if (!achievement || achievement.unlocked) {
        return false;
    }
    
    try {
        // Evaluate the condition
        const unlocked = eval(achievement.condition);
        
        if (unlocked) {
            achievement.unlocked = true;
            
            // Add to notification queue
            achievementQueue.push(achievement);
            
            // Show notification if not already showing one
            if (!isShowingNotification) {
                showNextAchievement();
            }
            
            // Save the unlock
            saveGame(true);
            
            return true;
        }
    } catch (error) {
        console.error(`Error checking achievement ${achievementId}:`, error);
    }
    
    return false;
}

// Check all achievements
function checkAllAchievements() {
    let newUnlocks = 0;
    
    Object.keys(ACHIEVEMENTS).forEach(id => {
        if (checkAchievement(id)) {
            newUnlocks++;
        }
    });
    
    return newUnlocks;
}

// Show achievement notification
function showNextAchievement() {
    if (achievementQueue.length === 0) {
        isShowingNotification = false;
        return;
    }
    
    isShowingNotification = true;
    const achievement = achievementQueue.shift();
    
    // Play achievement sound
    playSound('achievement');
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="achievement-notification-icon">${achievement.icon}</div>
            <div class="achievement-notification-text">
                <div class="achievement-notification-title">Achievement Unlocked!</div>
                <div class="achievement-notification-name">${achievement.name}</div>
                <div class="achievement-notification-description">${achievement.description}</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Animate out after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        
        // Remove from DOM and show next
        setTimeout(() => {
            notification.remove();
            showNextAchievement();
        }, 500);
    }, 4000);
}

// Get achievement statistics
function getAchievementStats() {
    const total = Object.keys(ACHIEVEMENTS).length;
    const unlocked = Object.values(ACHIEVEMENTS).filter(a => a.unlocked).length;
    const percentage = total > 0 ? Math.floor((unlocked / total) * 100) : 0;
    
    return { total, unlocked, percentage };
}

// Get achievements by category
function getAchievementsByCategory() {
    const categories = {};
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
        const cat = achievement.category || 'other';
        if (!categories[cat]) {
            categories[cat] = [];
        }
        categories[cat].push(achievement);
    });
    
    return categories;
}

// Category display names
const CATEGORY_NAMES = {
    fishing: '🎣 Fishing',
    catching: '🐟 Catching',
    money: '💰 Money',
    rarity: '✨ Rarity',
    mishaps: '💔 Mishaps',
    quests: '📜 Quests',
    exploration: '🗺️ Exploration',
    collections: '🐠 Collections',
    seasons: '📅 Seasons',
    progression: '⭐ Progression',
    special: '🏆 Special Fish',
    equipment: '⚙️ Equipment',
    tokens: '🎫 Tokens',
    other: '📋 Other'
};

// Update achievements display
function updateAchievementsDisplay() {
    const container = UI.achievementsContainer;
    if (!container) return;
    
    const stats = getAchievementStats();
    const categories = getAchievementsByCategory();
    
    let html = `
        <div class="achievements-header">
            <div class="achievements-stats">
                <div class="achievements-progress-bar">
                    <div class="achievements-progress-fill" style="width: ${stats.percentage}%"></div>
                </div>
                <div class="achievements-stats-text">
                    ${stats.unlocked} / ${stats.total} Achievements (${stats.percentage}%)
                </div>
            </div>
        </div>
    `;
    
    // Sort categories by name
    const sortedCategories = Object.keys(categories).sort();
    
    sortedCategories.forEach(categoryId => {
        const achievements = categories[categoryId];
        const categoryName = CATEGORY_NAMES[categoryId] || categoryId;
        const unlockedInCategory = achievements.filter(a => a.unlocked).length;
        
        html += `
            <div class="achievement-category">
                <div class="achievement-category-header">
                    <span class="achievement-category-name">${categoryName}</span>
                    <span class="achievement-category-count">${unlockedInCategory}/${achievements.length}</span>
                </div>
                <div class="achievement-list">
        `;
        
        // Sort achievements: unlocked first, then by ID
        achievements.sort((a, b) => {
            if (a.unlocked !== b.unlocked) return b.unlocked ? 1 : -1;
            return a.id.localeCompare(b.id);
        });
        
        achievements.forEach(achievement => {
            const lockedClass = achievement.unlocked ? '' : 'achievement-locked';
            html += `
                <div class="achievement-item ${lockedClass}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${achievement.name}</div>
                        <div class="achievement-description">${achievement.description}</div>
                    </div>
                    ${achievement.unlocked ? '<div class="achievement-check">✓</div>' : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Open achievements modal
function openAchievementsModal() {
    UI.achievementsModal.style.display = 'flex';
    updateAchievementsDisplay();
}

// Close achievements modal
function closeAchievementsModal() {
    UI.achievementsModal.style.display = 'none';
}

// Initialize achievement tracking in stats
function initializeAchievementStats() {
    if (!gameState.stats.speciesCaught) {
        gameState.stats.speciesCaught = {};
    }
    if (!gameState.stats.seasonsPassed) {
        gameState.stats.seasonsPassed = {
            spring: 0,
            summer: 0,
            fall: 0,
            winter: 0
        };
    }
    if (!gameState.stats.totalTokensEarned) {
        gameState.stats.totalTokensEarned = 0;
    }
}

// Track when a fish is caught
function trackFishCaught(fishId) {
    if (!gameState.stats.speciesCaught) {
        gameState.stats.speciesCaught = {};
    }
    gameState.stats.speciesCaught[fishId] = true;
    
    // Check achievements after tracking
    checkAllAchievements();
}

// Track when a season passes
function trackSeasonChange(oldSeason) {
    if (!gameState.stats.seasonsPassed) {
        gameState.stats.seasonsPassed = {
            spring: 0,
            summer: 0,
            fall: 0,
            winter: 0
        };
    }
    
    const seasonNames = ['spring', 'summer', 'fall', 'winter'];
    gameState.stats.seasonsPassed[seasonNames[oldSeason]]++;
    
    // Check achievements after tracking
    checkAllAchievements();
}

// Track when tokens are earned
function trackTokensEarned(amount) {
    if (!gameState.stats.totalTokensEarned) {
        gameState.stats.totalTokensEarned = 0;
    }
    gameState.stats.totalTokensEarned += amount;
    
    // Check achievements after tracking
    checkAllAchievements();
}

// Event listeners for modal
document.addEventListener('click', (e) => {
    const modal = UI.achievementsModal;
    if (e.target === modal) {
        closeAchievementsModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = UI.achievementsModal;
        if (modal && modal.style.display === 'flex') {
            closeAchievementsModal();
        }
    }
});
