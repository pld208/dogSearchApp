"use server";

import { prisma } from "@/src/lib/prisma";
import { getOrCreateUserId } from "@/src/lib/current-user";

export type FavoriteDog = {
  breed: string;
  imageUrl: string | null;
};

function cleanBreed(breed: string): string {
  const trimmed = breed.trim();
  if (!trimmed || trimmed.length > 100) {
    throw new Error("Invalid breed name");
  }
  return trimmed;
}

export async function getFavorites(): Promise<FavoriteDog[]> {
  const userId = await getOrCreateUserId();
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { breed: true, imageUrl: true },
  });
}

// Adds the breed if it isn't a favorite yet, otherwise removes it.
// Returns the updated list so the UI can re-render from the source of truth.
export async function toggleFavorite(
  breed: string,
  imageUrl: string | null
): Promise<FavoriteDog[]> {
  const userId = await getOrCreateUserId();
  const name = cleanBreed(breed);
  const safeImage = imageUrl?.startsWith("https://") ? imageUrl : null;

  const removed = await prisma.favorite.deleteMany({
    where: { userId, breed: name },
  });
  if (removed.count === 0) {
    await prisma.favorite.upsert({
      where: { userId_breed: { userId, breed: name } },
      create: { userId, breed: name, imageUrl: safeImage },
      update: {},
    });
  }

  return getFavorites();
}
