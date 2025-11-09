import { useContext, useEffect, useMemo, useRef } from 'react';
import butterchurn from 'butterchurn';
// import type { Visualizer } from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';
import useSize from '../../../hooks/useSize';
import { Presets } from '../../Presets';
import { AppContext } from '../../../AppContextProvider';


export const Milkdrop = () => {
  const context = useContext(AppContext);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, height] = useSize();
  const visualiserRef = useRef<butterchurn.Visualizer>();
  const frameRef = useRef(0);
  const nowPlaying = useMemo(() => {
    if (!context?.albums || context.playingAlbumIndex === undefined) return "";
    return context.albums[context.playingAlbumIndex]?.name || "Unknown Track";
  }, [context?.albums, context?.playingAlbumIndex]);

  useEffect(() => {
    const connectAudio = () => {
      if (context && context.audioContext && context.audioSource && !visualiserRef.current && canvasRef.current) {
        const visualiser = butterchurn.createVisualizer(context.audioContext, canvasRef.current, {
          width: width,
          height: height,
        });
        visualiser.connectAudio(context.audioSource);
        visualiserRef.current = visualiser;
        renderFrame();
      }
    };

    connectAudio();

    return () => {
      visualiserRef.current = undefined;
      cancelAnimationFrame(frameRef.current);
    };
  }, [context?.audioSource, context?.audioContext]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (visualiserRef.current && frameRef.current) {
        const viz = visualiserRef.current as butterchurn.Visualizer;
        viz.launchSongTitleAnim(nowPlaying);
      }
    }, 1500);

    return () => {
      clearTimeout(handler);
    };

  }, [nowPlaying]);
    
  const renderFrame = () => {
    visualiserRef.current && (visualiserRef.current as butterchurn.Visualizer).render();
    frameRef.current = requestAnimationFrame(renderFrame);
  };

  const presets = useMemo(() => {
    const presets = (visualiserRef && visualiserRef.current) ? butterchurnPresets.getPresets() : {};
    const presetKeys = Object.keys(presets);
    const p = presets[presetKeys[4]];
    if (p)
      (visualiserRef.current as butterchurn.Visualizer).loadPreset(p, 0);
    return presets;
  }, [visualiserRef.current]);

  const handlePresetChanged = (i: number) => {
    const presetKeys = Object.keys(presets);
    const p = presets[presetKeys[i]];
    (visualiserRef.current as butterchurn.Visualizer).loadPreset(p, 3); // 2nd argument is the number of seconds to blend presets, 0 = instant
  }

  useEffect(() => {
    visualiserRef.current && (visualiserRef.current as butterchurn.Visualizer).setRendererSize(width, height);
  }, [width, height]);

  useEffect(() => {

  }, [presets]);

  return <>
    <canvas
      className="min-vw-100 min-vh-100"
      ref={canvasRef}
      width={width}
      height={height}>
    </canvas>
    <Presets onPresetChanged={i => handlePresetChanged(i)} availablePresets={presets} zenMode={false} ></Presets>
  </>;
}