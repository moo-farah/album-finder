import { Card, Button } from "react-bootstrap"
const AlbumCard = ({ album }) => {
  return (
    <>
    <Card
      style={{
        backgroundColor: " #2A2A2A",
        margin: "10px",
        borderRadius: "10px",
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
            color: "#fff",
          }}
        >
          {album.name}
        </Card.Title>
        <Card.Text
          style={{
            color: "#fff",
          }}
        >
          Release Date: <br /> {album.release_date}
        </Card.Text>
        <Button
          href={album.external_urls.spotify}
          style={{
            display: "inline-block",
            backgroundColor: "#1ED760",
            color: "#121212",
            fontWeight: "bold",
            fontSize: "15px",
            borderRadius: "5px",
            marginTop: "10px",
            padding: "10px",
          }}
        >
          Album Link
        </Button>
      </Card.Body>
    </Card>
    </>
    
  )
}

export default AlbumCard;