import { Heart, Play } from "lucide-react";
import { formatReleaseDate } from "../spotify";

const TYPE_LABELS = {
  album: "Album",
  single: "Single",
};

const AlbumCard = ({ album, onOpen, isFavorite, onToggleFavorite, showRemove }) => {
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
        <button
          type="button"
          className={isFavorite ? "favorite-button selected" : "favorite-button"}
          onClick={() => onToggleFavorite(album)}
          aria-label={
            (isFavorite ? "Remove " : "Add ") +
            album.name +
            (isFavorite ? " from favorites" : " to favorites")
          }
          aria-pressed={isFavorite}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
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
      {showRemove && (
        <button
          type="button"
          className="remove-favorite"
          onClick={() => onToggleFavorite(album)}
        >
          Remove
        </button>
      )}
    </article>
  );
};

export default AlbumCard;
