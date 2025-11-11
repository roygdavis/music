import { DragEvent, useContext, useMemo, useRef, useState } from "react"
import Dropper from "./Dropper"
import Playlist from "./Playlist"
import { AppContext } from "../AppContextProvider";
import { IAlbumItem } from "../types/AlbumTypes";
import { parseAndMatchCueFile } from "../utils/parseAndMatchCueFile";
import { IVisualiser } from "../types/VIsualiserTypes";
import { Milkdrop } from "./visualisers/milkdrop/Milkdrop";
import WaveForm from "./visualisers/waveform/WaveForm";


const AvailableVisualisers: IVisualiser[] = [
  { component: Milkdrop, name: "Milkdrop" },
  { component: WaveForm, name: "WaveForm" }
];

export const Player = () => {
  const audioRef = useRef<HTMLMediaElement>(null);
  const context = useContext(AppContext);
  const [audioConnected, setAudioConnected] = useState(false);
  const playlistHasItems = useMemo(() => (context?.albums && context.albums.length > 0) || false, [context?.albums]);
  const activeVisualiser = useMemo(() =>
    AvailableVisualisers[context?.activeVisualiser || 0],
    [context?.activeVisualiser]);
  const currentlyPlayingAlbumName = useMemo(() => {
    if (!context?.albums || context.playingAlbumIndex === undefined) return "";
    return context.albums[context.playingAlbumIndex]?.name || "";
  }, [context?.albums, context?.playingAlbumIndex]);
  const playingTrackName = useMemo(() => {
    if (!context?.albums || context.playingAlbumIndex === undefined) return "";
    const playing = context.albums[context.playingAlbumIndex];
    if (!playing.cueInfo) return "";
    return playing.cueInfo.tracks[
      (playing.cueInfo.tracks.findIndex(x => x.timeIndex > (context.playbackPosition ?? 0)) ?? 1) - 1
    ]?.title ?? "Unknown Track";
  }, [context?.albums, context?.playingAlbumIndex, context?.playbackPosition]);
  
  const Component = activeVisualiser.component;

  const connectAudio = () => {
    if (audioRef.current && !audioConnected) {
      const audioContext = new AudioContext();
      const analyserNode = audioContext.createAnalyser();
      const audioSource = audioContext.createMediaElementSource(audioRef.current);
      audioSource.connect(analyserNode);
      audioSource.connect(audioContext.destination);
      context?.setAudioContext(audioContext);
      context?.setAudioSource(audioSource);
      setAudioConnected(true);
    }
  }
    
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }
    
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    let newAlbums = context?.albums || [];
    const albumCount = newAlbums.length ?? 0;
    
    const processFile = (f: File) => {
      if (f.type.startsWith('audio/')) {
        const url = URL.createObjectURL(f);
        newAlbums.push({ name: f.name, url, isPlaying: false });
      }
      if (f.type === "application/x-cue") {
        // load cue file if we have a matching audito clip already uploaded
        // const playListItem = newFileList.find(x => x.name.slice(0, x.name.length - 4) === f.name.slice(0, f.name.length - 4));
        // if (playListItem) {
        f.text()
          .then(success => {
            newAlbums = parseAndMatchCueFile([{ name: f.name, content: success }], newAlbums);
          })
          .catch(error => {
            console.log(error);
          })
        // }
      }
    }
    
    console.log(e.dataTransfer.items, e.dataTransfer.files);
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...e.dataTransfer.items].forEach((item) => {
        // If dropped items aren't files, reject them
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file !== null)
            processFile(file);
        }
      });
    } else {
      // Use DataTransfer interface to access the file(s)
      [...e.dataTransfer.files].forEach((file) => {
        processFile(file);
      });
    }
    if (newAlbums.length > 0) {
      const track = newAlbums[albumCount];
      console.log("Playing dropped file:", track);
      track.isPlaying = true;
      context?.setAlbums(newAlbums);
      audioRef.current!.src = track.url;
      audioRef.current!.play();
      if (!audioConnected) connectAudio();
    }
  }
    
  const handleVisualiserChanged = (i: number) => {
    context?.setActiveVisualiser(i);
  }
    
  const handleFileChanged = async (blob: IAlbumItem) => {
    if (audioRef.current) {
      audioRef.current.src = blob.url;
      audioRef.current.play();
      const newFileList = (context?.albums && [...context?.albums]) || [];
      newFileList.forEach(x => x.isPlaying = false);
      blob.isPlaying = true;
      context?.setAlbums(newFileList);
      connectAudio();
    }
  }
    
  const handlePlaybackPositionChanged = (n: number) => {
    context?.setPlaybackPosition(n);
  }
    
  return <div className="w-100 d-flex vh-100 overflow-hidden p-0" onDragOver={handleDragOver} onDrop={handleDrop} onMouseEnter={() => context?.setZenMode(false)} onMouseLeave={() => context?.setZenMode(true)} >
    <nav className={`navbar fixed-top navbar-expand ${context?.zenMode && playlistHasItems ? "invisible" : "visible"}`} data-bs-theme="dark">
      <div className="container-fluid">
        {/* <span className="navbar-brand mb-0 h1">music.roygdavis.dev</span> */}
        <div className="d-flex flex-column float-start text-white">
          <h3 className="text-start"><i className="bi bi-headphones me-1"></i>music.roygdavis.dev</h3>
          <p className="text-start me-4">Site by <a href="https://github.com/roygdavis/music" className="text-white">Roy G Davis</a>, using <a href="https://github.com/jberg/butterchurn" className="text-white"> Butterchurn </a>with <i className="text-white bi bi-heart-fill"></i></p>
        </div>
        <div className='d-flex flex-row justify-content-between'>
          {playlistHasItems && <ul className="navbar-nav">
            {AvailableVisualisers.map((x, i) => <button key={`nav-viz-item-${i}`} className={`nav-link${i === context?.activeVisualiser ? " active" : ""}`} onClick={() => handleVisualiserChanged(i)}>{x.name}</button>)}
          </ul>}
          <span className='text-white me-auto"'>{playingTrackName ?? ""}</span>
          {/* </div>
            <div className='d-flex flex-row justify-content-end'> */}
          <span className='text-white me-2 pt-2'>{currentlyPlayingAlbumName}</span>
    
          <a
            tabIndex={0}
            className="btn text-white"
            data-bs-toggle="offcanvas"
            href="#offcanvasPlaylist"
            role="button"
            aria-controls="offcanvasPlaylist">
            Playlist <i className="bi bi-list"></i>
          </a>
        </div>
      </div>
    </nav>
    {audioConnected
      ? <Component />
      : <Dropper />}
    <div className='position-absolute top-50 end-50 text-white'>
    
    </div>
    <Playlist onFileChanged={handleFileChanged}></Playlist>
    <div className="fixed-bottom">
      <div className="col">
        <audio
          className={`w-100 sticky-bottom visible`}
          controls={!context?.zenMode}
          ref={audioRef}
          autoPlay
          crossOrigin="anonymous"
          onProgress={e => handlePlaybackPositionChanged(e.currentTarget.currentTime)}
          onTimeUpdate={e => handlePlaybackPositionChanged(e.currentTarget.currentTime)}
        />
      </div>
    </div>
  </div>;
}