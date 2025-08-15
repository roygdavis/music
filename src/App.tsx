import { DragEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Milkdrop } from './components/visualisers/milkdrop/Milkdrop';
import WaveForm from './components/visualisers/waveform/WaveForm';
import Playlist from './components/Playlist';
import { BlobServiceClient } from '@azure/storage-blob';
import Dropper from './components/Dropper';
import { ICueFileInfo, ICueFileTrackInfo } from './types/CueFileTypes';
import React from 'react';
import { IAudioInformation } from './types/AudioTypes';
import { IAlbumItem } from './types/AlbumTypes';
import { IPlayback } from './types/Playback';
import { IVisualiser } from './types/VIsualiserTypes';

type CueFile = { name: string; content: string };
type CueFiles = CueFile[];

const AvailableVisualisers: IVisualiser[] = [
  { component: Milkdrop, name: "Milkdrop" },
  { component: WaveForm, name: "WaveForm" }
];

export const AppContext = React.createContext<{
  albums: IAlbumItem[];
  visualiser: IVisualiser;
  audioInformation?: IAudioInformation;
  playback: IPlayback;
} | null>(null);

function App() {
  const audioRef = useRef<HTMLMediaElement>(null);
  const [audioInformation, setAudioInformation] = useState<IAudioInformation>();
  const [zenMode, setZenMode] = useState(false);
  const [activeVisualiser, setActiveVisualiser] = useState(0);
  const [albums, setAlbums] = useState<IAlbumItem[]>([]);
  const Component = useMemo(() => AvailableVisualisers[activeVisualiser].component, [activeVisualiser]);
  const [audioConnected, setAudioConnected] = useState(false);
  const [playback, setPlayback] = useState<IPlayback>({ currentTrack: null, playbackPosition: null, playingAlbumIndex: -1 });
  const playlistHasItems = useMemo(() => albums.length > 0, [albums]);
  // const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);


  // TODO: is this albumns or cuefile?
  useEffect(() => {
    if (playlistHasItems && playback && playback.playingAlbumIndex > -1) {
      const playing = albums[playback.playingAlbumIndex];
      const track = playing.cueInfo?.tracks[
        (playing.cueInfo?.tracks.findIndex(x => x.timeIndex > (playback.playbackPosition ?? 0)) ?? 1) - 1
      ]?.title ?? "Unknown Track";
      const previousTrack = playback.currentTrack ?? "Unknown Track";
      if (track !== previousTrack) {
        const np = {
          // currentTrack: string | null;
          playbackPosition: playback.playbackPosition,
          // currentAlbum: string | null;
          playingAlbumIndex: playback.playingAlbumIndex
        } as IPlayback;
        setPlayback(np);
      }
    }
  }, [currentPlaybackPosition, albums, playback]);

  // Fetch the files from the Azure Blob Storage
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const blobServiceClient = new BlobServiceClient('https://rgdmusicstorage.blob.core.windows.net/?sv=2022-11-02&ss=b&srt=co&sp=rltf&se=2026-03-09T05:36:41Z&st=2025-03-08T21:36:41Z&spr=https&sig=w4R8CwEJ2RyOer%2BV4dy%2F2FfaLq21U2DZiobhXvbdktY%3D');
        const containerClient = blobServiceClient.getContainerClient('music');
        const audioFiles: IAlbumItem[] = [];
        const cueFiles: CueFiles = [];

        for await (const blob of containerClient.listBlobsFlat()) {
          const blobClient = containerClient.getBlobClient(blob.name);
          const blobUrl = blobClient.url;

          if (blob.name.endsWith('.mp3') || blob.name.endsWith('.wav')) {
            // Add audio files to the list
            audioFiles.push({ name: blob.name, url: blobUrl, isPlaying: false });
          } else if (blob.name.endsWith('.cue')) {
            // Fetch and store cue file content
            const response = await blobClient.download();
            const blobBody = await response.blobBody;
            const text = await blobBody?.text();
            if (text) {
              cueFiles.push({ name: blob.name, content: text });
            }
          }
        }

        parseCueFile(cueFiles, audioFiles);
        return audioFiles;
      } catch {
        throw "";
      }
    };

    fetchFiles()
      .then(success => {
        setAlbums(success);
      })
      .catch(error => {
        console.log("Error getting playlist from cdn:", error);
      });
  }, []);

  const connectAudio = () => {
    if (audioRef.current && !audioConnected) {
      const audioContext = new AudioContext();
      const analyserNode = audioContext.createAnalyser();
      const audioSource = audioContext.createMediaElementSource(audioRef.current);
      audioSource.connect(analyserNode);
      audioSource.connect(audioContext.destination);
      setAudioInformation({ audioContext, audioSource } as IAudioInformation);
      setAudioConnected(true);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    let droppedFilesProcessed = false;
    const newFileList = [...albums];

    const processFile = (f: File) => {
      if (f.type.startsWith('audio/')) {
        const url = URL.createObjectURL(f);
        newFileList.push({ name: f.name, url, isPlaying: false });
        droppedFilesProcessed = true;
      }
      if (f.type === "application/x-cue") {
        // load cue file if we have a matching audito clip already uploaded
        // const playListItem = newFileList.find(x => x.name.slice(0, x.name.length - 4) === f.name.slice(0, f.name.length - 4));
        // if (playListItem) {
        f.text()
          .then(success => {
            setAlbums([...parseCueFile([{ name: f.name, content: success }], albums)]);
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
    if (droppedFilesProcessed && !newFileList.some(x => x.isPlaying)) {
      if (newFileList.length === 1) {
        const track = newFileList[newFileList.length - 1];
        track.isPlaying = true;
        audioRef.current!.src = track.url;
        audioRef.current!.play();
        setAlbums([...newFileList]);
      }
      connectAudio();
    }
  }

  const handleVisualiserChanged = (i: number) => {
    setActiveVisualiser(i);
  }

  const handleFileChanged = async (blob: IAlbumItem) => {
    if (audioRef.current) {
      audioRef.current.src = blob.url;
      audioRef.current.play();
      const newFileList = [...albums];
      newFileList.forEach(x => x.isPlaying = false);
      blob.isPlaying = true;
      setAlbums(newFileList);
      connectAudio();
    }
  }

  const handlePlaybackPositionChanged = (n: number) => {
    setPlayback({
      ...playback,
      playbackPosition: n,
    });
  }

  return <AppContext.Provider value={
    {
      albums: albums,
      visualiser: AvailableVisualisers[activeVisualiser],
      audioInformation: audioInformation,
      playback: playback,
    }
  }>
    <div className="w-100 d-flex vh-100 overflow-hidden p-0" onDragOver={handleDragOver} onDrop={handleDrop} onMouseEnter={() => setZenMode(false)} onMouseLeave={() => setZenMode(true)} >
      <nav className={`navbar fixed-top navbar-expand ${zenMode && playlistHasItems ? "invisible" : "visible"}`} data-bs-theme="dark">
        <div className="container-fluid">
          {/* <span className="navbar-brand mb-0 h1">music.roygdavis.dev</span> */}
          <div className="d-flex flex-column float-start text-white">
            <h3 className="text-start"><i className="bi bi-headphones me-1"></i>music.roygdavis.dev</h3>
            <p className="text-start me-4">Site by <a href="https://github.com/roygdavis/music" className="text-white">Roy G Davis</a>, using <a href="https://github.com/jberg/butterchurn" className="text-white"> Butterchurn </a>with <i className="text-white bi bi-heart-fill"></i></p>
          </div>
          <div className='d-flex flex-row justify-content-between'>
            {playlistHasItems && <ul className="navbar-nav">
              {AvailableVisualisers.map((x, i) => <button key={`nav-viz-item-${i}`} className={`nav-link${i === activeVisualiser ? " active" : ""}`} onClick={() => handleVisualiserChanged(i)}>{x.name}</button>)}
            </ul>}
            <span className='text-white me-auto"'>{playback.currentTrack ?? ""}</span>
            {/* </div>
        <div className='d-flex flex-row justify-content-end'> */}
            <span className='text-white me-2 pt-2'>{playback.currentAlbum}</span>

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
            className={`w-100 sticky-bottom ${audioInformation ? "visible" : "invisible"}`}
            controls={!zenMode}
            ref={audioRef}
            autoPlay
            crossOrigin="anonymous"
            onProgress={e => handlePlaybackPositionChanged(e.currentTarget.currentTime)}
            onTimeUpdate={e => handlePlaybackPositionChanged(e.currentTarget.currentTime)}
          />
        </div>
      </div>
    </div>
  </AppContext.Provider>;
}

const parseCueFile = (cueFiles: CueFiles, audioFiles: IAlbumItem[]): IAlbumItem[] => {
  cueFiles.forEach(cueFile => {
    const baseName = cueFile.name.slice(0, -4); // Remove ".cue"
    const matchingAudio = audioFiles.find(audio => audio.name.startsWith(baseName));
    if (matchingAudio) {
      const lines = cueFile.content.split("\r\n");
      const cueFileInfo = {
        rem: [],
        title: "",
        performer: "",
        file: "",
        tracks: [],
        playbackPosition: null
      } as ICueFileInfo;

      lines.forEach(line => {
        if (line.startsWith("REM DATE"))
          cueFileInfo.rem.push(line.slice(9));
        if (line.startsWith("REM RECORDED_BY"))
          cueFileInfo.rem.push(line.slice(16));
        if (line.startsWith("TITLE"))
          cueFileInfo.title = line.slice(7);
        if (line.startsWith("PERFORMER"))
          cueFileInfo.performer = line.slice(10);
        if (line.startsWith("\t") && !line.startsWith("\t\t"))
          cueFileInfo.tracks.push({} as ICueFileTrackInfo);
        if (line.startsWith("\t\tTITLE")) {
          const t = cueFileInfo.tracks[cueFileInfo.tracks.length - 1];
          t.title = line.substring(8);
        }
        if (line.startsWith("\t\tPERFORMER")) {
          const t = cueFileInfo.tracks[cueFileInfo.tracks.length - 1];
          t.artist = line.substring(12);
        }
        if (line.startsWith("\t\tFILE")) {
          const t = cueFileInfo.tracks[cueFileInfo.tracks.length - 1];
          t.file = line.substring(7);
        }
        if (line.startsWith("\t\tINDEX")) {
          const t = cueFileInfo.tracks[cueFileInfo.tracks.length - 1];
          const timeString = line.substring(11);
          const h = Number.parseInt(timeString.slice(0, 2));
          const m = Number.parseInt(timeString.slice(3, 5));
          const s = Number.parseInt(timeString.slice(6, 8));
          t.timeIndex = s + (m * 60) + (h * 60 * 60);
        }
      });

      matchingAudio.cueInfo = cueFileInfo;
    }
  });
  return [...audioFiles];
}
// const EmptyBackground = () => <div className="w-100 d-flex text-center text-bg-dark">
//   <div className="w-100 d-flex p-3 mx-auto flex-column justify-content-center">

//   </div>
// </div>

export default App;

