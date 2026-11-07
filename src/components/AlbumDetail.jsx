import { formatDuration } from "../spotify";

const AlbumDetail = ({ album, isLoading, onClose }) => {
  if (!album) {
    return null;
  }

  const imageUrl = album.images?.[0]?.url;
  const spotifyUrl = album.external_urls?.spotify;
  const tracks = album.tracks ?? [];

  return (
    <section className="album-detail" aria-label="Album tracks">
      <div className="album-detail-top">
        {imageUrl ? <img src={imageUrl} alt="" /> : <div className="album-cover-fallback" />}
        <div>
          <p className="album-detail-kicker">Tracks</p>
          <h2>{album.name}</h2>
          {spotifyUrl && (
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
              Open in Spotify
            </a>
          )}
        </div>
        <button type="button" className="text-button" onClick={onClose}>
          Close
        </button>
      </div>

      {isLoading ? (
        <p className="status-message">Loading tracks…</p>
      ) : (
        <ol className="track-list">
          {tracks.map((track) => (
            <li key={track.id}>
              <span className="track-number">{track.track_number}</span>
              <span className="track-name">{track.name}</span>
              <span className="track-time">{formatDuration(track.duration_ms)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

export default AlbumDetail;
