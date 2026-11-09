import { useEffect, useRef } from "react";
import { Search as SearchIcon } from "lucide-react";

const Search = ({
  searchInput,
  setSearchInput,
  onSearch,
  isLoading,
  suggestions = [],
  onSelectSuggestion,
  inputRef,
}) => {
  const localRef = useRef(null);
  const fieldRef = inputRef || localRef;
  const canSearch = Boolean(searchInput.trim()) && !isLoading;

  useEffect(() => {
    fieldRef.current?.focus();
  }, [fieldRef]);

  return (
    <form
      className="search-container"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSearch) {
          onSearch();
        }
      }}
    >
      <div className="search-group">
        <div className="search-input-wrapper">
          <SearchIcon size={18} className="search-icon" />
          <input
            ref={fieldRef}
            className="search-input"
            type="text"
            placeholder={isLoading ? "Searching..." : "Search for an artist"}
            aria-label="Search for an artist"
            aria-autocomplete="list"
            value={searchInput}
            disabled={isLoading}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          {suggestions.length > 0 && (
            <ul className="search-suggestions" role="listbox">
              {suggestions.map((artist) => (
                <li key={artist.id}>
                  <button type="button" onClick={() => onSelectSuggestion(artist)}>
                    {artist.images?.[0]?.url ? (
                      <img src={artist.images[0].url} alt="" />
                    ) : (
                      <span className="artist-fallback" />
                    )}
                    <span>{artist.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="search-button" type="submit" disabled={!canSearch}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
};

export default Search;
