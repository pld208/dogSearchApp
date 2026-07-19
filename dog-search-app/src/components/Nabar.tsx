import { AppBar, Toolbar, Typography, Box, Button, IconButton} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Image from 'next/image';
import Link from 'next/link';

export default function ButtonAppBar() {
  return (
      <AppBar position="static" sx={{ width: '100%' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Link href="/" passHref style={{ textDecoration: 'none', display: 'flex' }}>
            <Box
              component="img"
              sx={{
                height: 40,
                marginRight: 2,
                cursor: 'pointer'
              }}
              alt="Dog Breed App Logo"
              src="/logo.png"
            />
          </Link>
      
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
  
  );
}
