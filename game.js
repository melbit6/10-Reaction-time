
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

//  Game state 
class ReactionGame {
  constructor(settings) {
    this.player = settings.playerName || "Anonymous";
    this.rounds = settings.rounds || 5;
    this.difficulty = settings.difficulty || "medium";
    this.signalType = settings.signalType || "click";
    this.falseStartPenalty = settings.falseStartPenalty || false;
    this.showAverage = settings.showAverage || true;

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
        this.scores.push(1000); // penalty time
      }
      return;
    }
    const reaction = Date.now() - this.startTime;
    this.scores.push(reaction);
    updateDisplay("displayScore", reaction);
    updateResults(`Round ${this.currentRound}: ${reaction} ms`);
    logMessage(`Round ${this.currentRound} reaction: ${reaction} ms`);
    this.waiting = false;

    // Update best and average
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

  saveSession() {
    sessionStorage.setItem("reactionGame", JSON.stringify(this));
    alert("Session saved!");
  }

  loadSession() {
    const data = JSON.parse(sessionStorage.getItem("reactionGame"));
    if (data) {
      Object.assign(this, data);
      updateDisplay("displayPlayer", this.player);
      updateDisplay("displayRound", this.currentRound);
      updateDisplay("displayFalseStarts", this.falseStarts);
      updateResults("Session loaded. Continue playing.");
      logMessage("Session loaded.");
    } else {
      alert("No saved session found.");
      
    }
  }
}

// Helper function
function updateDisplay(id, value) {
  document.getElementById(id).innerText = value;
}
function updateSignal(text, stateClass) {
  const el = document.getElementById("signalArea");
  el.innerText = text;
  el.className = "signal-area " + stateClass;

  // If the signal says GO, turn background pink
  if (text === "GO!") {
    el.style.backgroundColor = "pink";
    el.style.color = "black"; 
  } else {
    // Reset to default when not GO
    el.style.backgroundColor = "";
    el.style.color = "";
  }
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

// Game initialises
const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
const game = new ReactionGame(settings);
updateDisplay("displayPlayer", game.player);

// Event listener 
document.getElementById("startBtn").addEventListener("click", () => {
  game.startRound();
});

document.getElementById("nextRoundBtn").addEventListener("click", () => {
  if (game.currentRound < game.rounds) {
    game.startRound();
  } else {
    alert("All rounds completed.");
  }
});

document.getElementById("saveBtn").addEventListener("click", () => {
  game.saveSession();
});

document.getElementById("loadBtn").addEventListener("click", () => {
  game.loadSession();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  if (confirm("Reset game?")) {
    game.resetGame();
  }
});

document.getElementById("backBtn").addEventListener("click", () => {
  window.close();
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