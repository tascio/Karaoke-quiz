import { useEffect, useState } from "react";

const Ppremiation = "/static/audio/karaoke/premiation";
const audioAbbaWinner = new Audio(`${Ppremiation}/abba_the_winner.mp3`);

export default function Premiation({ teams = [] }) {

  const [visibleTeams, setVisibleTeams] = useState([]);

  useEffect(() => {
    if (!teams.length) return;

    // 🔊 Play audio
    audioAbbaWinner.play();

    // Reset
    setVisibleTeams([]);

    // 🔢 Ordina per punteggio totale
    const sorted = [...teams].sort(
      (a, b) =>
        (b.points + (b.p_audio || 0)) -
        (a.points + (a.p_audio || 0))
    );

    const overTeams = sorted.slice(10);
    const topTeams = sorted.slice(0, 10);

    // 👇 Mostra subito le ultime
    const lowRanks = overTeams.map((team, index) => {
      const position = 11 + index;
      const total = (team.points || 0) + (team.p_audio || 0);
      return { ...team, position, total };
    });

    setVisibleTeams(lowRanks);

    // 👑 Animazione top 10
    let index = topTeams.length - 1;

    const interval = setInterval(() => {
      if (index < 0) {
        clearInterval(interval);
        return;
      }

      const team = topTeams[index];
      const position = index + 1;
      const total = (team.points || 0) + (team.p_audio || 0);

      setVisibleTeams(prev => [
        { ...team, position, total },
        ...prev
      ]);

      index--;

    }, 3000);

    return () => clearInterval(interval);

  }, [teams]);

  return (
    <ul className="list-group score-list mx-auto">

      {visibleTeams.map((team, i) => {

        const isPodium = team.position <= 3;

        return (
          <li
            key={`${team.username}-${team.position}`}
            className={`list-group-item score-item-prem d-flex align-items-center justify-content-between mt-4
              ${isPodium ? `podium-prem-${team.position} podium-prem-animate` : "score-item"}
              show
            `}
          >

            {isPodium ? (
              <span className="trophy">
                {["","🏆","🥈","🥉"][team.position]}
              </span>
            ) : (
              <span>{team.position}</span>
            )}

            <span className="score-name fw-bold">
              {team.username}
            </span>

            <span className="score-points">
              {team.total} pts
            </span>

            {isPodium && (
              <span className="trophy">
                {["","🏆","🥈","🥉"][team.position]}
              </span>
            )}

          </li>
        );
      })}

    </ul>
  );
}