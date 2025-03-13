document.addEventListener("DOMContentLoaded", function () {
    const hammer = document.getElementById("hammer");
    const holes = document.querySelectorAll(".hole");
    const jhatus = document.querySelectorAll(".jhatu");
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
            startRound();
        }
    });

    // Function to Show Jhatu in a Random Hole
    function startRound() {
        if (!gameActive) return;

        const randomHoleIndex = Math.floor(Math.random() * holes.length);
        const jhatu = jhatus[randomHoleIndex];

        jhatu.style.transform = "translateX(-50%) scale(1)"; // Jhatu appears

        setTimeout(() => {
            jhatu.style.transform = "translateX(-50%) scale(0)"; // Hide after time
        }, 1000);

        setTimeout(startRound, 1500); // Show next Jhatu
    }

    // Hammer follows Mouse
    document.addEventListener("mousemove", function (event) {
        hammer.style.left = event.clientX - 40 + "px";
        hammer.style.top = event.clientY - 40 + "px";
    });

    // Click Event (Hit Jhatu)
    jhatus.forEach(jhatu => {
        jhatu.addEventListener("click", function () {
            if (gameActive) {
                score++;
                scoreDisplay.textContent = score;
                hammerAnimation();
                jhatu.style.transform = "translateX(-50%) scale(0)"; // Hide Jhatu after hit
            }
        });
    });

    // Hammer Animation on Hit
    function hammerAnimation() {
        hammer.style.transform = "rotate(-30deg)";
        setTimeout(() => {
            hammer.style.transform = "rotate(0deg)";
        }, 100);
    }
});
