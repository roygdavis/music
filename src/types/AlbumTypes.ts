import { ICueFileInfo } from "./CueFileTypes";

export interface IAlbumItem {
    name: string;
    url: string;
    isPlaying: boolean;
    cueInfo?: ICueFileInfo;
}