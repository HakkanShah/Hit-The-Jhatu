document.addEventListener("DOMContentLoaded", function () {
    const hammer = document.getElementById("hammer");
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
    const scoreDisplay = document.getElementById("score");
    const startButton = document.getElementById("start-game");
    const hitSound = document.getElementById("hit-sound");
    const clickSound = document.getElementById("click-sound"); // Click sound added

    let score = 0;
    let gameActive = false;
    let gameInterval;

    // Toggle Start/Stop Game
    startButton.addEventListener("click", function () {
        playClickSound(); // Play click sound on button press
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
    });

    // Start showing Jhatus randomly
    function startRound() {
        if (!gameActive) return;

        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        const jhatu = jhatus[randomHoleIndex];

        jhatu.style.transform = "translateX(-50%) scale(1)"; // Show Jhatu

        setTimeout(() => {
            jhatu.style.transform = "translateX(-50%) scale(0)"; // Hide Jhatu after 1 sec
        }, 1000);

        gameInterval = setTimeout(startRound, 1500);
    }
    
    // Make hammer follow the mouse
    document.addEventListener("mousemove", function (event) {
        hammer.style.left = event.clientX - 40 + "px";
        hammer.style.top = event.clientY - 40 + "px";
    });

    // When Jhatu is clicked, increase score, play sound, and animate hammer
    jhatus.forEach(jhatu => {
        jhatu.addEventListener("click", function () {
            if (gameActive) {
                score++;
                scoreDisplay.textContent = score;
                playHitSound();
                hammerAnimation();
                jhatu.style.transform = "translateX(-50%) scale(0)"; // Hide Jhatu
            }
        });
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
