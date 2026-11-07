import { getSpotifyAppToken } from "../server/spotifyToken.js";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Spotify credentials are not configured" });
  }

  try {
    const token = await getSpotifyAppToken({ clientId, clientSecret });
    return res.status(200).json(token);
  } catch (error) {
    console.error("Spotify token error:", error.message);
    return res.status(error.status || 500).json({
      error: "Could not get a Spotify access token",
    });
  }
}
