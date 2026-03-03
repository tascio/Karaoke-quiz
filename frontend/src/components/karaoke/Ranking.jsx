export default function Ranking({teams = {}}) {
    const medals = ["🥇", "🥈", "🥉"];
    return (
        <>
        {console.log("scores ", teams)}
        <div id="scores" className="container mt-4">
            <h2 className="mb-3 text-center">Ranking</h2>
            <ul id="scores-list" className="list-group score-list mx-auto">
            {Object.entries(teams)
                .sort((a, b) => (b[1].points + (b[1].p_audio || 0)) - (a[1].points + (a[1].p_audio || 0)))
                .map(([team, info], i) => ( 
                    <li 
                        key={team}
                        className="list-group-item score-item d-flex align-items-center text-bg-light fw-bold justify-content-between"
                    >
                    <span className="score-rank">{medals[i] || i + 1}</span>
                    <span className="score-name">{info.username}</span>
                    <span className="score-points">{(info.points || 0) + (info.p_audio || 0)} punti</span>
                    
                    </li>
                ))}
            </ul>
        </div>
        </>
    )
}