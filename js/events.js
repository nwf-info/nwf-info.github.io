document.addEventListener("DOMContentLoaded", () => {
    const awards = {};
    console.log('NwfEvents инициализирован');

    // -------------------------
    // 1) Собираем данные о событиях из users (если пользователи есть)
    // -------------------------
    const eventsMap = {};
    for (const userId in NwfUsers) {
        const user = NwfUsers[userId];
        (user.events || []).forEach(eventId => {
            if (!eventsMap[eventId]) {
                eventsMap[eventId] = { players: [], awards: {} };
            }
            eventsMap[eventId].players.push(user.gamename || user.id);

            (user.awards || []).forEach(awardId => {
                const award = awards && awards[awardId];
                if (award && award.event === eventId) {
                    if (!eventsMap[eventId].awards[awardId]) {
                        eventsMap[eventId].awards[awardId] = { award, players: [] };
                    }
                    eventsMap[eventId].awards[awardId].players.push(user.gamename || user.id);
                }
            });
        });
    }

    // -------------------------
    // 2) Парсер дат -> возвращает Date (без времени) или null
    // Поддерживает: DD.MM.YYYY, DD.MM.YY, YYYY-MM-DD и ISO-подобные строки
    // -------------------------
    function parseDateToDateObject(str) {
        if (!str) return null;
        str = String(str).trim();

        // DD.MM.YYYY или DD.MM.YY
        let m = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
        if (m) {
            let day = parseInt(m[1], 10);
            let month = parseInt(m[2], 10);
            let year = parseInt(m[3], 10);
            if (year < 100) {
                // 2-digit year: 00-69 -> 2000-2069, 70-99 -> 1970-1999
                year += (year >= 70 ? 1900 : 2000);
            }
            const d = new Date(year, month - 1, day);
            if (!isNaN(d)) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return null;
        }

        // YYYY-MM-DD
        m = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        if (m) {
            const year = parseInt(m[1], 10);
            const month = parseInt(m[2], 10);
            const day = parseInt(m[3], 10);
            const d = new Date(year, month - 1, day);
            if (!isNaN(d)) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return null;
        }

        // Попытка распарсить стандартными средствами (ISO и т.п.)
        const dt = new Date(str);
        if (!isNaN(dt)) return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());

        return null;
    }

    // Новая функция: парсит дату + время из объекта info (info.date и info.time)
    // Возвращает Date (полная дата-время) или null
    function parseDateAndTime(info) {
        if (!info || !info.date) return null;

        // Получаем date-only часть через существующий парсер (safe)
        const dateOnly = parseDateToDateObject(info.date);
        if (!dateOnly) return null;

        // Разбираем время: ожидаем форматы 'HH:mm' или 'H:mm' или 'HH' и т.п.
        let hour = 20, minute = 0; // значение по умолчанию
        if (info.time) {
            const t = String(info.time).trim();
            // формы: HH:MM, HH.MM, HHMM, HH
            let mt = t.match(/^(\d{1,2}):(\d{1,2})$/) || t.match(/^(\d{1,2})\.(\d{1,2})$/);
            if (mt) {
                hour = parseInt(mt[1], 10);
                minute = parseInt(mt[2], 10);
            } else if (/^\d{3,4}$/.test(t)) {
                // 930 -> 09:30, 1730 -> 17:30
                if (t.length === 3) {
                    hour = parseInt(t.slice(0,1), 10);
                    minute = parseInt(t.slice(1), 10);
                } else {
                    hour = parseInt(t.slice(0,2), 10);
                    minute = parseInt(t.slice(2), 10);
                }
            } else {
                // возможно просто "20" или "8"
                const m2 = t.match(/^(\d{1,2})$/);
                if (m2) hour = parseInt(m2[1], 10);
            }

            // нормализация
            if (hour < 0 || hour > 23) hour = 20;
            if (minute < 0 || minute > 59) minute = 0;
        }

        // Создаём Date в локальной временной зоне с учётом времени
        const dt = new Date(
            dateOnly.getFullYear(),
            dateOnly.getMonth(),
            dateOnly.getDate(),
            hour,
            minute,
            0,
            0
        );
        if (isNaN(dt)) return null;
        return dt;
    }

    // форматирование даты для отображения DD.MM.YYYY
    function formatDateDDMMYYYY(dateObj) {
        if (!dateObj) return "";
        const dd = String(dateObj.getDate()).padStart(2, "0");
        const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
        const yyyy = String(dateObj.getFullYear());
        return `${dd}.${mm}.${yyyy}`;
    }

    // isPast: true если дата-время строго меньше текущего момента (учитывает время)
    function isPast(dateTimeObj) {
        if (!dateTimeObj) return false;
        const now = new Date();
        return dateTimeObj.getTime() < now.getTime();
    }

    // -------------------------
    // 3) Строим eventsArray ПО ВСЕМ событиям (не только тем, где есть игроки)
    // -------------------------
    const eventsArray = Object.keys(NwfEvents).map(eventId => {
        const info = NwfEvents[eventId] || {};
        const mapData = eventsMap[eventId] || { players: [], awards: {} };
        const parsedDateOnly = parseDateToDateObject(info.date); // Date или null (date-only)
        const parsedDateTime = parseDateAndTime(info); // Date или null (date+time)
        return {
            eventId,
            data: mapData,
            info,
            dateObj: parsedDateOnly,
            dateTimeObj: parsedDateTime
        };
    });

    // Разбиваем на прошедшие / будущие
    const pastNwfEvents = [];
    let futureNwfEvents = [];
    const futureNwfEvents2 = [];
    if (typeof futureSatEvents !== 'undefined') futureNwfEvents = futureSatEvents;
    eventsArray.forEach(e => {
        // Если нет даты — пропускаем события без даты
        if (!e.dateTimeObj && !e.dateObj) return;

        // Если есть dateTimeObj — используем его для определения past/future,
        // иначе (есть только dateObj) используем dateObj (в этом случае сравнение только по дате)
        const ref = e.dateTimeObj || new Date(e.dateObj.getFullYear(), e.dateObj.getMonth(), e.dateObj.getDate(), 23, 59, 59);

        if (isPast(ref)) {
            pastNwfEvents.push(e);
        } else {
            futureNwfEvents.push(e);
            futureNwfEvents2.push(e);
        }
    });
    if (document.location.href.includes('saturn') || document.location.href.includes('Saturn')) {
        window.pastNwfEvents = pastNwfEvents;
        window.futureNwfEvents = futureNwfEvents;
        return 
    }

    const eventsCountElement = document.getElementById('eventsCount');
    let eventsCountLength;
    if (typeof futureSatEvents !== 'undefined') eventsCountLength = futureNwfEvents2.length
    else eventsCountLength = futureNwfEvents.length;
    if (eventsCountElement) {
        if (eventsCountLength > 0) { 
            if (eventsCountLength < 1) return;
            eventsCountElement.classList.add('active');
            eventsCountElement.innerText = eventsCountLength;
        } else {
            eventsCountElement.innerText = '';
            eventsCountElement.classList.remove('active');
        }
    }

    // -------------------------
    // 4) Сортировка
    // Требование: будущие над прошедшими, и внутри каждой секции более поздние события выше.
    // Значит: сортируем по убыванию даты (b - a)
    // Используем dateTimeObj если есть, иначе dateObj
    // -------------------------
    function getSortKey(e) {
        if (e.dateTimeObj) return e.dateTimeObj.getTime();
        if (e.dateObj) {
            // помещаем date-only в конец дня, чтобы они были после событиям с временем в тот же день
            return new Date(e.dateObj.getFullYear(), e.dateObj.getMonth(), e.dateObj.getDate(), 23, 59, 59).getTime();
        }
        return 0;
    }

    pastNwfEvents.sort((a, b) => getSortKey(b) - getSortKey(a));
    futureNwfEvents.sort((a, b) => getSortKey(b) - getSortKey(a));

    const container = document.querySelector("#eventstable");
    if (!container) return;

    container.innerHTML = ""; // очищаем контейнер

    // -------------------------
    // 5) Создание карточки события
    // -------------------------
    function createCard({ eventId, data, info, dateObj, dateTimeObj, source }, time) {
        const card = document.createElement("div");
        card.className = "event-card";
        if (info.map) {
            let mapId = info.map.replace(/^([^_]*_[^_]*)_.*$/, '$1');
            mapId = mapId.replace(/_/g, '/');
            if (window.location.href.includes('file:///')) {
            card.style.backgroundImage = `url("http://192.168.100.18:8081/lib/${mapId}/${info.map}.png")`;
            } else {
            card.style.backgroundImage = `url("http://raw.githubusercontent.com/EEditor-WS/eeditor-ws-data/refs/heads/main/lib/${mapId}/${info.map}.png")`;
            }
        } else if (SatEvents[eventId]) card.style.backgroundImage = `url("https://saturn-info.github.io/img/events/${info.img}")`
        else if (info.img) card.style.backgroundImage = `url("img/events/${info.img}")`;
        card.style.backgroundSize = "cover";
        card.style.backgroundPosition = "center";
        card.style.borderRadius = "var(--br)";
        card.style.padding = "1rem";
        card.style.marginBottom = "1rem";
        card.style.color = "#fff";
        card.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4)";
        card.loading = 'lazy';
        if (time === 'future') card.style.border = "5px solid #939347"; // желтая рамка для будущих событий
        if (info.canceled) card.style.border = "5px solid #934747ff"; // желтая рамка для проваленных событий

        const extrabtnsdiv = document.createElement("div");
        extrabtnsdiv.className = 'extrabtnsdiv';
        if (info.discord) extrabtnsdiv.innerHTML = `<button class="extrabtn discord" onclick="window.open('https://discord.com/channels/1299836753070395422/${info.discord}')"><img src="img/icons/discord-white.svg"></button>`;
        // extrabtnsdiv.innerHTML = extrabtnsdiv.innerHTML + `<button class="extrabtn" onclick="downloadScenario('${info.map}')"><img src="img/icons/download.svg"></button>`
        if (info.map) extrabtnsdiv.innerHTML = extrabtnsdiv.innerHTML + `<button class="extrabtn" onclick="window.open('https://eeditor-ws.github.io/page/library/download?fullid=${info.map}')"><img src="img/icons/download.svg"></button>`
        card.appendChild(extrabtnsdiv);

        const sourceOfEventDiv = document.createElement("div");
        sourceOfEventDiv.className = 'sourceOfEventDiv';
        if (typeof SatEvents !== 'undefined' && SatEvents[eventId]) {
            if (SatEvents[eventId]) sourceOfEventDiv.innerHTML = `<img src='img/icons/saturn3.png' class='sourceOfEventImg' />`;
            if (SatEvents[eventId]) card.appendChild(sourceOfEventDiv);
            card.style.filter = "sepia(0.75)";
        };

        const overlay = document.createElement("div");
        // затемняющий фон, чтобы текст читался на ярком фоне
        // overlay.style.background = "rgba(0,0,0,0.45)";
        overlay.style.padding = "0.5rem";
        overlay.style.borderRadius = "0.6rem";

        const title = document.createElement("h2");
        title.textContent = info.name || eventId;
        overlay.appendChild(title);

        // /--------------------------------------------\
        // отображаем итоговую строку даты+времени, если есть dateTimeObj — используем её,
        // иначе показываем date-only
        let finaltime = '';
        const eventDateObj = dateTimeObj || (dateObj ? new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), 20, 0, 0) : null);

        if (eventDateObj) {
            const options = {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            };
            finaltime = eventDateObj.toLocaleString(navigator.language, options);
        } else {
            finaltime = info.date || "";
        }

        const date = document.createElement("p");
        date.textContent = finaltime || info.date || formatDateDDMMYYYY(dateObj) || "";
        overlay.appendChild(date);
        // \--------------------------------------------/

        const players = document.createElement("p");
        players.textContent = "Players: " + (data.players.length ? data.players.join(", ") : "-");
        players.style.maxHeight = '35px';
        players.style.overflowY = 'auto';
        overlay.appendChild(players);

        const medals = document.createElement("div");
        medals.style.display = "flex";
        medals.style.gap = "8px";
        medals.style.marginTop = "0.5rem";

        for (const awardId in data.awards) {
            const obj = data.awards[awardId];
            const img = document.createElement("img");
            img.src = "img/award/" + (obj.award.img || "noimg.png");
            img.alt = obj.award.name || "";
            img.title = obj.award.name || "";
            img.style.width = "32px";
            img.style.height = "32px";
            img.style.cursor = "pointer";

            img.onclick = () => {
                window.leaderboard.showAward(awardId);
                //alert(`🏅 ${obj.award.name}\nПолучили: ${obj.players.join(", ")}`);
            };

            medals.appendChild(img);
        }

        overlay.appendChild(medals);
        card.appendChild(overlay);
        return card;
    }

    // -------------------------
    // 6) Рендер: сначала будущие, затем разделитель, затем прошедшие
    // -------------------------
    // будущее
    if (futureNwfEvents.length) {
        futureNwfEvents.forEach(e => container.appendChild(createCard(e, 'future')));
    }

    // разделитель (если есть и те, и другие)
    if (pastNwfEvents.length && futureNwfEvents.length) {
        const divider = document.createElement("div");
        divider.innerHTML = `
            <div class="ads" style="padding: 1rem; background: #333; color: #fff; text-align: center; border-radius: 0.5rem;">
                🌟 Here will be advertising of <a href="https://eeditor-ws.vercel.app/">EEditor - best scenario editor for Warnament</a> 🌟
                <br>
                <br>
                🌟 Тут должна быть реклама <a href="https://eeditor-ws.github.io/">EEditor'а - лучшего редактора сценариев для Warnament</a> 🌟
            </div>
        `;
        container.appendChild(divider);
    }

    // прошедшие
    if (pastNwfEvents.length) {
        pastNwfEvents.forEach(e => container.appendChild(createCard(e)));
    }

    window.futureNwfEvents = futureNwfEvents;

    // Если нужно — можно вывести лог для отладки
    // console.log('Всего событий (events):', Object.keys(events).length);
    // console.log('Событий с игроками (eventsMap):', Object.keys(eventsMap).length);
    // console.log('Будущие:', futureNwfEvents.map(e => ({ id: e.eventId, datetime: e.dateTimeObj ? e.dateTimeObj.toString() : (e.dateObj ? e.dateObj.toString() : null) })));
    // console.log('Прошедшие:', pastNwfEvents.map(e => ({ id: e.eventId, datetime: e.dateTimeObj ? e.dateTimeObj.toString() : (e.dateObj ? e.dateObj.toString() : null) })));
});

async function downloadFile(url, fileName) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const blob = await response.blob();
    const enhancedBlob = new Blob([blob], { type: contentType });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(enhancedBlob);
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);
    return new Promise(resolve => setTimeout(resolve, 100));
}

async function downloadScenario(id) {
    // Разбиваем id на части, предполагая формат 'часть1_часть2_часть3_часть4'
    const parts = id.split('_');

    // Берем первые две части и соединяем их через '/'.
    // Например, 'parkourcat_euro4_vg_1956' -> 'parkourcat/euro4'
    const scenarioPath = parts.slice(0, 2).join('/');

    // Формируем полный путь к файлу.
    // Если id = 'parkourcat_euro4_vg_1956', то filePath будет:
    // https://raw.githubusercontent.com/EEditor-WS/eeditor-ws-data/refs/heads/main/lib/parkourcat/euro4
    const filePath = `https://raw.githubusercontent.com/EEditor-WS/eeditor-ws-data/refs/heads/main/lib/${scenarioPath}/${id}.json`;

    // Используем последнюю часть id для имени файла
    const fileName = `${id}.json`; 

    // Загружаем файл
    await downloadFile(filePath, fileName);
}
