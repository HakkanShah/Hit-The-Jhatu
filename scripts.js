document.addEventListener("DOMContentLoaded", function () {
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
    const gandus = document.querySelectorAll(".gandu");
    const scoreDisplay = document.getElementById("score");
    const highScoreDisplay = document.getElementById("high-score");
    const instructionStartButton = document.getElementById("instruction-start-game");
    const muteButton = document.getElementById("mute-button");
    const shareButton = document.getElementById("share-button");
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
    let isMuted = false;
    let lastMuteClickTime = 0;
    const muteClickDelay = 300; // 300ms delay between mute clicks

    // Progress messages with their trigger scores
    const progressMessages = [
        { score: 5, messages: [
            { message: "Beta, tumse na ho payega!", emoji: "😆" },
            { message: "Jaldi kar, sabka badla lega re tera bhai!", emoji: "💪" },
            { message: "Arrey bhai bhai bhai! Mazaa aa gaya!", emoji: "🚀" }
        ]},
        { score: 10, messages: [
            { message: "Aap chronology samajhiye... tu OP ho raha hai! 🤯", emoji: "💯" },
            { message: "Oye hoye! Koi toh roko isko!", emoji: "🚀" },
            { message: "Aag laga di bhai!", emoji: "🔥" }
        ]},
        { score: 15, messages: [
            { message: "Baap re baap, ekdum turbo mode me! ", emoji: "⚡" },
            { message: "Tumse zyada expectations hai humko! ", emoji: "💪" }
        ]},
        { score: 20, messages: [
            { message: "Arey! Ye toh bahut tez jaa raha hai!", emoji: "💯" },
            { message: "Moye moye!", emoji: "🎭" },
            { message: "Abey yaar, yeh toh Ultra Pro Max level hai! ", emoji: "👑" }
        ]},
        { score: 25, messages: [
            { message: "Lagta hai tu game ka baap ban gaya!", emoji: "👑" },
            { message: "Beta, tumse na ho payega! (Oh wait... tu kar raha hai!)", emoji: "🔥" },
            { message: "Tu toh Sachin ka bhi baap nikla! ", emoji: "🏏" }
        ]},
        { score: 30, messages: [
            { message: "Ultra instinct activate!", emoji: "🦁" },
            { message: "Arrey bhai, ek aur round maar lo!", emoji: "⚡" },
            { message: "Aaja beta, seekh le humse!", emoji: "🗿" }
        ]},
        { score: 40, messages: [
            { message: "Bhai tu full god mode me hai!", emoji: "🦁" },
            { message: "Chalo bhai, aaj ka MVP mil gaya!", emoji: "🔥" },
            { message: "Abey yaar! Developers bhi shock ho gaye honge!", emoji: "👑" }
        ]},
        { score: 50, messages: [
            { message: "Kya baat hai bhai, mod menu use kar raha hai kya?", emoji: "🗿" },
            { message: "Arey! Ab yeh game tujhse hi seekhega!", emoji: "👑" },
            { message: "Hacker spotted!", emoji: "⚡" }
        ]}
    ];
    
    const explosionEmojis = ["😂","🤣","🤯","😵‍💫","💥", "🔥", "😭", "💨"];

    // Initialize high score
    highScoreDisplay.textContent = highScore;

    // Mute/Unmute functionality
    function toggleMute() {
        const currentTime = Date.now();
        if (currentTime - lastMuteClickTime < muteClickDelay) {
            return;
        }
        lastMuteClickTime = currentTime;

        isMuted = !isMuted;
        muteButton.querySelector('.button-text').textContent = isMuted ? '🔇' : '🔊';
        
        // Update volume for all sounds
        hitSound.volume = isMuted ? 0 : 1;
        clickSound.volume = isMuted ? 0 : 1;
        gameOverSound.volume = isMuted ? 0 : 1;
        
        // Update audio context volume if it exists
        if (audioContext) {
            audioContext.gainNode.gain.value = isMuted ? 0 : 1;
        } else {
            initAudio();
        }
    }

    // Share functionality
    async function shareGame() {
        const shareData = {
            title: 'Hit The Jhatu',
            text: '🎮 Check out this awesome game! Hit the Jhatu but be careful not to hit the Gandu! Can you beat my high score?',
            url: 'https://hakkanshah.github.io/Hit-The-Jhatu/'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                // Fallback for browsers that don't support Web Share API
                const shareUrl = encodeURIComponent('https://hakkanshah.github.io/Hit-The-Jhatu/');
                const shareText = encodeURIComponent('🎮 Check out this awesome game! Hit the Jhatu but be careful not to hit the Gandu! Can you beat my high score?');
                window.open(`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`, '_blank');
            }
        } catch (err) {
            console.log('Error sharing:', err);
        }
    }

    // Add event listeners for new buttons
    muteButton.addEventListener("click", function(event) {
        event.stopPropagation();
        toggleMute();
    });
    muteButton.addEventListener("touchstart", function(event) {
        event.stopPropagation();
        toggleMute();
    }, { passive: false });
    shareButton.addEventListener("click", function(event) {
        event.stopPropagation();
        shareGame();
    });
    shareButton.addEventListener("touchstart", function(event) {
        event.stopPropagation();
        shareGame();
    }, { passive: false });

    // Update audio context initialization
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const gainNode = audioContext.createGain();
            gainNode.gain.value = isMuted ? 0 : 1;
            gainNode.connect(audioContext.destination);
            
            fetch('sounds/Click.mp3')
                .then(response => response.arrayBuffer())
                .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
                .then(audioBuffer => {
                    clickBuffer = audioBuffer;
                })
                .catch(error => console.log("Audio loading failed:", error));
        }
    }

    // Update sound playing functions to respect mute state
    function playRandomHitSound() {
        if (isMuted) return;
        const sources = hitSound.getElementsByTagName('source');
        const randomIndex = Math.floor(Math.random() * sources.length);
        const selectedSource = sources[randomIndex].src;

        hitSound.src = selectedSource;
        hitSound.currentTime = 0;
        hitSound.volume = isMuted ? 0 : 1;
        hitSound.play().catch(error => {
            console.log("Audio play failed:", error);
        });
    }

    function playClickSound() {
        if (isMuted) return;
        
        // Initialize audio context if not already done
        if (!audioContext) {
            initAudio();
        }

        if (audioContext && clickBuffer) {
            const source = audioContext.createBufferSource();
            source.buffer = clickBuffer;
            const gainNode = audioContext.createGain();
            gainNode.gain.value = isMuted ? 0 : 1;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            source.start(0);
        } else {
            const sources = clickSound.getElementsByTagName('source');
            const selectedSource = sources[0].src;
            
            clickSound.src = selectedSource;
            clickSound.currentTime = 0;
            clickSound.volume = isMuted ? 0 : 1;
            clickSound.play().catch(error => {
                console.log("Click sound failed:", error);
            });
        }
    }

    function playGameOverSound() {
        if (isMuted) return;
        gameOverSound.currentTime = 0;
        gameOverSound.volume = isMuted ? 0 : 1;
        gameOverSound.play().catch(error => {
            console.log("Game over sound failed:", error);
        });
    }

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

    function startGame() {
        // Hide instruction modal and game over modal
        instructionModal.style.display = "none";
        gameOverModal.style.display = "none";
        
        // Stop game over sound when starting new game
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
        
        gameActive = true;
        score = 0;
        difficulty = 1;
        ganduChance = 0.2; // Increased initial Gandu chance
        scoreDisplay.textContent = score;
        
        // Clear any existing interval
        if (gameInterval) {
            clearTimeout(gameInterval);
            gameInterval = null;
        }
        
        startRound();
    }

    function gameOver() {
        gameActive = false;
        clearTimeout(gameInterval);
        hideJhatu();
        hideGandu();
        updateHighScore();
        finalScoreDisplay.textContent = score;
        gameOverModal.style.display = "flex";
    }

    // Event listeners for Play Now and Play Again buttons
    instructionStartButton.addEventListener("click", function(event) {
        event.stopPropagation();
        playClickSound();
        startGame();
    });

    instructionStartButton.addEventListener("touchstart", function(event) {
        event.stopPropagation();
        playClickSound();
        startGame();
    }, { passive: false });

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

        // Keep base time constant
        const randomTime = baseTime * (0.8 + Math.random() * 0.4);
        
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

            // Only increase Gandu chance based on score
            if (score % 3 === 0) {
                ganduChance = Math.min(ganduChance + 0.05, maxGanduChance); // Increased from 0.03 to 0.05
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