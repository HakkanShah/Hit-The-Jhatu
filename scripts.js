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
    const backgroundMusic = document.getElementById("background-music");
    const gameOverModal = document.getElementById("game-over-modal");
    const instructionModal = document.getElementById("instruction-modal");
    const finalScoreDisplay = document.getElementById("final-score");
    const restartButton = document.getElementById("restart-game");
    const registrationModal = document.getElementById('registration-modal');
    const playerNameInput = document.getElementById('player-name');
    const registerButton = document.getElementById('register-button');
    const leaderboardButton = document.getElementById('leaderboard-button');
    const leaderboardModal = document.getElementById('leaderboard-modal');
    const closeLeaderboardButton = document.getElementById('close-leaderboard');
    const leaderboardEntries = document.getElementById('leaderboard-entries');
    const MAX_LEADERBOARD_ENTRIES = 10;
    let playerName = '';

  
    const progressMessages = [
        { score: 0, message: "is Ready to Play!" },
        { score: 5, message: "is Getting Started!" },
        { score: 10, message: "is on Fire! 🔥" },
        { score: 20, message: "is Unstoppable! 💪" },
        { score: 30, message: "is a Pro Gamer! 🎮" },
        { score: 40, message: "is Legendary! 🌟" },
        { score: 50, message: "is a Gaming God! 👑" }
    ];
    
    function updatePlayerHeader() {
        let message = "is Playing";
        for (let i = progressMessages.length - 1; i >= 0; i--) {
            if (score >= progressMessages[i].score) {
                message = progressMessages[i].message;
                break;
            }
       }
       document.getElementById('player-header').textContent = `${playerName} ${message}`;
    }

    function updateScore() {
        score++;
        scoreDisplay.textContent = score;
        updatePlayerHeader();
        
        if (score > highScore) {
            highScore = score;
            highScoreDisplay.textContent = highScore;
            localStorage.setItem("highScore", highScore);
            
                       highScoreCelebration.style.display = 'block';
            setTimeout(() => {
                highScoreCelebration.style.display = 'none';
            }, 3000);
        }
    }

    backgroundMusic.volume = 0.3; 
    backgroundMusic.loop = true; 
    backgroundMusic.play().catch(error => {
        console.log("Background music autoplay failed:", error);
        
        document.addEventListener('click', function playMusic() {
            backgroundMusic.play();
            document.removeEventListener('click', playMusic);
        });
    });
  
    registrationModal.style.display = "flex";
    instructionModal.style.display = "none"; 

    let gameActive = false;
    let score = 0;
    let highScore = localStorage.getItem("highScore") || 0;
    let difficulty = 1;
    let ganduChance = 0.2;
    let gameInterval = null;
    let gameStartTime = 0;
    let activeHole = null;
    let activeJhatu = null;
    let activeGandu = null;
    let lastHitTime = 0;
    let hitCooldown = 150;
    let baseTime = 1500;
    let minTime = 1000;
    let maxGanduChance = 0.4;
    let audioContext = null;
    let clickBuffer = null;
    let isMuted = false;
    let lastMuteClickTime = 0;
    const muteClickDelay = 300; 
    const jhatuUpload = document.getElementById('jhatu-upload');
    const ganduUpload = document.getElementById('gandu-upload');
    const jhatuImage = document.getElementById('jhatu-image');
    const ganduImage = document.getElementById('gandu-image');
    
    let customJhatuImage = null;
    let customGanduImage = null;
    
    jhatuUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                
                jhatuImage.src = event.target.result;
              
             
                customJhatuImage = event.target.result;
                
                const jhatus = document.querySelectorAll('.jhatu');
                jhatus.forEach(jhatu => {
                    jhatu.src = customJhatuImage;
                });
              
          
                playClickSound();
            };
                  reader.readAsDataURL(e.target.files[0]);
        }
    });  
    ganduUpload.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
               
                ganduImage.src = event.target.result;
             
           
                customGanduImage = event.target.result;
   
                const gandus = document.querySelectorAll('.gandu');
                gandus.forEach(gandu => {
                    gandu.src = customGanduImage;
                });
                
                playClickSound();
            };
            
     reader.readAsDataURL(e.target.files[0]);
        }
    });

    const explosionEmojis = ["😂","🤣","🤯","😵‍💫","💥", "🔥", "😭", "💨"];

    const quitMessages = [
        {
            title: "Arey Bhai! Game Chhod ke Ja Rahe Ho?😱",
            subtitle: "(Bhai, Tum Toh Bade Heavy Driver Ho! Lekin Yeh Game Tumhare Bas Ki Baat Nahi Hai!😏)"
        },
        {
            title: "Kya Bhai? Game Se Darr Gaya?😨",
            subtitle: "(Beta, Real Gamers Kabhi Quit Nahi Karte! Lekin Tum Toh Special Ho!😏)"
        },
        {
            title: "Oho! Game Se Bhaag Rahe Ho?🏃‍♂️",
            subtitle: "(Bhai, Jhatu ko hit karne se darr lag raha hai kya?😅)"
        },
        {
            title: "Game Chhod ke Kahan Ja Rahe Ho?🤔",
            subtitle: "(Beta, Gandu se darr gaye? Ya Jhatu hit karne mein problem aa rahi hai?😏)"
        },
        {
            title: "Kya Hua? Game Se Mann Bhar Gaya?😴",
            subtitle: "(Bhai, Thoda aur try karo na! Jhatu ko hit karne ka mazaa alag hai!😎)"
        },
        {
            title: "Game Se Bhaag Rahe Ho Ya Kuch Aur?🤣",
            subtitle: "(Beta, Real challenge toh abhi aana baaki hai!😈)"
        },
        {
            title: "Kya Bhai? Game Se Pareshan Ho Gaye?😅",
            subtitle: "(Bhai, Jhatu ko hit karne ka mazaa alag hai! Thoda aur try karo!😏)"
        },
        {
            title: "Game Chhod ke Kahan Ja Rahe Ho?😱",
            subtitle: "(Beta, Gandu se darr gaye? Ya Jhatu hit karne mein problem aa rahi hai?😏)"
        }
    ];
 
    highScoreDisplay.textContent = highScore;

   
    function toggleMute() {
        const currentTime = Date.now();
        if (currentTime - lastMuteClickTime < muteClickDelay) {
            return;
        }
        lastMuteClickTime = currentTime;

        isMuted = !isMuted;
        muteButton.querySelector('.button-text').textContent = isMuted ? '🔇' : '🔊';
        
   
        hitSound.volume = isMuted ? 0 : 1;
        clickSound.volume = isMuted ? 0 : 1;
        gameOverSound.volume = isMuted ? 0 : 1;
        backgroundMusic.volume = isMuted ? 0 : 0.3;
       
       
        if (audioContext) {
            audioContext.gainNode.gain.value = isMuted ? 0 : 1;
        } else {
            initAudio();
        }
    }
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
                const shareUrl = encodeURIComponent('https://hakkanshah.github.io/Hit-The-Jhatu/');
                const shareText = encodeURIComponent('🎮 Check out this awesome game! Hit the Jhatu but be careful not to hit the Gandu! Can you beat my high score?');
              
              
                const tempInput = document.createElement('input');
                tempInput.value = `🎮 Check out this awesome game! Hit the Jhatu but be careful not to hit the Gandu! Can you beat my high score?\n\nhttps://hakkanshah.github.io/Hit-The-Jhatu/`;
                document.body.appendChild(tempInput);
 
               tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                alert('Share link copied to clipboard! You can now paste it anywhere.');
            }
        } catch (err) {
            console.log('Error sharing:', err);
        }
    }
  
    muteButton.addEventListener("click", function(event) {
        event.stopPropagation();
        playClickSound();
        toggleMute();
    });
    muteButton.addEventListener("touchstart", function(event) {
        event.stopPropagation();
        playClickSound();
        toggleMute();
    }, { passive: false });
    shareButton.addEventListener("click", function(event) {
        event.stopPropagation();
        playClickSound();
        shareGame();
    });
    shareButton.addEventListener("touchstart", function(event) {
        event.stopPropagation();
        playClickSound();
        shareGame();
    }, { passive: false });
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

    let originalStartGame = function() {
        
        instructionModal.style.display = "none";
        gameOverModal.style.display = "none";
        
      
        gameOverSound.pause();
        gameOverSound.currentTime = 0;
        
        gameActive = true;
        score = 0;
        difficulty = 1;
        ganduChance = 0.2; 
        scoreDisplay.textContent = score;
        
        
        if (gameInterval) {
            clearTimeout(gameInterval);
            gameInterval = null;
        }
        
        startRound();
    };

   registerButton.addEventListener('click', function() {
        const name = playerNameInput.value.trim();
        if (name) {
            playerName = name;
            
            localStorage.setItem('playerName', name);
            registrationModal.style.display = "none";
            instructionModal.style.display = "flex"; 
            document.getElementById('player-header').textContent = `${name} is Playing`;
            playClickSound();
        }
    });

     document.addEventListener('DOMContentLoaded', function() {
        
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            playerName = savedName;
            registrationModal.style.display = "none";
            instructionModal.style.display = "flex";
            document.getElementById('player-header').textContent = `${savedName} is Playing`;
        } else {
            registrationModal.style.display = "flex";
            instructionModal.style.display = "none";
        }
    });
 playerNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            registerButton.click();
        }
    });

    let originalGameOver = function() {
        gameActive = false;
        clearTimeout(gameInterval);
        hideJhatu();
        hideGandu();
        updateHighScore();
        finalScoreDisplay.textContent = score;
        gameOverModal.style.display = "flex";
    };

    startGame = function() {
        gameStartTime = Date.now();
        originalStartGame();
    };

    
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

     leaderboardButton.addEventListener('click', function(event) {
        event.stopPropagation();
        playClickSound();
        updateLeaderboardDisplay();
        leaderboardModal.style.display = 'flex';
    });

     closeLeaderboardButton.addEventListener('click', function(event) {
        event.stopPropagation();
        playClickSound();
        leaderboardModal.style.display = 'none';
    });

    function updateLeaderboardDisplay() {
        leaderboardEntries.innerHTML = '';
        const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
        
        sortedLeaderboard.slice(0, MAX_LEADERBOARD_ENTRIES).forEach((entry, index) => {
            const entryElement = document.createElement('div');
            entryElement.className = `leaderboard-entry rank-${index + 1}`;
            entryElement.innerHTML = `
                <span>${index + 1}</span>
                <span>${entry.name}</span>
                <span>${entry.score}</span>
            `;
            leaderboardEntries.appendChild(entryElement);
        });
    }

    
    function updateLeaderboard() {
        if (playerName && score > 0) {
            leaderboard.push({
                name: playerName,
                score: score,
                date: new Date().toISOString()
            });
            
            
            leaderboard.sort((a, b) => b.score - a.score);
            leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);
            
            localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        }
    }

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
        
        
        const jhatu = activeHole.querySelector('.jhatu');
        const gandu = activeHole.querySelector('.gandu');
        if (jhatu) jhatu.style.display = "none";
        if (gandu) gandu.style.display = "none";
        
        
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

        const currentCooldown = Math.max(50, hitCooldown - (difficulty * 10));
        if (currentTime - lastHitTime < currentCooldown) {
            return;
        }

        const hole = event.currentTarget;
        if (gameActive && hole === activeHole && activeJhatu) {
            score++;
            scoreDisplay.textContent = score;
            updatePlayerHeader(); // Update header when score changes
            playRandomHitSound();
            showHitEffect(activeJhatu);
            hideJhatu();
            lastHitTime = currentTime;

            if (score % 3 === 0) {
                ganduChance = Math.min(ganduChance + 0.05, maxGanduChance);
            }
        }
    }

    function hitGandu(event) {
        event.preventDefault();
        const currentTime = Date.now();

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

     document.addEventListener("visibilitychange", function() {
        if (document.hidden && gameActive) {
            stopGame();
        }
    });

     window.addEventListener("orientationchange", function() {
        if (gameActive) {
            stopGame();
        }
    });

    
    const quitModal = document.getElementById('quit-modal');
    const quitYesButton = document.getElementById('quit-yes');
    const quitNoButton = document.getElementById('quit-no');

    
    window.onpopstate = function(event) {
        if (gameActive) {
            event.preventDefault();
            quitModal.style.display = 'flex';
            history.pushState(null, null, window.location.href);
        }
    };

     document.addEventListener('visibilitychange', function() {
        if (document.hidden && gameActive) {
            quitModal.style.display = 'flex';
        }
    });

     window.addEventListener('beforeunload', function(e) {
        if (gameActive) {
            e.preventDefault();
            e.returnValue = '';
            quitModal.style.display = 'flex';
            return '';
        }
    });

     quitYesButton.addEventListener('click', function() {
        quitModal.style.display = 'none';
        gameActive = false;
        clearTimeout(gameInterval);
        hideJhatu();
        hideGandu();
        window.location.href = "about:blank";
    });

    quitNoButton.addEventListener('click', function() {
        quitModal.style.display = 'none';
    });

     quitYesButton.addEventListener('click', function(event) {
        event.stopPropagation();
        playClickSound();
    });

    quitNoButton.addEventListener('click', function(event) {
        event.stopPropagation();
        playClickSound();
    });

    quitYesButton.addEventListener('touchstart', function(event) {
        event.stopPropagation();
        playClickSound();
    }, { passive: false });

    quitNoButton.addEventListener('touchstart', function(event) {
        event.stopPropagation();
        playClickSound();
    }, { passive: false });

    
    history.pushState(null, null, window.location.href);

    
    let totalGames = 0;
    let totalScore = 0;
    let bestStreak = 0;
    let currentStreak = 0;
    let ganduHits = 0;
    let totalTimePlayed = 0;

    
    const statisticsModal = document.getElementById('statistics-modal');
    const statisticsButton = document.getElementById('statistics-button');
    const closeStatisticsButton = document.getElementById('close-statistics');
    const totalGamesDisplay = document.getElementById('total-games');
    const averageScoreDisplay = document.getElementById('average-score');
    const bestStreakDisplay = document.getElementById('best-streak');
    const ganduHitsDisplay = document.getElementById('gandu-hits');
    const totalTimeDisplay = document.getElementById('total-time');

    
    function loadStatistics() {
        const stats = JSON.parse(localStorage.getItem('gameStatistics')) || {
            totalGames: 0,
            totalScore: 0,
            bestStreak: 0,
            ganduHits: 0,
            totalTimePlayed: 0
        };
        
        totalGames = stats.totalGames;
        totalScore = stats.totalScore;
        bestStreak = stats.bestStreak;
        ganduHits = stats.ganduHits;
        totalTimePlayed = stats.totalTimePlayed;
        
        updateStatisticsDisplay();
    }

    
    function saveStatistics() {
        const stats = {
            totalGames,
            totalScore,
            bestStreak,
            ganduHits,
            totalTimePlayed
        };
        localStorage.setItem('gameStatistics', JSON.stringify(stats));
    }

    
    function updateStatisticsDisplay() {
        totalGamesDisplay.textContent = totalGames;
        averageScoreDisplay.textContent = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
        bestStreakDisplay.textContent = bestStreak;
        ganduHitsDisplay.textContent = ganduHits;
        
        
        const hours = Math.floor(totalTimePlayed / 3600);
        const minutes = Math.floor((totalTimePlayed % 3600) / 60);
        const seconds = totalTimePlayed % 60;
        
        if (hours > 0) {
            totalTimeDisplay.textContent = `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            totalTimeDisplay.textContent = `${minutes}m ${seconds}s`;
        } else {
            totalTimeDisplay.textContent = `${seconds}s`;
        }
    }

    // Update Game statistics
    function updateGameStatistics() {
        totalGames++;
        totalScore += score;
        currentStreak = score;
        
        if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
        }
        
        const gameDuration = Math.floor((Date.now() - gameStartTime) / 1000);
        totalTimePlayed += gameDuration;
        
        saveStatistics();
        updateStatisticsDisplay();
    }

     statisticsButton.addEventListener('click', function() {
        playClickSound();
        statisticsModal.style.display = 'flex';
        updateStatisticsDisplay();
    });

    closeStatisticsButton.addEventListener('click', function() {
        playClickSound();
        statisticsModal.style.display = 'none';
    });

    
    loadStatistics();
   
    gameOver = function() {
        originalGameOver();
        updateLeaderboard();
        updateGameStatistics();
        ganduHits++; // Increment gandu hits counter
        saveStatistics();
        updateStatisticsDisplay();
    };
});