import { useCallback, useState } from "react";
import { Milkdrop } from "./visualisers/milkdrop/Milkdrop"
import WaveForm from "./visualisers/waveform/WaveForm";

export interface IVisualiserProps {
    audioContext: AudioContext;
    audioSource: MediaElementAudioSourceNode;
    zenMode: boolean;
}

// TODO: This component should display a visualiser selection screen as an overlay so users can select different viz
export const Visualiser = (props: IVisualiserProps) => {
    const { zenMode, audioContext, audioSource } = props;
    const [activeVisualiser, setActiveVisualiser] = useState(0);
    const VisualiserComponent = AvailableVisualisers[activeVisualiser].component;

    return <>
        <div className={`position-absolute top-0 start-50 translate-middle-x mb-5 pb-5 ${!zenMode ? "visible" : "invisible"}`}>
            <div className="btn-group" role="group" aria-label="Basic radio toggle button group">
                {AvailableVisualisers.map((x, i) => <div key={`viz-${i}`}>
                    <input type="radio" className="btn-check" name="btnradio" id={`btnradio${i}`} autoComplete="off" onClick={()=> setActiveVisualiser(i)} />
                    <label className="btn btn-outline-primary" htmlFor={`btnradio${i}`}>{x.name}</label>
                </div>)}
            </div>
        </div>
        <VisualiserComponent zenMode={zenMode} audioContext={audioContext} audioSource={audioSource} />
        { /* <Milkdrop audioContext={audioContext} audioSource={audioSource} zenMode={zenMode} /> */}
    </>;
}

const AvailableVisualisers = [
    { component: Milkdrop, name: "Milkdrop" },
    { component: WaveForm, name: "WaveForm" }
];