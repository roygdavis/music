import { useState } from "react";

export interface IPresets {
    [key: string]: any;
}

// export interface IPresetProps {
    
// }

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
    
    return <div className={`position-absolute bottom-0 start-50 translate-middle-x mb-5 pb-5 ${zenMode ? "visible" : "invisible"}`}>
        <button onClick={e => { e.preventDefault(); handleClick(-1); }}><i className="bi bi-arrow-left-circle-fill pr-2"></i></button>
        <button onClick={e => { e.preventDefault(); handleClick(1); }}><i className="bi bi-arrow-right-circle-fill"></i></button>
    </div>;
}