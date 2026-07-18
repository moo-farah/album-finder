import { useState } from "react";

const App = () => {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const SECRET_ID = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  // create state to hold the search term
  const [searchTerm,  setSearchTerm] = useState('');

  const handleSearch = () => {
    console.log('Searching for:', searchTerm);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search for artist"
            aria-label="Search for an artist"
            onKeyDown={null}
            onChange={null}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-2 bg-[#1ED760] text-[#121212] font-semibold rounded-lg hover:scale-105 hover:bg-[#1db954] transition"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  )
}

export default App