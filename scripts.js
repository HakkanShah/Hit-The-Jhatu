document.addEventListener("DOMContentLoaded", function () {
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
    const scoreDisplay = document.getElementById("score");
    const startButton = document.getElementById("start-game");
    const hitSound = document.getElementById("hit-sound");
    const clickSound = document.getElementById("click-sound");

    let score = 0;
    let gameActive = false;
    let activeJhatu = null;
    let gameInterval;

    const explosionEmojis = ["😂","🤣","🤯","😵‍💫","💥", "🔥", "💣", "💨"];

    function toggleGame(event) {
        event.preventDefault();
        playClickSound();

        if (gameActive) {
            stopGame();
        } else {
            startGame();
        }
    }

    function startGame() {
        gameActive = true;
        score = 0;
        scoreDisplay.textContent = score;
        startButton.textContent = "Stop Game";
        startRound();
    }

    function stopGame() {
        gameActive = false;
        startButton.textContent = "Start Game";
        clearTimeout(gameInterval);
        hideJhatu();
    }

    startButton.addEventListener("click", toggleGame);
    startButton.addEventListener("touchstart", toggleGame, { passive: false });

    function startRound() {
        if (!gameActive) return;

        hideJhatu();

        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        activeJhatu = jhatus[randomHoleIndex];

        activeJhatu.style.transform = "translateX(-50%) scale(1)";

        setTimeout(() => {
            hideJhatu();
        }, 1000);

        gameInterval = setTimeout(startRound, 1500);
    }

    function hideJhatu() {
        if (activeJhatu) {
            activeJhatu.style.transform = "translateX(-50%) scale(0)";
            activeJhatu = null;
        }
    }

    jhatus.forEach(jhatu => {
        function hitJhatu(event) {
            event.preventDefault();

            if (gameActive && jhatu === activeJhatu) {
                score++;
                scoreDisplay.textContent = score;
                playRandomHitSound();
                showHitEffect(jhatu);
                hideJhatu();
            }
        }

        jhatu.addEventListener("click", hitJhatu);
        jhatu.addEventListener("touchstart", hitJhatu, { passive: false });
    });

    function playRandomHitSound() {
        const sources = hitSound.getElementsByTagName('source');
        const randomIndex = Math.floor(Math.random() * sources.length);
        const selectedSource = sources[randomIndex].src;

        hitSound.src = selectedSource;
        hitSound.currentTime = 0;
        hitSound.play();
    }

    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play();
    }

    function showHitEffect(jhatu) {
        const explosion = document.createElement("span");
        explosion.textContent = explosionEmojis[Math.floor(Math.random() * explosionEmojis.length)];
        explosion.classList.add("explosion-effect");

        jhatu.parentElement.appendChild(explosion);

        setTimeout(() => {
            explosion.remove();
        }, 700);
    }
});