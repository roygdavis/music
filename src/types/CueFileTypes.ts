export interface ICueFileInfo {
    rem: string[];
    title: string;
    performer: string;
    file: string;
    tracks: ICueFileTrackInfo[];
    playbackPosition?: number | null;
}

export interface ICueFileTrackInfo {
    trackNumber: number;
    title: string;
    file: string;
    timeIndex: number;
    artist: string;
}