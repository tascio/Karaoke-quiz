import { useEffect, useState, useRef } from "react";
import QRSection from "../components/QRSection";
import VideoPlayer from "../components/VideoPlayer";
import Quiz from "../components/Quiz";
import Scores from "../components/Scores";
import Countdown from "../components/Countdown";
import Premiation from "../components/Premiation";
import useKaraokeSocket from "../hooks/karaoke/useKaraokeSocket";
import useAudioEffects from "../hooks/karaoke/useAudioEffects";
import { socket } from "../socket";

export default function Karaoke() { 
  useAudioEffects();

  const [view, setView] = useState("qr");
  const [questionData, setQuestionData] = useState(null);
  const [scoresData, setScoresData] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [premiationData, setPremiationData] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [correctIndex, setCorrectIndex] = useState(null);

  useKaraokeSocket({
    onPlaySong: (data) => {
      setVideoSrc(data.video);
      setView("video");
    },

    onShowQuestion: (data) => {
      setQuestionData(data);
      setCorrectIndex(null);  // reset highlight
      setScoresData(null);
      setView("quiz");
    },

    onShowAnswer: (data) => {
      setCorrectIndex(data.correct);
      setScoresData(data.teams);
    },

    onShowCountdown: (data) => {
      setCountdown(data.count);
    },

    onIdle: () => setView("qr"),

    onPremiation: (data) => {
      setPremiationData(data);
      setView("premiation");
    }
  });

  return (
    <div className="container text-center">

      <h1 className="text-primary">Sing QUIZ</h1>

      {view === "qr" && <QRSection />}
      {view === "video" && <VideoPlayer src={videoSrc} />}
      {view === "quiz" && (
        <>
          <Quiz data={questionData} correct={correctIndex} />
          {scoresData && <Scores teams={scoresData} />}
        </>
      )}
      {view === "scores" && <Scores teams={scoresData} />}

      {view === "premiation" && <Premiation teams={premiationData} />}

      {countdown && <Countdown count={countdown} />}

    </div>
  );
}
