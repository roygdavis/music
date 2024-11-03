import { useEffect, useMemo, useRef } from 'react';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import useSize from '../../../hooks/useSize';
import { Presets } from '../../Presets';
import { IVisualiserProps } from '../../Visualiser';

export const Milkdrop = (props: IVisualiserProps) => {
    const { audioSource, audioContext, zenMode } = props;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [width, height] = useSize();
    const visualiserRef = useRef();
    const frameRef = useRef(0);

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
        const p = presets[presetKeys[i]];
        (visualiserRef.current as any).loadPreset(p, 3); // 2nd argument is the number of seconds to blend presets, 0 = instant
    }

    const presets = useMemo(() => {
        return (visualiserRef && visualiserRef.current) ? butterchurnPresets.getPresets() : {};
    }, [visualiserRef.current]);

    useEffect(() => {
        visualiserRef.current && (visualiserRef.current as any).setRendererSize(width, height);
    }, [width, height]);

    return <>
        <canvas
            className="min-vw-100 min-vh-100"
            ref={canvasRef}
            width={width}
            height={height}>
        </canvas>
        <Presets onPresetChanged={i => handlePresetChanged(i)} availablePresets={presets} zenMode={zenMode} ></Presets>
    </>;
}