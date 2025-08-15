import { useContext } from "react";
import { AppContext } from "../App";
import { IAlbumItem } from "../types/AlbumTypes";

export const Playlist = (props: { onFileChanged(blob: IAlbumItem): void; }) => {
    const context = useContext(AppContext);
    const blobs = context?.albums ?? [];
    const { onFileChanged } = props;
    const activeBlob = blobs.find(x => x.isPlaying);

    const handleFileChanged = (blob: IAlbumItem) => {
        onFileChanged(blob);
    }

    return <>
        <div className="offcanvas offcanvas-end" tabIndex={-1} id="offcanvasPlaylist" aria-labelledby="offcanvasPlaylistLabel" data-bs-theme="dark">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title ms-4" id="offcanvasPlaylistLabel">Playlist</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
                <div className="ms-4">
                    A currated list of mixes by Roy. Some are good, some are bad. All are free.
                </div>
                <div className="list-group list-group-flush">
                    {blobs.filter(x => x.name.endsWith(".mp3")).map((x, i) => <a key={`playlist-item-${i}`}
                        className={`list-group-item list-group-item-action m-2 ${x.name === activeBlob?.name ? "animated-glowing-border" : ""}`}
                        href="#"
                        onClick={() => handleFileChanged(x)}>
                        {x.name.replace(".mp3", "")}
                    </a>)}
                </div>
            </div>
        </div>
    </>;
}

export default Playlist;