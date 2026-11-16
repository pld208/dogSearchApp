"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Button, IconButton, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/src/lib/supabase/client";

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  // The client is created in the browser only (it's a singleton there),
  // so server prerendering never needs the Supabase keys.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
      },
    });
    if (error) console.error("Google sign-in failed:", error);
  };

  const signOut = async () => {
    setMenuAnchor(null);
    await createClient().auth.signOut();
    // Reload so favorites switch back to this browser's guest list.
    window.location.reload();
  };

  if (!ready) return null;

  if (!user) {
    return (
      <Button color="inherit" startIcon={<GoogleIcon />} onClick={signInWithGoogle}>
        Login
      </Button>
    );
  }

  const name = user.user_metadata?.full_name ?? user.email ?? "Account";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <>
      <Tooltip title={name}>
        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ p: 0 }}>
          <Avatar src={avatarUrl} alt={name} slotProps={{ img: { referrerPolicy: "no-referrer" } }}>
            {name.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem disabled>
          <Typography variant="body2">{user.email}</Typography>
        </MenuItem>
        <MenuItem onClick={signOut}>Sign out</MenuItem>
      </Menu>
    </>
  );
}
