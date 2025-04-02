document.addEventListener("DOMContentLoaded", function () {
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
    const gandus = document.querySelectorAll(".gandu");
    const scoreDisplay = document.getElementById("score");
    const highScoreDisplay = document.getElementById("high-score");
    const instructionStartButton = document.getElementById("instruction-start-game");
    const gameControlButton = document.getElementById("game-control-button");
    const hitSound = document.getElementById("hit-sound");
    const clickSound = document.getElementById("click-sound");
    const gameOverSound = document.getElementById("game-over-sound");
    const gameOverModal = document.getElementById("game-over-modal");
    const instructionModal = document.getElementById("instruction-modal");
    const finalScoreDisplay = document.getElementById("final-score");
    const restartButton = document.getElementById("restart-game");

    // Show instruction modal on page load
    instructionModal.style.display = "flex";

    let score = 0;
    let highScore = localStorage.getItem("highScore") || 0;
    let gameActive = false;
    let activeHole = null;
    let activeJhatu = null;
    let activeGandu = null;
    let gameInterval;
    let lastHitTime = 0;
    let hitCooldown = 150;
    let difficulty = 1;
    let ganduChance = 0.2;
    let baseTime = 1500;
    let minTime = 1000;
    let maxGanduChance = 0.4;
    let audioContext = null;
    let clickBuffer = null;

    // Progress messages with their trigger scores
    const progressMessages = [
        { score: 5, messages: [
            { message: "Arey yaar, kya baat hai!", emoji: "🔥" },
            { message: "Bhai tu toh mast hai!", emoji: "💪" },
            { message: "Kya baat hai bhai!", emoji: "🚀" }
        ]},
        { score: 10, messages: [
            { message: "Sigma male spotted!", emoji: "💪" },
            { message: "Bhai tu toh pro nikla!", emoji: "🚀" },
            { message: "Kya baat hai bhai!", emoji: "💯" }
        ]},
        { score: 15, messages: [
            { message: "Bhai tu toh pro nikla!", emoji: "🚀" },
            { message: "Gigachad energy!", emoji: "💯" },
           
        ]},
        { score: 20, messages: [
            { message: "Gigachad energy!", emoji: "💯" },
            { message: "Bhai tu toh legend hai!", emoji: "👑" },
            { message: "Kya baat hai bhai!", emoji: "⚡" }
        ]},
        { score: 25, messages: [
            { message: "Bhai tu toh legend hai!", emoji: "👑" },
            { message: "God mode activated!", emoji: "⚡" },
            { message: "Kya baat hai bhai!", emoji: "🦁" }
        ]},
        { score: 30, messages: [
            { message: "God mode activated!", emoji: "⚡" },
            { message: "Bhai tu toh beast hai!", emoji: "🦁" },
            { message: "Kya baat hai bhai!", emoji: "🗿" }
        ]},
        { score: 40, messages: [
            { message: "Bhai tu toh beast hai!", emoji: "🦁" },
            { message: "Hacker hai bhai Hacker!", emoji: "🗿" },
            { message: "Kya baat hai bhai!", emoji: "👑" }
        ]},
        { score: 50, messages: [
            { message: "Hacker hai bhai Hacker!", emoji: "🗿" },
            { message: "Bhai tu toh god hai!", emoji: "👑" },
            { message: "Kya baat hai bhai!", emoji: "⚡" }
        ]}
    ];

    const explosionEmojis = ["😂","🤣","🤯","😵‍💫","💥", "🔥", "😭", "💨"];

    // Initialize high score
    highScoreDisplay.textContent = highScore;

    // Function to show progress message
    function showProgressMessage(message, emoji) {
        const messageElement = document.createElement('div');
        messageElement.className = 'progress-message';
        messageElement.innerHTML = `<span class="emoji">${emoji}</span>${message}`;
        document.body.appendChild(messageElement);

        // Show message immediately
        messageElement.classList.add('show');

        // Hide and remove message after 2.5 seconds
        setTimeout(() => {
            messageElement.classList.add('hide');
            setTimeout(() => messageElement.remove(), 400);
        }, 2500);
    }

    // Check for progress messages
    function checkProgressMessages(newScore) {
        progressMessages.forEach(msg => {
            if (newScore === msg.score) {
                const randomMessage = msg.messages[Math.floor(Math.random() * msg.messages.length)];
                showProgressMessage(randomMessage.message, randomMessage.emoji);
            }
        });
    }

    function toggleGame(event) {
        event.preventDefault();
        playClickSound();

        if (gameActive) {
            pauseGame();
        } else {
            resumeGame();
        }
    }

    function startGame() {
        // Hide instruction modal
        instructionModal.style.display = "none";
        
        // Stop game over sound when starting new game
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
        
        gameActive = true;
        score = 0;
        difficulty = 1;
        ganduChance = 0.1;
        scoreDisplay.textContent = score;
        gameControlButton.textContent = "PAUSE";
        gameOverModal.style.display = "none";
        startRound();
    }

    function pauseGame() {
        gameActive = false;
        gameControlButton.textContent = "RESUME";
        clearTimeout(gameInterval);
        hideJhatu();
        hideGandu();
    }

    function resumeGame() {
        gameActive = true;
        gameControlButton.textContent = "PAUSE";
        startRound();
    }

    function gameOver() {
        gameActive = false;
        gameControlButton.textContent = "START GAME";
        clearTimeout(gameInterval);
        hideJhatu();
        hideGandu();
        updateHighScore();
        finalScoreDisplay.textContent = score;
        gameOverModal.style.display = "flex";
    }

    instructionStartButton.addEventListener("click", function(event) {
        playClickSound();
        startGame();
    });
    instructionStartButton.addEventListener("touchstart", function(event) {
        playClickSound();
        startGame();
    }, { passive: false });
    gameControlButton.addEventListener("click", toggleGame);
    gameControlButton.addEventListener("touchstart", toggleGame, { passive: false });
    restartButton.addEventListener("click", function(event) {
        playClickSound();
        startGame();
    });
    restartButton.addEventListener("touchstart", function(event) {
        playClickSound();
        startGame();
    }, { passive: false });

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

        // Reduced cooldown based on difficulty
        const currentCooldown = Math.max(50, hitCooldown - (difficulty * 10));
        if (currentTime - lastHitTime < currentCooldown) {
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
            if (score % 3 === 0) {
                difficulty += 0.5;
                ganduChance = Math.min(ganduChance + 0.03, maxGanduChance);
            }
        }
    }

    function hitGandu(event) {
        event.preventDefault();
        const currentTime = Date.now();

        // Reduced cooldown based on difficulty
        const currentCooldown = Math.max(50, hitCooldown - (difficulty * 10));
        if (currentTime - lastHitTime < currentCooldown) {
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

    // Initialize audio context on first user interaction
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            fetch('Click.mp3')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    clickBuffer = audioBuffer;
                })
                .catch(error => console.log("Audio loading failed:", error));
        }
    }

    function playClickSound() {
        // Initialize audio on first interaction
        initAudio();

        if (audioContext && clickBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = clickBuffer;
            source.connect(audioContext.destination);
            source.start(0);
        } else {
            // Fallback to regular audio element
            const sources = clickSound.getElementsByTagName('source');
            const selectedSource = sources[0].src;
            
            clickSound.src = selectedSource;
            clickSound.currentTime = 0;
            clickSound.volume = 1;
            clickSound.play().catch(error => {
                console.log("Click sound failed:", error);
            });
        }
    }

    // Add click/touch listeners to initialize audio
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

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