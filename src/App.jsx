import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Search from "./components/Search";
import ArtistList from "./components/ArtistList";
import AlbumCard from "./components/AlbumCard";
import AlbumDetail from "./components/AlbumDetail";
import {
  albumUrl,
  artistAlbumsUrl,
  artistUrl,
  prepareAlbums,
  readFavorites,
  readRecent,
  relatedArtistsUrl,
  searchArtistsUrl,
  sortAlbums,
  spotifyGet,
  SUGGESTED_ARTISTS,
  writeFavorites,
  writeRecent,
} from "./spotify";

const FILTERS = [
  { id: "album", label: "Albums", empty: "albums" },
  { id: "single", label: "Singles", empty: "singles" },
];

function updateUrlParam(name, value) {
  const url = new URL(window.location.href);
  if (value) {
    url.searchParams.set(name, value);
  } else {
    url.searchParams.delete(name);
  }
  window.history.replaceState(null, "", url);
}

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
  const [relatedArtists, setRelatedArtists] = useState([]);
  const [linkCopied, setLinkCopied] = useState(false);
  const [favorites, setFavorites] = useState(readFavorites);
  const [activeView, setActiveView] = useState("browse");
  const [sortBy, setSortBy] = useState("newest");

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

  useEffect(() => {
    document.title = selectedArtist
      ? selectedArtist.name + " · Album Finder"
      : "Album Finder";
  }, [selectedArtist]);

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

  function clearRecent() {
    setRecent([]);
    writeRecent([]);
  }

  function toggleFavorite(album) {
    setFavorites((current) => {
      const isSaved = current.some((item) => item.id === album.id);
      const next = isSaved
        ? current.filter((item) => item.id !== album.id)
        : [album, ...current];
      writeFavorites(next);
      return next;
    });
  }

  async function fetchArtist(artist) {
    if (artist.name && artist.images) {
      return artist;
    }

    const { ok, data } = await spotifyGet(artistUrl(artist.id), accessToken);
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

    const endpoint = url || artistAlbumsUrl(artist.id, group);

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
    setRelatedArtists([]);
    setLinkCopied(false);
    const fullArtist = await fetchArtist(artist);
    if (!fullArtist) {
      setMessage("Could not load that artist. Please try again.");
      return;
    }

    rememberArtist(fullArtist);
    updateUrlParam("artist", fullArtist.id);
    updateUrlParam("album", "");

    setArtists((current) => {
      if (current.some((item) => item.id === fullArtist.id)) {
        return current.map((item) => (item.id === fullArtist.id ? fullArtist : item));
      }
      return [fullArtist, ...current].slice(0, 6);
    });

    await loadAlbums(fullArtist, { group });
    loadRelatedArtists(fullArtist.id);
  }

  async function loadRelatedArtists(artistId) {
    try {
      const { ok, data } = await spotifyGet(relatedArtistsUrl(artistId), accessToken);
      if (!ok) {
        setRelatedArtists([]);
        return;
      }
      setRelatedArtists((data.artists ?? []).slice(0, 6));
    } catch {
      setRelatedArtists([]);
    }
  }

  useEffect(() => {
    if (!accessToken || restoredRef.current) return;
    restoredRef.current = true;
    const searchParams = new URLSearchParams(window.location.search);
    const artistId = searchParams.get("artist");
    const albumId = searchParams.get("album");
    if (!artistId) {
      if (albumId) {
        openAlbum({ id: albumId, name: "Album", images: [] });
      }
      return;
    }

    let cancelled = false;

    async function restoreArtist() {
      const { ok, data } = await spotifyGet(artistUrl(artistId), accessToken);
      if (cancelled) return;
      if (!ok) {
        setMessage("Could not load that artist. Please try again.");
        return;
      }

      setAlbumGroup("album");
      rememberArtist(data);
      setArtists([data]);
      await loadAlbums(data, { group: "album" });
      loadRelatedArtists(data.id);
      if (albumId && !cancelled) {
        openAlbum({ id: albumId, name: "Album", images: [] });
      }
    }

    restoreArtist();
    return () => {
      cancelled = true;
    };
    // Restore the artist in the URL once, after the first token arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function search(queryOverride) {
    const query = (queryOverride ?? searchInput).trim();
    if (queryOverride) {
      setSearchInput(query);
    }

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
      const { ok, data } = await spotifyGet(searchArtistsUrl(query), accessToken);

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
        setRelatedArtists([]);
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
    updateUrlParam("album", "");
    loadAlbums(selectedArtist, { group });
  }

  async function openAlbum(album) {
    if (albumDetail?.id === album.id) {
      closeAlbumDetail();
      return;
    }

    const requestId = ++trackRequest.current;
    setAlbumDetail(album);
    setIsLoadingTracks(true);
    updateUrlParam("album", album.id);

    try {
      const { ok, data } = await spotifyGet(albumUrl(album.id), accessToken);
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

  const closeAlbumDetail = useCallback(() => {
    trackRequest.current += 1;
    setAlbumDetail(null);
    updateUrlParam("album", "");
  }, []);

  async function copyArtistLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      setMessage("Could not copy the link.");
    }
  }

  const followerCount = selectedArtist?.followers?.total;
  const artistGenres = (selectedArtist?.genres ?? []).slice(0, 3).join(", ");
  const showEmptyState = !selectedArtist && !isSearching && recent.length === 0;
  const favoriteIds = new Set(favorites.map((album) => album.id));
  const sortedAlbums = sortAlbums(albums, sortBy);
  const sortedFavorites = sortAlbums(favorites, sortBy);

  return (
    <main className="page">
      <header className="page-header">
        <h1>Album Finder</h1>
        <p>Search for an artist and browse their albums.</p>
      </header>

      <nav className="view-tabs" aria-label="Album Finder views">
        <button
          type="button"
          className={activeView === "browse" ? "selected" : ""}
          onClick={() => setActiveView("browse")}
          aria-pressed={activeView === "browse"}
        >
          Browse
        </button>
        <button
          type="button"
          className={activeView === "favorites" ? "selected" : ""}
          onClick={() => setActiveView("favorites")}
          aria-pressed={activeView === "favorites"}
        >
          Favorites ({favorites.length})
        </button>
      </nav>

      {activeView === "favorites" ? (
        <section className="favorites-view">
          <div className="section-heading">
            <div>
              <h2>Favorite releases</h2>
              <p>Saved on this device.</p>
            </div>
            <label className="sort-control">
              Sort
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">A–Z</option>
              </select>
            </label>
          </div>

          <AlbumDetail
            album={albumDetail}
            isLoading={isLoadingTracks}
            onClose={closeAlbumDetail}
          />

          {sortedFavorites.length === 0 ? (
            <p className="favorites-empty">
              Select the heart on an album or single to save it here.
            </p>
          ) : (
            <section className="album-grid" aria-label="Favorite releases">
              {sortedFavorites.map((album) => (
                <AlbumCard
                  key={album.id}
                  album={album}
                  onOpen={openAlbum}
                  isFavorite
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </section>
          )}
        </section>
      ) : (
        <>
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
          <button type="button" className="clear-recent" onClick={clearRecent}>
            Clear
          </button>
        </div>
      )}

      {showEmptyState && (
        <div className="empty-state">
          <p>Try Drake, Radiohead, or Adele</p>
          <div className="recent">
            {SUGGESTED_ARTISTS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => search(name)}
                disabled={isSearching || !accessToken}
              >
                {name}
              </button>
            ))}
          </div>
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
            <img src={selectedArtist.images[0].url} alt={selectedArtist.name} />
          ) : (
            <div className="artist-fallback large" />
          )}
          <div>
            <h2>{selectedArtist.name}</h2>
            {artistGenres && <p>{artistGenres}</p>}
            {typeof followerCount === "number" && (
              <p>{followerCount.toLocaleString("en-US")} followers</p>
            )}
            <div className="artist-actions">
              {selectedArtist.external_urls?.spotify && (
                <a
                  href={selectedArtist.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open artist in Spotify
                </a>
              )}
              <button type="button" className="copy-link" onClick={copyArtistLink}>
                {linkCopied ? "Link copied" : "Copy link"}
              </button>
            </div>
          </div>
        </section>
      )}

      {selectedArtist && (
        <div className="catalog-controls">
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
          <label className="sort-control">
            Sort
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">A–Z</option>
            </select>
          </label>
        </div>
      )}

      <AlbumDetail
        album={albumDetail}
        isLoading={isLoadingTracks}
        onClose={closeAlbumDetail}
      />

      <section className="album-grid" aria-label="Albums">
        {sortedAlbums.map((album) => (
          <AlbumCard
            key={album.id}
            album={album}
            onOpen={openAlbum}
            isFavorite={favoriteIds.has(album.id)}
            onToggleFavorite={toggleFavorite}
          />
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

      {relatedArtists.length > 0 && (
        <section className="related-artists" aria-label="Related artists">
          <h2>Fans also like</h2>
          <ul>
            {relatedArtists.map((artist) => (
              <li key={artist.id}>
                <button
                  type="button"
                  className="artist-button"
                  onClick={() => selectArtist(artist)}
                  disabled={isSearching || isLoadingAlbums}
                >
                  {artist.images?.[0]?.url ? (
                    <img src={artist.images[0].url} alt={artist.name} />
                  ) : (
                    <span className="artist-fallback" />
                  )}
                  <span>{artist.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
        </>
      )}
    </main>
  );
};

export default App;
