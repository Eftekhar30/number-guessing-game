const DIFFICULTY = {
    easy: { min: 1, max: 50, maxAttempts: 15 },
    medium: { min: 1, max: 100, maxAttempts: 10 },
    hard: { min: 1, max: 500, maxAttempts: 7 }
};

const difficultySelect = document.getElementById('difficulty');
const rangeText = document.getElementById('rangeText');
const guessField = document.getElementById('guessField');
const submitButton = document.getElementById('submitGuess');
const hintBtn = document.getElementById('hintBtn');
const restartBtn = document.getElementById('restartBtn');
const message = document.getElementById('message');
const attemptsLeftEl = document.getElementById('attemptsLeft');
const bestScoreEl = document.getElementById('bestScore');

let minNum, maxNum, answer, attempts, maxAttempts, hintUsed;

submitButton.addEventListener('click', checkGuess);
restartBtn.addEventListener('click', startGame);
hintBtn.addEventListener('click', giveHint);
difficultySelect.addEventListener('change', startGame);
guessField.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        checkGuess();
    }
});

function startGame() {
    const diff = difficultySelect.value || 'medium';
    const cfg = DIFFICULTY[diff];
    minNum = cfg.min;
    maxNum = cfg.max;
    maxAttempts = cfg.maxAttempts;
    answer = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
    attempts = 0;
    hintUsed = false;

    rangeText.textContent = `${minNum} and ${maxNum}`;
    message.textContent = '';
    submitButton.disabled = false;
    hintBtn.disabled = false;
    guessField.value = '';
    guessField.placeholder = `Enter a number (${minNum}-${maxNum})`;
    guessField.focus();
    updateAttemptsUI();
    updateBestScoreUI();
}

function checkGuess() {
    const raw = guessField.value.trim();
    const userGuess = Number(raw);

    if (raw === '' || isNaN(userGuess)) {
        showMessage(`Please enter a valid number between ${minNum} and ${maxNum}`, 'error');
        return;
    }
    if (userGuess < minNum || userGuess > maxNum) {
        showMessage(`Please enter a number between ${minNum} and ${maxNum}`, 'error');
        return;
    }

    attempts++;
    updateAttemptsUI();

    if (userGuess === answer) {
        showMessage(`🎉 Congratulations! ${answer} is correct! You took ${attempts} attempts.`, 'success');
        submitButton.disabled = true;
        hintBtn.disabled = true;
        saveBestScore(attempts);
        updateBestScoreUI();
        return;
    }

    if (attempts >= maxAttempts) {
        showMessage(`Game over — you've used ${attempts} attempts. The answer was ${answer}.`, 'error');
        submitButton.disabled = true;
        hintBtn.disabled = true;
        return;
    }

    if (userGuess < answer) {
        showMessage('Too low — try a higher number.', 'hint');
    } else {
        showMessage('Too high — try a lower number.', 'hint');
    }

    guessField.value = '';
    guessField.focus();
}

function giveHint() {
    if (hintUsed) {
        showMessage('You already used the hint for this round.', 'info');
        return;
    }

    let hint = '';
    if (attempts < 2) {
        hint = (answer % 2 === 0) ? 'The number is even.' : 'The number is odd.';
    } else {
        const span = Math.max(2, Math.round((maxNum - minNum) / 8));
        const low = Math.max(minNum, answer - span);
        const high = Math.min(maxNum, answer + span);
        hint = `The number is between ${low} and ${high}.`;
    }

    hintUsed = true;
    hintBtn.disabled = true;
    showMessage(hint, 'hint');
}

function showMessage(text, type = 'info') {
    message.textContent = text;
    message.classList.remove('success', 'error', 'hint', 'info');
    message.classList.add(type);
}

function updateAttemptsUI() {
    attemptsLeftEl.textContent = `Attempts: ${attempts} / ${maxAttempts}`;
}

function bestScoreKey() {
    return `best_${difficultySelect.value || 'medium'}`;
}

function saveBestScore(currentAttempts) {
    const key = bestScoreKey();
    const prev = Number(localStorage.getItem(key)) || Infinity;
    if (currentAttempts < prev) {
        localStorage.setItem(key, String(currentAttempts));
    }
}

function updateBestScoreUI() {
    const val = localStorage.getItem(bestScoreKey());
    bestScoreEl.textContent = `Best: ${val ? val + ' attempts' : '—'}`;
}

startGame();