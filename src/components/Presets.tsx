import { useState } from "react";

export interface IPresets {
    [key: string]: any;
}

export const Presets = (props: { availablePresets: IPresets, zenMode: boolean, onPresetChanged: (index: number) => void }) => {
    const { availablePresets, onPresetChanged, zenMode } = props;
    const [current, setCurrent] = useState(0);
    
    const handleClick = (increment: number) => {
        let newValue = current + increment;
        const keys = Object.keys(availablePresets);
        if (newValue < 0) newValue = keys.length - 1;
        if (newValue >= keys.length) newValue = 0;
        setCurrent(newValue);
        onPresetChanged(newValue);
    }
    
    return <div id="fadingcarouselforpresets" className={`fixed-bottom carousel slide carousel-fade ${zenMode ? "invisible" : "visible"}`} style={{ marginBottom: "5em" }}>
        <div className="carousel-inner">
            {Object.keys(availablePresets).map((x, i) =>
                <div key={`car-viz-item-${i}`} className={`d-flex justify-content-center text-white carousel-item${i === current ? " active" : ""}`}>
                    <span>{x}</span>
                </div>
            )}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#fadingcarouselforpresets" data-bs-slide="prev" onClick={() => handleClick(-1)}>
            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#fadingcarouselforpresets" data-bs-slide="next" onClick={() => handleClick(1)}>
            <span className="carousel-control-next-icon" aria-hidden="true"></span>
            <span className="visually-hidden">Next</span>
        </button>
    </div>;
}