// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAcw63opkkCEr44dafnWMGf-7N9tzVepxE",
    authDomain: "login-page-e09ea.firebaseapp.com",
    projectId: "login-page-e09ea",
    storageBucket: "login-page-e09ea.appspot.com",
    messagingSenderId: "966052546550",
    appId: "1:966052546550:web:c2db5ee2b2222e6a25a9d7",
    measurementId: "G-H36NM4MTRF"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const accessCode = 'JC8GH5OPL4F0';
const igFollowers = 184;
const validNicknames = ['czupryniakk', 'nadia'];
const wordleWords = ['rower', 'drzwi', 'jacob', 'ekran', 'palec'];
let wordleSolution = wordleWords[Math.floor(Math.random() * wordleWords.length)];
let wordleAttempts = 0; 
let wordleGuesses = 0; 
let memoryAttempts = 0; 
let memoryTimer; 

// Redirect to start page function
function redirectToStart() {
    alert("Przekroczono limit prób. Powrót do strony początkowej.");
    location.reload(); 
}

// Function to handle Enter key submission
function enableEnterKeySubmission(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            button.click(); 
        }
    });
}

// Apply the Enter key submission to all relevant inputs
enableEnterKeySubmission('access-code', 'access-code-btn');
enableEnterKeySubmission('instagram-link', 'access-code-btn');
enableEnterKeySubmission('ig-followers', 'ig-followers-btn');
enableEnterKeySubmission('girl-nick', 'girl-nick-btn');
enableEnterKeySubmission('wordle-guess', 'wordle-submit-btn');

// Function to check if the user has already participated based on Instagram URL
async function checkUserParticipation() {
    const instagramLink = document.getElementById('instagram-link').value.trim();

    // Validate the Instagram link
    const instagramPattern = /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._-]+\/?$/;
    if (!instagramPattern.test(instagramLink)) {
        alert("Proszę wpisać poprawny link do profilu Instagram.");
        return true; // Prevent further action if link is invalid
    }
    
    const usersQuery = query(collection(db, "users"), where("instagramLink", "==", instagramLink));
    const querySnapshot = await getDocs(usersQuery);
    
    if (!querySnapshot.empty) {
        alert("Już wziąłeś udział w konkursie!");
        document.body.innerHTML = "";
        return true;
    }
    return false;
}

// Function to verify the access code and proceed to the first question
async function checkAccessCode() {
    // Tymczasowa blokada udziału w konkursie
    alert("Konkurs rozpoczyna się 13.09.2k24 o 19:00. Spróbuj później!");
    return;

    if (await checkUserParticipation()) return;

    const inputCode = document.getElementById('access-code').value;
    const instagramLink = document.getElementById('instagram-link').value.trim();
    if (inputCode === accessCode) {
        await saveUserToFirestore(instagramLink);
        showSection('question1');
    } else {
        alert("Niepoprawny kod!");
        location.reload();
    }
}


// Function to check the number of Instagram followers
async function checkIGFollowers() {
    const inputFollowers = parseInt(document.getElementById('ig-followers').value);
    if (inputFollowers === igFollowers) {
        showSection('question2');
    } else {
        alert("Niepoprawna liczba obserwujących!");
        location.reload();
    }
}

// Function to check the girl's nickname
async function checkGirlNick() {
    const inputNick = document.getElementById('girl-nick').value.trim();

    if (validNicknames.includes(inputNick)) {
        showSection('question3');
        initMemoryGame();  // Initialize Memory Game
    } else {
        alert("Niepoprawny nick!");
        location.reload();
    }
}

// Initialize Memory Game with Timer and Attempt Limitation
function initMemoryGame() {
    const memoryBoard = document.getElementById('memory-board');
    const restartBtn = document.getElementById('restart-btn');
    const timerDisplay = document.getElementById('memory-timer');
    
    // Clear previous game state and remove duplicate timers
    if (timerDisplay) timerDisplay.remove();
    clearInterval(memoryTimer);

    const cardArray = [
        { name: 'J', img: 'J' },
        { name: 'A', img: 'A' },
        { name: 'C', img: 'C' },
        { name: 'O', img: 'O' },
        { name: 'B', img: 'B' },
        { name: 'C', img: 'C' },
        { name: 'A', img: 'A' },
        { name: 'N', img: 'N' },
        { name: 'J', img: 'J' },
        { name: 'A', img: 'A' },
        { name: 'C', img: 'C' },
        { name: 'O', img: 'O' },
        { name: 'B', img: 'B' },
        { name: 'C', img: 'C' },
        { name: 'A', img: 'A' },
        { name: 'N', img: 'N' }
    ];
    cardArray.sort(() => 0.5 - Math.random());

    while (memoryBoard.firstChild) {
        memoryBoard.removeChild(memoryBoard.firstChild);
    }

    cardArray.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('memory-card');
        card.dataset.name = item.name;

        const frontFace = document.createElement('div');
        frontFace.classList.add('front-face');
        frontFace.textContent = item.img;

        const backFace = document.createElement('div');
        backFace.classList.add('back-face');
        backFace.textContent = '?';

        card.appendChild(backFace);  
        card.appendChild(frontFace); 
        memoryBoard.appendChild(card);
    });

    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let timerStarted = false;

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;

            if (!timerStarted) {
                startMemoryTimer();
                timerStarted = true;
            }
            return;
        }

        secondCard = this;
        lockBoard = true;

        checkForMatch();
    }

    function checkForMatch() {
        if (firstCard.dataset.name === secondCard.dataset.name) {
            disableCards();
            return;
        }

        unflipCards();
    }

    function disableCards() {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        resetBoard();
    }

    function unflipCards() {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');

            resetBoard();
        }, 800);
    }

    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
        checkMemoryCompletion();
    }

    function checkMemoryCompletion() {
        const allCards = document.querySelectorAll('.memory-card');
        const flippedCards = document.querySelectorAll('.memory-card.flipped');

        if (allCards.length === flippedCards.length) {
            clearInterval(memoryTimer);
            alert('Gratulacje! Ukończyłeś grę Memory!');
            showSection('wordle-game');  
            initWordleGame();  
        }
    }

    function startMemoryTimer() {
        const timerDisplay = document.createElement('div');
        timerDisplay.id = 'memory-timer';
        document.getElementById('memory-game-container').appendChild(timerDisplay);

        let timeLeft = 40; 
        memoryTimer = setInterval(() => {
            timerDisplay.textContent = `Pozostały czas: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(memoryTimer);
                memoryAttempts++;
                if (memoryAttempts >= 2) {
                    redirectToStart(); 
                } else {
                    alert("Czas się skończył! Spróbuj ponownie.");
                    initMemoryGame(); 
                }
            }
            timeLeft--;
        }, 1000);
    }

    document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', flipCard));
    restartBtn.addEventListener('click', initMemoryGame);
}

// Initialize Wordle Game with Attempt Limitation
function initWordleGame() {
    const wordleBoard = document.getElementById('wordle-board');
    const wordleGuessInput = document.getElementById('wordle-guess');
    const wordleSubmitBtn = document.getElementById('wordle-submit-btn');
    const wordleRestartBtn = document.getElementById('wordle-restart-btn');
    let attemptsDisplay = document.getElementById('wordle-attempts');

    if (!attemptsDisplay) {
        // Create the display element only if it doesn't already exist
        attemptsDisplay = document.createElement('div');
        attemptsDisplay.id = 'wordle-attempts';
        wordleBoard.parentElement.appendChild(attemptsDisplay);
    }

    wordleBoard.innerHTML = '';
    wordleSolution = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    wordleGuesses = 0;

    const updateAttemptsDisplay = () => {
        attemptsDisplay.textContent = `Pozostałe gry: ${2 - wordleAttempts}, Pozostałe próby: ${6 - wordleGuesses}`;
    };
    updateAttemptsDisplay(); // Initial display

    wordleSubmitBtn.onclick = () => {
        const guess = wordleGuessInput.value.toLowerCase();
        if (guess.length !== 5) {
            alert("Słowo musi mieć 5 liter!");
            return;
        }

        wordleGuesses++;
        const row = document.createElement('div');
        row.classList.add('wordle-row');

        for (let i = 0; i < 5; i++) {
            const cell = document.createElement('div');
            cell.classList.add('wordle-cell');
            cell.textContent = guess[i];
            if (guess[i] === wordleSolution[i]) {
                cell.classList.add('correct');
            } else if (wordleSolution.includes(guess[i])) {
                cell.classList.add('present');
            } else {
                cell.classList.add('absent');
            }
            row.appendChild(cell);
        }

        wordleBoard.appendChild(row);
        wordleGuessInput.value = '';

        if (guess === wordleSolution) {
            alert("Gratulacje! Odgadłeś słowo!");
            wordleAttempts++;
            showSection('mini-store'); 
        } else if (wordleGuesses === 6) {
            alert(`Przegrałeś! Poprawne słowo to: ${wordleSolution}`);
            wordleAttempts++;
            if (wordleAttempts >= 2) {
                redirectToStart(); 
            } else {
                alert("Rozpocznij nową grę Wordle!");
                initWordleGame();
            }
        } else {
            updateAttemptsDisplay(); // Update display after each guess
        }
    };

    wordleRestartBtn.onclick = () => {
        initWordleGame();
    };
}


// Mini Store Functionality
let cart = {};
let totalPoints = 20;

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', () => {
            const product = button.dataset.product;
            const price = parseInt(button.dataset.price);
            addToCart(product, price);
        });
    });

    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', () => {
            const product = button.dataset.product;
            const price = parseInt(button.dataset.price);
            removeFromCart(product, price);
        });
    });

    document.getElementById('save-cart-btn').addEventListener('click', saveCart);
});

function addToCart(product, price) {
    if (!cart[product]) {
        cart[product] = 0;
    }
    if (totalPoints - price >= 0) {
        cart[product]++;
        totalPoints -= price;
        document.getElementById('total-points').textContent = totalPoints;
        updateCartDisplay();
    } else {
        alert("Nie masz wystarczająco punktów.");
    }
}

function removeFromCart(product, price) {
    if (cart[product] > 0) {
        cart[product]--;
        totalPoints += price;
        document.getElementById('total-points').textContent = totalPoints;
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    for (const product in cart) {
        if (cart[product] > 0) {
            const item = document.createElement('li');
            item.textContent = `${product}: ${cart[product]}`;
            cartItems.appendChild(item);
        }
    }
}

// Function to save the cart to Firestore under the user's document
async function saveCart() {
    const instagramLink = document.getElementById('instagram-link').value.trim();
    const userCart = [];

    for (const product in cart) {
        if (cart[product] > 0) {
            userCart.push({ product: product, quantity: cart[product] });
        }
    }

    const userQuery = query(collection(db, "users"), where("instagramLink", "==", instagramLink));
    const querySnapshot = await getDocs(userQuery);
    
    if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userRef = doc(db, "users", userDoc.id);
        await updateDoc(userRef, {
            cart: userCart
        });
        alert("Koszyk zapisany!");
        showSection('final-task'); 
    } else {
        alert("Użytkownik nie został znaleziony.");
    }
}

// Save user to Firestore
async function saveUserToFirestore(instagramLink) {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            instagramLink: instagramLink,
            cart: [] 
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Change section visibility
function showSection(sectionId) {
    const sections = document.querySelectorAll('.screen');
    sections.forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// Existing JavaScript Code
// ... existing JavaScript code ...

// Particle Configuration
const particleConfig = {
    particles: {
        number: { value: 100 },
        size: { value: 3 },
        move: { speed: 1 }
    },
    interactivity: {
        events: {
            onhover: { enable: true, mode: "repulse" }
        }
    }
};

// Load particles.js with particle configuration
document.addEventListener('DOMContentLoaded', () => {
    particlesJS('particle-background', particleConfig);
    
    const logoAnimation = document.getElementById('logo-animation');
    const particleBackground = document.getElementById('particle-background');
    const container = document.getElementById('container');

    setTimeout(() => {
        logoAnimation.style.display = 'none';
        particleBackground.style.display = 'none'; // Hide particle background
        container.classList.remove('hidden');
    }, 5000); // Wait for 5 seconds (3s animation + 2s fade out)
});

// Continue with existing initialization
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('access-code-btn').addEventListener('click', checkAccessCode);
    document.getElementById('ig-followers-btn').addEventListener('click', checkIGFollowers);
    document.getElementById('girl-nick-btn').addEventListener('click', checkGirlNick);
});

