# Web development Project 01 - *Album finder with Spotify API*

Submitted by:  **Mohamed Farah**
Time spent:  **24 hours**

## An Overview

Album Finder searches Spotify for an artist and shows their releases in a dark, Spotify-style grid. You can choose the right artist, switch between albums, singles, and compilations, load more results, and open a track list without leaving the page.

## Features Implemented

- [x] **Search for an artist by name, with loading and error messages**
- [x] **Choose from the matching artists instead of always using the first result**
- [x] **Artist header with photo, name, and a link to Spotify**
- [x] **Album grid with cover art, release type, and release date**
- [x] **Duplicate album names are removed and results are sorted newest first**
- [x] **Filters for albums, singles, and compilations**
- [x] **Load more than the first 10 releases**
- [x] **Click a cover to see the track list and track lengths**
- [x] **Green play button opens that release on Spotify**
- [x] **Recent searches are saved in the browser**
- [x] **The selected artist is stored in the URL, so a refresh keeps the same page**
- [x] **Spotify access token is requested with the Client Credentials flow and refreshed before it expires**

## Tech Stack

- React 19 + Vite — UI and build tooling
- Custom CSS — layout and Spotify-style cards
- lucide-react — search and play icons
- Spotify Web API — artist search, albums, and track lists

## Run it locally

1. Install dependencies with `npm install`.
2. Create a `.env` file in the project root:

```
VITE_SPOTIFY_CLIENT_ID=your_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret
```

3. Start the app with `npm run dev` and open `http://localhost:5173/`.
