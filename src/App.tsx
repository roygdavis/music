import { DragEvent, FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { Milkdrop } from './components/visualisers/milkdrop/Milkdrop';
import WaveForm from './components/visualisers/waveform/WaveForm';
import Playlist from './components/Playlist';
import { BlobServiceClient } from '@azure/storage-blob';
import Dropper from './components/Dropper';
import { ICueFileInfo, ITrackInfo } from './types/ITrackInfo';

export interface IVisualiserProps {
  audioContext: AudioContext;
  audioSource: MediaElementAudioSourceNode;
  zenMode: boolean;
}

interface IAudioInformation {
  audioContext: AudioContext;
  audioSource: MediaElementAudioSourceNode;
}

interface IVisualiser {
  component: FunctionComponent<IVisualiserProps>;
  name: string;
}

export interface ITrackItem {
  name: string;
  url: string;
  isPlaying: boolean;
  cueInfo?: ICueFileInfo;
}

const AvailableVisualisers: IVisualiser[] = [
  { component: Milkdrop, name: "Milkdrop" },
  { component: WaveForm, name: "WaveForm" }
];

function App() {
  const audioRef = useRef<HTMLMediaElement>(null);
  const [audioInformation, setAudioInformation] = useState<IAudioInformation>();
  const [zenMode, setZenMode] = useState(false);
  const [activeVisualiser, setActiveVisualiser] = useState(0);
  const [playList, setPlayList] = useState<ITrackItem[]>([]);
  const Component = useMemo(() => AvailableVisualisers[activeVisualiser].component, [activeVisualiser]);
  const [audioConnected, setAudioConnected] = useState(false);
  const nowPlaying = useMemo(() => playList.find(x => x.isPlaying), [playList]);
  const playlistHasItems = useMemo(() => playList.length > 0, [playList]);
  const [currentPlaybackPosition, setCurrentPlaybackPosition] = useState(0);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const blobServiceClient = new BlobServiceClient('https://rgdmusicstorage.blob.core.windows.net/?sv=2022-11-02&ss=b&srt=co&sp=rltf&se=2026-03-09T05:36:41Z&st=2025-03-08T21:36:41Z&spr=https&sig=w4R8CwEJ2RyOer%2BV4dy%2F2FfaLq21U2DZiobhXvbdktY%3D');
        const containerClient = blobServiceClient.getContainerClient('music');
        const blobItems = [] as ITrackItem[];

        for await (const blob of containerClient.listBlobsFlat()) {
          const blobClient = containerClient.getBlobClient(blob.name);
          const blobUrl = blobClient.url;
          blobItems.push({ name: blob.name, url: blobUrl, isPlaying: false });
        }
        return blobItems;
      } catch {
        throw "";
      }
    };

    fetchFiles()
      .then(success => {
        setPlayList(success);

      })
      .catch(error => {
        console.log("Error getting playlist from cdn");
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
    const newFileList = [...playList];

    const processFile = (f: File) => {
      if (f.type.startsWith('audio/')) {
        const url = URL.createObjectURL(f);
        newFileList.push({ name: f.name, url, isPlaying: false });
        console.log(f.name);
        droppedFilesProcessed = true;
      }
      if (f.type === "application/x-cue") {
        console.log(f);
        // load cue file if we have a matching audito clip already uploaded
        const playListItem = newFileList.find(x => x.name.slice(0, x.name.length - 4) === f.name.slice(0, f.name.length - 4));
        if (playListItem) {
          f.text()
            .then(success => {
              const lines = success.split("\r\n");
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
                  cueFileInfo.tracks.push({} as ITrackInfo);
                if (line.startsWith("\t\tTITLE")) {
                  const t = cueFileInfo.tracks[cueFileInfo.tracks.length - 1];
                  t.title = line;
                }
                if (line.startsWith("\t\tPERFORMER")) {
                  const t = cueFileInfo.tracks[cueFileInfo.tracks.length - 1];
                  t.artist = line;
                }
                if (line.startsWith("\t\tFILE")) {
                  const t = cueFileInfo.tracks[cueFileInfo.tracks.length - 1];
                  t.file = line;
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
              playListItem.cueInfo = cueFileInfo;
            })
            .catch(error => {
              console.log(error);
            })
        }
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
    if (droppedFilesProcessed) {
      setPlayList(newFileList);
      if (newFileList.length === 1) {
        const track = newFileList[0];
        track.isPlaying = true;
        audioRef.current!.src = track.url;
      }
      connectAudio();
    }
  }

  const handleVisualiserChanged = (i: number) => {
    setActiveVisualiser(i);
  }

  const handleFileChanged = async (blob: ITrackItem) => {
    if (audioRef.current) {
      audioRef.current.src = blob.url;
      audioRef.current.play();
      connectAudio();
    }
  }

  const handlePlaybackPositionChanged = (n: number) => {
    setCurrentPlaybackPosition(n);
    console.log(n);
  }

  return <div className="w-100 d-flex vh-100 overflow-hidden p-0" onDragOver={handleDragOver} onDrop={handleDrop} onMouseEnter={() => setZenMode(false)} onMouseLeave={() => setZenMode(true)} >
    <nav className={`navbar fixed-top navbar-expand ${zenMode && playlistHasItems ? "invisible" : "visible"}`} data-bs-theme="dark">
      <div className="container-fluid">
        {/* <span className="navbar-brand mb-0 h1">music.roygdavis.dev</span> */}
        <div className="d-flex flex-column float-start text-white">
          <h3 className="text-start"><i className="bi bi-headphones me-1"></i>music.roygdavis.dev</h3>
          <p className="text-start me-4">Site by <a href="https://github.com/roygdavis/music" className="text-white">Roy G Davis</a>, using <a href="https://github.com/jberg/butterchurn" className="text-white"> Butterchurn </a>with <i className="text-white bi bi-heart-fill"></i></p>
        </div>
        {playlistHasItems && <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {AvailableVisualisers.map((x, i) => <button key={`nav-viz-item-${i}`} className={`nav-link${i === activeVisualiser ? " active" : ""}`} onClick={() => handleVisualiserChanged(i)}>{x.name}</button>)}
        </ul>}
        <div className='d-flex flex-row justify-content-end'>
          <span className='text-white me-2 pt-2'>{nowPlaying?.name}</span>

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
    {audioConnected ? <Component audioContext={audioInformation!.audioContext} audioSource={audioInformation!.audioSource} zenMode={zenMode} /> : <Dropper />}
    <div className='position-absolute top-50 end-50 text-white'>
      {nowPlaying?.cueInfo?.tracks.find(x => x.timeIndex > currentPlaybackPosition)?.title}
    </div>
    <Playlist blobs={playList} onFileChanged={handleFileChanged}></Playlist>
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
  </div>;
}

// const EmptyBackground = () => <div className="w-100 d-flex text-center text-bg-dark">
//   <div className="w-100 d-flex p-3 mx-auto flex-column justify-content-center">

//   </div>
// </div>

export default App;
