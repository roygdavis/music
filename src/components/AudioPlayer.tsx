import { useEffect, useRef, useState } from "react";
import { IAudioAnalyserData } from "../types/IAudioAnalyserData";

export type IAudioPlayerProps = {
    audioUrl: string,
    onAudioDataChanged: (audioData: IAudioAnalyserData) => void,
    onPlaybackTimeUpdated: (seconds: number) => void,
    onPlayPause: (isPlaying: Boolean) => void
};

export const AudioPlayer = (props: IAudioPlayerProps) => {
    const { audioUrl, onAudioDataChanged, onPlaybackTimeUpdated, onPlayPause } = props;

    

    
    return <div className="fixed-bottom">
        <div className="col">
            
        </div>
    </div>;
}