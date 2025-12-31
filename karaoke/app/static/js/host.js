

function startSong() {
  socket.emit("start_song");
}

function requestQuestion() {
  socket.emit("request_question");
}

function endQuestion() {
  socket.emit("end_question");
}

function showRanking() {
  socket.emit("show_ranking");
}


socket.on("show_scores_host", scores => {
  const ul = document.getElementById("scores");
  ul.innerHTML = "";

  // trasforma l'oggetto in array
  const teams = Object.values(scores);

  // ordina per punteggio DESC
  teams.sort((a, b) => b.punteggio - a.punteggio);

  // stampa classifica
  teams.forEach((team, index) => {
    const li = document.createElement("li");
    li.innerText = `${index + 1}. ${team.username} — ${team.punteggio} punti (✔ ${team.indovinate} ✖ ${team.sbagliate})`;
    ul.appendChild(li);
  });
});

