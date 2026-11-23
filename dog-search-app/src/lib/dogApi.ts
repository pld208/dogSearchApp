// Shared helpers for the two dog APIs:
//   - Dog CEO (https://dog.ceo) for breed list + photos
//   - Dog API (https://dogapi.dog) for breed facts

export const STOCK_DOG_IMAGE = "/dog-placeholder.svg";

interface DogCeoResponse {
  message: Record<string, string[]>;
  status: string;
}

export interface DogAttributes {
  name: string;
  description: string;
  life: { min: number; max: number };
  male_weight: { min: number; max: number };
  female_weight: { min: number; max: number };
  hypoallergenic: boolean;
}

interface DogApiSearchResponse {
  data: { id: string; type: string; attributes: DogAttributes }[];
}

export interface BreedDetails {
  images: string[];
  attributes: DogAttributes | null;
}

// Both lists are fetched once per page load and shared by every caller,
// so showing 10 favorite cards doesn't mean 10 copies of the same request.
let breedMapPromise: Promise<Record<string, string[]>> | null = null;
let breedFactsPromise: Promise<DogAttributes[]> | null = null;

export function fetchBreedMap(): Promise<Record<string, string[]>> {
  breedMapPromise ??= fetch("https://dog.ceo/api/breeds/list/all")
    .then((res) => res.json())
    .then((data: DogCeoResponse) => data.message)
    .catch((err) => {
      breedMapPromise = null; // allow a retry later
      throw err;
    });
  return breedMapPromise;
}

// The Dog API is paginated (30 per page by default), so request one large
// page to get all ~283 breeds, then match client-side.
function fetchAllBreedFacts(): Promise<DogAttributes[]> {
  breedFactsPromise ??= fetch("https://dogapi.dog/api/v2/breeds?page%5Bsize%5D=500")
    .then((res) => res.json())
    .then((resData: DogApiSearchResponse) => resData.data.map((b) => b.attributes))
    .catch((err) => {
      breedFactsPromise = null;
      throw err;
    });
  return breedFactsPromise;
}

// Fix breed names between Dog CEO API and Dog API
export function formatBreedName(ceoBreedName: string): string {
  const lowerCaseBreed = ceoBreedName.toLowerCase().trim();

  // Dictionary for explicit naming mismatches between the two APIs
  const directOverrides: Record<string, string> = {
    germanshepherd: "german shepherd",
    goldenretriever: "golden retriever",
    labrador: "labrador retriever",
    stbernard: "saint bernard",
    cotondetulear: "coton de tulear",
  };

  return directOverrides[lowerCaseBreed] ?? lowerCaseBreed;
}

// Convert user input (e.g. "labrador retriever", "golden retriever") into a
// valid Dog CEO path (e.g. "labrador", "retriever/golden"). Returns null if
// no matching breed exists, so we never request a URL that will 404.
export function toCeoBreedPath(input: string, breedMap: Record<string, string[]>): string | null {
  const name = input.toLowerCase().trim().replace(/\s+/g, " ");
  if (!name) return null;

  const reverseOverrides: Record<string, string> = {
    "labrador retriever": "labrador",
    "golden retriever": "retriever/golden",
    "german shepherd": "germanshepherd",
    "saint bernard": "stbernard",
    "st bernard": "stbernard",
    "coton de tulear": "cotondetulear",
  };
  if (reverseOverrides[name]) return reverseOverrides[name];

  // Exact top-level breed ("boxer") or with spaces removed ("german shepherd")
  if (breedMap[name]) return name;
  const joined = name.replace(/ /g, "");
  if (breedMap[joined]) return joined;

  // Sub-breed, in either word order ("english bulldog" -> "bulldog/english")
  for (const [breed, subs] of Object.entries(breedMap)) {
    for (const sub of subs) {
      if (name === `${sub} ${breed}` || name === `${breed} ${sub}`) {
        return `${breed}/${sub}`;
      }
    }
  }

  // Last resort: any single word that is a known breed
  const word = name.split(" ").find((w) => breedMap[w]);
  return word ?? null;
}

// Up to 10 random photos plus the facts for one breed. Never throws:
// missing photos fall back to the stock image, missing facts are null.
export async function fetchBreedDetails(breedName: string): Promise<BreedDetails> {
  const normalized = formatBreedName(breedName);

  const imagesPromise: Promise<string[]> = fetchBreedMap()
    .then((breedMap) => {
      const ceoPath = toCeoBreedPath(breedName, breedMap);
      if (!ceoPath) return [];
      return fetch(`https://dog.ceo/api/breed/${ceoPath}/images/random/10`)
        .then((res) => res.json())
        .then((data) =>
          data.status === "success" && Array.isArray(data.message)
            ? Array.from(new Set(data.message as string[])) // drop duplicates
            : []
        );
    })
    .catch(() => []);

  const attributesPromise = fetchAllBreedFacts()
    .then((breeds) => {
      // Exact match first, then substring match (e.g. "airedale" -> "Airedale Terrier")
      return (
        breeds.find((b) => b.name.toLowerCase() === normalized) ??
        breeds.find((b) => {
          const name = b.name.toLowerCase();
          return name.includes(normalized) || normalized.includes(name);
        }) ??
        null
      );
    })
    .catch(() => null);

  const [images, attributes] = await Promise.all([imagesPromise, attributesPromise]);
  return { images: images.length > 0 ? images : [STOCK_DOG_IMAGE], attributes };
}
