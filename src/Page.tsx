import {useContext, useEffect } from 'react';
import { BlobServiceClient } from '@azure/storage-blob';
import { IAlbumItem } from './types/AlbumTypes';
import { Player } from './components/Player';
import { AppContext } from './AppContextProvider';
import { parseAndMatchCueFile } from './utils/parseAndMatchCueFile';
import { CueFiles } from './types/CueFile';



const Page=()=> {
  const context = useContext(AppContext);

  // TODO: current track in the album. This will trigger too frequently so we need to find a way to slow it down
  // const playingTrackName = useMemo(() => {
  //   if (playingAlbumIndex < 0) return "";
  //   const playing = albums[playingAlbumIndex];
  //   return playing.cueInfo?.tracks[
  //     (playing.cueInfo?.tracks.findIndex(x => x.timeIndex > (playbackPosition ?? 0)) ?? 1) - 1
  //   ]?.title ?? "Unknown Track";
  // }, [playbackPosition]);

  // Fetch the files from the Azure Blob Storage
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const blobServiceClient = new BlobServiceClient('https://rgdmusicstorage.blob.core.windows.net/?sv=2026-02-06&ss=bf&srt=co&sp=rlf&se=2027-06-04T16:46:35Z&st=2026-06-04T08:31:35Z&spr=https&sig=Yv3QHdMUHfskRp7ZyW%2B7eQw7tZtU1NYU77WvUzlpZsg%3D');
        const containerClient = blobServiceClient.getContainerClient('music');
        const audioFiles: IAlbumItem[] = [];
        const cueFiles: CueFiles = [];

        for await (const blob of containerClient.listBlobsFlat()) {
          const blobClient = containerClient.getBlobClient(blob.name);
          const blobUrl = blobClient.url;

          if (blob.name.endsWith('.mp3') || blob.name.endsWith('.wav')) {
            // Add audio files to the list
            audioFiles.push({ name: blob.name, url: blobUrl, isPlaying: false });
          } else if (blob.name.endsWith('.cue')) {
            // Fetch and store cue file content
            const response = await blobClient.download();
            const blobBody = await response.blobBody;
            const text = await blobBody?.text();
            if (text) {
              cueFiles.push({ name: blob.name, content: text });
            }
          }
        }

        parseAndMatchCueFile(cueFiles, audioFiles);
        return audioFiles;
      } catch {
        throw "";
      }
    };

    fetchFiles()
      .then(albums => {
        context?.setAlbums(albums);
      })
      .catch(error => {
        console.log("Error getting playlist from cdn:", error);
      });
  }, []);
  
  return <Player></Player>;
}

export default Page;
