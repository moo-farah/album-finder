export const RECENT_KEY = "album-finder-recent";

export async function spotifyGet(url, token) {
  const response = await fetch(url, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await response.json();
  return { ok: response.ok, data };
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

export function formatDuration(ms) {
  const totalSeconds = Math.floor((ms || 0) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes + ":" + String(seconds).padStart(2, "0");
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
