import { FunctionComponent } from "react";

export interface IVisualiserProps {
    audioContext: AudioContext;
    audioSource: MediaElementAudioSourceNode;
    zenMode: boolean;
}

export type PresetVisualiserProps = IVisualiserProps;

export const Visualiser = (props: IVisualiserProps & { component: FunctionComponent<PresetVisualiserProps> }) => {
    const { zenMode, audioContext, audioSource, component: Component } = props;

    return <>
        <Component zenMode={zenMode} audioContext={audioContext} audioSource={audioSource} />
    </>
}