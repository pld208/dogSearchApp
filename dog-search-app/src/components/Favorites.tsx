"use client";
import React, { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Pagination, Typography } from "@mui/material";
import { getFavorites, toggleFavorite, type FavoriteDog } from "@/src/app/actions/favorites";
import { fetchBreedDetails, type BreedDetails } from "@/src/lib/dogApi";
import { BreedCard } from "./BreedCard";

const PAGE_SIZE = 10;

// The /favorites view: full breed cards for the user's favorites, 10 per page.
// Photos and facts are only fetched for the page being viewed.
export const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteDog[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState<Record<string, BreedDetails>>({});

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch((err) => {
        console.error("Could not load favorites:", err);
        setFavorites([]);
        setError("Could not load your favorites. Please try again.");
      });
  }, []);

  const list = favorites ?? [];
  const pageCount = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  // Removing the last card on the last page would leave it empty; step back.
  const currentPage = Math.min(page, pageCount);
  const visible = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    let cancelled = false;
    for (const fav of visible) {
      if (details[fav.breed]) continue;
      fetchBreedDetails(fav.breed).then((result) => {
        if (cancelled) return;
        // Show the photo that was on screen when they hit the heart first.
        const saved = fav.imageUrl;
        const images = saved ? [saved, ...result.images.filter((img) => img !== saved)] : result.images;
        setDetails((prev) => ({ ...prev, [fav.breed]: { ...result, images } }));
      });
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only when the visible breeds change
  }, [visible.map((f) => f.breed).join("|")]);

  const handleRemove = async (breed: string) => {
    setSaving(true);
    try {
      setFavorites(await toggleFavorite(breed, null));
    } catch (err) {
      console.error("Could not remove favorite:", err);
      setError("Could not remove that favorite. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const changePage = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ maxWidth: 780, mx: "auto", px: 1, py: 4 }}>
      <Typography align="center" variant="h4" sx={{ mb: 0.5 }}>
        🐶 Favorites
      </Typography>
      {favorites && favorites.length > 0 && (
        <Typography align="center" variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          {favorites.length} favorited {favorites.length === 1 ? "breed" : "breeds"}
        </Typography>
      )}

      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {favorites === null ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : favorites.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 6, color: "text.secondary" }}>
          <Typography sx={{ fontSize: 48, lineHeight: 1 }} aria-hidden="true">💔</Typography>
          <Typography variant="h5" sx={{ mt: 2, color: "text.primary" }}>
            No favorites yet
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Search for a breed and tap the heart to save it here.
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 3,
              alignItems: "start",
            }}
          >
            {visible.map((fav) => {
              const d = details[fav.breed];
              return d ? (
                <BreedCard
                  key={fav.breed}
                  name={d.attributes?.name ?? fav.breed}
                  images={d.images}
                  attributes={d.attributes}
                  isFavorite
                  favoriteDisabled={saving}
                  onToggleFavorite={() => handleRemove(fav.breed)}
                />
              ) : (
                <Box key={fav.breed} sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                  <CircularProgress size={28} />
                </Box>
              );
            })}
          </Box>

          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 2 }}>
              <Pagination count={pageCount} page={currentPage} onChange={(_, p) => changePage(p)} />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
