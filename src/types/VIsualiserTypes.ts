import { FunctionComponent } from "react";

export interface IVisualiserComponent {
    // audioContext: AudioContext;
    // audioSource: MediaElementAudioSourceNode;
    // zenMode: boolean;
}

export interface IVisualiser {
    component: FunctionComponent<IVisualiserComponent>;
    name: string;
}