document.addEventListener("DOMContentLoaded", function () {
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
    const gandus = document.querySelectorAll(".gandu");
    const scoreDisplay = document.getElementById("score");
    const highScoreDisplay = document.getElementById("high-score");
    const startButton = document.getElementById("start-game");
    const hitSound = document.getElementById("hit-sound");
    const clickSound = document.getElementById("click-sound");
    const gameOverSound = document.getElementById("game-over-sound");
    const gameOverModal = document.getElementById("game-over-modal");
    const finalScoreDisplay = document.getElementById("final-score");
    const restartButton = document.getElementById("restart-game");

    let score = 0;
    let highScore = localStorage.getItem("highScore") || 0;
    let gameActive = false;
    let activeHole = null;
    let activeJhatu = null;
    let activeGandu = null;
    let gameInterval;
    let lastHitTime = 0;
    let hitCooldown = 300;
    let difficulty = 1;
    let ganduChance = 0.1; // Initial 10% chance for Gandu
    let baseTime = 1500; // Initial base time
    let minTime = 800; // Minimum time limit
    let maxGanduChance = 0.3; // Maximum 30% chance for Gandu

    // Progress messages with their trigger scores
    const progressMessages = [
        { score: 5, message: "Bohut badhiya bhai! 🔥", emoji: "🔥" },
        { score: 10, message: "Hacker hai bhai hacker hai! 💻", emoji: "💻" },
        { score: 15, message: "Speed 1000! 🚀", emoji: "🚀" },
        { score: 20, message: "Pro player! 🏆", emoji: "🏆" },
        { score: 25, message: "Legend! 👑", emoji: "👑" },
        { score: 30, message: "God mode activated! ⚡", emoji: "⚡" },
        { score: 40, message: "Unstoppable! 💪", emoji: "💪" },
        { score: 50, message: "You're on fire! 🔥", emoji: "🔥" }
    ];

    const explosionEmojis = ["😂","🤣","🤯","😵‍💫","💥", "🔥", "💣", "💨"];

    // Initialize high score
    highScoreDisplay.textContent = highScore;

    // Function to show progress message
    function showProgressMessage(message, emoji) {
        const messageElement = document.createElement('div');
        messageElement.className = 'progress-message';
        messageElement.innerHTML = `<span class="emoji">${emoji}</span>${message}`;
        document.body.appendChild(messageElement);

        // Show message
        setTimeout(() => messageElement.classList.add('show'), 100);

        // Hide and remove message after 2 seconds
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => messageElement.remove(), 500);
        }, 2000);
    }

    // Check for progress messages
    function checkProgressMessages(newScore) {
        progressMessages.forEach(msg => {
            if (newScore === msg.score) {
                showProgressMessage(msg.message, msg.emoji);
            }
        });
    }

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
        // Stop game over sound when starting new game
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
        
        gameActive = true;
        score = 0;
        difficulty = 1;
        ganduChance = 0.1;
        scoreDisplay.textContent = score;
        startButton.textContent = "STOP GAME";
        gameOverModal.style.display = "none";
        startRound();
    }

    function stopGame() {
        gameActive = false;
        startButton.textContent = "START GAME";
        clearTimeout(gameInterval);
        hideJhatu();
        hideGandu();
        updateHighScore();
    }

    function gameOver() {
        gameActive = false;
        startButton.textContent = "START GAME";
        clearTimeout(gameInterval);
        hideJhatu();
        hideGandu();
        updateHighScore();
        finalScoreDisplay.textContent = score;
        gameOverModal.style.display = "flex";
    }

    startButton.addEventListener("click", toggleGame);
    startButton.addEventListener("touchstart", toggleGame, { passive: false });
    restartButton.addEventListener("click", startGame);
    restartButton.addEventListener("touchstart", startGame, { passive: false });

    function startRound() {
        if (!gameActive) return;

        hideJhatu();
        hideGandu();

        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        activeHole = holes[randomHoleIndex];
        
        // Hide both characters first
        const jhatu = activeHole.querySelector('.jhatu');
        const gandu = activeHole.querySelector('.gandu');
        if (jhatu) jhatu.style.display = "none";
        if (gandu) gandu.style.display = "none";
        
        // Decide if Gandu should appear as surprise
        if (Math.random() < ganduChance) {
            activeGandu = gandu;
            requestAnimationFrame(() => {
                activeHole.classList.add('active');
                activeGandu.style.display = "block";
                activeGandu.style.transform = "translate(-50%, 50%) scale(0.9)";
            });
        } else {
            activeJhatu = jhatu;
            requestAnimationFrame(() => {
                activeHole.classList.add('active');
                activeJhatu.style.display = "block";
                activeJhatu.style.transform = "translate(-50%, 50%) scale(0.9)";
            });
        }

        // Calculate time based on difficulty and score
        const timeReduction = Math.min(score * 25, baseTime - minTime); // Increased from 20 to 25
        const randomTime = (baseTime - timeReduction - (difficulty * 150)) * (0.8 + Math.random() * 0.4); // Increased from 100 to 150
        
        setTimeout(() => {
            if (gameActive) {
                hideJhatu();
                hideGandu();
            }
        }, randomTime);

        gameInterval = setTimeout(startRound, randomTime + 500);
    }

    function hideJhatu() {
        if (activeHole && activeJhatu) {
            activeHole.classList.remove('active');
            requestAnimationFrame(() => {
                activeJhatu.style.transform = "translate(-50%, 50%) scale(0.1)";
                activeJhatu = null;
            });
        }
    }

    function hideGandu() {
        if (activeHole && activeGandu) {
            activeHole.classList.remove('active');
            requestAnimationFrame(() => {
                activeGandu.style.transform = "translate(-50%, 50%) scale(0.1)";
                activeGandu.style.display = "none";
                activeGandu = null;
            });
        }
    }

    function hitJhatu(event) {
        event.preventDefault();
        const currentTime = Date.now();

        if (currentTime - lastHitTime < hitCooldown) {
            return;
        }

        const hole = event.currentTarget;
        if (gameActive && hole === activeHole && activeJhatu) {
            score++;
            scoreDisplay.textContent = score;
            playRandomHitSound();
            showHitEffect(activeJhatu);
            hideJhatu();
            lastHitTime = currentTime;

            // Check for progress messages
            checkProgressMessages(score);

            // Increase difficulty and Gandu chance based on score
            if (score % 3 === 0) { // Every 3 points
                difficulty += 0.5; // Increased from 0.3 to 0.5
                // Increase Gandu chance gradually up to maxGanduChance
                ganduChance = Math.min(ganduChance + 0.03, maxGanduChance); // Increased from 0.02 to 0.03
            }
        }
    }

    function hitGandu(event) {
        event.preventDefault();
        const currentTime = Date.now();

        if (currentTime - lastHitTime < hitCooldown) {
            return;
        }

        const hole = event.currentTarget;
        if (gameActive && hole === activeHole && activeGandu) {
            showHitEffect(activeGandu);
            hideGandu();
            lastHitTime = currentTime;
            playGameOverSound();
            gameOver();
        }
    }

    holes.forEach(hole => {
        hole.addEventListener("click", hitJhatu);
        hole.addEventListener("touchstart", hitJhatu, { passive: false });
        hole.addEventListener("click", hitGandu);
        hole.addEventListener("touchstart", hitGandu, { passive: false });
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

    function playGameOverSound() {
        gameOverSound.currentTime = 0;
        gameOverSound.play().catch(error => {
            console.log("Game over sound failed:", error);
        });
    }

    function showHitEffect(element) {
        const explosion = document.createElement("span");
        explosion.textContent = explosionEmojis[Math.floor(Math.random() * explosionEmojis.length)];
        explosion.classList.add("explosion-effect");

        element.parentElement.appendChild(explosion);

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