"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Alert, Box, CircularProgress, IconButton, InputBase, List, ListItemButton, Paper, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BreedCard } from './BreedCard';
import Navbar from './Nabar';
import { getFavorites, toggleFavorite, type FavoriteDog } from '@/src/app/actions/favorites';
import { fetchBreedDetails, fetchBreedMap, type BreedDetails } from '@/src/lib/dogApi';
import { glassSoft, glassStrong } from '@/src/theme/theme';

export const DogSearch: React.FC = () => {
  const [allBreeds, setAllBreeds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showBreedSuggestions, setShowBreedSuggestions] = useState<boolean>(false);
  const filteredBreeds = showBreedSuggestions && searchTerm
    ? allBreeds.filter((breed) =>
        breed.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // The breed that was actually searched (searchTerm changes as the user types)
  const [searchedBreed, setSearchedBreed] = useState<string>('');
  const [result, setResult] = useState<BreedDetails | null>(null);
  // Bumped on every search so the card (and its photo index) starts fresh.
  const [searchId, setSearchId] = useState<number>(0);
  const cardBreedName = result?.attributes?.name ?? searchedBreed;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Favorites are saved in Postgres (Supabase) through server actions.
  const [favorites, setFavorites] = useState<FavoriteDog[]>([]);
  const [savingFavorite, setSavingFavorite] = useState<boolean>(false);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch((err) => console.error('Could not load favorites:', err));
  }, []);

  const handleToggleFavorite = async (breed: string, imageUrl: string | null) => {
    setSavingFavorite(true);
    try {
      setFavorites(await toggleFavorite(breed, imageUrl));
    } catch (err) {
      console.error('Could not save favorite:', err);
      setError('Could not save your favorite. Please try again.');
    } finally {
      setSavingFavorite(false);
    }
  };

  useEffect(() => {
    fetchBreedMap()
      .then((breedMap) => setAllBreeds(Object.keys(breedMap)))
      .catch(() => setError("Failed to fetch dog breeds"));
  }, []);

  // Selecting a suggestion just fills the input, like Google's autocomplete —
  // the actual search runs separately (Enter key or the search icon).
  const handleSuggestionClick = (breedName: string) => {
    setSearchTerm(breedName);
    setShowBreedSuggestions(false);
  };

  // Fetch dog photos and facts
  const handleSearch = async (breedName: string) => {
    if (!breedName.trim()) return;

    setSearchTerm(breedName);
    setSearchedBreed(breedName.trim());
    setLoading(true);
    setError(null);
    setShowBreedSuggestions(false);
    setResult(null);

    const details = await fetchBreedDetails(breedName);
    setResult(details);
    setSearchId((id) => id + 1);
    setLoading(false);
  };

  // Rendered inside the navbar; all search state stays in this component.
  const searchBar = (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box
        sx={{
          ...glassSoft,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 999,
          pl: 2,
          pr: 0.5,
          transition: 'box-shadow 0.2s, background-color 0.2s',
          '&:focus-within': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            boxShadow: (t) => `0 0 0 3px ${t.palette.primary.main}33`,
          },
        }}
      >
        <InputBase
          fullWidth
          placeholder="Woof woof, type a breed (e.g. poodle, boxer)…"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            setShowBreedSuggestions(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(searchTerm);
            if (e.key === 'Escape') setShowBreedSuggestions(false);
          }}
          slotProps={{ input: { 'aria-label': 'Search dog breeds' } }}
          sx={{ py: 0.75, fontSize: 15 }}
        />
        <IconButton aria-label="Search" onClick={() => handleSearch(searchTerm)} size="small" color="primary">
          <SearchIcon />
        </IconButton>
      </Box>

      {filteredBreeds.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            ...glassStrong,
            borderRadius: '14px',
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            zIndex: 10,
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          <List dense disablePadding sx={{ p: 0.5 }}>
            {filteredBreeds.map((breed) => (
              <ListItemButton
                key={breed}
                onClick={() => handleSuggestionClick(breed)}
                sx={{ textTransform: 'capitalize' }}
              >
                {breed}
              </ListItemButton>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );

  return (
    <>
      <Navbar search={searchBar} />
      <Box sx={{ maxWidth: 500, mx: 'auto', px: 1, py: 4 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

        {!loading && !result && !error && (
          <Box sx={{ textAlign: 'center', mt: 6, color: 'text.secondary' }}>
            <Typography sx={{ fontSize: 48, lineHeight: 1 }} aria-hidden="true">🐾</Typography>
            <Typography variant="h5" sx={{ mt: 2, color: "text.primary" }}>
              Find your next best friend
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Search any breed above to see photos and facts.
            </Typography>
          </Box>
        )}

        {!loading && result && (
          <BreedCard
            key={searchId}
            name={cardBreedName}
            images={result.images}
            attributes={result.attributes}
            isFavorite={favorites.some((f) => f.breed.toLowerCase() === cardBreedName.toLowerCase())}
            favoriteDisabled={savingFavorite}
            onToggleFavorite={(image) => handleToggleFavorite(cardBreedName, image)}
          />
        )}
      </Box>
    </>
  );
};
