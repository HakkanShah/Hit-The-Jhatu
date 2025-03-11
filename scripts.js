// Selecting all necessary elements
const score = document.querySelector('.score span');
const holes = document.querySelectorAll('.hole');
const startBtn = document.querySelector('.start');
const stopBtn = document.querySelector('.stop');
const cursor = document.querySelector('.hammer img');

let gameInterval;
let points = 0;
let isGameRunning = false;

// Update cursor position smoothly
window.addEventListener('mousemove', (e) => {
    cursor.style.top = `${e.pageY}px`;
    cursor.style.left = `${e.pageX}px`;
});

// Hammer click animation
window.addEventListener('click', () => {
    cursor.classList.add('hit');
    setTimeout(() => {
        cursor.classList.remove('hit');
    }, 100);
});

// Start game logic
startBtn.addEventListener('click', () => {
    if (isGameRunning) return;
    isGameRunning = true;
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    points = 0;
    score.innerText = points;

    gameInterval = setInterval(() => {
        let randomHole = holes[Math.floor(Math.random() * holes.length)];
        let jhatu = document.createElement('img');
        jhatu.setAttribute('src', 'Jhatu.png');
        jhatu.setAttribute('class', 'rat');
        jhatu.style.width = '100px';
        jhatu.style.height = '160px';
        randomHole.appendChild(jhatu);

        setTimeout(() => {
            if (randomHole.contains(jhatu)) {
                randomHole.removeChild(jhatu);
            }
        }, 800);
    }, 900);
});

// Increase score when clicking on Jhatu
holes.forEach(hole => {
    hole.addEventListener('click', (e) => {
        if (e.target.classList.contains('rat')) {
            e.target.remove();
            score.innerText = ++points;
        }
    });
});

// Stop game logic
stopBtn.addEventListener('click', () => {
    clearInterval(gameInterval);
    isGameRunning = false;
    stopBtn.style.display = 'none';
    startBtn.style.display = 'inline-block';
    score.innerText = '0';
});
