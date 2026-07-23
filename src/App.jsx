import { useState, useEffect} from "react";
import './App.css';
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Row,
  Card,
} from "react-bootstrap";

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
    <Container>
        <InputGroup>
          <FormControl 
            placeholder ="Search for artist?"
            type="input"
            aria-label="Search for an artist"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
            style={{
              width: "300px",
              height: "35px",
              borderWidth: "0px",
              borderStyle: "solid",
              borderRadius: "50px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

    <Container>
        <Row className="flex flex-row flex-wrap justify-around content-center"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-around",
            alignContent: "center",
          }}
        >
          {albums.map((album) => {
            return (
              <Card
                key={album.id}
                style={{
                  backgroundColor: "white",
                  margin: "10px",
                  borderRadius: "5px",
                  marginBottom: "30px",
                }}
              >
                <Card.Img
                  width={200}
                  src={album.images[0].url}
                  style={{
                    borderRadius: "4%",
                  }}
                />
                <Card.Body>
                  <Card.Title
                    style={{
                      whiteSpace: "wrap",
                      fontWeight: "bold",
                      maxWidth: "200px",
                      fontSize: "18px",
                      marginTop: "10px",
                      color: "black",
                    }}
                  >
                    {album.name}
                  </Card.Title>
                  <Card.Text
                    style={{
                      color: "black",
                    }}
                  >
                    Release Date: <br /> {album.release_date}
                  </Card.Text>
                  <Button
                    href={album.external_urls.spotify}
                    style={{
                      backgroundColor: "#1DB954",
                      color: "#121212",
                      fontWeight: "bold",
                      fontSize: "15px",
                      borderRadius: "5px",
                      padding: "10px",
                    }}
                  >
                    Album Link
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </Row>
      </Container>
    </>
   
  )
}

export default App