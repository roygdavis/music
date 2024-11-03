import { FunctionComponent } from "react";

export interface IVisualiserProps {
    audioContext: AudioContext;
    audioSource: MediaElementAudioSourceNode;
    zenMode: boolean;
}

export const Visualiser = (props: IVisualiserProps & { component: FunctionComponent<IVisualiserProps> }) => {
    const { zenMode, audioContext, audioSource, component: Component } = props;
    return <Component zenMode={zenMode} audioContext={audioContext} audioSource={audioSource} />
}