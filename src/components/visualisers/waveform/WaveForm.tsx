import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import useSize from "../../../hooks/useSize";
import { IVisualiserProps } from "../../Visualiser";
import { IPresets, Presets } from "../../Presets";

interface DrawParameters {
    analyser: AnalyserNode;
    buffer: Uint8Array;
    canvasCtx: CanvasRenderingContext2D;
    width: number;
    height: number;
    frameRef: React.MutableRefObject<number>;
}

interface PresetAction {
    setup: () => void;
    drawCallback: (params: DrawParameters) => void;
}

const WaveForm = (props: IVisualiserProps) => {
    const { audioContext, audioSource, zenMode, onPresetChanged } = props;
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [width, height] = useSize();
    const analyserRef = useRef<AnalyserNode>();
    const frameRef = useRef(0);
    const bufferRef = useRef(new Uint8Array());
    const drawRef = useRef<(props: DrawParameters) => void>(drawBars);
    const [selectedPreset, setSelectedPreset] = useState(0);
    const presetChangedCallback = useCallback((name: string) => onPresetChanged(name), [selectedPreset]);
    const presets = useMemo(() => {
        return {
            "waves": {
                setup: () => {
                    analyserRef.current!.fftSize = 2048;
                    bufferRef.current = new Uint8Array(analyserRef.current!.fftSize);
                    canvasCtxRef.current!.clearRect(0, 0, width, height);
                },
                drawCallback: (props: DrawParameters) => drawWaveLine(props)
            } as PresetAction,
            "bars": {
                setup: () => {
                    analyserRef.current!.fftSize = 512;
                    bufferRef.current = new Uint8Array(analyserRef.current!.frequencyBinCount);
                    canvasCtxRef.current!.clearRect(0, 0, width, height);
                },
                drawCallback: (props: DrawParameters) => drawBars(props)
            } as PresetAction
        } as IPresets
    }, []);
    
    const handlePresetChanged = (i: number) => {
        const presetKeys = Object.keys(presets);
        const p = presets[presetKeys[i]];
        p.setup();
        drawRef.current = p.drawCallback;
        setSelectedPreset(i);
        presetChangedCallback(presetKeys[i]);
    };

    const animate = () => {
        if (!canvasRef.current || !analyserRef.current || !canvasCtxRef.current || !bufferRef.current) return;
        const draw = () => {
            drawRef.current({ analyser: analyserRef.current!, buffer: bufferRef.current, canvasCtx: canvasCtxRef.current!, width, height, frameRef });
            frameRef.current = requestAnimationFrame(draw);
        }        
        draw();
    };

    useEffect(() => {
        const analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyserRef.current = analyser;
        if (canvasRef && canvasRef.current) {
            canvasCtxRef.current = canvasRef.current.getContext("2d");
        }

        return () => {
            analyser.disconnect();
        }
    });

    useEffect(() => {
        const presetKeys = Object.keys(presets);
        const p = presets[presetKeys[selectedPreset]];
        p.setup();
        drawRef.current = p.drawCallback;
        animate();

        return () => {
            cancelAnimationFrame(frameRef.current);
        }
    });

    // useEffect(() => {
    //     if (canvasRef.current) {
    //         console.log(width, height);
    //         const w = width;
    //         const h = height;
    //         canvasRef.current.width = w;
    //         canvasRef.current.height = h;
    //     }
    // }, [width, height]);

    return (
        <>
            <canvas
                style={{
                    left: "0",
                    zIndex: "-10"
                }}
                className="sticky-top"
                ref={canvasRef}
                width={width}
                height={height}
            />
            <Presets onPresetChanged={i => handlePresetChanged(i)} availablePresets={presets} zenMode={!zenMode} ></Presets>
        </>
    );
};

export default WaveForm;

const drawWaveLine = (props: DrawParameters) => {
    const { analyser, buffer, canvasCtx, width, height } = props;
    analyser.getByteTimeDomainData(buffer);
    // take 10% of start of buffer
    // const bufferSlice = buffer.length / 5;
    // take average value of that 10%
    // const slicedBuffer=buffer.slice(1, bufferSlice);
    // set background red value based on that
    // const avg = slicedBuffer.reduce((p, c) => p + c) / bufferSlice*2;

    canvasCtx.fillStyle = `rgb(200 200 200)`;
    canvasCtx.fillRect(0, 0, width, height);
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(0 0 0)";
    canvasCtx.beginPath();
    const sliceWidth = width / buffer.length;
    let x = 0;
    for (let i = 0; i < buffer.length; i++) {
        const v = buffer[i] / 128.0;
        const y = v * (height / 2);

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    canvasCtx.lineTo(width, height / 2);
    canvasCtx.stroke();
    canvasCtx.closePath();
}

const drawBars = (props: DrawParameters) => {
    const { analyser, buffer, canvasCtx, width, height } = props;
    const bufferLength = buffer.length;
    analyser.getByteFrequencyData(buffer);
    canvasCtx.fillStyle = "rgb(200 200 200)";
    canvasCtx.fillRect(0, 0, width, height);
    const barWidth = (width / bufferLength);
    let x = 0;
    // console.log(bufferLength,buffer.length);
    for (let i = 0; i < bufferLength; i++) {
        const barHeight = Math.round((height / 256) * buffer[i]);
        canvasCtx.fillStyle = `rgb(${barHeight} 0 0)`;
        // console.log(barHeight);
        canvasCtx.fillRect(
            x,
            height-barHeight/2,
            barWidth,
            barHeight/2
        );
        x += barWidth;
    };
}