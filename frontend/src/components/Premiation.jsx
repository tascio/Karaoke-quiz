import { useEffect, useState } from "react";

export default function Premiation({ teams }) {

  const [visibleTeams, setVisibleTeams] = useState([]);

  useEffect(() => {
    if (!teams) return;

    let index = teams.length;
    const interval = setInterval(() => {
      if (index <= 0) {
        clearInterval(interval);
        return;
      }

      setVisibleTeams(prev => [
        teams[index - 1],
        ...prev
      ]);

      index--;
    }, 3000);

    return () => clearInterval(interval);
  }, [teams]);

  return (
    <ul className="list-group">
      {visibleTeams.map((team, i) => (
        <li key={i} className="list-group-item">
          {team.username} - {team.total} pts
        </li>
      ))}
    </ul>
  );
}
