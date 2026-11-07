let cachedToken = null;

export async function getSpotifyAppToken({ clientId, clientSecret }) {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) {
    return {
      access_token: cachedToken.accessToken,
      expires_in: Math.floor((cachedToken.expiresAt - now) / 1000),
    };
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const data = await response.json();
  if (!response.ok || !data.access_token) {
    const error = new Error("Spotify token request failed");
    error.status = response.status || 500;
    throw error;
  }

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
}
