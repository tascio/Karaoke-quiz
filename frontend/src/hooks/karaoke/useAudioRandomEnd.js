import { useRef, useState } from "react";

export default function useAudioRandomEnd() {
    const Pendround = "../../static/audio/karaoke/end_round"

    const [enabled, setEnabled] = useState(false);

    const endRoundAudios = useRef([
        new Audio(`${Pendround}/coffin_dance.mp3`),
        new Audio(`${Pendround}/big_shoe.mp3`),
        new Audio(`${Pendround}/ncs.mp3`),
        new Audio(`${Pendround}/omfg_hello.mp3`),
        new Audio(`${Pendround}/rat_dance.mp3`),
        new Audio(`${Pendround}/thunderstruck.mp3`),
        new Audio(`${Pendround}/baby_laugh.mp3`),
        new Audio(`${Pendround}/monkeys_spinning.mp3`),
    ]);

    function playRandom(audioArray) {
        if (!enabled) return;
        const index = Math.floor(Math.random() * audioArray.length);
        const audio = audioArray[index];
        audio.currentTime = 0;
        audio.play();
    }

    function stopAll() {
        endRoundAudios.current.forEach(a => {
        a.pause();
        a.currentTime = 0;
        });
    }

    return {
        enabled,
        setEnabled,
        playRandom,
        stopAll,
        endRoundAudios
    };
}
