export interface IAudioAnalyserData {
    analyser: AnalyserNode;
    bufferLength: number;
    dataArray: Uint8Array;
    audioContext: AudioContext;
}