import { useState } from "react";
import { IBlobItem } from "../App";

export const Playlist = (props: { blobs: IBlobItem[], onFileChanged(blob: IBlobItem): void; }) => {
    const { blobs, onFileChanged } = props;
    const [activeBlob, setActiveBlob] = useState<IBlobItem>();

    const handleFileChanged = (blob: IBlobItem) => {
        setActiveBlob(blob);
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