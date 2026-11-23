import { Container } from "@mui/material";
import Navbar from "../../components/Nabar";
import { Favorites } from "../../components/Favorites";

export default function FavoritesPage() {
  return (
    <Container>
      <Navbar />
      <Favorites />
    </Container>
  );
}
