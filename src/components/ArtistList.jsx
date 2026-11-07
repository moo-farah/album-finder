const ArtistList = ({ artists, selectedArtistId, onSelect, disabled }) => {
  if (artists.length === 0) {
    return null;
  }

  function handleKeyDown(event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    const buttons = [...event.currentTarget.querySelectorAll("button")];
    const index = buttons.indexOf(document.activeElement);
    if (index < 0) return;

    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + offset + buttons.length) % buttons.length;
    buttons[nextIndex].focus();
  }

  return (
    <section className="artist-list" aria-label="Matching artists">
      <h2>Choose an artist</h2>
      <ul onKeyDown={handleKeyDown}>
        {artists.map((artist) => {
          const imageUrl = artist.images?.[0]?.url;
          const genres = (artist.genres ?? []).slice(0, 2).join(", ");
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
                  <img src={imageUrl} alt={artist.name} />
                ) : (
                  <span className="artist-fallback" />
                )}
                <span className="artist-copy">
                  <span>{artist.name}</span>
                  {genres && <span className="artist-genres">{genres}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ArtistList;
