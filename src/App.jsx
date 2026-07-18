import { useState, useEffect} from "react";

const App = () => {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const SECRET_ID = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  // create state to hold the search term
  const [searchInput,  setSearchInput] = useState('');
  const [accessToken, setAccessToken] = useState('');

  // useEffect to fetch our access token
  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: 
        "grant_type=client_credentials&client_id=" + CLIENT_ID + 
        "&client_secret=" + SECRET_ID,
    };
    fetch("https://accounts.spotify.com/api/token", authParams)
    .then((result) => result.json())
    .then((data) => {
      setAccessToken(data.access_token);
    })
    .catch((error) => {
      console.error("Auth error:", error);
    });
  }, []);

  async function search() {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    // get artist
    const artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist", 
      artistParams
    )
    .then((result) => result.json())
    .then((data) => {
      console.log("API Response:", data);
      if (!data.artists || !data.artists.items || data.artists.items.length === 0) {
        console.error("No artists found in response");
        return null;
      }
      return data.artists.items[0].id;
    })
    .catch((error) => {
      console.error("Search error:", error);
      return null;
    });

    console.log("Search Input: " + searchInput);
    console.log("Artist ID: " + artistID);
  }



  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
      <div className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search for artist"
            aria-label="Search for an artist"
            onKeyDown={(event) => {
              if (event.key === "Enter"){
                search();
              } // search function
            }}
            onChange={(event) => setSearchInput(event.target.value)} // setSearch
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-white focus:outline-none focus:ring-2 focus:ring-gray-800"
          />
          <button
            onClick={search}
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