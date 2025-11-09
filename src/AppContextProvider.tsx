import { useState } from 'react';
import React from 'react';
import { IAlbumItem } from './types/AlbumTypes';

export const AppContext = React.createContext<{
  albums: IAlbumItem[];
  audioContext?: AudioContext;
  audioSource?: MediaElementAudioSourceNode;
  playbackPosition: number;
  playingAlbumIndex?: number;
  zenMode: boolean;
  isPlaying: boolean;
  activeVisualiser: number;
  setZenMode: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveVisualiser: React.Dispatch<React.SetStateAction<number>>;
  setPlaybackPosition: React.Dispatch<React.SetStateAction<number>>;
  setAudioContext: React.Dispatch<React.SetStateAction<AudioContext | undefined>>;
  setAudioSource: React.Dispatch<React.SetStateAction<MediaElementAudioSourceNode | undefined>>;
  setPlayingAlbumIndex: React.Dispatch<React.SetStateAction<number | undefined>>;
  setAlbums: React.Dispatch<React.SetStateAction<IAlbumItem[]>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [zenMode, setZenMode] = useState(false);
  const [activeVisualiser, setActiveVisualiser] = useState(0);
  const [albums, setAlbums] = useState<IAlbumItem[]>([]);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);
  const [audioContext, setAudioContext] = useState<AudioContext>();
  const [audioSource, setAudioSource] = useState<MediaElementAudioSourceNode>();
  const [playingAlbumIndex, setPlayingAlbumIndex] = useState<number | undefined>();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return <AppContext.Provider value={
    {
      albums: albums,
      audioContext: audioContext,
      audioSource: audioSource,
      playbackPosition: playbackPosition,
      zenMode: zenMode,
      activeVisualiser: activeVisualiser,
      playingAlbumIndex: playingAlbumIndex,
      isPlaying: isPlaying,
      setZenMode: setZenMode,
      setActiveVisualiser: setActiveVisualiser,
      setPlaybackPosition: setPlaybackPosition,
      setAudioContext: setAudioContext,
      setAudioSource: setAudioSource,
      setPlayingAlbumIndex: setPlayingAlbumIndex,
      setAlbums: setAlbums,
      setIsPlaying: setIsPlaying,
    }
  }>
    {children}
  </AppContext.Provider>;
}

export default AppContextProvider;