import { useEffect, useRef } from "react";
import { Search as SearchIcon } from "lucide-react";

const Search = ({ searchInput, setSearchInput, onSearch, isLoading }) => {
  const inputRef = useRef(null);
  const canSearch = Boolean(searchInput.trim()) && !isLoading;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder={isLoading ? "Searching..." : "Search for an artist"}
            aria-label="Search for an artist"
            value={searchInput}
            disabled={isLoading}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <button className="search-button" type="submit" disabled={!canSearch}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
};

export default Search;
