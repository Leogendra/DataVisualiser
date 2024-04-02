const div_stats = document.querySelector('.stats');
const optionsContainer = document.querySelector('.options');
const div_frequency_week = document.querySelector('.frequency-week');
const div_frequency_month = document.querySelector('.frequency-month');
const div_correlation_month = document.querySelector('.correlations-month');

const primaryColor = '#00bcd4';
const secondaryColor = '#ff5cd4';

////////////////////////////
//     UTILITAIRES        //
////////////////////////////

function add_stats_options() {

    const dict = {
        "pourcentage": ["Valeurs", "Pourcentages"],
        "tableau": ["Tableau", "Graphique"],
    };


    optionsContainer.innerHTML = '';

    for (const key in dict) {
        const optionValues = dict[key];
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option ' + key;

        optionValues.forEach((value, index) => {
            const radioButton = document.createElement('input');
            radioButton.type = 'radio';
            radioButton.id = value.toLowerCase();
            radioButton.name = key;
            radioButton.value = value.toLowerCase();
            if (index === 0) { radioButton.checked = true; }

            const label = document.createElement('label');
            label.setAttribute('for', value.toLowerCase());
            label.textContent = value;

            optionDiv.appendChild(radioButton);
            optionDiv.appendChild(label);
        });

        optionsContainer.appendChild(optionDiv);
    }

    //ajout des écouteurs d'évennements
}


function calculate_trend_line(labels, dataValues) {
    // Convertir les labels 'YYYY-MM' en nombres de mois depuis le premier label
    const startYear = parseInt(labels[0].split('-')[0]);
    const startMonth = parseInt(labels[0].split('-')[1]);
    const numericLabels = labels.map(label => {
        const [year, month] = label.split('-').map(Number);
        return (year - startYear) * 12 + (month - startMonth);
    });

    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = numericLabels.length;

    for (let i = 0; i < n; i++) {
        sumX += numericLabels[i];
        sumY += dataValues[i];
        sumXY += numericLabels[i] * dataValues[i];
        sumX2 += numericLabels[i] * numericLabels[i];
    }

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const b = (sumY - m * sumX) / n;

    // Générer les valeurs de la ligne de tendance pour chaque label numérique
    const trendValues = numericLabels.map(x => m * x + b);

    return trendValues;
}

function calculate_mean(data) {
    return data.reduce((acc, val) => acc + val, 0) / data.length;
}

////////////////////////////
//     FREQUENCIES        //
////////////////////////////

function display_frequency_week(frequency) {

    // Récupérer la valeur de l'option sélectionnée
    const optionPourcentage = document.querySelector('input[name="pourcentage"]:checked').value;
    const optionTableau = document.querySelector('input[name="tableau"]:checked').value;
    const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

    if (optionTableau === "tableau") {

        // Créer le tableau et son en-tête
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');

        // Ajouter une cellule vide pour la colonne de nom d'événement
        headerRow.appendChild(document.createElement('th'));

        // Remplir l'en-tête avec les jours de la semaine
        daysOfWeek.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        for (const dataName in frequency) {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            nameCell.textContent = dataName;
            row.appendChild(nameCell);

            for (let i = 1; i <= 7; i++) {
                const dayIndex = i % 7;
                const td = document.createElement('td');
                if (optionPourcentage === "valeurs") {
                    td.textContent = frequency[dataName][dayIndex].count || 0;
                }
                else {
                    td.textContent = Math.round(frequency[dataName][dayIndex].percentage * 100) / 100 + "%" || 0;
                }
                row.appendChild(td);
            }

            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        div_frequency_week.appendChild(table);
    }

    else if (optionTableau === "graphique") {

        // Pour chaque série de données, créer un graphique
        for (const dataName in frequency) {
            const dataPoints = frequency[dataName];
            // Mettre le 0 en dernier (dimanche)
            const lastDay = dataPoints[0];
            delete dataPoints[0];
            dataPoints[7] = lastDay;

            let canvas = document.createElement('canvas');
            canvas.className = 'canvas-frequency-week';
            canvas.setAttribute('aria-label', 'Graphique de fréquence hebdomadaire pour ' + dataName);

            div_frequency_week.appendChild(canvas);

            const labels = Object.keys(dataPoints).map(day => daysOfWeek[day - 1]);
            let dataValues;
            let dataType;
            if (optionPourcentage === "valeurs") {
                dataValues = labels.map(label => dataPoints[Object.keys(dataPoints).find(key => daysOfWeek[key-1] === label)].count);
                dataType = "Valeurs ";
            }
            else {
                dataValues = labels.map(label => dataPoints[Object.keys(frequency[dataName]).find(key => daysOfWeek[key-1] === label)].percentage);
                dataType = "Pourcentages ";
            }

            new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: dataType + dataName,
                        data: dataValues,
                        backgroundColor: primaryColor,
                    }]
                },
                options: {
                    scales: {
                        y: {
                            min: 0
                        }
                    },
                }
            });
        }
    }
}



function display_monthly_frequency_chart(frequency) {

    // Récupérer la valeur de l'option sélectionnée
    const optionPourcentage = document.querySelector('input[name="pourcentage"]:checked').value;

    // Pour chaque série de données, créer un graphique
    for (const dataName in frequency) {
        const dataPoints = frequency[dataName];
        let canvas = document.createElement('canvas');
        canvas.className = 'canvas-frequency-month';
        canvas.setAttribute('aria-label', 'Graphique de fréquence mensuelle pour ' + dataName);

        div_frequency_week.appendChild(canvas);

        const labels = Object.keys(dataPoints).sort();
        let dataValues;
        let dataType;
        if (optionPourcentage === 'valeurs') {
            dataValues = labels.map(label => dataPoints[label].count);
            dataType = "Valeurs ";
        }
        else {
            dataValues = labels.map(label => dataPoints[label].percentage);
            dataType = "Pourcentages ";
        }

        const trendValues = calculate_trend_line(labels, dataValues); // Assure-toi que labels est un array de nombres

        new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels, // Les mois sous forme de chaînes ou de nombres
                datasets: [{
                    label: dataType + dataName,
                    data: dataValues,
                    fill: false,
                    borderColor: primaryColor,
                    tension: 0.1
                }, {
                    label: 'Courbe de tendance',
                    data: trendValues,
                    fill: false,
                    borderColor: '#ff0000',
                    borderDash: [5, 2], // Ligne pointillée
                    tension: 0
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 0
                    }
                },
            }
        });
    }
    if (frequency.length == 1) {
        let canvas = document.createElement('canvas');
        canvas.className = 'canvas-void';
        div_frequency_week.appendChild(canvas);
    }
}






function calculate_frequency_week() {
    const frequency = {};

    // Initialiser la fréquence pour chaque jour de la semaine
    for (const dataName in filteredData) {
        frequency[dataName] = {};
        for (let day = 0; day < 7; day++) { // 0 est Dimanche, 6 est Samedi
            frequency[dataName][day] = { count: 0, percentage: 0 };
        }

        for (const dataDate of filteredData[dataName]) {
            const date = new Date(dataDate);
            const day = date.getUTCDay(); // pour pallier le décallage horaire
            frequency[dataName][day].count++;
        }
    }

    let totalWeeks = 0;
    for (const dataName in frequency) {

        let minDate = new Date();
        let maxDate = new Date(0);
        for (const dataDate of filteredData[dataName]) {
            const date = new Date(dataDate);
            minDate = date < minDate ? date : minDate;
            maxDate = date > maxDate ? date : maxDate;
        }
        totalWeeks = Math.ceil((maxDate - minDate) / (7 * 24 * 60 * 60 * 1000));

        for (let day = 0; day < 7; day++) {
            const count = frequency[dataName][day].count;
            frequency[dataName][day].percentage = (count / totalWeeks) * 100;
        }
    }
    return frequency;
}




function calculate_frequency_months() {
    const frequency = {};
    let minDate = new Date();
    let maxDate = new Date(0);

    // Trouver la plage de dates
    for (const dataName in filteredData) {
        for (const dataDate of filteredData[dataName]) {
            const date = new Date(dataDate);
            minDate = date < minDate ? date : minDate;
            maxDate = date > maxDate ? date : maxDate;
        }
    }

    // Initialiser la fréquence pour chaque mois entre minDate et maxDate
    for (const dataName in filteredData) {
        frequency[dataName] = {};
        let currentDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        while (currentDate <= maxDate) {
            const month = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1).toString().padStart(2, '0');
            frequency[dataName][month] = { count: 0, percentage: 0 };
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    }

    // Calculer la fréquence et le pourcentage pour chaque mois
    for (const dataName in filteredData) {
        for (const dataDate of filteredData[dataName]) {
            const date = new Date(dataDate);
            const month = date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0');
            frequency[dataName][month].count++;
        }

        // Calculer le pourcentage pour chaque mois
        for (const month in frequency[dataName]) {
            const year = parseInt(month.split("-")[0]);
            const monthIndex = parseInt(month.split("-")[1]) - 1;
            const daysInMonth = new Date(year, monthIndex + 1, 0).getUTCDate(); // Nombre de jours dans le mois
            frequency[dataName][month].percentage = 100 * frequency[dataName][month].count / daysInMonth;
        }
    }

    return frequency;
}


////////////////////////////
//     CORRELATIONS       //
////////////////////////////

function get_similarity(datesArray1, datesArray2) {
    const set1 = new Set(datesArray1);
    const set2 = new Set(datesArray2);

    const intersection = new Set([...set1].filter(date => set2.has(date)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
}



function display_correlation() {

    let minDate = new Date();
    let maxDate = new Date(0);

    for (const dataName in filteredData) {
        for (const dataDate of filteredData[dataName]) {
            const date = new Date(dataDate);
            minDate = date < minDate ? date : minDate;
            maxDate = date > maxDate ? date : maxDate;
        }
    }

    let all_months = [];
    for (let date = new Date(minDate); date <= maxDate; date.setMonth(date.getMonth() + 1)) {
        all_months.push(date.getFullYear() + "-" + (date.getMonth() + 1).toString().padStart(2, '0'));
    }

    let keyNames = Object.keys(filteredData);
    
    for (let i = 0; i < keyNames.length; i++) {
        for (let j = i + 1; j < keyNames.length; j++) {
            let dataName1 = keyNames[i];
            let dataName2 = keyNames[j];
            
            // Créer un objet pour stocker les fréquences par mois pour chaque événement
            let datesMonth1 = {};
            let datesMonth2 = {};

            filteredData[dataName1].forEach(date => {
                const month = date.substring(0, 7);
                if (!datesMonth1[month]) {
                    datesMonth1[month] = [];
                }
                datesMonth1[month].push(date);
            });

            filteredData[dataName2].forEach(date => {
                const month = date.substring(0, 7);
                if (!datesMonth2[month]) {
                    datesMonth2[month] = [];
                }
                datesMonth2[month].push(date);
            });

            // Calculer la corrélation pour chaque mois où les deux événements se produisent
            const correlations = [];
            const labels = [];
            all_months.forEach(month => {
                let correlation = 0;
                if ((datesMonth2[month]) && (datesMonth1[month])) {
                    correlation = get_similarity(datesMonth1[month].map(date_str_to_num), datesMonth2[month].map(date_str_to_num));
                }
                correlations.push(correlation);
                labels.push(month);
            });

            let canvas = document.createElement('canvas');
            div_correlation_month.appendChild(canvas);

            new Chart(canvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Corrélation entre " + dataName1 + " et " + dataName2,
                        data: correlations,
                        fill: false,
                        borderColor: secondaryColor,
                        tension: 0.1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            min: 0,
                            max: 1
                        }
                    },
                }
            });
        }
    }
}









function update_statistics() {
    div_frequency_week.innerHTML = '';
    div_frequency_month.innerHTML = '';
    div_correlation_month.innerHTML = '';
    if (filteredData && Object.keys(filteredData).length > 0) {

        const frequency_weeks = calculate_frequency_week();
        display_frequency_week(frequency_weeks);

        const frequency_months = calculate_frequency_months();
        display_monthly_frequency_chart(frequency_months);

        display_correlation();
    }
}




optionsContainer.addEventListener('change', () => {
    update_statistics();
});