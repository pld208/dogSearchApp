"use client";
import React, { useState } from "react";
import { Box, Card, CardHeader, CardContent, Checkbox, Divider, IconButton, Typography } from "@mui/material";
import { FavoriteBorder, Favorite } from "@mui/icons-material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { STOCK_DOG_IMAGE, type DogAttributes } from "@/src/lib/dogApi";
import { glassSoft } from "@/src/theme/theme";

interface BreedCardProps {
  name: string;
  images: string[];
  attributes: DogAttributes | null;
  isFavorite: boolean;
  favoriteDisabled?: boolean;
  onToggleFavorite: (imageShowing: string | null) => void;
}

const HEART = "#e0435a";

// One breed: name, photo carousel and facts, with a heart to (un)favorite it.
// Used for search results and for each card on the favorites page.
export const BreedCard: React.FC<BreedCardProps> = ({
  name,
  images,
  attributes,
  isFavorite,
  favoriteDisabled,
  onToggleFavorite,
}) => {
  const [imageIndex, setImageIndex] = useState(0);
  const image = images[imageIndex] ?? null;

  const showPrevImage = () => setImageIndex((i) => (i - 1 + images.length) % images.length);
  const showNextImage = () => setImageIndex((i) => (i + 1) % images.length);

  const facts = attributes
    ? [
        ["Lifespan", `${attributes.life.min} – ${attributes.life.max} years`],
        ["Hypoallergenic", attributes.hypoallergenic ? "Yes" : "No"],
        ["Male weight", `${attributes.male_weight.min} – ${attributes.male_weight.max} kg`],
        ["Female weight", `${attributes.female_weight.min} – ${attributes.female_weight.max} kg`],
      ]
    : [];

  return (
    <Card sx={{ width: 360, maxWidth: "100%", mx: "auto" }}>
      <CardHeader
        action={
          <Checkbox
            icon={<FavoriteBorder sx={{ color: HEART }} />}
            checkedIcon={<Favorite sx={{ color: HEART }} />}
            checked={isFavorite}
            disabled={favoriteDisabled}
            onChange={() => onToggleFavorite(image)}
            slotProps={{ input: { "aria-label": isFavorite ? "remove from favorites" : "add to favorites" } }}
          />
        }
        title={name}
        slotProps={{ title: { variant: "h6", sx: { textTransform: "capitalize" } } }}
        sx={{ pb: 0 }}
      />
      <CardContent>
        {image && (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Box
              component="img"
              src={image}
              alt={name}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = STOCK_DOG_IMAGE; }}
              sx={{ width: "100%", height: 260, objectFit: "cover", borderRadius: 3, display: "block" }}
            />
            {images.length > 1 && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, mt: 1 }}>
                <IconButton aria-label="Previous photo" onClick={showPrevImage} size="small" sx={glassSoft}>
                  <ArrowBackIosNewIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 48 }}>
                  {imageIndex + 1} / {images.length}
                </Typography>
                <IconButton aria-label="Next photo" onClick={showNextImage} size="small" sx={glassSoft}>
                  <ArrowForwardIosIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Box>
        )}

        <Box sx={{ ...glassSoft, borderRadius: 3, p: 2 }}>
          {attributes ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {attributes.description || "No description available."}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 2, rowGap: 0.75 }}>
                {facts.map(([label, value]) => (
                  <React.Fragment key={label}>
                    <Typography component="dt" variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                    <Typography component="dd" variant="body2" color="text.secondary" sx={{ m: 0 }}>{value}</Typography>
                  </React.Fragment>
                ))}
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Facts are still being pondered for this breed, so sorry!
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
