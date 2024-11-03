import { DragEvent, FunctionComponent, useMemo, useRef, useState } from 'react';
import Dropper from './components/Dropper';
import { Milkdrop } from './components/visualisers/milkdrop/Milkdrop';
import WaveForm from './components/visualisers/waveform/WaveForm';

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

const AvailableVisualisers: IVisualiser[] = [
  { component: Milkdrop, name: "Milkdrop" },
  { component: WaveForm, name: "WaveForm" }
];

function App() {
  const audioRef = useRef<HTMLMediaElement>(null);
  const [audioInformation, setAudioInformation] = useState<IAudioInformation>();
  const [zenMode, setZenMode] = useState(false);
  const audioDropped = useMemo(() => audioInformation !== undefined, [audioInformation]);
  const [trackName, setTrackName] = useState("");
  const [activeVisualiser, setActiveVisualiser] = useState(0);
  const Component = useMemo(() => AvailableVisualisers[activeVisualiser].component, [activeVisualiser]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const connectAudio = () => {
      if (audioRef.current && !audioDropped) {
        const audioContext = new AudioContext();
        const analyserNode = audioContext.createAnalyser();
        const audioSource = audioContext.createMediaElementSource(audioRef.current);
        audioSource.connect(analyserNode);
        audioSource.connect(audioContext.destination);

        setAudioInformation({ audioContext, audioSource } as IAudioInformation);
      }
    };

    const processFile = (f: File) => {
      if (f.type.startsWith('audio/')) {
        setTrackName(f.name);
        const url = URL.createObjectURL(f);
        audioRef.current!.src = url;
        connectAudio();
      }
    }

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
  }

  const handleVisualiserChanged = (i: number) => {
    setActiveVisualiser(i);
  }

  return <div className="w-100 d-flex vh-100 overflow-hidden p-0" onDragOver={handleDragOver} onDrop={handleDrop} onMouseEnter={() => setZenMode(false)} onMouseLeave={() => setZenMode(true)} >
    <nav className={`navbar fixed-top navbar-expand ${zenMode && audioDropped ? "invisible" : "visible"}`} data-bs-theme="dark">
      <div className="container-fluid">
        {/* <span className="navbar-brand mb-0 h1">music.roygdavis.dev</span> */}
        <div className="d-flex flex-column float-start text-white">
          <h3 className="text-start"><i className="bi bi-headphones me-1"></i>music.roygdavis.dev</h3>
          <p className="text-start me-4">Site by <a href="https://github.com/roygdavis/music" className="text-white">Roy G Davis</a>, using <a href="https://github.com/jberg/butterchurn" className="text-white"> Butterchurn </a>with <i className="text-white bi bi-heart-fill"></i></p>
        </div>
        {audioDropped && <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {AvailableVisualisers.map((x, i) => <button key={`nav-viz-item-${i}`} className={`nav-link${i === activeVisualiser ? " active" : ""}`} onClick={() => handleVisualiserChanged(i)}>{x.name}</button>)}
        </ul>}
        <div className='d-flex'>
          <span className='text-white'>{trackName}</span>
        </div>
      </div>
    </nav>
    {audioDropped ? <Component audioContext={audioInformation!.audioContext} audioSource={audioInformation!.audioSource} zenMode={zenMode} /> : <Dropper />}
    <div className="fixed-bottom">
      <div className="col">
        <audio
          className={`w-100 sticky-bottom ${audioInformation ? "visible" : "invisible"}`}
          controls={!zenMode}
          ref={audioRef}
          autoPlay
          crossOrigin="anonymous"
        />
      </div>
    </div>
  </div>;
}

export default App;
