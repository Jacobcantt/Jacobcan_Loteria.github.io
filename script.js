document.addEventListener('DOMContentLoaded', function() {
    const tiktokLink = document.getElementById('tiktokLink');
    const instagramLink = document.getElementById('instagramLink');
    const passwordInput = document.getElementById('password');
    const submitButton = document.getElementById('submitPassword');
    const gameDiv = document.getElementById('game');
    const resultDiv = document.getElementById('result');
    const taskListDiv = document.getElementById('taskList');
    const followersCountDiv = document.getElementById('followersCount');
    const tiktokFollowersSpan = document.getElementById('tiktokFollowers');
    const logos = document.querySelectorAll('.logo');
    const correctPassword = 'twoje_haslo'; // Zmień to na swoje hasło
    const winnerProbability = 0.9;
    let tiktokClicked = false;
    let instagramClicked = false;

    function checkPassword() {
        if (passwordInput.value === correctPassword) {
            gameDiv.classList.remove('hidden');
        } else {
            alert('Niepoprawne hasło');
        }
    }

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

        logo.src = isWinner ? 'logo4-win.png' : 'logo4-lose.png';
        logo.classList.remove('logo');
        logo.classList.add('result-logo');

        if (isWinner) {
            resultDiv.textContent = 'Wygrana! Aby zdobyć nagrodę, wykonaj poniższe zadania:';
            taskListDiv.classList.remove('hidden');
        } else {
            resultDiv.textContent = 'Przegrana. Spróbuj ponownie.';
            taskListDiv.classList.add('hidden');
        }
    }

    function init() {
        submitButton.addEventListener('click', checkPassword);

        if (localStorage.getItem('gamePlayed')) {
            const gameResult = localStorage.getItem('gameResult');
            const isWinner = gameResult === 'win';

            logos.forEach((logo, index) => {
                if (index === 0) { // Display result on the first logo
                    displayResult(logo, isWinner);
                } else {
                    logo.src = 'logo4-lose.png';
                    logo.classList.remove('logo');
                    logo.classList.add('result-logo');
                }
            });
        } else {
            logos.forEach(logo => {
                logo.addEventListener('click', handleClick);
            });
        }

        tiktokLink.addEventListener('click', function() {
            tiktokClicked = true;
            checkSocialLinks();
        });

        instagramLink.addEventListener('click', function() {
            instagramClicked = true;
            checkSocialLinks();
        });

        fetchTikTokFollowers();
    }

    function checkSocialLinks() {
        if (tiktokClicked && instagramClicked) {
            passwordInput.classList.remove('hidden');
            submitButton.classList.remove('hidden');
        }
    }

    async function fetchTikTokFollowers() {
        try {
            const response = await fetch('YOUR_PROXY_SERVER_ENDPOINT'); // Zastąp to odpowiednim URL-em do serwera proxy
            const data = await response.json();
            const followersCount = data.data.user.followers_count;
            tiktokFollowersSpan.textContent = followersCount;
            followersCountDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Error fetching TikTok followers:', error);
            tiktokFollowersSpan.textContent = 'Błąd ładowania';
        }
    }

    init();
});
