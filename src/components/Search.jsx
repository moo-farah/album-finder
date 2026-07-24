import { Search as SearchIcon } from "lucide-react";
const Search = ({searchInput, setSearchInput, onSearch}) => {
  return (
    <div className="search-container">
      <div className="search-group">
        <div className="search-input-wrapper">
          <SearchIcon size={18} className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="Search for artist?"
          aria-label="Search for an artist"
          value={searchInput}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSearch();
            }
          }}
          onChange={(event) => setSearchInput(event.target.value)}
        />
         </div>
        <button className="search-button" onClick={onSearch}>
          Search
        </button>
      </div>
    </div>
  )
}

export default Search;