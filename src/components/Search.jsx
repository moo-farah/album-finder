import { Search as SearchIcon } from "lucide-react";

const Search = ({ searchInput, setSearchInput, onSearch, isLoading }) => {
  return (
    <form
      className="search-container"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isLoading) {
          onSearch();
        }
      }}
    >
      <div className="search-group">
        <div className="search-input-wrapper">
          <SearchIcon size={18} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Search for an artist"
            aria-label="Search for an artist"
            value={searchInput}
            disabled={isLoading}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </div>
        <button className="search-button" type="submit" disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
};

export default Search;
