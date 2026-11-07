import { Play } from "lucide-react";
import { formatReleaseDate } from "../spotify";

const TYPE_LABELS = {
  album: "Album",
  single: "Single",
  compilation: "Compilation",
};

const AlbumCard = ({ album, onOpen }) => {
  const imageUrl = album.images?.[0]?.url;
  const spotifyUrl = album.external_urls?.spotify;
  const typeLabel = TYPE_LABELS[album.album_type] || "Album";

  return (
    <article className="album-card">
      <div className="album-cover">
        <button
          type="button"
          className="album-cover-button"
          onClick={() => onOpen(album)}
          aria-label={"Show tracks for " + album.name}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={album.name} />
          ) : (
            <div className="album-cover-fallback" />
          )}
        </button>
        {spotifyUrl && (
          <a
            className="album-play"
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={"Open " + album.name + " in Spotify"}
          >
            <Play size={22} fill="currentColor" />
          </a>
        )}
      </div>
      <h3 title={album.name}>{album.name}</h3>
      <p>
        {typeLabel} • {formatReleaseDate(album.release_date)}
      </p>
    </article>
  );
};

export default AlbumCard;
