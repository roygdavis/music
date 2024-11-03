import { FunctionComponent } from "react";

export interface IVisualiserProps {
    audioContext: AudioContext;
    audioSource: MediaElementAudioSourceNode;
    zenMode: boolean;
    onPresetChanged(presetName: string): void;
}

export const Visualiser = (props: IVisualiserProps & { component: FunctionComponent<IVisualiserProps> }) => {
    const { zenMode, audioContext, audioSource, component: Component, onPresetChanged } = props;
    return <Component zenMode={zenMode} audioContext={audioContext} audioSource={audioSource} onPresetChanged={onPresetChanged} />
}