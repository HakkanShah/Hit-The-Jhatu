document.addEventListener("DOMContentLoaded", function () {
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
    const scoreDisplay = document.getElementById("score");
    const highScoreDisplay = document.getElementById("high-score");
    const startButton = document.getElementById("start-game");
    const hitSound = document.getElementById("hit-sound");
    const clickSound = document.getElementById("click-sound");

    let score = 0;
    let highScore = localStorage.getItem("highScore") || 0;
    let gameActive = false;
    let activeHole = null;
    let activeJhatu = null;
    let gameInterval;
    let lastHitTime = 0;
    let hitCooldown = 300; // Cooldown in milliseconds
    let difficulty = 1; // Game difficulty multiplier

    const explosionEmojis = ["😂","🤣","🤯","😵‍💫","💥", "🔥", "💣", "💨"];

    // Initialize high score
    highScoreDisplay.textContent = highScore;

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
        difficulty = 1;
        scoreDisplay.textContent = score;
        startButton.textContent = "STOP GAME";
        startRound();
    }

    function stopGame() {
        gameActive = false;
        startButton.textContent = "START GAME";
        clearTimeout(gameInterval);
        hideJhatu();
        updateHighScore();
    }

    startButton.addEventListener("click", toggleGame);
    startButton.addEventListener("touchstart", toggleGame, { passive: false });

    function startRound() {
        if (!gameActive) return;

        hideJhatu();

        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        activeHole = holes[randomHoleIndex];
        activeJhatu = activeHole.querySelector('.jhatu');

        // Add active class to hole
        requestAnimationFrame(() => {
            activeHole.classList.add('active');
            activeJhatu.style.transform = "translateX(-50%) scale(1)";
        });

        // Calculate time based on difficulty
        const baseTime = 1500;
        const randomTime = (baseTime - (difficulty * 100)) * (0.8 + Math.random() * 0.4);
        
        setTimeout(() => {
            if (gameActive) {
                hideJhatu();
            }
        }, randomTime);

        gameInterval = setTimeout(startRound, randomTime + 500);
    }

    function hideJhatu() {
        if (activeHole) {
            activeHole.classList.remove('active');
            requestAnimationFrame(() => {
                activeJhatu.style.transform = "translateX(-50%) scale(0)";
                activeHole = null;
                activeJhatu = null;
            });
        }
    }

    function hitJhatu(event) {
        event.preventDefault();
        const currentTime = Date.now();

        if (currentTime - lastHitTime < hitCooldown) {
            return; // Ignore hits during cooldown
        }

        const hole = event.currentTarget;
        if (gameActive && hole === activeHole) {
            score++;
            scoreDisplay.textContent = score;
            playRandomHitSound();
            showHitEffect(activeJhatu);
            hideJhatu();
            lastHitTime = currentTime;

            // Increase difficulty every 5 points
            if (score % 5 === 0) {
                difficulty += 0.5;
            }
        }
    }

    holes.forEach(hole => {
        hole.addEventListener("click", hitJhatu);
        hole.addEventListener("touchstart", hitJhatu, { passive: false });
    });

    function playRandomHitSound() {
        const sources = hitSound.getElementsByTagName('source');
        const randomIndex = Math.floor(Math.random() * sources.length);
        const selectedSource = sources[randomIndex].src;

        hitSound.src = selectedSource;
        hitSound.currentTime = 0;
        hitSound.play().catch(error => {
            console.log("Audio play failed:", error);
        });
    }

    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play().catch(error => {
            console.log("Audio play failed:", error);
        });
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

    function updateHighScore() {
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem("highScore", highScore);
        }
    }

    // Handle visibility change
    document.addEventListener("visibilitychange", function() {
        if (document.hidden && gameActive) {
            stopGame();
        }
    });

    // Handle orientation change
    window.addEventListener("orientationchange", function() {
        if (gameActive) {
            stopGame();
        }
    });
});