// 1. 變數與資料定義
const wordList = ["teppanyaki", "young", "YCC", "old generation", "sagging-man", "dang face", "french fries", "booth", "freestyle", "freshness", "CORTIS", "Martin", "James", "Seonghyeon", "Keonho", "Juhoon"];
const wordLayer = document.getElementById('word-layer');
const input = document.getElementById('word-input');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const levelDisplay = document.getElementById('level-num');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const bgm = document.getElementById('bgm');

let score = 0;
let lives = 3;
let level = 1;      
let fallSpeed = 2;  
let activeWords = [];
let gameRunning = false;
let isPaused = false; 
let spawnInterval, fallInterval;

// 2. 開始按鈕監聽器 (獨立在外面)
startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    gameRunning = true;
    bgm.play();
    initGame(); 
});

// 3. 核心遊戲初始化
function initGame() {
    // 生成單字定時器
    spawnInterval = setInterval(() => {
        if (!gameRunning || isPaused) return; 

        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        
        // 20% 機率特殊單字
        const isSpecial = Math.random() < 0.2; 
        if (isSpecial) {
            wordElement.classList.add('special-red');
        }

        wordElement.textContent = randomWord;
        wordElement.style.left = Math.random() * (window.innerWidth - 100) + 'px';
        wordElement.style.top = '0px';
        wordLayer.appendChild(wordElement);

        activeWords.push({ el: wordElement, text: randomWord, top: 0, isSpecial: isSpecial });
    }, 2000);

    // 掉落邏輯定時器
    fallInterval = setInterval(() => {
        if (!gameRunning || isPaused) return; 

        for (let i = activeWords.length - 1; i >= 0; i--) {
            let wordObj = activeWords[i];
            wordObj.top += fallSpeed;
            wordObj.el.style.top = wordObj.top + 'px';

            if (wordObj.top > window.innerHeight - 100) {
                wordLayer.removeChild(wordObj.el);
                activeWords.splice(i, 1);
                lives--;
                updateLivesUI();
                if (lives <= 0) endGame();
            }
        }
    }, 50);
}

// 4. 輸入比對邏輯 (獨立在外面，只設置一次)
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gameRunning) {
        const userValue = input.value.trim();
        const foundIndex = activeWords.findIndex(w => w.text === userValue);

        if (foundIndex !== -1) {
            const target = activeWords[foundIndex];
            
            if (target.isSpecial) {
                triggerPause(3000); 
            }

            wordLayer.removeChild(target.el);
            activeWords.splice(foundIndex, 1);
            score += 10;
            scoreDisplay.textContent = score;
            checkLevelUp();
        }
        input.value = '';
        setTimeout(() => input.focus(), 10);
    }
});

// 5. 功能型函式 (暫停、升級、生命值、結束)
function triggerPause(duration) {
    if (isPaused) return; 
    isPaused = true;
    
    const notice = document.createElement('div');
    notice.style.cssText = "position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); font-size:40px; color:#ff4757; font-weight:bold; z-index:1000; text-shadow: 2px 2px 10px black;";
    document.body.appendChild(notice);

    setTimeout(() => {
        isPaused = false;
        if (notice.parentNode) document.body.removeChild(notice);
    }, duration);
}

function checkLevelUp() {
    let newLevel = Math.floor(score / 100) + 1;
    if (newLevel > level) {
        level = newLevel;
        fallSpeed += 1;
        levelDisplay.textContent = level;
    }
}

function updateLivesUI() {
    let hearts = "";
    for(let i=0; i<lives; i++) hearts += "❤️";
    livesDisplay.textContent = hearts || "💀";
}

function endGame() {
    gameRunning = false;
    clearInterval(spawnInterval);
    clearInterval(fallInterval);
    bgm.pause();
    alert("Game Over! Score: " + score);
    location.reload();
}