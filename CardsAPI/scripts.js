// Global constants
const drawBtn = document.getElementById('drawBtn');
const cardContainer = document.getElementById('cardContainer');
const imgElement = document.createElement('img');
const loadingIndicator = document.getElementById('loadingIndicator');
const previousCardsContainer = document.getElementById('previousCardsContainer');
const shuffleBtn = document.getElementById('shuffleBtn');
const countElement = document.getElementById('count');
const toggleBtn = document.getElementById('toggleBtn');
const cardBackUrl = 'https://deckofcardsapi.com/static/img/back.png'; 

// Global variables 
let loadingTimeout;
let deckId = null;
let cardCount = 0;
let previousCards = [];
let cardFrontUrl = '';  
let isCardBackVisible = false;


// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    drawBtn.addEventListener('click', drawCard);
    shuffleBtn.addEventListener('click', shuffleCards); 
    toggleBtn.addEventListener('click', toggleCardBack);
    setPlaceholder();  
});

// Loading indicator
function setLoading(loading) {
    // Clear any existing timeout
    clearTimeout(loadingTimeout);  
    if (loading) {

        // Set a timeout to show the loading indicator after 2 seconds
        loadingTimeout = setTimeout(() => {
            Swal.fire({
                title: 'Please wait...',
                html: 'Asking the dealer for the cards...',
                onBeforeOpen: () => {
                    Swal.showLoading();
                }
            });
        // 2000 = 2 second delay
        }, 2000);  
    } 
    
    else {
        // If loading is done, clear the timeout and close the popup
        clearTimeout(loadingTimeout);
        Swal.close();
    }
}


// Function to set the placeholder
function setPlaceholder() {
    cardContainer.innerHTML = 'Draw me!';
    cardContainer.style.border = '2px dashed #ccc';
}


// Function to display the previous cards
function displayPreviousCards() {
    
    previousCardsContainer.innerHTML = '';              // Clear any existing cards
    previousCards.forEach(cardUrl => {
        const imgElement = document.createElement('img');
        imgElement.setAttribute('src', cardUrl);
        imgElement.style.width = '80px';                // Set a smaller width for previous cards
        previousCardsContainer.appendChild(imgElement);
    });
}


// Function to toggle the card back
function toggleCardBack() {

 //   console.log('toggleCardBack called');             // Debugging line
 //   console.log('cardFrontUrl:', cardFrontUrl);       // Debugging line

    if (isCardBackVisible) {
        imgElement.setAttribute('src', cardFrontUrl);
        toggleBtn.innerText = "Show card's back";       // Update the button text
    } else {
        imgElement.setAttribute('src', cardBackUrl);
        toggleBtn.innerText = "Show card's front";      // Update the button text
    }
    isCardBackVisible = !isCardBackVisible;             // Toggle the variable for next click
}


// Function to update the card count display
function updateCardCount() {
    countElement.textContent = cardCount;
}

// Async function to draw a card
async function drawCard() {

    if (deckId == null || cardCount >= 52) {
        // Prompt for user to shuffle if deckId is null or all cards have been drawn
        await Swal.fire({
            icon: 'info',
            title: 'Shuffle Required',
            text: 'Please shuffle the deck before drawing a card.'
        });
        return;
    }

    setLoading(true);
    const url = `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`;

    try {       
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error: " + response.statusText);

        const data = await response.json();

        if (data && data.cards && data.cards.length > 0) {

            cardCount++;  // Increment the card count to keep track of how many cards have been drawn
            updateCardCount();

            const cardImage = data.cards[0].image;
            displayCard(cardImage);

            isCardBackVisible = false;  // Reset the card back toggle
            toggleBtn.innerText = "Show card's back";  // Reset the button text
            
            // Add the card to the previousCards array
            previousCards.unshift(cardImage); //push or unshift
            // Remove the oldest card
            if (previousCards.length > 5) {
                previousCards.pop();
            }
            // Display the previous cards
            displayPreviousCards();

        } else {
            Swal.fire('No cards drawn. Please try again.');
        }
    } catch (err) {
        console.error(err);
        await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!'
    });
    } 
    setLoading(false);
}



// Shuffle cards
async function shuffleCards() {
    setLoading(true);
    const url = "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1";
    try {       
        const response = await fetch(url);

        if (!response.ok) throw new Error("Network error: " + response.statusText);
        
        const data = await response.json();

        if (data && data.deck_id) {
            // Store the deck ID for global use
            deckId = data.deck_id; {
                deckId = data.deck_id;
                cardCount = 0;
                updateCardCount();
            }
            await Swal.fire({
                title: 'Deck Shuffled',
                text: 'Deck ID: ' + deckId,
                icon: 'success',
                confirmButtonText: 'Okay'
            });
            // Placeholder replaces the card image to start fresh
            setPlaceholder();
        } else {
            await Swal.fire('No cards drawn. Please try again.');
        }
    } catch (err) {
        console.error(err);
        await Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong!'
    });
    } 
    setLoading(false);
}



// Display card image
function displayCard(imageUrl) {
    cardFrontUrl = imageUrl;  // Store the card front URL for toggling the card back
    imgElement.setAttribute('src', imageUrl);
    cardContainer.innerHTML = '';
    cardContainer.style.border = 'none';  
    cardContainer.style.lineHeight = 'initial';  
    cardContainer.appendChild(imgElement);
}

