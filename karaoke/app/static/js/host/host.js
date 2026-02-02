

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

socket.on("all_question_host", q => {
  console.log("all question", q);
  const row = document.getElementById(`q-${q.id_q}`);
  row.classList.remove("table-success");
  row.classList.add("table-danger");
  const doneCell = row.querySelector('[data-field="q-done"]');
  if (doneCell) {
    doneCell.innerText = "✔️";
  }
});

socket.on("current_question_host", q => {
  console.log("current question ", q);
  document.getElementById("question-id").innerText = q.id_q;
  document.getElementById("question-title").innerText = q.title;
  document.getElementById("question-artist").innerText = q.artist;
  document.getElementById("question-question").innerText = q.question;
  document.getElementById("question-answers").innerText = q.answers;
  document.getElementById("question-correct").innerText = `${["A", "B", "C", "D"][q.correct]}`;
  document.getElementById("question-author").innerText = q.author;
  document.getElementById("question-done").innerText = q.done ? "✔️" : "❌";
});


socket.on("quiz_finished", () => alert("Quiz ended!"));

socket.on("show_scores_host", scores => {
  console.log("scores ", scores);
  const tbody = document.getElementById("ranking-body");

  Object.entries(scores).forEach(([ipKey, data]) => {
    let row = tbody.querySelector(`tr[data-ip="${ipKey}"]`);

    if (!row) {
      row = document.createElement("tr");
      row.dataset.ip = ipKey;

      row.innerHTML = `
        <td class="team-ip"></td>
        <td class="team-username"></td>
        <td class="team-points"></td>
        <td class="team-p-audio"></td>
      `;

      tbody.appendChild(row);
    }

    row.querySelector(".team-ip").innerText =
      ipKey.replace("ip:", "").replaceAll("_", ".");
    row.querySelector(".team-username").innerText = data.username;
    row.querySelector(".team-points").innerText = data.points;
    row.querySelector(".team-p-audio").innerText = data.p_audio;
  });

  sortRankingTable();
})

function sortRankingTable() {
  const tbody = document.getElementById("ranking-body");
  const rows = [...tbody.querySelectorAll("tr")];

  rows.sort((a, b) => {
    const pA = parseInt(a.querySelector(".team-points").innerText);
    const pB = parseInt(b.querySelector(".team-points").innerText);
    return pB - pA;
  });

  rows.forEach(r => tbody.appendChild(r));
}
