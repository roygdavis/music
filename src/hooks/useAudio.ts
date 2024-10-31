import { useEffect, useState } from "react";

export const useAudio = ( audioRef?: HTMLMediaElement ) => {
    const [handled, setHandled] = useState(false);
    let audioContext;
    let audioSource;
    useEffect(() => {
        if (audioRef && !handled) {
            audioContext = new AudioContext();
            const analyserNode = audioContext.createAnalyser();
            audioSource = audioContext.createMediaElementSource(audioRef);
            audioSource.connect(analyserNode);
            audioSource.connect(audioContext.destination);
            setHandled(true);
        }
    });
    return { audioContext, audioSource };
}