const choicesContainer = document.querySelector('.data-choices');
const legende = document.querySelector('.legende');
const container = document.getElementById('container');
const expand_more_icon = '<span class="material-symbols-outlined"> expand_more </span>';
const expand_less_icon = '<span class="material-symbols-outlined"> expand_less </span>';

const data_colors = ['data-red', 'data-blue', 'data-green', 'data-orange', 'data-purple']
const nom_mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
let filteredData;


function get_min_date(data) {
    let min_date = new Date();

    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            let tab = data[key];
            for (let i = 0; i < tab.length; i++) {
                let currentDate = new Date(tab[i]);
                if (currentDate < min_date) {
                    min_date = currentDate;
                }
            }
        }
    }
    return min_date;
}



function get_max_date(data) {
    let max_date = new Date(0);

    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            let tab = data[key];
            for (let i = 0; i < tab.length; i++) {
                let currentDate = new Date(tab[i]);
                if (currentDate > max_date) {
                    max_date = currentDate;
                }
            }
        }
    }
    return max_date;
}


function scroll_down() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth' 
    });
}

function scroll_up() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


function expand_or_reduce(localYearHeader, localYearBody) {
    let year = localYearHeader.getAttribute('data-year');
    localYearBody.classList.toggle('hidden');
    localYearHeader.innerHTML = year + (localYearBody.classList.contains('hidden') ? expand_more_icon : expand_less_icon);
}

function reduce_all() {
    let years = document.querySelectorAll('.year-body');
    years.forEach(year => {
        year.classList.add('hidden');
    });
    let headers = document.querySelectorAll('.year-header');
    headers.forEach(header => {
        let year = header.getAttribute('data-year');
        header.innerHTML = year + expand_more_icon;
    });
}

function expand_all() {
    let years = document.querySelectorAll('.year-body');
    years.forEach(year => {
        year.classList.remove('hidden');
    });
    let headers = document.querySelectorAll('.year-header');
    headers.forEach(header => {
        let year = header.getAttribute('data-year');
        header.innerHTML = year + expand_less_icon;
    });
}




function filterData(data, filter) {
    let filteredData = {};
    for (const dataType in data) {
        if (filter.hasOwnProperty(dataType) && (filter[dataType])) {
            filteredData[dataType] = data[dataType];
        }
    }
    return filteredData;
}



function add_choices(choiceNames) {
    choicesContainer.innerHTML = '';

    choiceNames.forEach((name) => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'choice';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = name;
        checkbox.value = name;

        const label = document.createElement('label');
        label.setAttribute('for', name);
        label.textContent = name;

        choiceDiv.appendChild(checkbox);
        choiceDiv.appendChild(label);

        choicesContainer.appendChild(choiceDiv);

        checkbox.addEventListener('change', () => {
            display_data();
        });
    });
}




function update_choices() {
    let filter = {};
    for (let i = 0; i < choicesContainer.children.length; i++) {
        const checkbox = choicesContainer.children[i].querySelector('input');
        const dataType = checkbox.value;
        filter[dataType] = checkbox.checked;
    }
    filteredData = filterData(parsedData, filter);
    update_statistics();
}



function refresh_calendar() {
    update_choices();
    create_calendar(filteredData);
    display_data();
}


function create_calendar(parsedData) {

    const calendar = document.querySelector('.calendar-body');
    calendar.innerHTML = '';
    let yearBody;

    // Créer un en-tête avec les jours de la semaine
    const daysOfWeek = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const weekHeader = document.createElement('div');
    weekHeader.className = 'week-header';
    daysOfWeek.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day-header';
        dayElement.textContent = day;
        weekHeader.appendChild(dayElement);
    });
    calendar.appendChild(weekHeader);
    var headerDiv = document.querySelector('.header').offsetHeight; // Remplace '.other-sticky-div' par le sélecteur approprié
    weekHeader.style.top = headerDiv + 'px';


    // déterminer la plage de dates
    const startDate = get_min_date(parsedData);
    const endDate = get_max_date(parsedData);

    let currentMonth = null;
    let currentYear = null;
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const dayNum = date.getDate().toString().padStart(2, '0');

        // Vérifie si l'année a changé
        if (year !== currentYear) {
            const yearContainer = document.createElement('div');
            yearContainer.className = 'year-container';
            calendar.appendChild(yearContainer);

            const yearHeader = document.createElement('div');
            yearHeader.className = 'year-header';
            yearHeader.innerHTML = year + expand_more_icon;
            yearHeader.setAttribute('data-year', year);
            yearContainer.appendChild(yearHeader);

            
            yearBody = document.createElement('div');
            yearBody.className = 'year-body hidden'; // RETIRER LE HIDDEN POUR MONTRER PAR DEFAUT
            yearContainer.appendChild(yearBody);
            
            // pour que les div soient enregistrées et pas overwrite
            (function(localYearBody, localYearHeader) {
                yearHeader.addEventListener('click', () => {
                    expand_or_reduce(localYearHeader, localYearBody);
                });
            })(yearBody, yearHeader);

            currentYear = year;
        }

        // Vérifie si le mois a changé
        if (month !== currentMonth) {
            const monthHeader = document.createElement('div');
            monthHeader.className = 'month-header';
            monthHeader.textContent = `${nom_mois[month - 1]} ${year}`;
            yearBody.appendChild(monthHeader);

            currentMonth = month;

            // Ajoute des cases vides au début du mois
            let dayOfWeek = date.getDay();
            let decallage = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

            for (let i = 0; i < decallage; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'day empty';
                yearBody.appendChild(emptyDay);
            }
        }

        const day = document.createElement('div');
        day.className = 'day';
        day.textContent = dayNum;
        day.setAttribute('data-date', `${year}-${month}-${dayNum}`);

        for (let i = 1; i <= 8; i++) {
            const point = document.createElement('div');
            point.className = "habit-point";
            day.appendChild(point);
        }

        yearBody.appendChild(day);
    }
}




function display_data() {

    let calendar = document.querySelector('.calendar');

    // vérification des checkbox, update de filteredData
    update_choices();

    // remettre tous les jours vierges
    let points = document.querySelectorAll('.habit-point');
    points.forEach(point => {
        point.classList = "habit-point";
    });

    // remettre la légende vierge
    legende.innerHTML = '';

    index = 0;
    for (let data in filteredData) {
        index += 1;
        
        filteredData[data].forEach(date => {
            const dayElement = calendar.querySelector(`.day[data-date="${date}"]`);
            if (dayElement) {
                let childToColor = dayElement.querySelector(`:nth-child(${index})`);
                childToColor.classList.add(data_colors[index - 1]);
            }
        });

        // ajout de la légende
        let legende_item = document.createElement('div');
        legende_item.textContent = data;
        legende_item.className = data_colors[index - 1];
        legende.appendChild(legende_item);
    }

}

document.addEventListener('DOMContentLoaded', () => {

    add_choices(Object.keys(parsedData));
    add_stats_options();
    
    // for (let input of ["debug"]) {
    //     const input_div = document.querySelector(`input[value="${input}"]`);
    //     input_div.checked = true;
    // }

    create_calendar(parsedData);
    display_data();

    title = document.querySelector('.title');
    title.addEventListener('click', () => {
        // uncheck all
        let checkboxes = document.querySelectorAll('.choice input');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        display_data();
    });
});