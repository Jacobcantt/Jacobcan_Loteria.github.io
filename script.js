// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Konfiguracja Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAcw63opkkCEr44dafnWMGf-7N9tzVepxE",
    authDomain: "login-page-e09ea.firebaseapp.com",
    projectId: "login-page-e09ea",
    storageBucket: "login-page-e09ea.appspot.com",
    messagingSenderId: "966052546550",
    appId: "1:966052546550:web:c2db5ee2b2222e6a25a9d7",
    measurementId: "G-H36NM4MTRF"
};

// Inicjalizacja Firebase i Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const accessCode = 'JC8GH5OPL4F0';
const igFollowers = 178;
const validNicknames = ['czupryniakk', 'nadia'];
const wordleWords = ['rower', 'drzwi', 'jacob', 'ekran', 'palec'];
let wordleSolution = wordleWords[Math.floor(Math.random() * wordleWords.length)];

// Funkcja do sprawdzenia, czy użytkownik już brał udział
async function checkUserParticipation() {
    const ip = await getUserIP();
    const participant = localStorage.getItem(ip);

    if (participant) {
        alert("Już wziąłeś udział w konkursie!");
        document.body.innerHTML = "";
        return true;
    } else {
        const usersQuery = query(collection(db, "users"), where("ip", "==", ip));
        const querySnapshot = await getDocs(usersQuery);
        if (!querySnapshot.empty) {
            alert("Już wziąłeś udział w konkursie!");
            localStorage.setItem(ip, JSON.stringify({ participated: true }));
            document.body.innerHTML = "";
            return true;
        }
    }
    return false;
}

// Sprawdzenie kodu dostępu
async function checkAccessCode() {
    if (await checkUserParticipation()) return;

    const inputCode = document.getElementById('access-code').value;
    if (inputCode === accessCode) {
        showSection('question1');
    } else {
        alert("Niepoprawny kod!");
        await markAsParticipated();
        location.reload();
    }
}

// Sprawdzenie liczby obserwujących na IG
async function checkIGFollowers() {
    if (await checkUserParticipation()) return;

    const inputFollowers = parseInt(document.getElementById('ig-followers').value);
    if (inputFollowers === igFollowers) {
        showSection('question2');
    } else {
        alert("Niepoprawna liczba obserwujących!");
        await markAsParticipated();
        location.reload();
    }
}

// Sprawdzenie nicku dziewczyny
async function checkGirlNick() {
    if (await checkUserParticipation()) return;

    const inputNick = document.getElementById('girl-nick').value.trim();

    if (validNicknames.includes(inputNick)) {
        showSection('question3');
        initMemoryGame();  // Zainicjalizuj grę Memory
    } else {
        alert("Niepoprawny nick!");
        await markAsParticipated();
        location.reload();
    }
}

// Inicjalizacja gry Memory
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

        card.appendChild(backFace);  // Dodajemy najpierw tylną stronę
        card.appendChild(frontFace); // Następnie przednią stronę
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
            showSection('wordle-game');  // Przejście do gry Wordle po ukończeniu gry Memory
            initWordleGame();  // Zainicjalizuj grę Wordle
        }
    }

    document.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', flipCard));
    restartBtn.addEventListener('click', initMemoryGame);
}

// Inicjalizacja gry Wordle
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
            showSection('final-task');
        } else if (attempts === maxAttempts) {
            alert(`Przegrałeś! Poprawne słowo to: ${wordleSolution}`);
            initWordleGame();  // Automatyczny restart gry po porażce
        }
    };

    wordleRestartBtn.onclick = () => {
        initWordleGame();
    };
}

// Funkcja do zapisywania nicku do Firestore
async function saveUserToFirestore(tiktokNick) {
    const ip = await getUserIP();
    try {
        const docRef = await addDoc(collection(db, "users"), {
            tiktokNick: tiktokNick,
            ip: ip
        });
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

// Funkcja do oznaczania użytkownika jako uczestnika
async function markAsParticipated() {
    const ip = await getUserIP();
    localStorage.setItem(ip, JSON.stringify({ participated: true }));
    await saveUserToFirestore("invalid_attempt"); // Opcjonalnie można zapisać jako "invalid_attempt"
}

/* Funkcja do wysyłania końcowego zadania
async function submitFinalTask() {
    const tiktokNick = document.getElementById('tiktok-nick').value;
    const ip = await getUserIP();
    localStorage.setItem(ip, JSON.stringify({ tiktokNick }));
    await saveUserToFirestore(tiktokNick); // Zapis do Firestore
    alert("Brawo! Czekam na twoją wiadomość!");
    location.reload();
}*/

// Funkcja do zmiany widoczności sekcji
function showSection(sectionId) {
    const sections = document.querySelectorAll('.screen');
    sections.forEach(section => section.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

// Inicjalizacja strony
document.addEventListener('DOMContentLoaded', async () => {
    if (await checkUserParticipation()) return;

    // Dodanie event listenerów
    document.getElementById('access-code-btn').addEventListener('click', checkAccessCode);
    document.getElementById('ig-followers-btn').addEventListener('click', checkIGFollowers);
    document.getElementById('girl-nick-btn').addEventListener('click', checkGirlNick);
    //document.getElementById('final-task-btn').addEventListener('click', submitFinalTask);
});

// Funkcja do pobierania IP użytkownika
async function getUserIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}
