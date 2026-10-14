const ArtistList = ({ artists, selectedArtistId, onSelect, disabled }) => {
  if (artists.length === 0) {
    return null;
  }

  return (
    <section className="artist-list" aria-label="Matching artists">
      <h2>Choose an artist</h2>
      <ul>
        {artists.map((artist) => {
          const imageUrl = artist.images?.[0]?.url;
          const isSelected = artist.id === selectedArtistId;

          return (
            <li key={artist.id}>
              <button
                type="button"
                className={isSelected ? "artist-button selected" : "artist-button"}
                onClick={() => onSelect(artist)}
                disabled={disabled}
                aria-pressed={isSelected}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="" />
                ) : (
                  <span className="artist-fallback" />
                )}
                <span>{artist.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ArtistList;
