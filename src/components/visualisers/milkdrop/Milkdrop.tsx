import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import useSize from '../../../hooks/useSize';
import { Presets } from '../../Presets';
import { IVisualiserProps } from '../../Visualiser';

// export interface IMilkDropProps{
//     audioSource: MediaElementAudioSourceNode;
//     audioContext: AudioContext;
//     zenMode: Boolean;
// }

export const Milkdrop = (props: IVisualiserProps) => {
    const { audioSource, audioContext, zenMode, onPresetChanged } = props;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [width, height] = useSize();
    const visualiserRef = useRef();
    const frameRef = useRef(0);
    const [selectedPreset, setSelectedPreset] = useState(0);
    const presetChangedCallback = useCallback((name: string) => onPresetChanged(name), [selectedPreset]);

    useEffect(() => {
        const connectAudio = () => {
            const visualiser = butterchurn.createVisualizer(audioContext, canvasRef.current, {
                width: width,
                height: height,
            });
            visualiser.connectAudio(audioSource);
            visualiserRef.current = visualiser;
            renderFrame();
        };
        if (!audioContext && !audioSource)
            return;
        connectAudio();
        return () => {
            visualiserRef.current = undefined;
            cancelAnimationFrame(frameRef.current);
        };
    }, [audioSource, audioContext]);
    
    const renderFrame = () => {
        visualiserRef.current && (visualiserRef.current as any).render();
        frameRef.current = requestAnimationFrame(renderFrame);
    };

    const handlePresetChanged = (i: number) => {
        const presetKeys = Object.keys(presets);
        // console.log(i, presetKeys.length);
        const p = presets[presetKeys[i]];
        (visualiserRef.current as any).loadPreset(p, 3); // 2nd argument is the number of seconds to blend presets, 0 = instant
        setSelectedPreset(i);
        onPresetChanged(presetKeys[i]);
    }

    const presets = useMemo(() => {
        return (visualiserRef && visualiserRef.current) ? butterchurnPresets.getPresets() : {};
    }, [visualiserRef.current]);

    useEffect(() => {
        visualiserRef.current && (visualiserRef.current as any).setRendererSize(width, height);
    }, [width, height]);

    useEffect(() => {
        const presetKeys = Object.keys(presets);
        onPresetChanged(presetKeys[selectedPreset]);
    });

    return <>
        <canvas
            className="min-vw-100 min-vh-100"
            ref={canvasRef}
            width={width}
            height={height}>
        </canvas>
        <Presets onPresetChanged={i => handlePresetChanged(i)} availablePresets={presets} zenMode={!zenMode} ></Presets>
    </>;
}