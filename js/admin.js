class AdminPanel {
    constructor() {
        this.token = localStorage.getItem('githubToken');
        // Защита от отсутствия глобальных данных
        this.originalData = { 
            NwfUsers: NwfUsers || {}, 
            NwfEvents: NwfEvents || {}, 
            NwfTypes: NwfTypes || {} 
        };
        this.currentData = JSON.parse(JSON.stringify(this.originalData));
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Auth listeners
        const saveTokenBtn = document.getElementById('saveToken');
        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', () => this.saveToken());
        }
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Add buttons
        const addUserBtn = document.getElementById('addUser');
        const addEventBtn = document.getElementById('addEvent');
        const addTypeBtn = document.getElementById('addType');
        if (addUserBtn) addUserBtn.addEventListener('click', () => this.addUser());
        if (addEventBtn) addEventBtn.addEventListener('click', () => this.addEvent());
        if (addTypeBtn) addTypeBtn.addEventListener('click', () => this.addType());

        // Save/Reset buttons
        const saveChangesBtn = document.getElementById('saveChanges');
        const resetChangesBtn = document.getElementById('resetChanges');
        if (saveChangesBtn) saveChangesBtn.addEventListener('click', () => this.saveChanges());
        if (resetChangesBtn) resetChangesBtn.addEventListener('click', () => this.resetChanges());
    }

    checkAuth() {
        //if (this.token) {
            document.getElementById('authSection')?.classList.add('hidden');
            document.getElementById('editorSection')?.classList.remove('hidden');
            this.renderAll();
        /*} else {
            document.getElementById('authSection')?.classList.remove('hidden');
            document.getElementById('editorSection')?.classList.add('hidden');
        }*/
    }

    saveToken() {
        const tokenInput = document.getElementById('tokenInput');
        if (!tokenInput) return;
        
        const token = tokenInput.value.trim();
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
        if (!container) return;
        container.innerHTML = '';

        Object.entries(this.currentData.NwfUsers).forEach(([id, user]) => {
            const card = document.createElement('div');
            card.className = 'item-card';

            // Список наград пользователя
            const userAwards = (user.awards || [])
                .map(awardId => {
                    const parts = awardId.split('_');
                    const eventId = parts[0] || '';
                    const typeId = parts[1] || '';
                    
                    const award = eventId ? this.currentData.NwfEvents[eventId] : null;
                    const type = typeId ? this.currentData.NwfTypes[typeId] : null;
                    
                    let imgSrc, displayName, displayType;
                    
                    if (award) {
                        imgSrc = award.img ? `img/award/default.png` : `img/award/${typeId || 'default'}.png`;
                        displayName = award.name || eventId;
                        displayType = type ? `(${type.name || typeId})` : (typeId ? `(${typeId})` : '');
                    } else {
                        // Fallback для несуществующей награды
                        imgSrc = `img/award/default.png`;
                        displayName = eventId || awardId;
                        displayType = typeId ? `(${typeId})` : '';
                    }
                    
                    return `
                        <div class="award-item">
                            <img src="${imgSrc}" alt="${displayName}" class="award-icon" onerror="this.src='img/award/default.png'">
                            <span>${displayName} ${displayType}</span>
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
                .map(([typeId, type]) => {
                    // Поддержка старого формата (число) и нового (объект)
                    const displayName = typeof type === 'object' ? (type.name || typeId) : typeId;
                    return `<option value="${typeId}">${displayName}</option>`;
                })
                .join('');

            card.innerHTML = `
                <div>
                    <div class="user-info">
                        <input type="text" value="${user.id || ''}" placeholder="ID" onchange="admin.updateUser('${id}', 'id', this.value)">
                        <input type="text" value="${user.discord || ''}" placeholder="Discord" onchange="admin.updateUser('${id}', 'discord', this.value)">
                        <input type="text" value="${user.discordid || ''}" placeholder="Discord ID" onchange="admin.updateUser('${id}', 'discordid', this.value)">
                        <input type="text" value="${user.gamename || ''}" placeholder="Game Name" onchange="admin.updateUser('${id}', 'gamename', this.value)">
                        <input type="number" value="${user.events?.length || 0}" placeholder="Events count" readonly>
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
                                <button type="button" onclick="admin.addUserAward('${id}')">+</button>
                            </div>
                        </div>

                        <h4>Medals:</h4>
                        <div class="awards-list">
                            ${userAwards || '<div class="no-awards">No medals</div>'}
                        </div>
                    </div>
                </div>

                <div class="item-controls">
                    <button type="button" class="delete-btn" onclick="admin.deleteUser('${id}')">Del</button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    addUserAward(userId) {
        const eventSelect = document.getElementById(`eventSelect_${userId}`);
        const typeSelect = document.getElementById(`typeSelect_${userId}`);
        if (!eventSelect || !typeSelect) return;
        
        const eventId = eventSelect.value.trim();
        const typeId = typeSelect.value.trim();
        
        if (!eventId || !typeId) {
            alert('Выберите событие И тип награды.');
            return;
        }
        
        const compositeId = `${eventId}_${typeId}`;
        const user = this.currentData.NwfUsers[userId];
        if (!user) return;
        user.awards = user.awards || [];
        
        if (user.awards.includes(compositeId)) {
            alert('Пользователь уже имеет эту награду.');
            return;
        }
        
        user.awards.push(compositeId);
        this.renderUsers();
    }

    removeUserAward(userId, awardId) {
        const user = this.currentData.NwfUsers[userId];
        if (!user || !Array.isArray(user.awards)) return;
        user.awards = user.awards.filter(a => a !== awardId);
        this.renderUsers();
    }

    renderEvents() {
        const container = document.getElementById('eventstablebody');
        if (!container) return;
        container.innerHTML = '';
        
        Object.entries(this.currentData.NwfEvents).forEach(([id, event]) => {
            const row = document.createElement('tr');
            row.className = 'item-card';
            
            // ID field
            const idCell = document.createElement('td');
            const idInput = document.createElement('input');
            idInput.type = 'text';
            idInput.value = id;
            idInput.placeholder = 'Event ID';
            idInput.dataset.originalId = id; // Сохраняем оригинальный ID
            idInput.addEventListener('blur', (e) => {
                const oldId = e.target.dataset.originalId;
                const newId = e.target.value.trim();
                if (oldId !== newId) {
                    this.updateEventId(oldId, newId);
                }
            });
            idCell.appendChild(idInput);
            row.appendChild(idCell);
            
            // Name field
            const nameCell = document.createElement('td');
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = event.name || '';
            nameInput.placeholder = 'Event Name';
            nameInput.dataset.eventId = id;
            nameInput.addEventListener('input', (e) => {
                this.updateEvent(e.target.dataset.eventId, 'name', e.target.value);
            });
            nameCell.appendChild(nameInput);
            row.appendChild(nameCell);
            
            // Date field
            const dateCell = document.createElement('td');
            const dateInput = document.createElement('input');
            dateInput.type = 'text';
            dateInput.value = event.date || '';
            dateInput.placeholder = 'Date (DD.MM.YYYY)';
            dateInput.dataset.eventId = id;
            dateInput.addEventListener('input', (e) => {
                this.updateEvent(e.target.dataset.eventId, 'date', e.target.value);
            });
            dateCell.appendChild(dateInput);
            row.appendChild(dateCell);
            
            // Map field
            const mapCell = document.createElement('td');
            const mapInput = document.createElement('input');
            mapInput.type = 'text';
            mapInput.value = event.map || '';
            mapInput.placeholder = 'Map id (from EE Lib)';
            mapInput.dataset.eventId = id;
            mapInput.addEventListener('input', (e) => {
                this.updateEvent(e.target.dataset.eventId, 'map', e.target.value);
            });
            mapCell.appendChild(mapInput);
            row.appendChild(mapCell);
            
            // Image field
            const imgCell = document.createElement('td');
            const imgInput = document.createElement('input');
            imgInput.type = 'text';
            imgInput.value = event.img || '';
            imgInput.placeholder = 'Image filename';
            imgInput.dataset.eventId = id;
            imgInput.addEventListener('input', (e) => {
                this.updateEvent(e.target.dataset.eventId, 'img', e.target.value);
            });
            imgCell.appendChild(imgInput);
            row.appendChild(imgCell);
            
            // Delete button
            const deleteCell = document.createElement('td');
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Del';
            deleteBtn.addEventListener('click', () => this.deleteAward(id));
            deleteCell.appendChild(deleteBtn);
            row.appendChild(deleteCell);
            
            container.appendChild(row);
        });
    }

    renderTypes() {
        const container = document.getElementById('typesList');
        if (!container) return;
        container.innerHTML = '';
        
        Object.entries(this.currentData.NwfTypes).forEach(([typeKey, params]) => {
            // Конвертация старого формата (число) в новый (объект)
            if (typeof params === 'number') {
                params = { score: params, name: typeKey };
                this.currentData.NwfTypes[typeKey] = params;
            }
            
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div>
                    <strong>${typeKey}</strong>
                    <input type="text" value="${params.name || typeKey}" placeholder="Display Name" 
                           onchange="admin.updateType('${typeKey}', 'name', this.value)">
                    <input type="number" value="${params.score || 0}" placeholder="Score" 
                           onchange="admin.updateType('${typeKey}', 'score', this.value)">
                </div>
                <div class="item-controls">
                    <button type="button" class="delete-btn" onclick="admin.deleteType('${typeKey}')">Del</button>
                </div>
            `;
            container.appendChild(card);
        });
    }

    addUser() {
        const id = prompt('Enter user ID:');
        if (!id || id.trim() === '') return;
        const cleanId = id.trim();
        
        if (this.currentData.NwfUsers[cleanId]) {
            alert('User with this ID already exists!');
            return;
        }
        
        this.currentData.NwfUsers[cleanId] = {
            id: cleanId,
            discord: '',
            discordid: '',
            gamename: '',
            awards: [],
            events: []
        };
        this.renderUsers();
        
        // Обновляем выпадающий список пользователей, если он существует
        try {
            if (window.userChose && typeof window.userChose.setOptions === 'function') {
                const rawData = Object.keys(this.currentData.NwfUsers);
                const sortedData = [...rawData].sort();
                const formattedUsersList = sortedData.map(item => ({
                    value: item,
                    label: item,
                }));
                window.userChose.setOptions(formattedUsersList);
            }
        } catch (e) {
            console.warn('Failed to update user dropdown:', e);
        }
    }

    addEvent() {
        const id = 'event_' + Date.now();
        this.currentData.NwfEvents[id] = {
            name: '',
            date: new Date().toLocaleDateString('ru-RU'),
            img: '',
            map: ''
        };
        this.renderEvents();
    }

    addType() {
        const id = 'type_' + Date.now();
        this.currentData.NwfTypes[id] = {
            score: 1,
            name: id
        };
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
                this.currentData.NwfUsers[userId].awards.filter(a => a !== awardId);
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
        newId = newId.trim();
        if (!this.currentData.NwfEvents[oldId] || oldId === newId || !newId) return;
        
        // Create new entry with new ID
        this.currentData.NwfEvents[newId] = {...this.currentData.NwfEvents[oldId]};
        // Delete old entry
        delete this.currentData.NwfEvents[oldId];
        
        // Update all user awards that reference this event (точная замена префикса)
        Object.values(this.currentData.NwfUsers).forEach(user => {
            if (Array.isArray(user.awards)) {
                user.awards = user.awards.map(awardId => {
                    const parts = awardId.split('_');
                    if (parts[0] === oldId) {
                        parts[0] = newId;
                        return parts.join('_');
                    }
                    return awardId;
                });
            }
        });
        
        // Перерисовываем ТОЛЬКО события, а не всё
        this.renderEvents();
    }

    updateType(typeKey, field, value) {
        if (!this.currentData.NwfTypes[typeKey]) return;
        
        if (field === 'name') {
            // Обновляем только отображаемое имя, ключ остаётся прежним
            if (typeof this.currentData.NwfTypes[typeKey] === 'object') {
                this.currentData.NwfTypes[typeKey].name = value;
            } else {
                this.currentData.NwfTypes[typeKey] = { 
                    score: this.currentData.NwfTypes[typeKey], 
                    name: value 
                };
            }
        } else if (field === 'score') {
            if (typeof this.currentData.NwfTypes[typeKey] === 'object') {
                this.currentData.NwfTypes[typeKey].score = parseInt(value) || 0;
            } else {
                this.currentData.NwfTypes[typeKey] = parseInt(value) || 0;
            }
        }
        this.renderTypes();
    }

    deleteUser(id) {
        delete this.currentData.NwfUsers[id];
        this.renderUsers();
    }

    deleteAward(eventId) {
        delete this.currentData.NwfEvents[eventId];
        // Remove award from users (точное совпадение префикса)
        Object.values(this.currentData.NwfUsers).forEach(user => {
            if (Array.isArray(user.awards)) {
                user.awards = user.awards.filter(awardId => {
                    const parts = awardId.split('_');
                    return parts[0] !== eventId;
                });
            }
        });
        this.renderAll();
    }

    deleteType(typeKey) {
        delete this.currentData.NwfTypes[typeKey];
        // Remove type from awards (если используется поле .type)
        Object.values(this.currentData.NwfEvents).forEach(event => {
            if (event.type === typeKey) {
                const fallback = Object.keys(this.currentData.NwfTypes)[0] || '';
                event.type = fallback;
            }
        });
        this.renderAll();
    }

    async saveChanges() {
        try {
            const output = `const NwfUsers = ${JSON.stringify(this.currentData.NwfUsers, null, 4)};\n\n` +
                          `const NwfTypes = ${JSON.stringify(this.currentData.NwfTypes, null, 4)};\n\n` +
                          `const NwfEvents = ${JSON.stringify(this.currentData.NwfEvents, null, 4)};\n`;
            
            const textArea = document.getElementById('textSaved');
            if (textArea) textArea.value = output;
            
            await navigator.clipboard.writeText(output);
            this.showMessage('Данные скопированы в буфер обмена', 'success');
        } catch (e) {
            console.error('Save error:', e);
            this.showMessage('Ошибка: ' + e.message, 'error');
        }
    }

    resetChanges() {
        this.currentData = JSON.parse(JSON.stringify(this.originalData));
        this.renderAll();
        this.showMessage('Изменения отменены', 'info');
    }

    showMessage(text, type) {
        const container = document.querySelector('.admin-container');
        if (!container) return;
        
        const existingMsg = container.querySelector('.message');
        if (existingMsg) existingMsg.remove();

        const msg = document.createElement('div');
        msg.className = `message ${type}-message`;
        msg.textContent = text;
        msg.style.position = 'fixed';
        msg.style.top = '20px';
        msg.style.right = '20px';
        msg.style.padding = '12px 24px';
        msg.style.borderRadius = '4px';
        msg.style.color = 'white';
        msg.style.zIndex = '1000';
        msg.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        
        switch(type) {
            case 'success': msg.style.backgroundColor = '#4CAF50'; break;
            case 'error': msg.style.backgroundColor = '#f44336'; break;
            case 'info': msg.style.backgroundColor = '#2196F3'; break;
        }
        
        document.body.appendChild(msg);
        setTimeout(() => {
            if (msg.parentNode) msg.parentNode.removeChild(msg);
        }, 3000);
    }

    renderAwardsEvents(user, what) {
        const userdata = this.currentData.NwfUsers[user];
        if (!userdata) return;
        
        const awards = userdata.awards || [];
        const events = userdata.events || [];
        
        if (what !== 'events' && document.getElementById('userawards')) {
            const awardsDiv = document.getElementById('userawards');
            awardsDiv.innerHTML = '';
            
            if (awards.length === 0) {
                awardsDiv.innerHTML = '<div class="no-awards">No medals</div>';
                return;
            }
            
            awards.forEach(award => {
                let dynamicAward = award;
                let isEdit = false;
                const el = document.createElement('div');
                const placeForText = document.createElement('div');
                const btn = document.createElement('button');
                btn.textContent = '✎';
                btn.type = 'button';
                placeForText.innerHTML = `${award}` || '-';
                placeForText.className = 'placeForTextInEditor';
                el.appendChild(placeForText);
                el.appendChild(btn);
                el.className = 'awardInEditor';
                awardsDiv.appendChild(el);

                btn.addEventListener('click', () => {
                    isEdit = !isEdit;
                    if (isEdit) {
                        const currentAwards = this.currentData.NwfUsers[user].awards;
                        placeForText.innerHTML = '';
                        const eventContainer = document.createElement('div');
                        const rankSelect = document.createElement('select');

                        eventContainer.className = 'adminUserEvent';
                        rankSelect.className = 'adminUserRank';

                        // Безопасное получение данных из currentData
                        const rawData = Object.keys(this.currentData.NwfEvents || {});
                        const sortedData = [...rawData].sort();
                        const formattedList = sortedData.map(item => ({
                            value: item,
                            label: item,
                        }));
                        const finalResult = [
                            { value: 'delete', label: '--- DELETE ---' },
                            ...formattedList
                        ];
                        
                        eventContainer.innerHTML = '';
                        
                        // Проверка существования функции создания кастомного дропдауна
                        let eventDropdown;
                        if (typeof window.createCustomDropdown === 'function') {
                            eventDropdown = window.createCustomDropdown(eventContainer, finalResult, { 
                                placeholder: 'Event', 
                                searchable: true 
                            });
                        } else {
                            // Fallback: обычный select
                            eventDropdown = document.createElement('select');
                            finalResult.forEach(opt => {
                                const option = document.createElement('option');
                                option.value = opt.value;
                                option.textContent = opt.label;
                                eventDropdown.appendChild(option);
                            });
                            eventContainer.appendChild(eventDropdown);
                        }

                        // Заполнение типов наград
                        Object.entries(this.currentData.NwfTypes || {}).forEach(([typeId, type]) => {
                            const option = document.createElement('option');
                            option.value = typeId;
                            option.textContent = typeof type === 'object' ? (type.name || typeId) : typeId;
                            rankSelect.appendChild(option);
                        });

                        // Установка текущих значений
                        const parts = dynamicAward.split('_');
                        rankSelect.value = parts[1] || '';
                        
                        if (eventDropdown.setValue) {
                            eventDropdown.setValue(parts[0] || '');
                        } else {
                            eventDropdown.value = parts[0] || '';
                        }

                        placeForText.appendChild(eventContainer);
                        placeForText.appendChild(rankSelect);

                        const saveChanges = () => {
                            const eventValue = eventDropdown.getValue ? eventDropdown.getValue() : eventDropdown.value;
                            
                            if (eventValue === 'delete') {
                                if (!confirm('Are you sure you want to delete this award?')) return;
                                const index = currentAwards.indexOf(dynamicAward);
                                if (index !== -1) {
                                    currentAwards.splice(index, 1);
                                }
                                this.renderAwardsEvents(user, 'awards');
                                return;
                            }
                            
                            const newAwardId = `${eventValue}_${rankSelect.value}`;
                            const index = currentAwards.indexOf(dynamicAward);
                            if (index !== -1) {
                                currentAwards[index] = newAwardId;
                            }
                            dynamicAward = newAwardId;
                        };

                        if (eventDropdown.addEventListener) {
                            eventDropdown.addEventListener('change', saveChanges);
                        } else {
                            eventDropdown.addEventListener('change', saveChanges);
                        }
                        rankSelect.addEventListener('change', saveChanges);
                    } else {
                        placeForText.innerHTML = `${dynamicAward}`;
                    }
                });
            });
        }
        
        if (what !== 'awards' && document.getElementById('userevents')) {
            const eventsDiv = document.getElementById('userevents');
            eventsDiv.innerHTML = '';
            
            if (events.length === 0) {
                eventsDiv.innerHTML = '<div class="no-awards">No events</div>';
                return;
            }
            
            events.forEach(event => {
                let dynamicEvent = event;
                let isEdit = false;
                const el = document.createElement('div');
                const placeForText = document.createElement('div');
                const btn = document.createElement('button');
                btn.textContent = '✎';
                btn.type = 'button';
                placeForText.innerHTML = `${event}`;
                placeForText.className = 'placeForTextInEditor';
                el.appendChild(placeForText);
                el.appendChild(btn);
                el.className = 'eventInEditor';
                eventsDiv.appendChild(el);

                btn.addEventListener('click', () => {
                    isEdit = !isEdit;
                    if (isEdit) {
                        const currentEvents = this.currentData.NwfUsers[user].events;
                        placeForText.innerHTML = '';
                        const eventContainer = document.createElement('div');

                        eventContainer.className = 'adminUserEvent';

                        const rawData = Object.keys(this.currentData.NwfEvents || {});
                        const sortedData = [...rawData].sort();
                        const formattedList = sortedData.map(item => ({
                            value: item,
                            label: item,
                        }));
                        const finalResult = [
                            { value: 'delete', label: '--- DELETE ---' },
                            ...formattedList
                        ];
                        
                        eventContainer.innerHTML = '';
                        
                        let eventDropdown;
                        if (typeof window.createCustomDropdown === 'function') {
                            eventDropdown = window.createCustomDropdown(eventContainer, finalResult, { 
                                placeholder: 'Event', 
                                searchable: true 
                            });
                        } else {
                            eventDropdown = document.createElement('select');
                            finalResult.forEach(opt => {
                                const option = document.createElement('option');
                                option.value = opt.value;
                                option.textContent = opt.label;
                                eventDropdown.appendChild(option);
                            });
                            eventContainer.appendChild(eventDropdown);
                        }

                        if (eventDropdown.setValue) {
                            eventDropdown.setValue(dynamicEvent);
                        } else {
                            eventDropdown.value = dynamicEvent;
                        }

                        placeForText.appendChild(eventContainer);

                        const saveChanges = () => {
                            const newValue = eventDropdown.getValue ? eventDropdown.getValue() : eventDropdown.value;
                            
                            if (newValue === 'delete') {
                                if (!confirm('Are you sure you want to delete this event?')) return;
                                const index = currentEvents.indexOf(dynamicEvent);
                                if (index !== -1) {
                                    currentEvents.splice(index, 1);
                                }
                                this.renderAwardsEvents(user, 'events');
                                return;
                            }
                            
                            const index = currentEvents.indexOf(dynamicEvent);
                            if (index !== -1) {
                                currentEvents[index] = newValue;
                            }
                            dynamicEvent = newValue;
                        };

                        if (eventDropdown.addEventListener) {
                            eventDropdown.addEventListener('change', saveChanges);
                        } else {
                            eventDropdown.addEventListener('change', saveChanges);
                        }
                    } else {
                        placeForText.innerHTML = `${dynamicEvent}`;
                    }
                });
            });
        }
    }

    giveEvent(user) {
        if (!this.currentData.NwfUsers[user]) return;
        const events = this.currentData.NwfUsers[user].events || [];
        const availableEvents = Object.keys(this.currentData.NwfEvents || {});
        
        if (availableEvents.length > 0) {
            events.push(''); // Добавляем первый доступный ивент
            this.currentData.NwfUsers[user].events = events;
            if (window.userChose?.getValue?.() === user) {
                this.renderAwardsEvents(user, 'events');
            }
        } else {
            alert('No events available to add');
        }
    }
    
    giveAward(user) {
        if (!this.currentData.NwfUsers[user]) return;
        const awards = this.currentData.NwfUsers[user].awards || [];
        const availableEvents = Object.keys(this.currentData.NwfEvents || {});
        const availableTypes = Object.keys(this.currentData.NwfTypes || {});
        
        if (availableEvents.length > 0 && availableTypes.length > 0) {
            awards.push(`_`); // Добавляем первую комбинацию
            this.currentData.NwfUsers[user].awards = awards;
            if (window.userChose?.getValue?.() === user) {
                this.renderAwardsEvents(user, 'awards');
            }
        } else {
            alert('No events or types available to add');
        }
    }
}

// Initialize the admin panel
let admin;
document.addEventListener('DOMContentLoaded', () => {
    // Проверка наличия глобальных данных
    if (!NwfUsers || !NwfEvents || !NwfTypes) {
        console.error('Global data (NwfUsers/NwfEvents/NwfTypes) not found. Make sure data is loaded before admin panel.');
        document.body.innerHTML = '<div style="padding:20px;color:red;text-align:center;font-family:Arial">Ошибка: данные не загружены. Убедитесь, что users.js загружен до admin panel.</div>';
        return;
    }
    
    window.admin = new AdminPanel();
    
    // Инициализация выпадающего списка пользователей
    const dropdownEl = document.getElementById('choseUser');
    if (dropdownEl && typeof window.createCustomDropdown === 'function') {
        const rawData = Object.keys(NwfUsers);
        const sortedData = [...rawData].sort();
        const formattedUsersList = sortedData.map(item => ({
            value: item,
            label: item,
        }));
        
        window.userChose = window.createCustomDropdown(dropdownEl, formattedUsersList, { 
            placeholder: 'User', 
            searchable: true 
        });
        
        // ЕДИНСТВЕННЫЙ обработчик смены пользователя
        window.userChose.addEventListener('change', () => {
            const userId = window.userChose.getValue();
            window.currentEditingUser = userId;
            const user = window.admin?.currentData?.NwfUsers?.[userId];
            if (!user) return;
            
            // Обновляем поля ввода
            const fields = {
                'userid': user.id || '',
                'username': user.discord || '',
                'usergame': user.gamename || '',
                'userdiscordid': user.discordid || ''
            };
            
            Object.entries(fields).forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.value = value;
            });
            
            window.admin.renderAwardsEvents(userId, 'all');
        });
    }
    
    // Обработчики полей пользователя — ОДИН РАЗ при инициализации
    const fieldMap = {
        'userid': 'id',
        'username': 'discord',
        'usergame': 'gamename',
        'userdiscordid': 'discordid'
    };
    
    Object.entries(fieldMap).forEach(([fieldId, fieldName]) => {
        const el = document.getElementById(fieldId);
        if (el) {
            el.addEventListener('input', (e) => {
                const userId = window.currentEditingUser;
                if (userId && window.admin?.currentData?.NwfUsers?.[userId]) {
                    window.admin.currentData.NwfUsers[userId][fieldName] = e.target.value;
                }
            });
        }
    });
    
    // Кнопки добавления наград/событий для текущего пользователя
    const giveEventBtn = document.getElementById('giveEventBtn');
    const giveAwardBtn = document.getElementById('giveAwardBtn');
    
    if (giveEventBtn) {
        giveEventBtn.addEventListener('click', () => {
            const userId = window.currentEditingUser;
            if (userId) window.admin.giveEvent(userId);
        });
    }
    
    if (giveAwardBtn) {
        giveAwardBtn.addEventListener('click', () => {
            const userId = window.currentEditingUser;
            if (userId) window.admin.giveAward(userId);
        });
    }
});

window.admin = new AdminPanel();
admin = window.admin;