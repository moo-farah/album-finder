import { useState, useEffect } from "react";
import "./App.css";
import Search from "./components/Search";
import ArtistList from "./components/ArtistList";
import AlbumCard from "./components/AlbumCard";

const App = () => {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const SECRET_ID = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        CLIENT_ID +
        "&client_secret=" +
        SECRET_ID,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        if (!data.access_token) {
          setMessage("Could not connect to Spotify. Check the app credentials.");
          return;
        }
        setAccessToken(data.access_token);
      })
      .catch((error) => {
        console.error("Auth error:", error);
        setMessage("Could not connect to Spotify. Check the app credentials.");
      });
  }, [CLIENT_ID, SECRET_ID]);

  async function loadAlbums(artist) {
    setSelectedArtist(artist);
    setAlbums([]);
    setIsLoadingAlbums(true);
    setMessage("Loading albums…");

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/artists/" +
          artist.id +
          "/albums?include_groups=album&market=US&limit=10",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage("Could not load albums. Please try again.");
        return;
      }

      const nextAlbums = data.items ?? [];
      setAlbums(nextAlbums);
      setMessage(
        nextAlbums.length === 0 ? "No albums found for " + artist.name + "." : ""
      );
    } catch (error) {
      console.error("Album error:", error);
      setMessage("Could not load albums. Please try again.");
    } finally {
      setIsLoadingAlbums(false);
    }
  }

  async function search() {
    const query = searchInput.trim();
    setArtists([]);
    setSelectedArtist(null);
    setAlbums([]);

    if (!query) {
      setMessage("Enter an artist name.");
      return;
    }

    if (!accessToken) {
      setMessage("Still connecting to Spotify. Try again in a moment.");
      return;
    }

    setIsSearching(true);
    setMessage("Searching…");

    try {
      const response = await fetch(
        "https://api.spotify.com/v1/search?q=" +
          encodeURIComponent(query) +
          "&type=artist&limit=5",
        {
          headers: {
            Authorization: "Bearer " + accessToken,
          },
        }
      );
      const data = await response.json();

      if (!response.ok) {
        setMessage("Search failed. Please try again.");
        return;
      }

      const matches = data.artists?.items ?? [];
      if (matches.length === 0) {
        setMessage('No artist found for "' + query + '".');
        return;
      }

      setArtists(matches);
      setMessage("");
      await loadAlbums(matches[0]);
    } catch (error) {
      console.error("Search error:", error);
      setMessage("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  const selectedArtistName = selectedArtist?.name;

  return (
    <main className="page">
      <header className="page-header">
        <h1>Album Finder</h1>
        <p>Search for an artist and browse their albums.</p>
      </header>

      <Search
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        onSearch={search}
        isLoading={isSearching}
      />

      {message && (
        <p className="status-message" role="status">
          {message}
        </p>
      )}

      <ArtistList
        artists={artists}
        selectedArtistId={selectedArtist?.id}
        onSelect={loadAlbums}
        disabled={isSearching || isLoadingAlbums}
      />

      {selectedArtistName && albums.length > 0 && (
        <h2 className="results-heading">Albums by {selectedArtistName}</h2>
      )}

      <section className="album-grid" aria-label="Albums">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </section>
    </main>
  );
};

export default App;
