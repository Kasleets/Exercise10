// Global variables
const btn = document.getElementById('generateBtn1');
const input = document.getElementById('element');
const output = document.getElementById('output');
const loading = document.getElementById('loading');
const suggestionList = document.getElementById('suggestionList');


// Create a fixed number of list items upfront
for (let i = 0; i < 5; i++) {
    let suggestionItem = document.createElement('li');
    suggestionList.appendChild(suggestionItem);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    btn.addEventListener('click', logPeople);
    input.addEventListener('input', debounce(autoCompleteSuggestion, 300));  // 300ms delay
});

// Hide suggestions when clicking outside of input or suggestion list
document.addEventListener('click', (event) => {
    if (!input.contains(event.target) && !suggestionList.contains(event.target)) {
        hideAutoCompleteSuggestions();
    }
});
// Hide suggestions when pressing escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        hideAutoCompleteSuggestions();
    }
});



// Async function to fetch character data
async function logPeople() {
    loading.style.display = 'block';
    const characterName = input.value.trim();
    if (!characterName || characterName.length > 50) {
        alert('Please enter a valid character name');
        loading.style.display = 'none';
        return;
    }

    const url = "https://www.swapi.tech/api/people/?name=" + characterName;
    try {       
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error: " + response.statusText);

        const data = await response.json();

        if (data && data.result && data.result.length > 0) {
            const character = data.result[0].properties;
            const outputStr = [
                "Name: " + character.name,
                "Height: " + character.height,
                "Mass: " + character.mass,
                "Gender: " + character.gender,
                "Hair Color: " + character.hair_color
            ].join('\n');
            output.value = outputStr;
        }         
        else {
            output.value = 'Character not found, please try again';
        }
    } catch (err) {
        console.error(err);
        output.value = 'An error occurred';
    } 
    finally {
        loading.style.display = 'none';
    }
}



// Autocomplete suggestion
async function autoCompleteSuggestion() {
    const characterName = input.value.trim();

    // Hide suggestions if input is empty or too long
    if (characterName.length < 3 || characterName.length > 20) {
        hideAutoCompleteSuggestions();
        return;
    }

    const url = "https://www.swapi.tech/api/people/?name=" + characterName;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error: " + response.statusText);

        const data = await response.json();
        if (data && data.result && data.result.length > 0) {
            const suggestions = data.result.map(result => result.properties.name);
            displayAutoCompleteSuggestions(suggestions);
        } 
        else {
            hideAutoCompleteSuggestions();
        }
    } 
    catch (err) {
        console.error(err);
        hideAutoCompleteSuggestions();
    }
}



function displayAutoCompleteSuggestions(suggestions) {
    const suggestionItems = suggestionList.children;

    for (let i = 0; i < suggestionItems.length; i++) {
        const suggestionItem = suggestionItems[i];
        if (suggestions[i]) {
            suggestionItem.textContent = suggestions[i];
            suggestionItem.style.display = 'block';
            suggestionItem.addEventListener('click', () => {
                input.value = suggestions[i];
                hideAutoCompleteSuggestions();
            });
        } 
        else {
            suggestionItem.style.display = 'none';
        }
    }

    suggestionList.style.display = suggestions.length > 0 ? 'block' : 'none';
    suggestionList.style.position = 'absolute';
    suggestionList.style.top = input.offsetTop + input.offsetHeight + 'px';
    suggestionList.style.left = input.offsetLeft + 'px';
}



function hideAutoCompleteSuggestions() {
    suggestionList.style.display = 'none';
}



// Debounce function to limit API calls and reduce the jittery effect from the suggestion list
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
