import { useState, useEffect} from "react";
import './App.css';
import Search from "./components/Search";
import AlbumCard from "./components/AlbumCard";
import { Container, Row } from "react-bootstrap";

const App = () => {
  const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const SECRET_ID = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  // create state to hold the search term
  const [searchInput,  setSearchInput] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [albums, setAlbumns] = useState([]); // get artist albums


  // useEffect to fetch our access token
  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: 
        "grant_type=client_credentials&client_id=" + CLIENT_ID + 
        "&client_secret=" + SECRET_ID,
    };
    fetch("https://accounts.spotify.com/api/token", authParams)
    .then((result) => result.json())
    .then((data) => {
      setAccessToken(data.access_token);
    })
    .catch((error) => {
      console.error("Auth error:", error);
    });
  },);

  // search
  async function search() {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    // get artist
    const artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist", 
      artistParams
    )
    .then((result) => result.json())
    .then((data) => {
      console.log("API Response:", data);
      if (!data.artists || !data.artists.items || data.artists.items.length === 0) {
        console.error("No artists found in response");
        return null;
      }
      return data.artists.items[0].id;
    })
    .catch((error) => {
      console.error("Search error:", error);
      return null;
    });

    // get artist albums
    await fetch(
      "https://api.spotify.com/v1/artists/" + 
      artistID + 
      "/albums?include_groups=album&market=US&limit=5",
      artistParams
    )
    .then((result) => result.json())
    .then((data) => {
      setAlbumns(data.items);
    });

    console.log("Search Input: " + searchInput);
    console.log("Artist ID: " + artistID);
  }

  return (
    <>
    <Search 
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      onSearch={search}
    />

    <Container>
        <Row
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "center",
          }}
        >
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </Row>
      </Container>
    </>
  );
}

export default App;