const video = document.getElementById("video-player");
let unlocked = false;

socket.on("quiz_finished", () => alert("Quiz ended!"));

// Avvia il video
socket.on("play_song", data => {
    document.getElementById("qr-codes").classList.add("d-none");
    document.getElementById("quiz").classList.add("d-none");
    document.getElementById("scores").classList.add("d-none");
    document.getElementById("countdown-overlay").classList.add("d-none");
    video.classList.remove("d-none");
    video.src = data.video;
    video.play();
});


// Mostra domanda
socket.on("show_question", data => {
    document.getElementById("qr-codes").classList.add("d-none");
    document.getElementById("countdown-overlay").classList.add("d-none");
    if (!video.paused) {
        video.pause();
        video.currentTime = 0;
    }
    video.classList.add("d-none");

    document.getElementById("quiz").classList.remove("d-none");
    document.getElementById("question").innerText = data.question;

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    // colori dei box in ordine
    const colors = ["primary", "warning", "pink", "purple"];

    data.choices.forEach((c, i) => {
        const [letter, text] = c.split(/:(.+)/);

        const col = document.createElement("div");
        col.className = "col-12 col-md-8 mb-3";

        const btn = document.createElement("div");
        btn.className = `answer-box bg-${colors[i % colors.length]} text-white d-flex align-items-center p-3 rounded`;

        btn.innerHTML = `
          <div class="answer-letter me-3 fw-bold fs-1">${letter}</div>
          <div class="answer-text fw-bold fs-1">${text}</div>
        `;

        col.appendChild(btn);
        choicesDiv.appendChild(col);
    });
});

// Mostra risposta corretta e classifica
socket.on("show_answer", data => {
    document.getElementById("qr-codes").classList.add("d-none");
    document.getElementById("countdown-overlay").classList.add("d-none");
    const correctIndex = data.correct;
    const choicesDiv = document.getElementById("choices");

    [...choicesDiv.children].forEach((el, i) => {
        const answerBox = el.querySelector(".answer-box"); // prendi il div interno        

        if (i === correctIndex) {
            //answerBox.classList.remove("bg-info", "bg-warning", "bg-danger", "bg-purple", "bg-primary");
            answerBox.classList.add("border", "border-success", "border-6", "answer-box-right"); // evidenzia corretta
        } else {
            answerBox.style.opacity = "0.25"; // sfuma le altre
        }
    });


    // aggiorna classifica
    const scores = document.getElementById("scores");
    scores.classList.remove("d-none");

    const ul = document.getElementById("scores-list");
    ul.className = "list-group score-list mx-auto";
    ul.innerHTML = ""; // pulisco prima di ricreare
    scores.innerHTML = ""; // reset container
    scores.appendChild(ul);

    Object.entries(data.teams)
        .sort((a, b) => (b[1].points + (b[1].p_audio || 0)) - (a[1].points + (a[1].p_audio || 0)))
        .forEach(([username, info], i) => {
            const li = document.createElement("li");
            li.className = "list-group-item score-item d-flex align-items-center text-bg-light fw-bold justify-content-between";

            li.innerHTML = `
                <span class="score-rank">${i + 1}</span>
                <span class="score-name">${username}</span>
                <span class="score-points">+${info.points}</span>
                <span class="ms-2 score-points text-danger">bonus +${info.p_audio}</span>
            `;

            ul.appendChild(li);
    });
});



socket.on("show_ranking_karaoke", data => {
    console.log(data);
    document.getElementById("qr-codes").classList.add("d-none");
    document.getElementById("quiz").classList.add("d-none");
    const scoresContainer = document.getElementById("scores");
    scoresContainer.classList.remove("d-none");

    const ul = document.getElementById("scores-list");
    ul.innerHTML = ""; // reset lista

    // Trasforma l'oggetto in array e ordina per points + p_audio
    const teams = Object.values(data);
    teams.sort((a, b) => (b.points + (b.p_audio || 0)) - (a.points + (a.p_audio || 0)));

    const medals = ["🥇", "🥈", "🥉"];

    teams.forEach((team, index) => {
        const li = document.createElement("li");
        li.className = "list-group-item score-item d-flex align-items-center fw-bold justify-content-between";

        const medal = medals[index] || `${index + 1}.`;

        const finalScore = (team.points || 0) + (team.p_audio || 0);

        li.innerHTML = `
            <span class="score-rank">${medal}</span>
            <span class="score-name">${team.username}</span>
            <span class="score-points">${finalScore} punti</span>
        `;

        ul.appendChild(li);
    });
});


  

  const overlay = document.getElementById("countdown-overlay");
  const number = document.getElementById("countdown-number");
  
socket.on("show_countdown", data => {
overlay.classList.remove("d-none");
number.innerText = data.count;

number.style.animation = "none";
number.offsetHeight; // trigger reflow
number.style.animation = null;
});
  

socket.on("karaoke_idle", () => {
    document.getElementById("video-player").classList.add("d-none");
    document.getElementById("quiz").classList.add("d-none");
    document.getElementById("scores").classList.add("d-none");
    document.getElementById("countdown-overlay").classList.add("d-none");

    document.getElementById("qr-codes").classList.remove("d-none");
});

socket.on("action_blocked", data => {
    console.log(data);
});