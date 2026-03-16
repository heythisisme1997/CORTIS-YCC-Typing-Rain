const wordList = ["teppanyaki", "young", "YCC", "old generation", "sagging-man", "dang face", "french fry", "booth", "freestyle", "freshness", "CORTIS", "Martin", "James", "Seonghyeon", "Keonho", "Juhoon"];
const wordLayer = document.getElementById('word-layer');
const input = document.getElementById('word-input');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const bgm = document.getElementById('bgm');

let score = 0;
let lives = 3;
let level = 1;      
let fallSpeed = 2;  // 起始掉落速度
let activeWords = [];
let spawnInterval, fallInterval; // 將定時器變數提到外面
gameRunning = false; // 初始設為 false

// 點擊按鈕開始遊戲
startBtn.addEventListener('click', () => {
    startScreen.style.display = 'none'; // 隱藏開始畫面
    gameRunning = true;
    bgm.play(); // 播放音樂
    initGame(); // 啟動遊戲邏輯
});

// 1. 生成單字的定時器
function initGame() {
    // 1. 生成單字
    spawnInterval = setInterval(() => {
        if (!gameRunning) return;
        const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        wordElement.textContent = randomWord;
        wordElement.style.left = Math.random() * (window.innerWidth - 100) + 'px';
        wordElement.style.top = '0px';
        wordLayer.appendChild(wordElement);
        activeWords.push({ el: wordElement, text: randomWord, top: 0 });
    }, 2000);

// 2. 掉落邏輯
    fallInterval = setInterval(() => {
        if (!gameRunning) return;
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

// 檢查升級邏輯
function checkLevelUp() {
    let newLevel = Math.floor(score / 100) + 1;
    
    console.log("當前分數:", score, "判定等級:", newLevel);

    if (newLevel > level) {
        level = newLevel;    
        fallSpeed += 1.5;    // 升級後增加速度
        
        const levelElement = document.getElementById('level-num');
        if (levelElement) {
            levelElement.textContent = level;
            
            // 升級特效
            levelElement.style.color = "#f1c40f";
            levelElement.style.fontSize = "30px";
            setTimeout(() => {
                levelElement.style.color = "white";
                levelElement.style.fontSize = "24px";
            }, 500);
        }

        console.log("升級成功！目前等級:", level, "掉落速度變為:", fallSpeed);
    }
}

// 更新生命值 UI
function updateLivesUI() {
    let hearts = "";
    for(let i=0; i<lives; i++) hearts += "❤️";
    livesDisplay.textContent = hearts || "💀 Game Over";
}

// 修正 endGame 函式，停止音樂
function endGame() {
    gameRunning = false;
    clearInterval(spawnInterval);
    clearInterval(fallInterval);
    bgm.pause(); // 停止音樂
    bgm.currentTime = 0; // 重設音樂時間
    alert("Game Over! Score: " + score);
    location.reload();
}

// 3. 輸入比對
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gameRunning) {
        // 使用 toLowerCase() 讓大小寫輸入都可通 (選用)
        const userValue = input.value.trim();
        const foundIndex = activeWords.findIndex(w => w.text === userValue);

        if (foundIndex !== -1) {
            wordLayer.removeChild(activeWords[foundIndex].el);
            activeWords.splice(foundIndex, 1);
            score += 10;
            scoreDisplay.textContent = score;
            
            // 【修正點 2】加分後一定要執行檢查升級
            checkLevelUp();
        }
        input.value = '';
    }
});