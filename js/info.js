let currentInfoTab = 'intro';

function openInfoModal(tab = 'intro')
{
    UI.infoModal.style.display = 'flex';
    switchInfoTab(tab);
}
function closeInfoModal()
{
    UI.infoModal.style.display = 'none';
}

function switchInfoTab(tab)
{
    currentInfoTab = tab;
    document.querySelectorAll('.modal-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById('info-' + tab).classList.add('active');
    const content = UI.modalContent;
    switch (tab)
    {
        case 'intro':
            content.innerHTML = renderIntro();
            break;
        case 'changelog':
            content.innerHTML = renderChangelog();
            break;
        case 'roadmap':
            content.innerHTML = renderRoadmap();
            break;
        case 'about':
            content.innerHTML = renderAbout();
            break;
    }
}

function renderIntro()
{
    return `
        <div class="info-section">
            <h3>${GAME_INFO.intro.title}</h3>
            ${GAME_INFO.intro.content}
        </div>
    `;
}

function renderChangelog()
{
    return `
        <div class="info-section">
            ${GAME_INFO.changelog.map(entry => `
                <div class="changelog-entry">
                    <div class="changelog-header">
                        <h3>Version ${entry.version}</h3>
                        <span class="changelog-date">${entry.date}</span>
                    </div>
                    <ul class="changelog-list">
                        ${entry.changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRoadmap()
{
    const statusLabels = {
        planned: '📅 Planned',
        'in-progress': '🚧 In Progress',
        considering: '💭 Considering'
    };
    
    return `
        <div class="info-section">
            <p style="color: #93c5fd; margin-bottom: 1.5rem;">
                Here's what we're working on for future updates! These features are subject to change based on player feedback.
            </p>
            ${GAME_INFO.roadmap.map(item => `
                <div class="roadmap-item">
                    <div class="roadmap-header">
                        <h4>${item.title}</h4>
                        <span class="roadmap-status status-${item.status}">${statusLabels[item.status]}</span>
                    </div>
                    <p>${item.description}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function renderAbout()
{
    return `
        <div class="info-section">
            <div class="about-section">
                <h4>Version</h4>
                <p>Fishcremental v${GAME_INFO.version}</p>
            </div>
            
            <div class="about-section">
                <h4>Credits</h4>
                <ul>
                    ${GAME_INFO.about.credits.map(credit => `<li>${credit}</li>`).join('')}
                </ul>
            </div>
            
            <div class="about-section">
                <h4>Links</h4>
                <ul>
                    ${GAME_INFO.about.links.map(link => 
                        `<li><a href="${link.url}" target="_blank" rel="noopener">${link.text}</a></li>`
                    ).join('')}
                </ul>
            </div>
            
            <div class="about-section">
                <h4>Content Attributions</h4>
                ${GAME_INFO.about.attributions.map(attr => `
                    <div class="attribution-item">
                        <strong>${attr.item}:</strong> ${attr.source}
                        ${attr.license ? `<br><span style="font-size: 0.875rem; color: #93c5fd;">${attr.license}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function checkFirstTimePlayer()
{
    const savedGame = localStorage.getItem('fishcremental_save');
    const hasSeenIntro = localStorage.getItem('fishcremental_seen_intro');
    
    if (!savedGame && !hasSeenIntro)
    {
        setTimeout(() => {
            openInfoModal('intro');
            localStorage.setItem('fishcremental_seen_intro', 'true');
        }, 500);
    }
}

document.addEventListener('click', (e) => {
    const modal = UI.infoModal;
    if (e.target === modal)
        closeInfoModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape')
    {
        const modal = UI.infoModal;
        if (modal.style.display === 'flex')
        {
            closeInfoModal();
        }
    }
});
