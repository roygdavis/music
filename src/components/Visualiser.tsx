import { ReactNode } from "react";

export interface IVisualiserProps {
    audioContext: AudioContext;
    audioSource: MediaElementAudioSourceNode;
    zenMode: boolean;
}

export const Visualiser = (props: { children?: ReactNode }) => {
    const { children } = props;

    return <>
        {children}
    </>
}