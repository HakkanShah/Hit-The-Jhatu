document.addEventListener("DOMContentLoaded", function () {
    const startButton = document.getElementById("start-game");
    const scoreElement = document.getElementById("score");
    const hammer = document.getElementById("hammer");
    const holes = document.querySelectorAll(".hole");
    const hitSound = document.getElementById("hit-sound");
    const clickSound = document.getElementById("click-sound");

    let score = 0;
    let gameInterval;

    // Play click sound when button is clicked
    startButton.addEventListener("click", function () {
        clickSound.currentTime = 0;
        clickSound.play();
        toggleGame();
    });

    // Function to start or stop the game
    function toggleGame() {
        if (startButton.textContent === "Start Game") {
            startGame();
            startButton.textContent = "Stop Game";
        } else {
            stopGame();
            startButton.textContent = "Start Game";
        }
    }

    // Function to start the game
    function startGame() {
        score = 0;
        scoreElement.textContent = score;
        gameInterval = setInterval(showJhatu, 800);
    }

    // Function to stop the game
    function stopGame() {
        clearInterval(gameInterval);
        document.querySelectorAll(".jhatu").forEach(jhatu => {
            jhatu.style.transform = "translateX(-50%) scale(0)";
        });
    }

    // Function to randomly show Jhatu
    function showJhatu() {
        const randomHole = holes[Math.floor(Math.random() * holes.length)];
        const jhatu = randomHole.querySelector(".jhatu");
        
        jhatu.style.transform = "translateX(-50%) scale(1)";

        setTimeout(() => {
            jhatu.style.transform = "translateX(-50%) scale(0)";
        }, 600);
    }

    // Hammer movement effect
    document.addEventListener("mousemove", function (e) {
        hammer.style.left = `${e.pageX - 40}px`;
        hammer.style.top = `${e.pageY - 40}px`;
    });

    // Hammer hit effect
    document.addEventListener("click", function () {
        hammer.style.transform = "rotate(-30deg)";
        setTimeout(() => {
            hammer.style.transform = "rotate(0deg)";
        }, 100);
    });

    // Jhatu hit event
    holes.forEach(hole => {
        hole.addEventListener("click", function () {
            const jhatu = hole.querySelector(".jhatu");

            if (jhatu.style.transform === "translateX(-50%) scale(1)") {
                hitSound.currentTime = 0;
                hitSound.play();
                score++;
                scoreElement.textContent = score;
                jhatu.style.transform = "translateX(-50%) scale(0)";
            }
        });
    });
});
