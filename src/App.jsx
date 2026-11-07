import { useEffect, useRef, useState } from "react";
import "./App.css";
import Search from "./components/Search";
import ArtistList from "./components/ArtistList";
import AlbumCard from "./components/AlbumCard";
import AlbumDetail from "./components/AlbumDetail";
import {
  prepareAlbums,
  readRecent,
  spotifyGet,
  writeRecent,
} from "./spotify";

const FILTERS = [
  { id: "album", label: "Albums", empty: "albums" },
  { id: "single", label: "Singles", empty: "singles" },
  { id: "compilation", label: "Compilations", empty: "compilations" },
];

const App = () => {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [artists, setArtists] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [nextUrl, setNextUrl] = useState("");
  const [albumGroup, setAlbumGroup] = useState("album");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [message, setMessage] = useState("");
  const [recent, setRecent] = useState(readRecent);
  const [albumDetail, setAlbumDetail] = useState(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  const albumRequest = useRef(0);
  const trackRequest = useRef(0);
  const restoredRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let refreshTimer;

    async function loadToken() {
      try {
        const response = await fetch("/api/token");
        const data = await response.json();
        if (cancelled) return;

        if (!response.ok || !data.access_token) {
          setMessage("Could not connect to Spotify. Check the app credentials.");
          return;
        }

        setAccessToken(data.access_token);
        const expiresInMs = (data.expires_in ?? 3600) * 1000;
        const refreshInMs = Math.max(expiresInMs - 60_000, 5_000);
        refreshTimer = setTimeout(loadToken, refreshInMs);
      } catch (error) {
        console.error("Auth error:", error);
        if (!cancelled) {
          setMessage("Could not connect to Spotify. Check the app credentials.");
          refreshTimer = setTimeout(loadToken, 15_000);
        }
      }
    }

    loadToken();
    return () => {
      cancelled = true;
      clearTimeout(refreshTimer);
    };
  }, []);

  function rememberArtist(artist) {
    const entry = {
      id: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url ?? "",
    };
    setRecent((current) => {
      const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 5);
      writeRecent(next);
      return next;
    });
  }

  async function fetchArtist(artist) {
    if (artist.name && artist.images) {
      return artist;
    }

    const { ok, data } = await spotifyGet(
      "https://api.spotify.com/v1/artists/" + artist.id,
      accessToken
    );
    if (!ok) {
      return null;
    }
    return data;
  }

  async function loadAlbums(artist, { append = false, group = albumGroup, url } = {}) {
    const requestId = ++albumRequest.current;
    const emptyLabel = FILTERS.find((item) => item.id === group)?.empty || "albums";
    setSelectedArtist(artist);
    if (!append) {
      setAlbumDetail(null);
      setNextUrl("");
      setIsLoadingAlbums(true);
      setMessage("Loading " + emptyLabel + "…");
    } else {
      setIsLoadingMore(true);
    }

    const endpoint =
      url ||
      "https://api.spotify.com/v1/artists/" +
        artist.id +
        "/albums?include_groups=" +
        group +
        "&market=US&limit=10";

    try {
      const { ok, data } = await spotifyGet(endpoint, accessToken);
      if (requestId !== albumRequest.current) return;

      if (!ok) {
        setMessage("Could not load albums. Please try again.");
        if (!append) {
          setAlbums([]);
          setNextUrl("");
        }
        return;
      }

      const incoming = data.items ?? [];
      setAlbums((current) => prepareAlbums(append ? [...current, ...incoming] : incoming));
      setNextUrl(data.next || "");
      setMessage(
        !append && incoming.length === 0
          ? "No " + emptyLabel + " found for " + artist.name + "."
          : ""
      );
    } catch (error) {
      console.error("Album error:", error);
      if (requestId !== albumRequest.current) return;
      setMessage("Could not load albums. Please try again.");
      if (!append) {
        setAlbums([]);
        setNextUrl("");
      }
    } finally {
      if (requestId === albumRequest.current) {
        setIsLoadingAlbums(false);
        setIsLoadingMore(false);
      }
    }
  }

  async function selectArtist(artist, group = "album") {
    if (!accessToken) {
      setMessage("Still connecting to Spotify. Try again in a moment.");
      return;
    }

    setAlbumGroup(group);
    const fullArtist = await fetchArtist(artist);
    if (!fullArtist) {
      setMessage("Could not load that artist. Please try again.");
      return;
    }

    rememberArtist(fullArtist);
    const nextUrlParams = new URL(window.location.href);
    nextUrlParams.searchParams.set("artist", fullArtist.id);
    window.history.replaceState(null, "", nextUrlParams);

    setArtists((current) => {
      if (current.some((item) => item.id === fullArtist.id)) {
        return current.map((item) => (item.id === fullArtist.id ? fullArtist : item));
      }
      return [fullArtist, ...current].slice(0, 6);
    });

    await loadAlbums(fullArtist, { group });
  }

  useEffect(() => {
    if (!accessToken || restoredRef.current) return;
    restoredRef.current = true;
    const artistId = new URLSearchParams(window.location.search).get("artist");
    if (!artistId) return;

    let cancelled = false;

    async function restoreArtist() {
      const { ok, data } = await spotifyGet(
        "https://api.spotify.com/v1/artists/" + artistId,
        accessToken
      );
      if (cancelled) return;
      if (!ok) {
        setMessage("Could not load that artist. Please try again.");
        return;
      }

      setAlbumGroup("album");
      rememberArtist(data);
      setArtists([data]);
      await loadAlbums(data, { group: "album" });
    }

    restoreArtist();
    return () => {
      cancelled = true;
    };
    // Restore the artist in the URL once, after the first token arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function search() {
    const query = searchInput.trim();

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
      const { ok, data } = await spotifyGet(
        "https://api.spotify.com/v1/search?q=" +
          encodeURIComponent(query) +
          "&type=artist&limit=5",
        accessToken
      );

      if (!ok) {
        setMessage("Search failed. Please try again.");
        return;
      }

      const matches = data.artists?.items ?? [];
      if (matches.length === 0) {
        setArtists([]);
        setSelectedArtist(null);
        setAlbums([]);
        setNextUrl("");
        setAlbumDetail(null);
        setMessage('No artist found for "' + query + '".');
        return;
      }

      setArtists(matches);
      setMessage("");
      await selectArtist(matches[0]);
    } catch (error) {
      console.error("Search error:", error);
      setMessage("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }

  function changeGroup(group) {
    if (!selectedArtist || group === albumGroup) return;
    setAlbumGroup(group);
    loadAlbums(selectedArtist, { group });
  }

  async function openAlbum(album) {
    if (albumDetail?.id === album.id) {
      trackRequest.current += 1;
      setAlbumDetail(null);
      return;
    }

    const requestId = ++trackRequest.current;
    setAlbumDetail(album);
    setIsLoadingTracks(true);

    try {
      const { ok, data } = await spotifyGet(
        "https://api.spotify.com/v1/albums/" + album.id,
        accessToken
      );
      if (requestId !== trackRequest.current) return;
      if (!ok) {
        setMessage("Could not load tracks. Please try again.");
        return;
      }

      let tracks = data.tracks?.items ?? [];
      let page = data.tracks?.next;
      while (page) {
        const nextPage = await spotifyGet(page, accessToken);
        if (!nextPage.ok || requestId !== trackRequest.current) break;
        tracks = tracks.concat(nextPage.data.items ?? []);
        page = nextPage.data.next;
      }

      if (requestId !== trackRequest.current) return;
      setAlbumDetail({ ...data, tracks });
    } catch (error) {
      console.error("Track error:", error);
      if (requestId === trackRequest.current) {
        setMessage("Could not load tracks. Please try again.");
      }
    } finally {
      if (requestId === trackRequest.current) {
        setIsLoadingTracks(false);
      }
    }
  }

  const followerCount = selectedArtist?.followers?.total;
  const artistGenres = (selectedArtist?.genres ?? []).slice(0, 3).join(", ");

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

      {recent.length > 0 && (
        <div className="recent">
          <span>Recent</span>
          {recent.map((artist) => (
            <button
              key={artist.id}
              type="button"
              onClick={() => selectArtist(artist)}
              disabled={isSearching || isLoadingAlbums}
            >
              {artist.name}
            </button>
          ))}
        </div>
      )}

      {message && (
        <p className="status-message" role="status">
          {message}
        </p>
      )}

      <ArtistList
        artists={artists}
        selectedArtistId={selectedArtist?.id}
        onSelect={selectArtist}
        disabled={isSearching || isLoadingAlbums}
      />

      {selectedArtist && (
        <section className="artist-header">
          {selectedArtist.images?.[0]?.url ? (
            <img src={selectedArtist.images[0].url} alt="" />
          ) : (
            <div className="artist-fallback large" />
          )}
          <div>
            <h2>{selectedArtist.name}</h2>
            {artistGenres && <p>{artistGenres}</p>}
            {typeof followerCount === "number" && (
              <p>{followerCount.toLocaleString("en-US")} followers</p>
            )}
            {selectedArtist.external_urls?.spotify && (
              <a
                href={selectedArtist.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open artist in Spotify
              </a>
            )}
          </div>
        </section>
      )}

      {selectedArtist && (
        <div className="filters" role="group" aria-label="Release type">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={filter.id === albumGroup ? "selected" : ""}
              onClick={() => changeGroup(filter.id)}
              disabled={isLoadingAlbums}
              aria-pressed={filter.id === albumGroup}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      <AlbumDetail
        album={albumDetail}
        isLoading={isLoadingTracks}
        onClose={() => {
          trackRequest.current += 1;
          setAlbumDetail(null);
        }}
      />

      <section className="album-grid" aria-label="Albums">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} onOpen={openAlbum} />
        ))}
      </section>

      {nextUrl && (
        <button
          type="button"
          className="load-more"
          onClick={() => loadAlbums(selectedArtist, { append: true, url: nextUrl })}
          disabled={isLoadingMore || isLoadingAlbums}
        >
          {isLoadingMore ? "Loading more..." : "Load more"}
        </button>
      )}
    </main>
  );
};

export default App;
