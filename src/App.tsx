import { DragEvent, useMemo, useRef, useState } from 'react';
import { Visualiser } from './components/Visualiser';
import Dropper from './components/Dropper';

interface IAudioInformation {
  audioContext: AudioContext;
  audioSource: MediaElementAudioSourceNode;
}

function App() {
  const audioRef = useRef<HTMLMediaElement>(null);
  const [audioInformation, setAudioInformation] = useState<IAudioInformation>();
  const [zenMode, setZenMode] = useState(false);
  const audioDropped = useMemo(() => audioInformation !== undefined, [audioInformation]);

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
        // setNowPlaying(f);
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

  return <div className="w-100 d-flex vh-100 overflow-hidden p-0" onDragOver={handleDragOver} onDrop={handleDrop} onMouseEnter={() => setZenMode(false)} onMouseLeave={() => setZenMode(true)} >
    {audioDropped ? <Visualiser audioContext={audioInformation!.audioContext} audioSource={audioInformation!.audioSource} zenMode={zenMode}></Visualiser> : <Dropper />}
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
