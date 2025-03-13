document.addEventListener("DOMContentLoaded", function () {
    const hammer = document.getElementById("hammer");
    const target = document.getElementById("target");
    const scoreDisplay = document.getElementById("score");
    const startButton = document.getElementById("start-game");

    let score = 0;
    let gameActive = false;

    // Start Game
    startButton.addEventListener("click", function () {
        if (!gameActive) {
            gameActive = true;
            score = 0;
            scoreDisplay.textContent = score;
            moveTarget();
        }
    });

    // Move Target Randomly
    function moveTarget() {
        if (!gameActive) return;
        
        const gameContainer = document.getElementById("game-container");
        const maxX = gameContainer.clientWidth - target.clientWidth;
        const maxY = gameContainer.clientHeight - target.clientHeight;

        target.style.left = Math.random() * maxX + "px";
        target.style.top = Math.random() * maxY + "px";

        setTimeout(moveTarget, 1000); // Move every second
    }

    // Click Event (Hit Jhatu)
    target.addEventListener("click", function () {
        if (gameActive) {
            score++;
            scoreDisplay.textContent = score;
            hammerAnimation();
        }
    });

    // Hammer Animation on Hit
    function hammerAnimation() {
        hammer.style.transform = "rotate(-30deg)";
        setTimeout(() => {
            hammer.style.transform = "rotate(0deg)";
        }, 100);
    }
});
