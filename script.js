import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAcw63opkkCEr44dafnWMGf-7N9tzVepxE",
    authDomain: "login-page-e09ea.firebaseapp.com",
    projectId: "login-page-e09ea",
    storageBucket: "login-page-e09ea.appspot.com",
    messagingSenderId: "966052546550",
    appId: "1:966052546550:web:c2db5ee2b2222e6a25a9d7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const gameDiv = document.getElementById('game');
    const resultDiv = document.getElementById('result');
    const taskListDiv = document.getElementById('taskList');
    const logos = document.querySelectorAll('.logo');
    const correctPassword = 'kuba'; // Zmień to na swoje hasło
    const winnerProbability = 0.9;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const phoneNumber = document.getElementById('phoneNumber').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (password !== correctPassword) {
            alert('Nieprawidłowe hasło.');
            return;
        }

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("phoneNumber", "==", phoneNumber), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(usersRef, { phoneNumber, email });
            gameDiv.classList.remove('hidden');
        } else {
            alert('Użytkownik o podanym numerze telefonu i adresie e-mail już istnieje.');
        }
    });

    function handleClick(event) {
        const selectedLogo = event.target;

        if (localStorage.getItem('gamePlayed')) {
            alert('Już raz grałeś. Odświeżenie strony nie pozwala na ponowne zagranie.');
            return;
        }

        const isWinner = Math.random() < winnerProbability;
        localStorage.setItem('gamePlayed', 'true');
        localStorage.setItem('gameResult', isWinner ? 'win' : 'lose');
        displayResult(selectedLogo, isWinner);

        // Dodaj animację obrotu
        selectedLogo.classList.add('rotate');
    }

    function displayResult(logo, isWinner) {
        resultDiv.classList.remove('hidden');
        taskListDiv.classList.remove('hidden');
        logos.forEach(logo => logo.removeEventListener('click', handleClick));

        logo.src = isWinner ? 'images/logo4-win.png' : 'images/logo4-lose.png';
        logo.classList.remove('logo');
        logo.classList.add('result-logo');

        if (isWinner) {
            resultDiv.textContent = 'Wygrana! Aby zdobyć nagrodę, wykonaj poniższe zadania:';
            taskListDiv.classList.remove('hidden');
        } else {
            resultDiv.textContent = 'Przegrana. Spróbuj ponownie.';
            taskListDiv.classList.add('hidden');
        }

        // Zapisz wynik do Firestore
        const phoneNumber = document.getElementById('phoneNumber').value;
        const email = document.getElementById('email').value;
        saveResultToFirestore(phoneNumber, email, isWinner);
    }

    async function saveResultToFirestore(phoneNumber, email, isWinner) {
        try {
            await addDoc(collection(db, "results"), {
                phoneNumber: phoneNumber,
                email: email,
                result: isWinner ? 'win' : 'lose',
                timestamp: new Date()
            });
            console.log("Wynik zapisany pomyślnie");
        } catch (e) {
            console.error("Błąd podczas zapisywania wyniku: ", e);
        }
    }

    logos.forEach(logo => {
        logo.addEventListener('click', handleClick);
    });
});
