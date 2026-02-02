const Ppremiation = "/static/audio/karaoke/premiation"
const audioAbbaWinner = new Audio(`${Ppremiation}/abba_the_winner.mp3`);
const audioPremiation = [audioAbbaWinner];


function lowranks(teams) {
console.log(teams);
const ul = document.getElementById("scores-list");
for (let i = teams.length; i > 0; i--) {
    const position = 11 + teams.length - i;
    const finalScore = (teams[i-1].points || 0) + (teams[i-1].p_audio || 0);
    const li = document.createElement("li");
    li.className = "list-group-item score-item-prem d-flex align-items-center justify-content-between mt-4";
    li.innerHTML = `<span>${position}</span>
        <span class="score-name fw-bold">${teams[i-1].username}</span>
        <span class="score-points">${finalScore} pts</span>`
    ul.appendChild(li);

    requestAnimationFrame(() => li.classList.add("show"));
}
}

socket.on("showPremiationKaraoke", data => {
console.log(data);
playRandomAudioKaraoke(audioPremiation);
document.getElementById("qr-codes").classList.add("d-none");
document.getElementById("quiz").classList.add("d-none");

const scoresContainer = document.getElementById("scores");
scoresContainer.classList.remove("d-none");

const ul = document.getElementById("scores-list");
ul.innerHTML = "";

const allTeams = Object.values(data)
    .sort((a, b) => (b.points + (b.p_audio || 0)) - (a.points + (a.p_audio || 0)))
const overTeams = allTeams.slice(10, 100);
teams = allTeams.slice(0, 10);

lowranks(overTeams);

let index = teams.length;

const interval = setInterval(() => {
    if (index <= 0) {
    clearInterval(interval);
    return;
    }

    const team = teams[index - 1];
    const position = index;
    console.log(position);
    const finalScore = (team.points || 0) + (team.p_audio || 0);

    const li = document.createElement("li");
    li.className = "list-group-item score-item-prem d-flex align-items-center justify-content-between mt-4";

    let podiumClass = "";
    let trophy = "";

    if (position <= 3) {
    podiumClass = `podium-prem-${position}`;
    trophy = `<span class="trophy">${["","🏆","🥈","🥉"][position]}</span>`;

    li.classList.add(podiumClass, 'podium-prem-animate');

    li.innerHTML = `
        ${position <= 3 ? trophy : `<span>${position}.</span>`}
        <span class="score-name fw-bold">${team.username}</span>
        <span class="score-points">${finalScore} pts</span>
        ${position <= 3 ? trophy : ""}
    `;
    } else {
        li.classList.add('score-item');
        li.innerHTML = `<span>${position}</span>
        <span class="score-name fw-bold">${team.username}</span>
        <span class="score-points">${finalScore} pts</span>`
    }

    ul.prepend(li);

    requestAnimationFrame(() => li.classList.add("show"));

    index--;
}, 3000); 
});
