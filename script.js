// 1. 變數與資料定義
const wordList = ["teppanyaki", "young", "YCC", "old generation", "sagging-man", "dang face", "french fries", "booth", "freestyle", "freshness", "CORTIS", "Martin", "James", "Seonghyeon", "Keonho", "Juhoon"];

// DOM 元素
const wordLayer = document.getElementById('word-layer');
const input = document.getElementById('word-input');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const levelDisplay = document.getElementById('level-num');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const bgm = document.getElementById('bgm');
const gameOverScreen = document.getElementById('game-over-screen');
const restartBtn = document.getElementById('restart-btn');
const finalScoreDisplay = document.getElementById('final-score');

// 遊戲狀態物件
const gameState = {
    score: 0,
    lives: 3,
    level: 1,
    fallSpeed: 1,
    activeWords: [],
    isRunning: false,
    isPaused: false
};

let spawnInterval;
let animationFrameId;

// 2. 按鈕監聽器
startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none';
    startGame();
});

restartBtn.addEventListener('click', () => {
    gameOverScreen.style.display = 'none';
    wordLayer.innerHTML = ''; // 清空畫面殘留的單字
    startGame();
});

// 重置與開始遊戲
function startGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.fallSpeed = 1;
    gameState.activeWords = [];
    gameState.isRunning = true;
    gameState.isPaused = false;

    scoreDisplay.textContent = gameState.score;
    levelDisplay.textContent = gameState.level;
    updateLivesUI();

    bgm.currentTime = 0;
    bgm.play();

    input.focus();
    input.value = '';

    initGame();
}

// 3. 核心遊戲初始化
function initGame() {
    // 生成單字定時器
    spawnInterval = setInterval(() => {
        if (!gameState.isRunning || gameState.isPaused) return;

        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        const wordElement = document.createElement('div');
        wordElement.className = 'word';

        // 20% 機率特殊單字
        const isSpecial = Math.random() < 0.2;
        if (isSpecial) {
            wordElement.classList.add('special-red');
        }

        wordElement.textContent = randomWord;

        // 調整 X 軸範圍避免較長的單字超出螢幕邊界
        const startX = Math.random() * (window.innerWidth - 200);
        wordElement.style.transform = `translate(${startX}px, 0px)`;
        wordLayer.appendChild(wordElement);

        gameState.activeWords.push({
            el: wordElement,
            text: randomWord,
            x: startX,
            y: 0,
            isSpecial: isSpecial
        });
    }, 2000);

    // 開始掉落動畫的迴圈
    updateFall();
}

// 建立 GPU 加速的動畫更新函數
function updateFall() {
    if (!gameState.isRunning) return;

    if (!gameState.isPaused) {
        for (let i = gameState.activeWords.length - 1; i >= 0; i--) {
            let wordObj = gameState.activeWords[i];
            wordObj.y += gameState.fallSpeed;
            // 使用 transform 進行 GPU 加速位移
            wordObj.el.style.transform = `translate(${wordObj.x}px, ${wordObj.y}px)`;

            if (wordObj.y > window.innerHeight - 100) {
                wordLayer.removeChild(wordObj.el);
                gameState.activeWords.splice(i, 1);
                gameState.lives--;
                updateLivesUI();
                if (gameState.lives <= 0) {
                    endGame();
                    return; // 遊戲結束，停止繼續計算
                }
            }
        }
    }
    // 呼叫下一幀
    animationFrameId = requestAnimationFrame(updateFall);
}

// 4. 輸入相關邏輯
// 失去焦點時自動恢復，提升 UX
input.addEventListener('blur', () => {
    if (gameState.isRunning) {
        input.focus();
    }
});

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gameState.isRunning) {
        const userValue = input.value.trim();
        const foundIndex = gameState.activeWords.findIndex(w => w.text === userValue);

        if (foundIndex !== -1) {
            const target = gameState.activeWords[foundIndex];

            if (target.isSpecial) {
                triggerPause(3000);
            }

            wordLayer.removeChild(target.el);
            gameState.activeWords.splice(foundIndex, 1);
            gameState.score += 10;
            scoreDisplay.textContent = gameState.score;
            checkLevelUp();
        }
        input.value = '';
        setTimeout(() => input.focus(), 10);
    }
});

// 5. 功能型函式
function triggerPause(duration) {
    if (gameState.isPaused) return;
    gameState.isPaused = true;

    // 遊戲純粹暫停運作，不顯示任何提示
    setTimeout(() => {
        gameState.isPaused = false;
        if (gameState.isRunning) {
            input.focus();
        }
    }, duration);
}

function checkLevelUp() {
    let newLevel = Math.floor(gameState.score / 100) + 1;
    if (newLevel > gameState.level) {
        gameState.level = newLevel;
        gameState.fallSpeed += 1;
        levelDisplay.textContent = gameState.level;
    }
}

function updateLivesUI() {
    let hearts = "";
    for (let i = 0; i < gameState.lives; i++) hearts += "❤️";
    livesDisplay.textContent = hearts || "💀";
}

function endGame() {
    gameState.isRunning = false;
    clearInterval(spawnInterval);
    cancelAnimationFrame(animationFrameId);
    bgm.pause();

    // 顯示自訂的遊戲結束畫面，取代 alert()
    finalScoreDisplay.textContent = gameState.score;
    gameOverScreen.style.display = 'block';
    // 取消重新整理，透過 restartBtn 來重新開始
}