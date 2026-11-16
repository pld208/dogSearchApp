"use client";
import React from "react";
import { Chip, Avatar, Typography, Box } from "@mui/material";
import { Favorite } from "@mui/icons-material";
import type { FavoriteDog } from "@/src/app/actions/favorites";

interface FavoritesProps {
  favorites: FavoriteDog[];
  onSelect: (breed: string) => void;
  onRemove: (breed: string) => void;
}

export const Favorites: React.FC<FavoritesProps> = ({ favorites, onSelect, onRemove }) => {
  if (favorites.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
        <Favorite sx={{ color: "red", fontSize: 18 }} /> Doggo favorites
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {favorites.map((fav) => (
          <Chip
            key={fav.breed}
            label={fav.breed}
            avatar={fav.imageUrl ? <Avatar src={fav.imageUrl} alt={fav.breed} /> : undefined}
            onClick={() => onSelect(fav.breed)}
            onDelete={() => onRemove(fav.breed)}
            sx={{ textTransform: "capitalize", backgroundColor: "#dccebafb" }}
          />
        ))}
      </Box>
    </Box>
  );
};
