"use client";
import { useState } from 'react';
import { AppBar, Toolbar, Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthButton from './AuthButton';

interface NavbarProps {
  search?: React.ReactNode;
}

// Links in the hamburger menu.
const MENU_LINKS = [
  { href: '/', label: 'Search breeds', emoji: '🔍' },
  { href: '/favorites', label: 'Favorites', emoji: '🐶' },
];

export default function ButtonAppBar({ search }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Floating glass bar that stays at the top while scrolling */}
      <AppBar position="sticky" sx={{ top: 12, mt: 1.5, zIndex: (t) => t.zIndex.appBar }}>
        <Toolbar sx={{ gap: { xs: 1, sm: 2 } }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Link href="/" style={{ display: 'flex' }}>
            <Box component="img" sx={{ height: { xs: 32, sm: 40 } }} alt="Doggo Dictionary home" src="/logo.svg" />
          </Link>

          <Box sx={{ flexGrow: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
            {search && <Box sx={{ width: '100%', maxWidth: 500 }}>{search}</Box>}
          </Box>
          <AuthButton />
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{
          paper: { sx: { width: 260, p: 1.5 } },
          backdrop: { sx: (t) => ({ backgroundColor: alpha(t.palette.text.primary, 0.18), backdropFilter: 'blur(3px)' }) },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton aria-label="close menu" onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {MENU_LINKS.map((link) => (
            <ListItemButton
              key={link.href}
              component={Link}
              href={link.href}
              selected={pathname === link.href}
              onClick={() => setMenuOpen(false)}
            >
              <ListItemIcon sx={{ minWidth: 36, fontSize: 22 }}>
                <span aria-hidden="true">{link.emoji}</span>
              </ListItemIcon>
              <ListItemText primary={link.label} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
}
