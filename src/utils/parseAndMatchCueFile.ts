import { IAlbumItem } from "../types/AlbumTypes";
import { CueFiles } from "../types/CueFile";
import { ICueFileInfo, ICueFileTrackInfo } from "../types/CueFileTypes";

export const parseAndMatchCueFile = (cueFiles: CueFiles, audioFiles: IAlbumItem[]): IAlbumItem[] => {
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