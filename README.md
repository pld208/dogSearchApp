# dogSearchApp
a dog breed search app with images and facts about different dog breeds and an AI agent to discuss different dogs

## Database setup (Supabase + Prisma)

1. Create a project at [supabase.com](https://supabase.com).
2. In `dog-search-app/`, copy `.env.example` to `.env` and paste in the connection strings from the dashboard (**Connect → ORMs → Prisma**).
3. Create the tables: `npm run db:deploy`
4. Start the app: `npm run dev`

After changing `prisma/schema.prisma`, run `npm run db:migrate` to create a new migration. Use `npm run db:studio` to browse data.

## Google sign-in setup

1. **Google Cloud Console** → APIs & Services:
   - Set up the **OAuth consent screen** (External, app name, support email).
   - **Credentials → Create credentials → OAuth client ID** → Web application.
   - Authorized JavaScript origins: `http://localhost:3000` (plus your production URL later).
   - Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
2. **Supabase** → Authentication → Sign In / Providers → **Google**: enable it and paste the client ID and secret.
3. **Supabase** → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: add `http://localhost:3000/auth/callback` (plus your production URL's `/auth/callback` later).
4. In `dog-search-app/.env`, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Supabase → Project Settings → API Keys).

Favorites saved before signing in are moved to your account when you log in.
