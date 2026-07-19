"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import CircularProgress from '@mui/material/CircularProgress';

// Dog CEO API for IMAGES
interface DogCeoResponse {
  message: Record<string, string[]>;
  status: string;
}

// Dog API (Attributes) for BREEDS
interface DogAttributeData {
  id: string;
  type: string;
  attributes: {
    name: string;
    description: string;
    life: { min: number; max: number };
    male_weight: { min: number; max: number };
    female_weight: { min: number; max: number };
    hypoallergenic: boolean;
  };
}

interface DogApiSearchResponse {
  data: DogAttributeData[];
}

const STOCK_DOG_IMAGE = "/dog-placeholder.svg";

export const DogSearch: React.FC = () => {
  const [allBreeds, setAllBreeds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredBreeds, setFilteredBreeds] = useState<string[]>([]);
  const [selectedDogImage, setSelectedDogImage] = useState<string | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<DogAttributeData['attributes'] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllBreeds = async () => {
      try {
        const response = await fetch("https://dog.ceo/api/breeds/list/all");
        const data: DogCeoResponse = await response.json();
        setAllBreeds(Object.keys(data.message));
      } catch (error) {
        setError("Failed to fetch dog breeds");
      }
    };

    fetchAllBreeds();
  }, []);

  // 2. Filter input suggestions
  useEffect(() => {
    if (!searchTerm) {
      setFilteredBreeds([]);
      return;
    }
    const results = allBreeds.filter((breed) =>
      breed.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBreeds(results);
  }, [searchTerm, allBreeds]);

  // Fix breed names between Dog CEO API and Dog API
  const formatBreedNames = (ceoBreedName: string): string => {
    const lowerCaseBreed = ceoBreedName.toLowerCase().trim();

    // Dictionary for explicit naming mismatches between the two APIs
    const directOverrides: Record<string, string> = {
      germanshepherd: "german shepherd",
      goldenretriever: "golden retriever",
      labrador: "labrador retriever",
      stbernard: "saint bernard",
      cotondetulear: "coton de tulear",
    };

    if (directOverrides[lowerCaseBreed]) {
      return directOverrides[lowerCaseBreed];
    }

    return lowerCaseBreed;
  };

  // Selecting a suggestion just fills the input, like Google's autocomplete —
  // the actual search runs separately (Enter key or the search icon).
  const handleSuggestionClick = (breedName: string) => {
    setSearchTerm(breedName);
    setFilteredBreeds([]);
  };

  // 3. Fetch dog image and attributes
  const handleSearch = async (breedName: string) => {
    if (!breedName.trim()) return;

    setLoading(true);
    setError(null);
    setFilteredBreeds([]);
    setSelectedDogImage(null);
    setSelectedAttributes(null);

    // Normalize breed names for Dog API attributes
    const normalizedBreedName = formatBreedNames(breedName);

    try {
      //grab random images; fall back to a stock image if the breed has no photo
      const imagePromise = fetch(`https://dog.ceo/api/breed/${breedName}/images/random`)
        .then((res) => res.json())
        .then((data) => data.message as string)
        .catch(() => STOCK_DOG_IMAGE);

      // Query Dog API for attributes (the API ignores query filters, so fetch
      // the full list and match client-side)
      const attributesPromise = await fetch(`https://dogapi.dog/api/v2/breeds`)
        .then((res) => res.json())
        .then((resData: DogApiSearchResponse) => {
          const exactMatch = resData.data.find(
            (b) => b.attributes.name.toLowerCase() === normalizedBreedName
          );
          return exactMatch ? exactMatch.attributes : null;
        });

      // Fetch attributes from Dog API parallel to image fetch
      const [imgUrl, attributes] = await Promise.all([imagePromise, attributesPromise]);

      setSelectedDogImage(imgUrl || STOCK_DOG_IMAGE);
      setSelectedAttributes(attributes);

      // Fallback strategy: If explicit string match failed, do a broader partial scan of the dataset
      if (!attributes) {
        const fallbackResponse = await fetch('https://dogapi.dog/api/v2/breeds');
        const fallbackData: DogApiSearchResponse = await fallbackResponse.json();

        // Dynamic substring matching fallback (e.g. finding "Airedale Terrier" when given "airedale")
        const partialMatch = fallbackData.data.find(b =>
          b.attributes.name.toLowerCase().includes(normalizedBreedName) ||
          normalizedBreedName.includes(b.attributes.name.toLowerCase())
        );

        if (partialMatch) {
          setSelectedAttributes(partialMatch.attributes);
        } else {
          setError(`Facts are still being pondered for "${normalizedBreedName}", so sorry!`);
        }
      }
    } catch (err) {
      console.error('Ruh-roh! Error fetching dog details:', err);
      setSelectedDogImage(STOCK_DOG_IMAGE);
      setError('Failed to fetch data from API endpoints.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', fontFamily: 'Roboto', padding: '20px' }}>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Woof woof, type breed name (e.g., poodle, boxer)..."
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch(searchTerm);
          }}
          style={{ width: '100%', padding: '12px 44px 12px 12px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <button
          type="button"
          aria-label="Search"
          onClick={() => handleSearch(searchTerm)}
          style={{
            position: 'absolute',
            right: '6px',
            top: '50%',
            transform: 'translateY(-50%)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {filteredBreeds.length > 0 && (
          <ul style={{
            border: '1px solid #ccc',
            maxHeight: '180px',
            overflowY: 'auto',
            listStyleType: 'none',
            padding: '0',
            margin: '0',
            position: 'absolute',
            width: '100%',
            background: 'white',
            zIndex: 10,
            borderRadius: '4px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            {filteredBreeds.map((breed) => (
              <li
                key={breed}
                onClick={() => handleSuggestionClick(breed)}
                style={{ padding: '10px 12px', cursor: 'pointer', textTransform: 'capitalize' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f5f5f5'}
                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
              >
                {breed}
              </li>
            ))}
          </ul>
        )}
      </div>

      {loading && (
  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
    <CircularProgress sx={{ color: '#dea037' }} />
  </div>
)}
      {error && <p style={{ color: '#d9534f', fontSize: '14px', marginTop: '15px' }}>⚠️ {error}</p>}

      {!loading && (selectedDogImage || selectedAttributes) && (
        <div style={{ marginTop: '25px', border: '1px solid #eee', padding: '15px', borderRadius: '8px', background: '#fafafa' }}>
          
          {selectedDogImage && (
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img
                src={selectedDogImage}
                alt={searchTerm}
                onError={(e) => { e.currentTarget.src = STOCK_DOG_IMAGE; }}
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '6px' }}
              />
            </div>
          )}

          {selectedAttributes && (
            <div>
              <h3 style={{ textTransform: 'capitalize', marginTop: '0' }}>{selectedAttributes.name} Profile</h3>
              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5' }}>{selectedAttributes.description || 'No description available.'}</p>
              
              <hr style={{ border: '0', borderTop: '1px solid #ddd', margin: '15px 0' }} />
              
              <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
                <li><strong>Lifespan:</strong> {selectedAttributes.life.min} - {selectedAttributes.life.max} years</li>
                <li><strong>Hypoallergenic:</strong> {selectedAttributes.hypoallergenic ? 'Yes' : 'No'}</li>
                <li><strong>Male Weight:</strong> {selectedAttributes.male_weight.min} to {selectedAttributes.male_weight.max} kg</li>
                <li><strong>Female Weight:</strong> {selectedAttributes.female_weight.min} to {selectedAttributes.female_weight.max} kg</li>
              </ul>
            </div>
          )}
        </div> )}
    </div>
  );
  
};
