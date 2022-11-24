const starterTags =['Musiikki', 'Teatteri', 'Tanssi', 'Näyttelyt', 'Elokuvat'];
const filteredValues = [];
let encodedSearchStr = "";
let shownItemsCount = 10;
let currentEventIndex = 0; 
let amountOfEventsFound = 0;


const selector = document.getElementById('pages');
const appendPageSelector = () => {
    let pagesNeeded = Math.ceil(amountOfEventsFound/shownItemsCount);
    selector.innerHTML = "";
    for (var i = 0; i < pagesNeeded; i++) {
        createPageIndex(i);    
    };
};
const createPageIndex = index => {
    newPage = document.createElement('a');
    newPage.setAttribute('href', "javascript: void(0)");
    newPage.setAttribute('title', "select page of listed events");
    newPage.innerHTML = index + 1;
    newPage.addEventListener('click',() => showData(index * shownItemsCount));
    selector.appendChild(newPage);
};

const checkIfContent = () => {
    const guide = document.getElementById('guide-text');
    const itemLimit = document.getElementById('shown-item-limit');
    const pageSelector = document.getElementById('page-selector');
    const tagList = document.getElementById('tag-list');
    if (filteredValues.length > 0) {
        guide.classList.add('hidden');
        itemLimit.classList.remove('hidden');
        pageSelector.classList.remove('hidden');
        tagList.classList.remove('hidden');
    };
    if (filteredValues.length === 0) {
        guide.classList.remove('hidden');
        itemLimit.classList.add('hidden');
        pageSelector.classList.add('hidden');
        tagList.classList.add('hidden');
    };

};

function toggleSelectedFilter() {
    this.classList.toggle('button-selected');
};

const starterButtons = document.querySelectorAll('.starter-tag-btn');
for (button of starterButtons) {
    button.addEventListener('click', addToFilters);
    button.addEventListener('click', toggleSelectedFilter);
    button.addEventListener('click', fetchData);


};

document.getElementById('prev-page').addEventListener('click', () => {
    if(currentEventIndex > 0){
        showData(currentEventIndex - shownItemsCount);
    };
});

document.getElementById('next-page').addEventListener('click', () => {
    if(amountOfEventsFound - currentEventIndex > shownItemsCount){
        showData(currentEventIndex + shownItemsCount);
    };
});


const encodeStr = () => {   // Encodes the filtered tags for making the API call with the chosen tags
    let newStr = filteredValues.join(',');
    encodedSearchStr = encodeURIComponent(newStr);
}

function addToFilters() {       // Adds toggled tag button' value into array 'filteredValues', which is then converted to string that can be used in API call
    const tag = this.value;  
    if (filteredValues.includes(tag)) {
        const index = filteredValues.indexOf(tag);
    filteredValues.splice(index, 1);
    } else {
        filteredValues.push(tag);
        }   
    encodeStr();
}

const appendFilterButton = (tagName) => {
    newBtn = document.createElement('button');
    newBtn.className = "tag-btn";
    newBtn.setAttribute('name', 'tag');
    newBtn.setAttribute('value', tagName);
    newBtn.innerHTML = tagName;
    newBtn.addEventListener('click', addToFilters);
    newBtn.addEventListener('click', toggleSelectedFilter);
    newBtn.addEventListener('click', fetchData);

    document.getElementById('tag-list').appendChild(newBtn);

};

const removeFilterButtons = () => {
    const buttons = document.querySelectorAll('.tag-btn');
    for (button of buttons) {
        if (!filteredValues.includes(button.value)) {
        button.remove();
        };
    };
};

const addFilterButton = (tagArr) => {
    removeFilterButtons();
    for (tag in tagArr) {
        if (!filteredValues.includes(tagArr[tag]) && !starterTags.includes(tagArr[tag])) {
            appendFilterButton(tagArr[tag]);
        };
    };

};

const createEventListing = event => {
    const newListing = document.createElement('div');
    newListing.className = 'event-card flex flex-col';
    const heading = document.createElement('h3');
    heading.innerHTML = event.name.fi;
    const intro = document.createElement('p');
    intro.innerHTML = event.description.intro;
    const loc = document.createElement('p');
    loc.innerHTML = `${event.location.address.street_address} ${event.location.address.postal_code} ${event.location.address.locality}`;
    const date = document.createElement('p');
    const startDate = new Date(event.event_dates.starting_day);
    const endDate = new Date(event.event_dates.ending_day);
    date.innerHTML = `${startDate} - ${endDate}`;
    const url = document.createElement('a');
    url.setAttribute('href', event.info_url);
    url.innerHTML = event.info_url;
    const tags = document.createElement('p');
    const eventTags = event.tags;
    for (var i = 0; i < eventTags.length; i++) {
        tags.innerHTML += `${Object.values(eventTags)[i].name}, `;
    }
    newListing.appendChild(heading);
    newListing.appendChild(intro);
    newListing.appendChild(loc);
    newListing.appendChild(date);
    newListing.appendChild(url);
    newListing.appendChild(tags);
    document.getElementById('event-list').appendChild(newListing);
}

function displayData(response) {
    const event = document.getElementById('event-list');
    event.innerHTML = "";
    const eventData = Object.values(response.data);
    if (eventData){
        const currentEvents = [];
        for (element of eventData) {
            const name = element.name.fi;
            if (!currentEvents.includes(name)) {
                currentEvents.push(name);
                createEventListing(element);

            };
        };
    };
    checkIfContent();
};

function CountEvents(response) {
    amountOfEventsFound = 0;
    const eventData = Object.values(response.data);
    if (eventData){
        const currentEvents = [];
        for (element of eventData) {
            const name = element.name.fi;
            if (!currentEvents.includes(name)) {
                currentEvents.push(name);
                amountOfEventsFound += 1;
            };
        };
    };

    appendPageSelector();

};

const getTags = (response) => {     // Gets the tags from all the events after filtering
    const tagsOfSearchedEvents = [];
    const eventEntries = Object.values(response.data);
    for (entry of eventEntries) {
        const tagList = Object.values(entry.tags);
        for (tag of tagList) {
            if (!tagsOfSearchedEvents.includes(tag.name)) {
                tagsOfSearchedEvents.push(tag.name);
            };
        };
    };
    addFilterButton(tagsOfSearchedEvents.sort());
};

function changeShownItemCount() {  
    shownItemsCount = this.value;
    fetchData();
    showData();
};

document.getElementById('show-10').addEventListener('click', changeShownItemCount);
document.getElementById('show-25').addEventListener('click', changeShownItemCount);
document.getElementById('show-50').addEventListener('click', changeShownItemCount);


function fetchData() {
    const getEvents = new XMLHttpRequest;
    getEvents.open('GET', `https://open-api.myhelsinki.fi/v1/events/?tags_filter=${encodedSearchStr}`, true);

    getEvents.onload = function count() {
        if (this.status == 200) {
            const res = JSON.parse(this.response);
            CountEvents(res);
            getTags(res);
        };        
    };
    getEvents.send();
    showData();

};


function showData(index = 0) {
    const xhr = new XMLHttpRequest;
    xhr.open('GET', `https://open-api.myhelsinki.fi/v1/events/?tags_filter=${encodedSearchStr}&limit=${shownItemsCount}&start=${index}`, true);
    xhr.onload = function show() {
        if (this.status == 200) {
            const res = JSON.parse(this.response);
            displayData(res);
        };        
    };
    currentEventIndex = index;
    xhr.send();

};








 

