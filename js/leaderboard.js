class Leaderboard { // Исправлено: классы должны называться с большой буквы
    awards(id) {
        const parts = id.split('_');
        const result = {
            event: parts[0],
            type: parts[1]
        };
        return result;
    }

    calcScoreAward(id) {
        const awardType = this.awards(id).type;
        return NwfTypes[awardType]?.score || 0; // Добавлена проверка на существование типа
    }

    update() {
        const tbody = document.getElementById('leadertablebody');
        if (!tbody) return; // Добавлена проверка существования элемента
        tbody.innerHTML = '';

        // Convert users object to array and calculate scores
        const usersArray = Object.entries(NwfUsers).map(([key, user]) => {
            let score = 0;
            // Calculate score based on awards
            user.awards?.forEach(award => {
                score += this.calcScoreAward(award);
            });
            return { ...user, score };
        });

        // Sort users by ratio (highest first)
        usersArray.sort((a, b) => {
            let ratioA;
            let ratioB;
            if (a.events) {
                if (a.events.length < a.awards.length) {
                    ratioA = a.score / a.awards.length;
                } else {
                    ratioA = a.score / a.events.length;
                }
            } else {
                ratioA = a.score / a.awards.length;
            }
            if (b.events) {
                if (b.events.length < b.awards.length) {
                    ratioB = b.score / b.awards.length;
                } else {
                    ratioB = b.score / b.events.length;
                }
            } else {
                ratioB = b.score / b.awards.length;
            }
            return ratioB - ratioA;
        });

        // Create table rows
        usersArray.forEach(user => {
            const tr = document.createElement('tr');
            if (user.id === localStorage.getItem('account')) {
                tr.classList.add('userThisIs');
            }
            
            // Score column
            const tdScore = document.createElement('td');
            tdScore.textContent = user.score;
            tr.appendChild(tdScore);
            
            // Ratio column - исправлен расчет
            const tdRatio = document.createElement('td');
            let ratio;
            //    ratio = user.events?.length ? (user.score / user.events.length).toFixed(2) : "0.00";
            if (user.events) {
                if (user.events.length < user.awards.length) {
                    ratio = (user.score / user.awards.length).toFixed(2);
                } else {
                    ratio = (user.score / user.events.length).toFixed(2);
                }
            } else {
                ratio = (user.score / user.awards.length).toFixed(2);
            }
            tdRatio.textContent = ratio;
            tr.appendChild(tdRatio);

            // Discord name column
            const tdDiscord = document.createElement('td');
            if (user.discordid) { // Добавлена проверка
                const discordLink = document.createElement('a');
                discordLink.href = `https://discord.com/users/${user.discordid}`;
                discordLink.textContent = user.discord || ''; // Защита от undefined
                discordLink.target = '_blank';
                tdDiscord.appendChild(discordLink);
            } else {
                tdDiscord.textContent = user.discord || '';
            }
            tr.appendChild(tdDiscord);

            // Game name column
            const tdGame = document.createElement('td');
            tdGame.textContent = user.gamename || '';
            tr.appendChild(tdGame);

            // Awards column
            const tdAwards = document.createElement('td');
            tdAwards.classList.add('awardslist');

            // Сортируем награды
            const sortedAwards = [...(user.awards || [])].sort((a, b) => { // Защита от отсутствия awards
                return this.calcScoreAward(b) - this.calcScoreAward(a);
            });

            sortedAwards.forEach(awardKey => {
                const award = this.awards(awardKey);
                if (award && NwfTypes[award.type]) { // Проверка существования типа
                    const img = document.createElement('img');
                    img.src = `img/award/${award.type}.png`;
                    img.title = `${NwfTypes[award.type].name} ${NwfEvents[award.event]?.name || ''}`; // Проверка события
                    img.onclick = () => this.showAward(awardKey); // Исправлен вызов метода
                    tdAwards.appendChild(img);
                }
            });
            tr.appendChild(tdAwards);

            // Events column
            const tdEvents = document.createElement('td');
            if (user.events) {
                if (user.events.length < user.awards.length) {
                    tdEvents.textContent = user.awards?.length || 0;
                } else {
                    tdEvents.textContent = user.events?.length || 0;
                }
            } else {
                tdEvents.textContent = user.awards?.length || 0;
            }
            tr.appendChild(tdEvents);

            tbody.appendChild(tr);
        });
    }

    showAward(id) {
        try {
        const modalElement = document.getElementById('modal');
        if (!modalElement) return; // Проверка существования модального окна
        
        const awardInfo = this.awards(id);
        const eventInfo = NwfEvents[awardInfo.event];
        const typeInfo = NwfTypes[awardInfo.type];
        
        if (!eventInfo || !typeInfo) return; // Проверка существования данных

        modalElement.classList.add('active');
        modalElement.innerHTML = `
        <div class="modalcontent">
            <div style="justify-self: right;">
                <button onclick="document.getElementById('modal').classList.remove('active')" class="modalClose">×</button>
            </div>
            <div class="stroke">
                <b data-translate="nameDT">${window.langMgr?.trs('nameDT') || 'Name'}</b>
                <p>${typeInfo.name} ${eventInfo.name}</p>
            </div>
            <div class="stroke">
                <b data-translate="scoreDT">${window.langMgr?.trs('scoreDT') || 'Score'}</b>
                <p>${this.calcScoreAward(id)}</p>
            </div>
            <div class="stroke">
                <b data-translate="dateDT">${window.langMgr?.trs('dateDT') || 'Date'}</b>
                <p>${eventInfo.date}</p>
            </div>
            <div class="imageDiv">
                <img src="img/award/${awardInfo.type}.png"> <!-- Исправлено: было awardInfo.img -->
            </div>
        </div>`;
        } catch(e) {
            alert(e);
        }
    }
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация leaderboard...');
    window.leaderboard = new Leaderboard(); // Исправлено имя класса
    console.log('leaderboard инициализирован:', window.leaderboard);

    window.leaderboard.update();
});