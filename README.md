# Web development Project 01 - *Album finder with Spotify API*

Submitted by:  **Mohamed Farah**
Time spent:  **24 hours**

## An Overview

Album Finder searches Spotify for an artist and shows their releases in a dark, Spotify-style grid. You can choose the right artist, switch between albums and singles, load more results, and open a track list without leaving the page.

## Features Implemented

- [x] **Search for an artist by name, with loading and error messages**
- [x] **Choose from the matching artists instead of always using the first result**
- [x] **Artist header with photo, name, and a link to Spotify**
- [x] **Album grid with cover art, release type, and release date**
- [x] **Duplicate album names are removed and results are sorted newest first**
- [x] **Filters for albums and singles**
- [x] **Load more than the first 10 releases**
- [x] **Click a cover to see the track list and track lengths**
- [x] **Green play button opens that release on Spotify**
- [x] **Recent searches are saved in the browser**
- [x] **The selected artist is stored in the URL, so a refresh keeps the same page**
- [x] **Spotify access token is requested on the server and refreshed before it expires**
- [x] **Suggested artists on the first visit, and a copy-link button for the current artist**
- [x] **Related artists and 30-second track previews when Spotify provides them**
- [x] **Favorite releases are saved on the current device**
- [x] **Sort releases by newest, oldest, or name**
- [x] **Clear recent searches**
- [x] **Shareable album links restore the open track list**
- [x] **Only one track preview plays at a time**
- [x] **The browser tab shows the selected artist**

## Tech Stack

- React 19 + Vite — UI and build tooling
- Custom CSS — layout and Spotify-style cards
- lucide-react — search and play icons
- Spotify Web API — artist search, albums, related artists, and track lists

## Run it locally

1. Install dependencies with `npm install`.
2. Create a `.env` file in the project root:

```
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
```

These names have no `VITE_` prefix, so Vite does not put them in the browser bundle. The page asks `/api/token` for a short-lived access token, and only the server sends the client secret to Spotify.

3. Start the app with `npm run dev` and open `http://localhost:5173/`.
4. On Vercel, add the same two variables in the project settings. The `api/token.js` function reads them there.
