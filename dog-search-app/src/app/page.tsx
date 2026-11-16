import { Button, Typography, Container } from "@mui/material";
import Navbar from "../components/Nabar";
import { DogSearch } from "../components/DogSearch";

export default function Home() {
  return (
    <Container>
      <Navbar />
      <Typography align="center" sx={{ p: 2, mt: 4 }} variant="h4" gutterBottom>
        Doggo Dictionary
      </Typography>
      <DogSearch />
    </Container>
  );
}
