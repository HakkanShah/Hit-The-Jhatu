document.addEventListener("DOMContentLoaded", function () {
    const hammer = document.getElementById("hammer");
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
    const scoreDisplay = document.getElementById("score");
    const startButton = document.getElementById("start-game");

    let score = 0;
    let gameActive = false;
    let gameInterval;

    // Toggle Start/Stop Game
    startButton.addEventListener("click", function () {
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

    function startRound() {
        if (!gameActive) return;

        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        const jhatu = jhatus[randomHoleIndex];

        jhatu.style.transform = "translateX(-50%) scale(1)";

        setTimeout(() => {
            jhatu.style.transform = "translateX(-50%) scale(0)";
        }, 1000);

        gameInterval = setTimeout(startRound, 1500);
    }

    document.addEventListener("mousemove", function (event) {
        hammer.style.left = event.clientX - 40 + "px";
        hammer.style.top = event.clientY - 40 + "px";
    });

    jhatus.forEach(jhatu => {
        jhatu.addEventListener("click", function () {
            if (gameActive) {
                score++;
                scoreDisplay.textContent = score;
                hammerAnimation();
                jhatu.style.transform = "translateX(-50%) scale(0)";
            }
        });
    });

    function hammerAnimation() {
        hammer.style.transform = "rotate(-30deg)";
        setTimeout(() => {
            hammer.style.transform = "rotate(0deg)";
        }, 100);
    }
});
