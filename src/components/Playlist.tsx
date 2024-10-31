import { useCallback, useMemo, useState } from 'react';
import { ICueFileInfo, ITrackInfo } from '../types/ITrackInfo';

type PlaylistProps = {
  mixes: ICueFileInfo[],
  onClipChanged: (clip: ICueFileInfo) => void,
  playbackPosition: number,
  // nowPlayingMix: ICueFileInfo | null,
  isPlaying: Boolean
};

type Time = {
  hours: number;
  minutes: number;
  seconds: number;
};

export const Playlist = (props: PlaylistProps) => {
  const { mixes, onClipChanged, playbackPosition, isPlaying } = props;
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handleClipChanged = (i: number) => {
    const clip = mixes[i];
    setPlayingIndex(i);
    onClipChanged(clip);
  }

  const time = useMemo(() => {
    return {
      hours: Math.round(playbackPosition / 3600),
      minutes: Math.round(playbackPosition / 60),
      seconds: Math.round(playbackPosition % 60)
    } as Time
  }, [playbackPosition]);
  
  
  return <div className="list-group overflow-auto mh-100">
    {
      mixes?.map((x, i) => {
        
        const isRenderingPlayingTrack = playingIndex === i;
        const sortedTracks = isRenderingPlayingTrack ? mixes[i].tracks.sort(x => x.timeIndex) : [] as ITrackInfo[];
        const filteredTracks = sortedTracks.filter(x => x.timeIndex <= playbackPosition);
        const nowPlayingTrack = sortedTracks.length === 0 ? null : filteredTracks.length === 0 ? sortedTracks[0] : filteredTracks[filteredTracks.length - 1];

        return <div key={i} className={`list-group-item list-group-item-action ${isRenderingPlayingTrack ? "list-group-item-primary" : "list-group-item-light"}`}>
          <div className="d-flex w-100 justify-content-between">
            <button type='button' onClick={() => handleClipChanged(i)}>
              {isRenderingPlayingTrack&& isPlaying ? <i className="bi bi-pause-circle-fill"></i> : <i className="bi bi-play-circle-fill"></i>}
            </button>
            <h5 className="mb-1">{x.title}</h5>
            <small className="text-muted">{isRenderingPlayingTrack ? `${time.hours.toString().padStart(2, "0")}:${time.minutes.toString().padStart(2, "0")}:${time.seconds.toString().padStart(2, "0")}` : ""}</small>
          </div>
          <p className="mb-1">{isRenderingPlayingTrack ? nowPlayingTrack?.title : ""}</p>
          <p className="mb-1">{isRenderingPlayingTrack ? nowPlayingTrack?.artist : ""}</p>
          <small className="text-muted">Mixed by {x.performer}</small>
        </div>
      }
      )
    }
  </div>
}
