// Cookies
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function getCookie(name) {
  const cookies = document.cookie.split(";");
  for (let c of cookies) {
    let [key, val] = c.trim().split("=");
    if (key === name) return val;
  }
  return "";
}

// Game state
class ReactionGame {
  constructor(settings) {
    this.player = settings.playerName || "Anonymous";
    this.rounds = parseInt(settings.rounds) || 5;
    this.difficulty = settings.difficulty || "medium";
    this.signalType = settings.signalType || "click";
    this.falseStartPenalty = settings.falseStartPenalty || false;
    this.showAverage = settings.showAverage !== false;

    this.currentRound = 0;
    this.scores = [];
    this.falseStarts = 0;
    this.waiting = false;
    this.startTime = 0;
  }

  randomDelay() {
    if (this.difficulty === "easy") return 1000 + Math.random() * 2000;
    if (this.difficulty === "medium") return 1000 + Math.random() * 3000;
    return 1000 + Math.random() * 4000;
  }

  startRound() {
    if (this.currentRound >= this.rounds) {
      alert("All rounds completed.");
      return;
    }
    this.currentRound++;
    updateDisplay("displayRound", this.currentRound);
    updateDisplay("ruleArea", `Round ${this.currentRound}: Wait for signal...`);
    updateSignal("WAIT...", "waiting");
    this.waiting = true;

    setTimeout(() => {
      updateSignal("GO!", "go");
      this.startTime = Date.now();
      updateDisplay("ruleArea", "React now!");
    }, this.randomDelay());
  }

  recordReaction() {
    if (!this.waiting) {
      if (this.falseStartPenalty) {
        this.falseStarts++;
        updateDisplay("displayFalseStarts", this.falseStarts);
        logMessage("False start detected. Penalty applied.");
        this.scores.push(1000);
      }
      return;
    }
    const reaction = Date.now() - this.startTime;
    this.scores.push(reaction);
    updateDisplay("displayScore", reaction);
    updateResults(`Round ${this.currentRound}: ${reaction} ms`);
    logMessage(`Round ${this.currentRound} reaction: ${reaction} ms`);
    this.waiting = false;

    const best = Math.min(...this.scores);
    const avg = this.scores.reduce((a, b) => a + b, 0) / this.scores.length;
    updateDisplay("displayBestTime", best + " ms");
    updateDisplay("displayAverageTime", Math.round(avg) + " ms");

    if (this.currentRound >= this.rounds) {
      if (this.showAverage) {
        alert(`Game Over!\nAverage Reaction Time: ${Math.round(avg)} ms`);
      } else {
        alert("Game Over!");
      }
      const bestScore = parseInt(getCookie("bestScore") || "999999");
      if (avg < bestScore) {
        setCookie("bestScore", Math.round(avg), 7);
        alert("New Best Score!");
        launchConfetti();
      }
    }
  }

  resetGame() {
    this.currentRound = 0;
    this.scores = [];
    this.falseStarts = 0;
    this.waiting = false;
    this.startTime = 0;
    updateDisplay("displayRound", 0);
    updateDisplay("displayScore", 0);
    updateDisplay("displayBestTime", "-");
    updateDisplay("displayAverageTime", "-");
    updateDisplay("displayFalseStarts", 0);
    updateResults("No results yet.");
    logMessage("Game reset.");
    updateSignal("WAIT...", "waiting");
    updateDisplay("ruleArea", "Press Start Test when ready.");
  }
}

// Helper functions
function updateDisplay(id, value) {
  document.getElementById(id).innerText = value;
}

function updateSignal(text, stateClass) {
  const el = document.getElementById("signalArea");
  el.innerText = text;
  el.className = "signal-area " + stateClass;

  if (text === "GO!") {
    el.style.backgroundColor = "pink";
    el.style.color = "black";
    playSignalSound("go");
    animateSignal();
  } else {
    el.style.backgroundColor = "";
    el.style.color = "";
    playSignalSound("wait");
  }
}

//  Preload audio (change x)
const goSound = new Audio("go-sound.mp3");
const waitSound = new Audio("wait-sound.mp3");

function playSignalSound(type) {
  if (type === "go") {
    goSound.currentTime = 0;
    goSound.play();
  } else {
    waitSound.currentTime = 0;
    waitSound.play();
  }
}

function animateSignal() {
  const el = document.getElementById("signalArea");
  el.style.transition = "transform 0.3s ease";
  el.style.transform = "scale(1.2)";
  setTimeout(() => {
    el.style.transform = "scale(1)";
  }, 300);
}

function updateResults(text) {
  document.getElementById("resultsArea").innerText = text;
}
function logMessage(msg) {
  const logArea = document.getElementById("logArea");
  const entry = document.createElement("div");
  entry.innerText = msg;
  logArea.appendChild(entry);
}

//  Confetti(change x)
function launchConfetti() {
  const confettiCount = 50;
  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.innerText = "🎊";
    confetti.className = "confetti";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 2000);
  }
}

//  Background music(change x)
let bgAudio = null;
function startBackgroundMusic() {
  if (!bgAudio) {
    bgAudio = new Audio("oceanframemusic-no-copyright-background-music-kid-480805.mp3");
    bgAudio.loop = true;
    bgAudio.volume = 0.3;
    bgAudio.play();
    logMessage("Background music started.");
  }
}
function stopBackgroundMusic() {
  if (bgAudio) {
    bgAudio.pause();
    bgAudio.currentTime = 0;
    bgAudio = null;
    logMessage("Background music stopped.");
  }
}

// Initialise
const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
const game = new ReactionGame(settings);
updateDisplay("displayPlayer", game.player);

// Event listeners
document.getElementById("startBtn").addEventListener("click", () => {
  startBackgroundMusic();
  game.startRound();
});
document.getElementById("nextRoundBtn").addEventListener("click", () => game.startRound());
document.getElementById("saveBtn").addEventListener("click", () => game.saveSession());
document.getElementById("loadBtn").addEventListener("click", () => game.loadSession());
document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Reset game?")) {
    stopBackgroundMusic();
    game.resetGame();
  }
});
document.getElementById("backBtn").addEventListener("click", () => window.close());
document.getElementById("musicToggleBtn").addEventListener("click", () => {
  if (bgAudio && !bgAudio.paused) {
    bgAudio.pause();
    logMessage("Music muted.");
  } else {
    startBackgroundMusic();
    logMessage("Music unmuted.");
  }
});

// Signal type handling
if (game.signalType === "click" || game.signalType === "mixed") {
  document.getElementById("signalArea").addEventListener("click", () => game.recordReaction());
}
if (game.signalType === "spacebar" || game.signalType === "mixed") {
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") game.recordReaction();
  });
}
