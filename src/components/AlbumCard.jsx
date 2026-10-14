import { Play } from "lucide-react";

function formatReleaseDate(date) {
  if (!date) {
    return "Unknown";
  }

  if (/^\d{4}$/.test(date)) {
    return date;
  }

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month) {
    return date;
  }

  const parsed = new Date(year, month - 1, day || 1);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  if (!day) {
    return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const AlbumCard = ({ album }) => {
  const imageUrl = album.images?.[0]?.url;
  const spotifyUrl = album.external_urls?.spotify;

  return (
    <article className="album-card">
      <div className="album-cover">
        {imageUrl ? (
          <img src={imageUrl} alt="" />
        ) : (
          <div className="album-cover-fallback" />
        )}
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
      <p>Album • {formatReleaseDate(album.release_date)}</p>
    </article>
  );
};

export default AlbumCard;
