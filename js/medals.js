document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('medalstablebody')
    Object.keys(NwfTypes).forEach(medal => {
        const line = document.createElement('tr')
        let tds = []
        for (let i = 0; i < 4; i++) {
            const td = document.createElement('td')
            tds.push(td)
            line.appendChild(td)
        }

        tds[0].innerHTML = `<img src="img/award/${medal}.png">`
        tds[1].textContent = NwfTypes[medal].name
        tds[2].textContent = NwfTypes[medal].score

        table.appendChild(line)
    })
})