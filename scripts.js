// Selecting elements
const score = document.querySelector('.score span');
const holes = document.querySelectorAll('.hole');
const start_btn = document.querySelector('.buttons .start');
const stop_btn = document.querySelector('.buttons .stop');
const hammer = document.querySelector('.hammer img');

let gameInterval;
let points = 0;
let gameActive = false;
let gameTimer;

// Sound Effects
const hitSound = new Audio('hit.mp3');
const missSound = new Audio('miss.mp3');

// Hammer follows cursor
window.addEventListener('mousemove', (e) => {
    hammer.style.left = `${e.pageX - 50}px`;
    hammer.style.top = `${e.pageY - 50}px`;
});

// Hammer follows touch (For Mobile)
window.addEventListener('touchmove', (e) => {
    let touch = e.touches[0];
    hammer.style.left = `${touch.pageX - 50}px`;
    hammer.style.top = `${touch.pageY - 50}px`;
});

// Hammer hit animation on click/tap
window.addEventListener('mousedown', () => hammer.classList.add('hit'));
window.addEventListener('mouseup', () => hammer.classList.remove('hit'));
window.addEventListener('touchstart', () => hammer.classList.add('hit'));
window.addEventListener('touchend', () => hammer.classList.remove('hit'));

// Start Game Logic
start_btn.addEventListener('click', () => {
    startGame();
});

function startGame() {
    if (gameActive) return; // Prevent multiple starts
    gameActive = true;

    start_btn.style.display = 'none';
    stop_btn.style.display = 'inline-block';
    points = 0;
    score.innerText = points;

    gameTimer = setTimeout(stopGame, 30000); // Stop game after 30 seconds

    gameInterval = setInterval(() => {
        let randomHole = holes[Math.floor(Math.random() * holes.length)];
        
        // Avoid adding multiple targets in one hole
        if (randomHole.querySelector('.rat')) return;
        
        let target = document.createElement('img');
        target.setAttribute('src', 'Jhatu.png');
        target.setAttribute('class', 'rat');
        target.style.width = '80px';
        target.style.height = '130px';

        randomHole.appendChild(target);

        // Remove target after a random duration (600ms - 1200ms)
        let disappearTime = Math.random() * (1200 - 600) + 600;
        setTimeout(() => {
            if (randomHole.contains(target)) {
                randomHole.removeChild(target);
            }
        }, disappearTime);
    }, 1000);
}

// Click or tap to hit target
window.addEventListener('click', (e) => handleHit(e));
window.addEventListener('touchstart', (e) => handleHit(e));

function handleHit(e) {
    if (e.target.classList.contains('rat')) {
        e.target.remove();
        score.innerText = ++points;
        hitSound.play();
    } else {
        missSound.play();
    }
}

// Stop Game
stop_btn.addEventListener('click', stopGame);

function stopGame() {
    clearInterval(gameInterval);
    clearTimeout(gameTimer);
    gameActive = false;

    stop_btn.style.display = 'none';
    start_btn.style.display = 'inline-block';
}