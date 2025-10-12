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
        return types[awardType]?.score || 0; // Добавлена проверка на существование типа
    }

    update() {
        const tbody = document.getElementById('leadertablebody');
        if (!tbody) return; // Добавлена проверка существования элемента
        tbody.innerHTML = '';

        // Convert users object to array and calculate scores
        const usersArray = Object.entries(users).map(([key, user]) => {
            let score = 0;
            // Calculate score based on awards
            user.awards?.forEach(award => {
                score += this.calcScoreAward(award);
            });
            return { ...user, score };
        });

        // Sort users by ratio (highest first)
        usersArray.sort((a, b) => {
            /*const ratioA = a.events?.length ? a.score / a.events.length : 0;
            const ratioB = b.events?.length ? b.score / b.events.length : 0;*/
            const ratioA = a.awards?.length ? a.score / a.awards.length : 0;
            const ratioB = b.awards?.length ? b.score / b.awards.length : 0;
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
            // const ratio = user.events?.length ? (user.score / user.events.length).toFixed(2) : "0.00";
            const ratio = user.events?.length ? (user.score / user.awards.length).toFixed(2) : "0.00";
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
                if (award && types[award.type]) { // Проверка существования типа
                    const img = document.createElement('img');
                    img.src = `img/award/${award.type}.png`;
                    img.title = `${types[award.type].name} ${events[award.event]?.name || ''}`; // Проверка события
                    img.onclick = () => this.showAward(awardKey); // Исправлен вызов метода
                    tdAwards.appendChild(img);
                }
            });
            tr.appendChild(tdAwards);

            // Events column
            /*const tdEvents = document.createElement('td');
            tdEvents.textContent = user.events?.length || 0;
            tr.appendChild(tdEvents);*/

            tbody.appendChild(tr);
        });
    }

    showAward(id) {
        try {
        const modalElement = document.getElementById('modal');
        if (!modalElement) return; // Проверка существования модального окна
        
        const awardInfo = this.awards(id);
        const eventInfo = events[awardInfo.event];
        const typeInfo = types[awardInfo.type];
        
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