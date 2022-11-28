/** GLOBAL VARIABLES */

const starterTags =['Musiikki', 'music', 'concerts', 'Concerts and clubs', 'Teatteri', 'theatre', 'Tanssi', 'dance (performing arts)', 'Näyttelyt', 'exhibitions', 'Elokuvat', 'cinema (art forms)'];
const filteredValues = [];
let encodedSearchStr = "";
let shownItemsCount = 10;
let currentEventIndex = 0; 
let amountOfEventsFound = 0;


const showPageInfo = () => {    // Shows the numbers of shown items out of the total amount
    const info = document.getElementById('page-info');
    if (currentEventIndex + 1 + shownItemsCount < amountOfEventsFound) {
    info.innerHTML = `Näytetään: ${currentEventIndex + 1} - ${currentEventIndex + shownItemsCount} / ${amountOfEventsFound}`;
    } else {
        info.innerHTML = `Näytetään: ${currentEventIndex + 1} - ${amountOfEventsFound} / ${amountOfEventsFound}`;   
    }
};

function toggleSelectedFilter() {   // Toggles styling for selected filter
    this.classList.toggle('button-selected');
};

const starterButtons = document.querySelectorAll('.starter-tag-btn');
for (button of starterButtons) {    // Gives functionality to the starter filter buttons on top of the page
    button.addEventListener('click', addToFilters);
    button.addEventListener('click', toggleSelectedFilter);
    button.addEventListener('click', fetchData);
};

const moveHighlight = (direction = null) => {   // Moves the page index highlight when switching pages with arrows
    const index = document.querySelector('.selection-highlight'); 
    index.classList.remove('selection-highlight');
    if (direction === 'prev') {
        index.previousElementSibling.classList.add('selection-highlight');   
    } else {
        index.nextElementSibling.classList.add('selection-highlight');
    };  
};

document.getElementById('prev-page').addEventListener('click', () => {  // Functionality for moving to previous result page
    if(currentEventIndex > 0){
        currentEventIndex = currentEventIndex - shownItemsCount;
        showData(currentEventIndex);
        showPageInfo();
        moveHighlight('prev');
        document.getElementById('event-list').scrollTop = 0;
    };
});

document.getElementById('next-page').addEventListener('click', () => {  // Funcionality for moving to next result page
    if(amountOfEventsFound - currentEventIndex > shownItemsCount){
        currentEventIndex = currentEventIndex + shownItemsCount;
        showData(currentEventIndex);
        showPageInfo();
        moveHighlight();
        document.getElementById('event-list').scrollTop = 0;
    };
});

const checkIfContent = () => {      // Checks if the search result div has content on it and shows the related site functions if there are results. Else hides elements and shows guide text
    const guide = document.getElementById('guide-text');

    const pageSelector = document.getElementById('page-selector');
    const tagList = document.getElementById('tag-list');
    if (filteredValues.length > 0) {
        guide.classList.add('hidden');

        pageSelector.classList.remove('hidden');
        tagList.classList.remove('hidden');
    };
    if (filteredValues.length === 0) {
        guide.classList.remove('hidden');

        pageSelector.classList.add('hidden');
        tagList.classList.add('hidden');
    };
};

function higlightSelection() {  // Highlights the current page index
    const indices = document.querySelectorAll('.page-index');
    for (index of indices) {
        index.classList.remove('selection-highlight');
    };
    this.classList.add('selection-highlight');
};

/** ELEMENT CREATION */

const selector = document.getElementById('pages');

const appendPageSelector = () => {      // Adds page indices for paginated search results           
    let pagesNeeded = Math.ceil(amountOfEventsFound/shownItemsCount);
    selector.innerHTML = "";
    for (var i = 0; i < pagesNeeded; i++) {
        createPageIndex(i);    
    };
};

const createPageIndex = index => {      // Creates the individual link anchor tagged buttons for the pages
    newPage = document.createElement('a');
    newPage.setAttribute('href', "javascript: void(0)");
    newPage.setAttribute('title', "select page of listed events");
    if (index === 0) {
        newPage.className = ('page-index selection-highlight');
    } else { newPage.className =  ('page-index')};
    newPage.innerHTML = index + 1;
    newPage.addEventListener('click',() => showData(index * shownItemsCount));
    newPage.addEventListener('click', showPageInfo);
    newPage.addEventListener('click', higlightSelection);
    newPage.addEventListener('click', () => document.getElementById('event-list').scrollTop = 0);
    selector.appendChild(newPage);
};

const appendFilterButton = (tagName) => {   // Creates the filter button 
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

const removeFilterButtons = () => {     // Removes filter buttons whose values don't match values in currently selected filters
    const buttons = document.querySelectorAll('.tag-btn');
    for (button of buttons) {
        if (!filteredValues.includes(button.value)) {
        button.remove();
        };
    };
};

const addFilterButton = (tagArr) => {   // Adds new filter buttons according to the result events' filter tags
    removeFilterButtons();  // Removes all unneeded buttons first so there will be no duplicates
    for (tag in tagArr) {
        if (!filteredValues.includes(tagArr[tag]) && !starterTags.includes(tagArr[tag])) {
            appendFilterButton(tagArr[tag]);    // Creates new buttons
        };
    };
};

const createEventListing = event => {   // Creates the listing for a result and appends them to the site
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
};


/** DATA HANDLING */

const encodeStr = () => {   // Encodes the filtered tags for making the API call with the chosen tags
    let newStr = filteredValues.join(',');
    encodedSearchStr = encodeURIComponent(newStr);
};

function addToFilters() {       // Adds toggled tag button's value into array 'filteredValues', which is then converted to string that can be used in API call
    const tag = this.value;  
    if (filteredValues.includes(tag)) {
        const index = filteredValues.indexOf(tag);
    filteredValues.splice(index, 1);
    } else {
        filteredValues.push(tag);
        };  
    encodeStr();    // Encodes the filter tags
};

function displayData(response) {    // Displays the event data on the site after calling the API      
    const event = document.getElementById('event-list');
    event.innerHTML = "";
    const eventData = Object.values(response.data);
    if (eventData){
        const currentEvents = [];
        for (element of eventData) {
            const name = element.name.fi;
            currentEvents.push(name);
            createEventListing(element);    // Creates the listing
        };
    };
    checkIfContent();   // Content check to show hidden elements related to listings
};

function CountEvents(response) {    // Counts the amount of events found and appends the page selector according to the total amount and display amount setting
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
    appendPageSelector();   // Creates the page indices
    showPageInfo();
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
    addFilterButton(tagsOfSearchedEvents.sort());   // Adds the filter buttons in alphabetical order
};


/** API CALLS */

function fetchData() {      // Fetches the search data only with the filters, so all results can be counted and the tags extracted. This is done seperately, so that the tags shown on the page are of from all of the results and not only from the ones currently shown on the page.
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

function showData(index = 0) {      // Shows the search results according to tags, sets the limit of items shown on one page and the result index from which results are shown (for pagination)
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








 

