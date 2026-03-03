export default function Scores({teams = {}}) {
    return (
        <>
        {console.log("scores ", teams)}
        <div id="scores" className="container mt-4">
            <h2 className="mb-3 text-center">Round Score</h2>
            <ul id="scores-list" className="list-group score-list mx-auto">
            {Object.entries(teams)
                .sort((a, b) => (b[1].points + (b[1].p_audio || 0)) - (a[1].points + (a[1].p_audio || 0)))
                .map(([username, info], i) => ( 
                    <li 
                        key={username}
                        className="list-group-item score-item d-flex align-items-center text-bg-light fw-bold justify-content-between"
                    >
                    <span>{i + 1}</span>
                        <span>{username}</span>
                        <span>+{info.points}</span>
                        <span className="text-danger">
                            bonus +{info.p_audio || 0}
                        </span>

                    </li>
                ))}
            </ul>
        </div>
        </>
    )
}