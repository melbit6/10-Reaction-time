// Cookie helpers
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

// Update preview
function updatePreview() {
  const playerName = document.getElementById("playerName").value || "Anonymous";
  const difficulty = document.getElementById("difficulty").value;
  const rounds = document.getElementById("roundCount").value;
  const signalType = document.querySelector('input[name="signalType"]:checked').value;
  const sound = document.getElementById("soundEnabled").checked ? "Sound ON" : "Sound OFF";
  const penalty = document.getElementById("falseStartPenalty").checked ? "Penalty ON" : "Penalty OFF";
  const avg = document.getElementById("showAverage").checked ? "Average ON" : "Average OFF";

  document.getElementById("previewText").innerText =
    `Player: ${playerName}, Difficulty: ${difficulty}, Rounds: ${rounds}, Signal: ${signalType}, ${sound}, ${penalty}, ${avg}`;
}//brings back the information written by the player

document.getElementById("setupForm").addEventListener("input", updatePreview);

// Buttons
document.getElementById("openGameBtn").addEventListener("click", () => {
  let playerName = document.getElementById("playerName").value;
  if (!playerName) {
    playerName = prompt("Enter your name:");
  }
  const gameSettings = {
    playerName,
    difficulty: document.getElementById("difficulty").value,
    rounds: parseInt(document.getElementById("roundCount").value),
    signalType: document.querySelector('input[name="signalType"]:checked').value,
    soundEnabled: document.getElementById("soundEnabled").checked,
    falseStartPenalty: document.getElementById("falseStartPenalty").checked,
    showAverage: document.getElementById("showAverage").checked
  };
  sessionStorage.setItem("gameSettings", JSON.stringify(gameSettings));
  window.open("game.html", "_blank", "width=700,height=500");
});

document.getElementById("saveSettingsBtn").addEventListener("click", () => {
  setCookie("playerName", document.getElementById("playerName").value, 7);
  alert("Settings saved!");
});

document.getElementById("loadSettingsBtn").addEventListener("click", () => {
  const savedName = getCookie("playerName");
  if (savedName) {
    document.getElementById("playerName").value = savedName;
    updatePreview();
    alert("Settings loaded!");
  } else {
    alert("No saved settings found.");
  }
});

document.getElementById("resetSettingsBtn").addEventListener("click", () => {
  if (confirm("Reset all settings?")) {
    document.getElementById("setupForm").reset();
    updatePreview();
  }
});

document.getElementById("instructionsBtn").addEventListener("click", () => {
  window.open("instructions.html", "_blank", "width=600,height=400");
});