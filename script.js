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
const igFollowers = 178;
const validNicknames = ['czupryniakk', 'nadia'];
const wordleWords = ['rower', 'drzwi', 'jacob', 'ekran', 'palec'];
let wordleSolution = wordleWords[Math.floor(Math.random() * wordleWords.length)];

// Function to check if the user has already participated based on Instagram URL
async function checkUserParticipation() {
    const instagramLink = document.getElementById('instagram-link').value.trim();
    
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

// Initialize Memory Game
function initMemoryGame() {
    const memoryBoard = document.getElementById('memory-board');
    const restartBtn = document.getElementById('restart-btn');
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

        card.appendChild(backFace);  // Add back face first
        card.appendChild(frontFace); // Then front face
        memoryBoard.appendChild(card);
    });

    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;

    function flipCard() {
        if (lockBoard) return;
        if (this === firstCard) return;

        this.classList.add('flipped');

        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
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
            alert('Gratulacje! Ukończyłeś grę Memory!');
            showSection('wordle-game');  // Proceed to Wordle game
            initWordleGame();  // Initialize Wordle Game
        }
    }

    document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', flipCard));
    restartBtn.addEventListener('click', initMemoryGame);
}

// Initialize Wordle Game
function initWordleGame() {
    const wordleBoard = document.getElementById('wordle-board');
    const wordleGuessInput = document.getElementById('wordle-guess');
    const wordleSubmitBtn = document.getElementById('wordle-submit-btn');
    const wordleRestartBtn = document.getElementById('wordle-restart-btn');

    wordleBoard.innerHTML = '';
    wordleSolution = wordleWords[Math.floor(Math.random() * wordleWords.length)];
    let attempts = 0;
    const maxAttempts = 6;

    wordleSubmitBtn.onclick = () => {
        const guess = wordleGuessInput.value.toLowerCase();
        if (guess.length !== 5) {
            alert("Słowo musi mieć 5 liter!");
            return;
        }

        attempts++;
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
            showSection('mini-store');  // Proceed to Mini Store after Wordle
        } else if (attempts === maxAttempts) {
            alert(`Przegrałeś! Poprawne słowo to: ${wordleSolution}`);
            initWordleGame();  // Auto-restart Wordle game after failure
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
        showSection('final-task'); // Proceed to the final task
    } else {
        alert("Użytkownik nie został znaleziony.");
    }
}

// Save user to Firestore
async function saveUserToFirestore(instagramLink) {
    try {
        const docRef = await addDoc(collection(db, "users"), {
            instagramLink: instagramLink,
            cart: [] // Initialize with an empty cart
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

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    // Add event listeners
    document.getElementById('access-code-btn').addEventListener('click', checkAccessCode);
    document.getElementById('ig-followers-btn').addEventListener('click', checkIGFollowers);
    document.getElementById('girl-nick-btn').addEventListener('click', checkGirlNick);
});
