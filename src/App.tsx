import { DragEvent, useRef, useState } from 'react';
// import { ICueFileInfo } from './types/ITrackInfo';
// import { Playlist } from './components/Playlist';
import { Visualiser } from './components/Visualiser';
// import { useAudio } from './hooks/useAudio';


interface IAudioInformation {
  audioContext: AudioContext;
  audioSource: MediaElementAudioSourceNode;
}

function App() {
  const [nowPlaying, setNowPlaying] = useState<File|null>();
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);
  const [isPaused, setTrackPaused] = useState<Boolean>(true);
  const audioRef = useRef<HTMLMediaElement>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [audioInformation, setAudioInformation] = useState<IAudioInformation>();
  const [zenMode, setZenMode] = useState(false);
  
  // const handleClipChanged = (clip: ICueFileInfo) => {
  //   setNowPlaying(clip);
  // }

  const handlePlaybackTimeUpdated = (seconds: number) => {
    const s = Math.round(seconds);
    if (s !== playbackPosition)
      setPlaybackPosition(s);
  }

  const handlePlay = (isPaused: Boolean) => {
    setTrackPaused(isPaused);
  }

  // useEffect(() => {
  //   
  //   if (userInteracted)
  //     connectAudio();
  // }, [userInteracted]);

  // useEffect(() => {
  //   const setZenModeOff = () => {
  //     console.log("setZenModeOff");
  //     setZenMode(false);
  //   };

  //   const setZenModeOn = () => {
  //     console.log("setZenModeOn");
  //     setZenMode(true);
  //   }
    
  //   window.addEventListener("onmouseleave", setZenModeOn);
  //   window.addEventListener("onmouseenter", setZenModeOff);

  //   return () => {
  //     window.removeEventListener("onmouseleave", setZenModeOn);
  //     window.removeEventListener("onmouseenter", setZenModeOff);
  //   }

  // }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setUserInteracted(true);
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>)=> {
    e.preventDefault();
    
    const processFile = (f: File) => {
      if (f.type.startsWith('audio/')){
        setNowPlaying(f);
        const url = URL.createObjectURL(f);
        audioRef.current!.src = url;
        connectAudio();
      }
    }

    const connectAudio = () => {
        if (audioRef.current) {
          const audioContext = new AudioContext();
          const analyserNode = audioContext.createAnalyser();
          const audioSource = audioContext.createMediaElementSource(audioRef.current);
          audioSource.connect(analyserNode);
          audioSource.connect(audioContext.destination);

          setAudioInformation({ audioContext, audioSource } as IAudioInformation);
        }
      };

    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      [...e.dataTransfer.items].forEach((item, i) => {
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
  
  return <div className="container-fluid vh-100 overflow-hidden p-0" onDragOver={handleDragOver} onDrop={handleDrop} onMouseEnter={e => setZenMode(false)} onMouseLeave={e => setZenMode(true)} >
    {audioInformation && <Visualiser audioContext={audioInformation.audioContext} audioSource={audioInformation.audioSource} zenMode={zenMode}></Visualiser>}
    <div className="fixed-bottom">
      <div className="col">
        <audio
          className='w-100 sticky-bottom'
          controls={!zenMode}
          ref={audioRef}
          autoPlay
          crossOrigin="anonymous"
          onPlay={e => handlePlay(false)}
          onPause={e => handlePlay(true)}
          onTimeUpdate={e => handlePlaybackTimeUpdated(e.currentTarget.currentTime)} />
      </div>
    </div>
  </div>;
}

//  const discarded = () =><div className="container-fluid vh-100 overflow-hidden p-0">
//       
        
//       <button className={`btn position-absolute top-50 end-0 translate-middle-y text-primary ${zenMode ? "invisible" : "visible"}`} type="button" data-bs-toggle="offcanvas" data-bs-target="#playlistCanvas" aria-controls="playlistCanvas">
//         <i className="bi bi-box-arrow-in-left"></i>
//       </button>
//     </div>
//     ;

export default App;
