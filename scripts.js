document.addEventListener("DOMContentLoaded", function () {
    const hammer = document.getElementById("hammer");
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
    const scoreDisplay = document.getElementById("score");
    const startButton = document.getElementById("start-game");
    const hitSound = document.getElementById("hit-sound");
    const clickSound = document.getElementById("click-sound");

    let score = 0;
    let gameActive = false;
    let gameInterval;
    let activeJhatu = null; // Track the active Jhatu

    // Toggle Start/Stop Game (Prevents double trigger)
    function toggleGame(event) {
        event.preventDefault(); // Stops multiple triggers on mobile
        playClickSound();

        if (gameActive) {
            gameActive = false;
            startButton.textContent = "Start Game";
            clearTimeout(gameInterval);
        } else {
            gameActive = true;
            score = 0;
            scoreDisplay.textContent = score;
            startButton.textContent = "Stop Game";
            startRound();
        }
    }

    // Add event listeners for both click and touch (prevents duplicate events)
    startButton.addEventListener("click", toggleGame);
    startButton.addEventListener("touchstart", toggleGame, { passive: false });

    // Start showing Jhatus randomly
    function startRound() {
        if (!gameActive) return;

        if (activeJhatu) {
            activeJhatu.style.transform = "translateX(-50%) scale(0)"; // Hide previous Jhatu
        }

        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        activeJhatu = jhatus[randomHoleIndex];

        activeJhatu.style.transform = "translateX(-50%) scale(1)"; // Show Jhatu

        setTimeout(() => {
            if (activeJhatu) {
                activeJhatu.style.transform = "translateX(-50%) scale(0)"; // Hide after 1 sec
                activeJhatu = null;
            }
        }, 1000);

        gameInterval = setTimeout(startRound, 1500);
    }

    // Make hammer follow the mouse and touch
    function moveHammer(event) {
        const x = event.clientX || (event.touches && event.touches[0].clientX);
        const y = event.clientY || (event.touches && event.touches[0].clientY);

        if (x && y) {
            hammer.style.left = x - 40 + "px";
            hammer.style.top = y - 40 + "px";
        }
    }

    document.addEventListener("mousemove", moveHammer);
    document.addEventListener("touchmove", moveHammer, { passive: false });

    // When Jhatu is tapped/clicked, increase score, play sound, and animate hammer
    jhatus.forEach(jhatu => {
        function hitJhatu(event) {
            event.preventDefault(); // Prevent double click/tap issue

            if (gameActive && jhatu === activeJhatu) {
                score++;
                scoreDisplay.textContent = score;
                playHitSound();
                hammerAnimation();
                jhatu.style.transform = "translateX(-50%) scale(0)"; // Hide Jhatu
                activeJhatu = null; // Prevent multiple hits on the same Jhatu
            }
        }

        jhatu.addEventListener("click", hitJhatu);
        jhatu.addEventListener("touchstart", hitJhatu, { passive: false });
    });

    // Play hit sound
    function playHitSound() {
        hitSound.currentTime = 0; // Reset sound for consecutive hits
        hitSound.play();
    }

    // Hammer animation effect
    function hammerAnimation() {
        hammer.style.transform = "rotate(-30deg)";
        setTimeout(() => {
            hammer.style.transform = "rotate(0deg)";
        }, 100);
    }

    // Play click sound function
    function playClickSound() {
        clickSound.currentTime = 0; // Reset audio to start for quick replay
        clickSound.play();
    }
});
