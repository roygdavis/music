declare module 'butterchurn' {
    export class Visualizer {
        constructor(audioContext: AudioContext, canvas: HTMLCanvasElement, options: { width: number; height: number });

        connectAudio(audioSource: AudioNode): void;
        launchSongTitleAnim(title: string): void;
        loadPreset(preset: any, blendTime: number): void;
        render(): void;
        setRendererSize(width: number, height: number): void;
    }

    export function createVisualizer(
        audioContext: AudioContext,
        canvas: HTMLCanvasElement,
        options: { width: number; height: number }
    ): Visualizer;
}