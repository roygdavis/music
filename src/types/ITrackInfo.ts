export interface ICueFileInfo {
    rem: string[];
    title: string;
    performer: string;
    file: string;
    tracks: ITrackInfo[];
    playbackPosition?: number | null;
}

export interface ITrackInfo {
    trackNumber: number;
    title: string;
    file: string;
    timeIndex: number;
    artist: string;
}