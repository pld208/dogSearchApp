import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/src/lib/supabase/server";
import { mergeGuestIntoUser } from "@/src/lib/current-user";

// Google sends the user back to Supabase, which redirects here with a
// one-time code. Exchange it for a session cookie, then return home.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  // Only allow same-site paths, so this can't be used as an open redirect.
  const nextParam = searchParams.get("next") ?? "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      try {
        await mergeGuestIntoUser(data.user.id);
      } catch (err) {
        console.error("Could not merge guest data into account:", err);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("Supabase sign-in failed:", error);
  }

  return NextResponse.redirect(`${origin}/?auth_error=1`);
}
