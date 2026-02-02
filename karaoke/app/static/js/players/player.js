let username = "";
let joined = false;
let answered = false;

socket.on("sync_state", data => {
  console.log('data sync', data);

  if (!data) {
    return;
  }
  if (data.state === "quiz") {
      socket.emit("request_question_refresh");
  }
  if (data.state === "sing") {
      socket.emit("start_song_refresh");
  }
  if (data.state === "quiz_end") {
    socket.emit("request_question_refresh");
  }
  if (typeof data.audioEffectsPlayers === "boolean") {
    audioEffectsPlayers = data.audioEffectsPlayers;
  }
});

socket.on("refresh_players", () => {
  location.reload();
})


socket.on("join_ok", () => {
  setTimeout(() => {
    window.location.reload();
  }, 300);
});

socket.on("username_exist", () => {
  alert("Username or player already exist!");
});

socket.on("connect", () => {
  console.log("connected ", socket.id);
});

//QUIZ
socket.on("show_question", data => {
  console.log('show question ', data);
  answered = false;
  let givenAnswer = null;
  
  if (data.answer !== undefined && data.answer.done === true) {
    answered = true;
    givenAnswer = data.answer.answer;
  }

  
  document.getElementById("quiz").classList.remove("d-none");
  document.getElementById("sing").classList.add("d-none");
  document.getElementById("status").classList.add("d-none");
  document.getElementById("question").innerText = data.question;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  choicesDiv.className = "d-flex flex-column align-items-center gap-3";

  const colors = ["primary", "warning", "pink", "purple"];

  data.choices.forEach((c, i) => {
    const [letter, _] = c.split(/:(.+)/);

    const btn = document.createElement("button");
    btn.className = `btn btn-${colors[i % colors.length]} choice-btn display-1 text-white`;
    btn.style.width = "200px";
    btn.style.height = "120px";
    btn.style.borderRadius = "90%"; 

    btn.innerText = letter;
    btn.dataset.index = i;

    if (answered) {
      btn.disabled = true;

      if (i === givenAnswer) {
        btn.disabled = false;
      } else {
        btn.style.opacity = "0.1";
      }
    }

    btn.onclick = () => {
      if (!answered) {
        socket.emit("answer", { choice: i });
        document.querySelectorAll(".choice-btn").forEach(b => {
          b.disabled = true; 
          b.style.opacity = '0.1';
        });
        btn.disabled = false;
        btn.style.opacity = '1';
        answered = true;
      }
    };

    choicesDiv.appendChild(btn);
  });
});

socket.on("show_question_refresh", data => {
  console.log('show question refresh ', data);

  document.getElementById("quiz").classList.remove("d-none");
  document.getElementById("sing").classList.add("d-none");
  document.getElementById("status").classList.add("d-none");
  document.getElementById("question").innerText = data.question;

  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  choicesDiv.className = "d-flex flex-column align-items-center gap-3";

  const colors = ["primary", "warning", "pink", "purple"];

  data.choices.forEach((c, i) => {
    const [letter, _] = c.split(/:(.+)/);

    const btn = document.createElement("button");
    btn.className = `btn btn-${colors[i % colors.length]} choice-btn display-1 text-white`;
    btn.style.width = "200px";
    btn.style.height = "120px";
    btn.style.borderRadius = "90%"; 

    btn.innerText = letter;
    btn.dataset.index = i;

    if (data.answer != null) {
      btn.disabled = true;

      if (i === data.answer) {
        btn.disabled = false;
      } else {
        btn.style.opacity = "0.1";
      }
    } else {
      btn.onclick = () => {
        if (data.answer == null || data.answer == undefined) {
          socket.emit("answer", { choice: i });
          document.querySelectorAll(".choice-btn").forEach(b => {
            b.disabled = true; 
            b.style.opacity = '0.1';
          });
          btn.disabled = false;
          btn.style.opacity = '1';

        }
      };
    }
    choicesDiv.appendChild(btn);
    
  });
  if (data.answer != null || data.answer != undefined) {
    show_answer_right_players({"correct": data.correct,
      "answer": data.answer
    });
  }
})

socket.on("show_answer_right_players", data => {
  show_answer_right_players(data); 
});

//SING
socket.on("show_sing", () => {
  document.getElementById("quiz").classList.add("d-none");
  document.getElementById("status").classList.add("d-none");
  document.getElementById("sing").classList.remove("d-none");
});

//IDLE
socket.on("idle", () => {
  document.getElementById("quiz").classList.add("d-none");
  document.getElementById("sing").classList.add("d-none");
  document.getElementById("status").classList.remove("d-none");
});

socket.on("quiz_finished", () => alert("Quiz ended!"));


//PART OF THE CODE RELATING SIGN IN
function join() {
  if (joined) return;

  const input = document.getElementById("username");
  username = input.value.trim();

  if (!username) {
    alert("Inserisci un nome squadra");
    return;
  }

  socket.emit("join", { "username": username , "role": "player" });
}
///////////////////////////////////////////////////





//PART OF THE CODE RELATING MAKE EVIDENT RIGHT OR WRONG ANSWER
function show_answer_right_players(data) {
  console.log('show answer right ', data);
  if (data.answer == null) {
    playRandomAudio(audioNull);
    document.querySelectorAll(".choice-btn").forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.1';
      return;
    });
  }
  document.querySelectorAll(".choice-btn").forEach(btn => {
    const index = parseInt(btn.dataset.index);
    if (index === data.correct && !btn.disabled) {
      btn.classList.add("border", "border-success", "border-6");
      btn.style.width = "240px";
      btn.style.height = "160px";
      btn.style.position = "relative";

      const icon = document.createElement("div");
      icon.className = "bg-success";
      icon.style.width = "64px";
      icon.style.height = "64px";
      icon.style.position = "absolute";
      icon.style.mask = "url('/static/icons/check2-circle.svg') no-repeat center";
      icon.style.maskSize = "contain";
      icon.style.webkitMask = icon.style.mask;
      icon.style.top = "30%";
      icon.style.left = "60%";

      playRandomAudio(audioRights);
      btn.appendChild(icon);
    }
    if (index !== data.correct && index === data.answer && !btn.disabled)
    {
      btn.classList.add("border", "border-danger", "border-6");
      btn.style.width = "240px";
      btn.style.height = "160px";
      btn.style.position = "relative";

      const icon = document.createElement("div");
      icon.className = "bg-danger";
      icon.style.width = "64px";
      icon.style.height = "64px";
      icon.style.position = "absolute";
      icon.style.mask = "url('/static/icons/x-circle.svg') no-repeat center";
      icon.style.maskSize = "contain";
      icon.style.webkitMask = icon.style.mask;
      icon.style.top = "30%";
      icon.style.left = "60%";

      playRandomAudio(audioWrongs);
      btn.appendChild(icon);
    }
  });
}
/////////////////////////////////////////////




