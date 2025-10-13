class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('githubToken');
        this.originalData = { NwfUsers, NwfEvents, NwfTypes };
        this.currentData = JSON.parse(JSON.stringify(this.originalData));
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Auth listeners
        document.getElementById('saveToken').addEventListener('click', () => this.saveToken());
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Add buttons
        document.getElementById('addUser').addEventListener('click', () => this.addUser());
        document.getElementById('addEvent').addEventListener('click', () => this.addEvent());
        document.getElementById('addEvent').addEventListener('click', () => this.addEvent());
        document.getElementById('addType').addEventListener('click', () => this.addType());

        // Save/Reset buttons
        document.getElementById('saveChanges').addEventListener('click', () => this.saveChanges());
        document.getElementById('resetChanges').addEventListener('click', () => this.resetChanges());
    }

    checkAuth() {
        if (this.token) {
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('editorSection').classList.remove('hidden');
            this.renderAll();
        } else {
            document.getElementById('authSection').classList.remove('hidden');
            document.getElementById('editorSection').classList.add('hidden');
        }
    }

    saveToken() {
        const token = document.getElementById('tokenInput').value;
        if (token) {
            localStorage.setItem('githubToken', token);
            this.token = token;
            this.checkAuth();
        }
    }

    switchTab(tabId) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId + 'Tab');
        });
    }

    renderAll() {
        this.renderUsers();
        this.renderEvents();
        this.renderTypes();
    }

    renderUsers() {
        const container = document.getElementById('usersList');
        container.innerHTML = '';

        Object.entries(this.currentData.NwfUsers).forEach(([id, user]) => {
            const card = document.createElement('div');
            card.className = 'item-card';

            // Список наград пользователя
            const userAwards = (user.awards || [])
                .map(awardId => {
                    const award = this.currentData.NwfEvents && this.currentData.NwfEvents[awardId];
                    const parts = awardId.split('_');
                    const imgName = parts[1];
                    const imgSrc = `img/award/${imgName}.png`;
                    const displayName = award?.name || awardId;
                    const displayType = award?.type ? `(${award.type})` : '';
                    if (!award) {
                        // Если награда не найдена — показываем id
                        return `
                            <div class="award-item">
                                <img src="${imgSrc}" alt="${displayName}" class="award-icon">
                                <span>${displayName} ${displayType}</span>
                                <button class="remove-award-btn" onclick="admin.removeUserAward('${id}', '${awardId}')">Del</button>
                            </div>
                        `;
                    }
                    const awardImg = award.img || `${awardId}.png`;
                    return `
                        <div class="award-item">
                            <img src="img/award/${awardImg}" alt="${award.name}" class="award-icon">
                            <span>${award.name} ${award.type ? `(${award.type})` : ''}</span>
                            <button class="remove-award-btn" onclick="admin.removeUserAward('${id}', '${awardId}')">Del</button>
                        </div>
                    `;
                }).join('');

            // Dropdown для выбора события (награды)
            const eventOptions = Object.entries(this.currentData.NwfEvents || {})
                .map(([eventId, event]) => `<option value="${eventId}">${event.name || eventId}</option>`)
                .join('');

            // Dropdown для выбора типа награды
            const typeOptions = Object.entries(this.currentData.NwfTypes || {})
                .map(([typeId, type]) => `<option value="${typeId}">${type.name || typeId}</option>`)
                .join('');

            card.innerHTML = `
                <div>
                    <div class="user-info">
                        <input type="text" value="${user.id || ''}" placeholder="ID" onchange="admin.updateUser('${id}', 'id', this.value)">
                        <input type="text" value="${user.discord || ''}" placeholder="Discord" onchange="admin.updateUser('${id}', 'discord', this.value)">
                        <input type="text" value="${user.discordid || ''}" placeholder="Discord ID" onchange="admin.updateUser('${id}', 'discordid', this.value)">
                        <input type="text" value="${user.gamename || ''}" placeholder="Game Name" onchange="admin.updateUser('${id}', 'gamename', this.value)">
                        <input type="number" value="${user.events || 0}" placeholder="Events" onchange="admin.updateUser('${id}', 'events', this.value)">
                    </div>

                    <div class="awards-section">
                        <div class="award-add-section">
                            <h5>Add medal:</h5>
                            <div class="add-medal-div">
                                <select id="eventSelect_${id}">
                                    <option value="">Event</option>
                                    ${eventOptions}
                                </select>
                                <select id="typeSelect_${id}">
                                    <option value="">Type</option>
                                    ${typeOptions}
                                </select>
                                <button onclick="admin.addUserAward('${id}')">+</button>
                            </div>
                        </div>

                        <h4>Medals:</h4>
                        <div class="awards-list">
                            ${userAwards || '<div class="no-awards">No medals</div>'}
                        </div>
                    </div>
                </div>

                <div class="item-controls">
                    <button class="delete-btn" onclick="admin.deleteUser('${id}')">Del</button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // Примеры реализаций, добавь в свой объект admin (или где у тебя методы)
    addUserAward(userId) {
        const eventSelect = document.getElementById(`eventSelect_${userId}`);
        const typeSelect = document.getElementById(`typeSelect_${userId}`);
        if (!eventSelect) return;
        const eventId = `${eventSelect.value}_${typeSelect.value}`;
        const typeId = typeSelect ? typeSelect.value : '';

        if (!eventSelect.value) {
            alert('Выберите событие (medal).');
            return;
        }

        const user = this.currentData.NwfUsers[userId];
        if (!user) return;
        user.awards = user.awards || [];

        if (user.awards.includes(eventId)) {
            // Уже есть
            alert('Пользователь уже имеет эту награду.');
            return;
        }

        // Мы добавляем выбранный eventId в массив наград.
        // Примечание: если у вас в проекте ожидается другой формат (например composite id),
        // замените логику формирования awardId здесь.
        user.awards.push(eventId);
        this.renderUsers();
    }

    removeUserAward(userId, awardId) {
        const user = this.currentData.NwfUsers[userId];
        if (!user || !user.awards) return;
        user.awards = user.awards.filter(a => a !== awardId);
        this.renderUsers();
    }

    //    ШТУКИ ОТ ДОБАВЛЕНИЯ МЕДАЛЕК
    // \ ----------------------------- /

    renderEvents() {
        const container = document.getElementById('eventstablebody');
        container.innerHTML = '';
        
        Object.entries(this.currentData.NwfEvents).forEach(([id, event]) => {
            const card = document.createElement('tr');
            card.className = 'item-card';
            
            card.innerHTML = `
                <tr>
                    <td><input type="text" value="${id}" placeholder="Event ID" onchange="admin.updateEventId('${id}', this.value)"></td>
                    <td><input type="text" value="${event.name || ''}" placeholder="Event Name" onchange="admin.updateEvent('${id}', 'name', this.value)"></td>
                    <td><input type="text" value="${event.date || ''}" placeholder="Date (DD.MM.YYYY)" onchange="admin.updateEvent('${id}', 'date', this.value)"></td>
                    <td><input type="text" value="${event.map || ''}" placeholder="Map id (from EE Lib)" onchange="admin.updateEvent('${id}', 'map', this.value)"></td>
                    <td><input type="text" value="${event.img || ''}" placeholder="Image filename" onchange="admin.updateEvent('${id}', 'img', this.value)"></td>
                </tr>
                <!--div class="item-controls">
                    <button class="delete-btn" onclick="admin.deleteAward('${id}')">Del</button>
                </div-->
            `;
            
            container.appendChild(card);
        });
    }

    renderTypes() {
        const container = document.getElementById('typesList');
        container.innerHTML = '';
        
        Object.entries(this.currentData.NwfTypes).forEach(([type, params]) => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div>
                    <input type="text" value="${type}" placeholder="Type" onchange="admin.updateType('${type}', 'name', this.value)">
                    <input type="number" value="${params.score}" placeholder="Score" onchange="admin.updateType('${type}', 'params.score', this.value)">
                    <input type="string" value="${params.name}" placeholder="Name" onchange="admin.updateType('${type}', 'params.name', this.value)">
                </div>
                <div class="item-controls">
                    <button class="delete-btn" onclick="admin.deleteType('${type}')">Del</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    addUser() {
        const id = 'new_user_' + Date.now();
        this.currentData.NwfUsers[id] = {
            id: id,
            discord: '',
            discordid: '',
            gamename: '',
            awards: [],
            events: 0
        };
        this.renderUsers();
    }

    addEvent() {
        const id = 'event_' + Date.now();
        this.currentData.NwfEvents[id] = {
            name: '',
            date: new Date().toLocaleDateString('ru-RU').replace(/\./g, '.'),
            img: '',
            map: ''
        };
        this.renderEvents();
    }

    addType() {
        const id = 'new_type_' + Date.now();
        this.currentData.NwfTypes[id] = 1;
        this.renderTypes();
    }

    updateUser(id, field, value) {
        if (!this.currentData.NwfUsers[id]) return;
        this.currentData.NwfUsers[id][field] = value;
    }

    handleAwardCheckbox(userId, awardId, checked) {
        if (!this.currentData.NwfUsers[userId]) return;
        
        if (checked) {
            // Add award if not already present
            if (!this.currentData.NwfUsers[userId].awards.includes(awardId)) {
                this.currentData.NwfUsers[userId].awards.push(awardId);
            }
        } else {
            // Remove award
            this.currentData.NwfUsers[userId].awards = 
                this.currentData.NwfUsers[userId].awards.filter(id => id !== awardId);
        }
    }

    updateUserAwards(id, awards) {
        if (!this.currentData.NwfUsers[id]) return;
        this.currentData.NwfUsers[id].awards = awards;
    }

    updateEvent(id, field, value) {
        if (!this.currentData.NwfEvents[id]) return;
        this.currentData.NwfEvents[id][field] = value;
    }

    updateEventId(oldId, newId) {
        if (!this.currentData.NwfEvents[oldId] || oldId === newId) return;
        
        // Create new entry with new ID
        this.currentData.NwfEvents[newId] = {...this.currentData.NwfEvents[oldId]};
        // Delete old entry
        delete this.currentData.NwfEvents[oldId];
        
        // Update all user awards that reference this event
        Object.values(this.currentData.NwfUsers).forEach(user => {
            if (user.awards) {
                user.awards = user.awards.map(awardId => 
                    awardId.startsWith(oldId) ? awardId.replace(oldId, newId) : awardId
                );
            }
        });
        
        this.renderAll();
    }

    updateType(oldType, field, value) {
        if (field === 'name' && value !== oldType) {
            this.currentData.NwfTypes[value] = this.currentData.NwfTypes[oldType];
            delete this.currentData.NwfTypes[oldType];
            // Update award references
            Object.values(this.currentData.NwfEvents).forEach(award => {
                if (award.type === oldType) {
                    award.type = value;
                }
            });
        } else if (field === 'score') {
            this.currentData.NwfTypes[oldType] = parseInt(value) || 0;
        }
        this.renderAll();
    }

    deleteUser(id) {
        delete this.currentData.NwfUsers[id];
        this.renderUsers();
    }

    deleteAward(id) {
        delete this.currentData.NwfEvents[id];
        // Remove award from users
        Object.values(this.currentData.NwfUsers).forEach(user => {
            user.awards = user.awards.filter(a => a !== id);
        });
        this.renderAll();
    }

    deleteType(type) {
        delete this.currentData.NwfTypes[type];
        // Remove type from awards
        Object.values(this.currentData.NwfEvents).forEach(award => {
            if (award.type === type) {
                award.type = Object.keys(this.currentData.NwfTypes)[0] || '';
            }
        });
        this.renderAll();
    }

    async saveChanges() {
        alert('!');
        if (document.location.href.includes('.html')) {
            try {
            navigator.clipboard.writeText(`const NwfUsers = ${JSON.stringify(this.currentData.NwfUsers, null, 4)};\n\n` +
                          `const NwfTypes = ${JSON.stringify(this.currentData.NwfTypes, null, 4)};\n\n` +
                          `const NwfEvents = ${JSON.stringify(this.currentData.NwfEvents, null, 4)};\n`);
            } catch(e) {
                alert(e);
            }
        } else {
        try {
            // First, get the current file's SHA
            const getFileResponse = await fetch('https://api.github.com/repos/NWF-winner-s-table/NWF-winner-s-table.github.io/contents/users.js', {
                headers: {
                    'Authorization': `token ${this.token}`,
                }
            });
            
            if (!getFileResponse.ok) {
                throw new Error('Failed to get current file version');
            }
            
            const fileData = await getFileResponse.json();
            const content = `const NwfUsers = ${JSON.stringify(this.currentData.NwfUsers, null, 4)};\n\n` +
                          `const NwfEvents = ${JSON.stringify(this.currentData.NwfEvents, null, 4)};\n\n` +
                          `const NwfTypes = ${JSON.stringify(this.currentData.NwfTypes, null, 4)};\n`;

            const response = await fetch('https://api.github.com/repos/NWF-winner-s-table/NWF-winner-s-table.github.io/contents/users.js', {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: 'Update users data via admin panel',
                    content: btoa(unescape(encodeURIComponent(content))),
                    sha: fileData.sha
                })
            });

            if (response.ok) {
                this.originalData = JSON.parse(JSON.stringify(this.currentData));
                this.showMessage('Изменения успешно сохранены', 'success');
            } else {
                throw new Error('Failed to save changes');
            }
        } catch (error) {
            this.showMessage('Ошибка при сохранении изменений: ' + error.message, 'error');
        }
        }
    }

    resetChanges() {
        this.currentData = JSON.parse(JSON.stringify(this.originalData));
        this.renderAll();
    }

    showMessage(text, type) {
        const container = document.querySelector('.admin-container');
        const existingMsg = container.querySelector('.message');
        if (existingMsg) existingMsg.remove();

        const msg = document.createElement('div');
        msg.className = `message ${type}-message`;
        msg.textContent = text;
        container.insertBefore(msg, container.firstChild);
        setTimeout(() => msg.remove(), 3000);
    }
}

// Initialize the admin panel
let admin;
document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminPanel();
});