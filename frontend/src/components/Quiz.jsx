export default function Quiz({ data, correct }) {
    if (!data) return null;
  
    const { question, author, choices } = data;
  
    const colors = ["primary", "warning", "pink", "purple"];
  
    return (
        <>
            {correct !== null && (
                <>
                    {console.log(correct)}
                    <p>DIO CANE</p>
                </>
            )}
            <div className="container text-center mt-4">
        
                <h2 className="mb-0 fs-1">{question}</h2>
        
                <div className="d-flex justify-content-center align-items-center mb-3">
                <small className="text-light fst-italic opacity-75">
                    by {author}
                </small>
                </div>
        
                <div className="row justify-content-center">
                {choices.map((choice, i) => {
                    const [letter, text] = choice.split(/:(.+)/);
                    const isCorrect = i === correct;
        
                    return (
                    <div key={i} className="col-12 col-md-8 mb-3">
                        <div
                            className={`answer-box d-flex align-items-center p-3 rounded text-white ${
                                isCorrect ? "border border-success border-6 answer-box-right" : `bg-${colors[i % colors.length]}`
                            }`}
                        >
                        <div className="answer-letter me-3 fw-bold fs-1">
                            {letter}
                        </div>
        
                        <div className="answer-text fw-bold fs-1">
                            {text}
                        </div>
                        </div>
                    </div>
                    );
                })}
                </div>
        
            </div>
        </>
    );

    
}
  