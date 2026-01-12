

function startSong() {
  socket.emit("start_song");
}

function requestQuestion() {
  socket.emit("request_question");
}

function showRoundScore() {
  socket.emit("showRoundScore");
}

function showRanking() {
  socket.emit("show_ranking");
}

function refreshPlayers() {
  socket.emit("refresh_players");
}

function setIdle() {
  socket.emit("setIdle");
}

socket.on("quiz_finished", () => alert("Quiz ended!"));

socket.on("show_scores_host", scores => {
  const ul = document.getElementById("scores");
  ul.innerHTML = "";

  // trasforma l'oggetto in array
  const teams = Object.values(scores);

  // ordina per points DESC
  teams.sort((a, b) => b.points - a.points);

  // stampa classifica
  teams.forEach((team, index) => {
    const li = document.createElement("li");
    li.innerText = `${index + 1}. ${team.username} — ${team.points} punti (✔ ${team.indovinate} ✖ ${team.sbagliate})`;
    ul.appendChild(li);
  });
});

