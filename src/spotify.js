export const RECENT_KEY = "album-finder-recent";
export const FAVORITES_KEY = "album-finder-favorites";

export const SUGGESTED_ARTISTS = ["Drake", "Radiohead", "Adele"];

export async function spotifyGet(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  return { ok: response.ok, data };
}

export function searchArtistsUrl(query) {
  return (
    "https://api.spotify.com/v1/search?q=" +
    encodeURIComponent(query) +
    "&type=artist&limit=5"
  );
}

export function artistUrl(id) {
  return "https://api.spotify.com/v1/artists/" + id;
}

export function artistAlbumsUrl(id, group) {
  return (
    "https://api.spotify.com/v1/artists/" +
    id +
    "/albums?include_groups=" +
    group +
    "&market=US&limit=10"
  );
}

export function albumUrl(id) {
  return "https://api.spotify.com/v1/albums/" + id;
}

export function relatedArtistsUrl(id) {
  return "https://api.spotify.com/v1/artists/" + id + "/related-artists";
}

export function prepareAlbums(items) {
  const byName = new Map();

  for (const album of items) {
    const key = (album.name || "").trim().toLowerCase();
    const existing = byName.get(key);
    if (!existing || (album.release_date || "") > (existing.release_date || "")) {
      byName.set(key, album);
    }
  }

  return [...byName.values()].sort((a, b) =>
    (b.release_date || "").localeCompare(a.release_date || "")
  );
}

export function sortAlbums(items, sortBy) {
  return [...items].sort((a, b) => {
    if (sortBy === "oldest") {
      return (a.release_date || "").localeCompare(b.release_date || "");
    }

    if (sortBy === "name") {
      return (a.name || "").localeCompare(b.name || "", undefined, {
        sensitivity: "base",
      });
    }

    return (b.release_date || "").localeCompare(a.release_date || "");
  });
}

export function formatDuration(ms) {
  const totalSeconds = Math.floor((ms || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
}

export function formatReleaseDate(date) {
  if (!date) {
    return "Unknown";
  }

  if (/^\d{4}$/.test(date)) {
    return date;
  }

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month) {
    return date;
  }

  const parsed = new Date(year, month - 1, day || 1);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  if (!day) {
    return parsed.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function readRecent() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(saved) ? saved.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export function writeRecent(artists) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(artists.slice(0, 5)));
}

export function readFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

export function writeFavorites(albums) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(albums));
}
