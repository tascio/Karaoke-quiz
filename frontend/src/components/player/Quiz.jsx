import { useState, useEffect } from "react";
import useAudioEffects from "../../hooks/player/useAudioEffects";

export default function Quiz({ question, answer, audioEffectsPlayers }) {
  const {audioRights, audioWrongs, audioNull, playRandomAudio} = useAudioEffects();

  const [answered, setAnswered] = useState(false);
  const [givenAnswer, setGivenAnswer] = useState(null);
  const [correctAnswer, setCorrectAnswer] = useState(null);

  useEffect(() => {
    if (!question) return;

    // reset nuova domanda
    setAnswered(false);
    setGivenAnswer(null);
    setCorrectAnswer(null);

    // risposta corretta arrivata → fine quiz
    if (question.correct !== undefined) {
      setCorrectAnswer(question.correct);
    }

    // risposta giocatore esistente
    if (question.answer !== undefined && question.answer !== null) {
      setAnswered(true);
      setGivenAnswer(question.answer);
    }

  }, [question]);

  useEffect(() => {
    console.log("porcodio", audioEffectsPlayers);

    if (!audioEffectsPlayers) return;
    if (correctAnswer === null) return;

    if (givenAnswer === null) {
      console.log("NULL");
      playRandomAudio(audioNull);
      return;
    }
    if (correctAnswer === givenAnswer) {
      console.log("GIUSTA");
      playRandomAudio(audioRights);
      return;
    } 
    console.log("SBAGLIATA");
    playRandomAudio(audioWrongs);
  }, [correctAnswer]);

  if (!question) return null;

  const colors = ["primary", "warning", "pink", "purple"];

  const handleClick = (index) => {
    if (answered || correctAnswer !== null) return;

    answer(index);
    setAnswered(true);
    setGivenAnswer(index);
  };

  return (
    <div>

      <h4 className="mb-4 fs-1">
        {question.question}
      </h4>

      <div className="d-flex flex-column align-items-center gap-3">

        {question.choices.map((choice, i) => {

          const [letter] = choice.split(/:(.+)/);

          const isGiven = i === givenAnswer;
          const isCorrect = i === correctAnswer;

          let opacity = 1;
          let classListSuccess = "border border-success border-6";
          let classListWrong = "border border-danger border-6";
          let classList = "";
          let height = "120px";
          let width = "200px";

          // Dopo risposta utente
          if (answered && correctAnswer === null && !isGiven)
            opacity = 0.1;

          // Dopo timeout
          if (correctAnswer !== null) {

            opacity = 0.2;

            if (isCorrect) {
              classList = classListSuccess;
              height = "160px";
              width = "240px";
              if (isCorrect === isGiven) opacity = 1;
            }

            if (isGiven && !isCorrect) {
              opacity = 1;
              classList = classListWrong;
              height = "160px";
              width = "240px";
            }

          }

          return (
            <button
              key={i}
              className={`btn btn-${colors[i % colors.length]} choice-btn display-1 text-white ${classList}`}
              style={{
                width: width,
                height: height,
                borderRadius: "90%",
                opacity: opacity,
                position: "relative"
              }}
              disabled={answered || correctAnswer !== null}
              onClick={() => handleClick(i)}
            >

            {letter}

              {/* ICONA CORRETTA */}
            {correctAnswer !== null && isCorrect && (
            <div
                className="bg-success"
                style={{
                width: "64px",
                height: "64px",
                position: "absolute",
                mask: "url('/static/icons/check2-circle.svg') no-repeat center",
                maskSize: "contain",
                top: "30%",
                left: "60%"
                }}
            />
            )}

            {/* ICONA SBAGLIATA */}
            {correctAnswer !== null && isGiven && !isCorrect && (
            <div
                className="bg-danger"
                style={{
                width: "64px",
                height: "64px",
                position: "absolute",
                mask: "url('/static/icons/x-circle.svg') no-repeat center",
                maskSize: "contain",
                top: "30%",
                left: "60%"
                }}
            />
            )}
            </button>
          );

        })}

      </div>

    </div>
  );
}
