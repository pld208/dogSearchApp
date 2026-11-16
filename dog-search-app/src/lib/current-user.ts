import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import { createClient } from "@/src/lib/supabase/server";

export const GUEST_COOKIE = "doggo_user_id";
const ONE_YEAR = 60 * 60 * 24 * 365;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Signed-in users are identified by their Supabase Auth id. Everyone else
// is a guest with an id in an httpOnly cookie. Only call this from Server
// Actions or Route Handlers, because creating a guest sets a cookie.
export async function getOrCreateUserId(): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const authUserId = data?.claims?.sub;

  if (authUserId) {
    await prisma.user.upsert({
      where: { id: authUserId },
      create: { id: authUserId },
      update: {},
    });
    return authUserId;
  }

  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value;
  if (guestId && UUID_RE.test(guestId)) {
    const guest = await prisma.user.findUnique({ where: { id: guestId } });
    if (guest) return guest.id;
  }

  const guest = await prisma.user.create({ data: {} });
  cookieStore.set(GUEST_COOKIE, guest.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return guest.id;
}

// After sign-in, move a guest's favorites and chat history onto their
// account so nothing saved before logging in is lost.
export async function mergeGuestIntoUser(authUserId: string): Promise<void> {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE)?.value;
  cookieStore.delete(GUEST_COOKIE);

  if (!guestId || !UUID_RE.test(guestId) || guestId === authUserId) return;

  await prisma.$transaction(async (tx) => {
    const guest = await tx.user.findUnique({
      where: { id: guestId },
      include: { favorites: true },
    });
    if (!guest) return;

    await tx.user.upsert({
      where: { id: authUserId },
      create: { id: authUserId },
      update: {},
    });
    await tx.favorite.createMany({
      data: guest.favorites.map((f) => ({
        userId: authUserId,
        breed: f.breed,
        imageUrl: f.imageUrl,
      })),
      skipDuplicates: true,
    });
    await tx.chatMessage.updateMany({
      where: { userId: guestId },
      data: { userId: authUserId },
    });
    await tx.user.delete({ where: { id: guestId } });
  });
}
