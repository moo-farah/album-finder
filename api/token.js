async function createTokenResponse() {
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret =
    process.env.SPOTIFY_CLIENT_SECRET || process.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Response.json(
      {
        error:
          "Spotify credentials are not configured. In Vercel, add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET, then redeploy.",
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });
    const data = await response.json();

    if (!response.ok || !data.access_token) {
      return Response.json(
        { error: "Could not get a Spotify access token" },
        { status: response.status || 500 }
      );
    }

    return Response.json({
      access_token: data.access_token,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error("Spotify token error:", error.message);
    return Response.json(
      { error: "Could not get a Spotify access token" },
      { status: 500 }
    );
  }
}

export function GET() {
  return createTokenResponse();
}

export function POST() {
  return createTokenResponse();
}

export default async function handler(req, res) {
  const response = await createTokenResponse();
  const body = await response.json();

  if (res && typeof res.status === "function") {
    return res.status(response.status).json(body);
  }

  return Response.json(body, { status: response.status });
}
