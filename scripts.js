// Selecting elements
const score = document.querySelector('.score span');
const holes = document.querySelectorAll('.hole');
const start_btn = document.querySelector('.buttons .start');
const stop_btn = document.querySelector('.buttons .stop');
const hammer = document.querySelector('.hammer img');

let gameInterval;
let points = 0;

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
window.addEventListener('mousedown', () => {
    hammer.classList.add('hit');
});
window.addEventListener('mouseup', () => {
    hammer.classList.remove('hit');
});

// Touch version for mobile
window.addEventListener('touchstart', () => {
    hammer.classList.add('hit');
});
window.addEventListener('touchend', () => {
    hammer.classList.remove('hit');
});

// Start Game Logic
start_btn.addEventListener('click', () => {
    start_btn.style.display = 'none';
    stop_btn.style.display = 'inline-block';
    points = 0;
    score.innerText = points;

    gameInterval = setInterval(() => {
        let randomHole = holes[Math.floor(Math.random() * holes.length)];
        
        let target = document.createElement('img');
        target.setAttribute('src', 'Jhatu.png');
        target.setAttribute('class', 'rat');
        target.style.width = '80px';
        target.style.height = '130px';

        randomHole.appendChild(target);

        // Remove after delay
        setTimeout(() => {
            if (randomHole.contains(target)) {
                randomHole.removeChild(target);
            }
        }, 900);
    }, 1000);
});

// Click to hit target
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('rat')) {
        e.target.remove();
        score.innerText = ++points;
    }
});

// Stop Game
stop_btn.addEventListener('click', () => {
    clearInterval(gameInterval);
    stop_btn.style.display = 'none';
    start_btn.style.display = 'inline-block';
    score.innerText = '0';
});
