// Selecting elements
const score = document.querySelector('.score span');
const holes = document.querySelectorAll('.hole');
const start_btn = document.querySelector('.buttons .start');
const stop_btn = document.querySelector('.buttons .stop');
const hammer = document.querySelector('.hammer img');

let gameInterval;
let gameTimer;
let points = 0;
let gameActive = false;

// Sound Effects
const hitSound = new Audio('hit.mp3');  // Add hit sound
const missSound = new Audio('miss.mp3'); // Add miss sound

// Hammer follows cursor (Desktop)
window.addEventListener('mousemove', (e) => {
    hammer.style.transform = `translate(${e.pageX - 50}px, ${e.pageY - 50}px)`;
});

// Hammer follows touch (Mobile)
window.addEventListener('touchmove', (e) => {
    let touch = e.touches[0];
    hammer.style.transform = `translate(${touch.pageX - 50}px, ${touch.pageY - 50}px)`;
});

// Hammer hit animation
function hammerHit() {
    hammer.classList.add('hit');
    setTimeout(() => {
        hammer.classList.remove('hit');
    }, 100);
}

window.addEventListener('mousedown', hammerHit);
window.addEventListener('mouseup', () => hammer.classList.remove('hit'));
window.addEventListener('touchstart', hammerHit);
window.addEventListener('touchend', () => hammer.classList.remove('hit'));

// Start Game Logic
start_btn.addEventListener('click', startGame);

function startGame() {
    if (gameActive) return;
    gameActive = true;

    start_btn.style.display = 'none';
    stop_btn.style.display = 'inline-block';
    points = 0;
    score.innerText = points;

    gameTimer = setTimeout(stopGame, 30000); // Stop game after 30 seconds

    gameInterval = setInterval(() => {
        let randomHole = holes[Math.floor(Math.random() * holes.length)];

        // Prevent multiple targets in the same hole
        if (randomHole.querySelector('.rat')) return;

        let target = document.createElement('img');
        target.setAttribute('src', 'Jhatu.png');
        target.setAttribute('class', 'rat');
        target.style.width = '80px';
        target.style.height = '130px';
        target.style.position = 'absolute';
        target.style.bottom = '0px'; // Ensure target appears at the hole position

        randomHole.appendChild(target);

        // Animate target appearance
        target.animate([{ transform: 'translateY(20px)' }, { transform: 'translateY(0px)' }], {
            duration: 200,
            easing: 'ease-out'
        });

        // Remove target after a random duration (600ms - 1200ms)
        let disappearTime = Math.random() * (1200 - 600) + 600;
        setTimeout(() => {
            if (randomHole.contains(target)) {
                target.remove();
            }
        }, disappearTime);
    }, 1000);
}

// Click or tap to hit target
function handleHit(e) {
    if (e.target.classList.contains('rat')) {
        e.target.remove();
        score.innerText = ++points;
        hitSound.play();
    } else {
        missSound.play();
    }
}

window.addEventListener('click', handleHit);
window.addEventListener('touchstart', handleHit);

// Stop Game
stop_btn.addEventListener('click', stopGame);

function stopGame() {
    clearInterval(gameInterval);
    clearTimeout(gameTimer);
    gameActive = false;

    stop_btn.style.display = 'none';
    start_btn.style.display = 'inline-block';
}