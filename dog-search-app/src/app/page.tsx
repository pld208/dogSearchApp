import { Button, Typography, Container } from "@mui/material";
import Navbar from "../components/Nabar";
import { DogSearch } from "../components/DogSearch";

export default function Home() {
  return (
    <Container>
      <Navbar />
      <Typography variant="h4" gutterBottom>
        Dog Breed Search App
      </Typography>
      <DogSearch />
    </Container>
  );
}
