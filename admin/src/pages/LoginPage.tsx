import { Box, Typography } from '@mui/material';
import { Login } from 'react-admin';
import { LoginForm } from 'ra-supabase';
import { brand } from '../theme';

/** Page de connexion : formulaire e-mail / mot de passe de ra-supabase, habillage HEROES. */
export function HeroesLoginPage() {
  return (
    <Login
      sx={{ '& .RaLogin-card': { marginTop: '10vh' } }}
    >
      <Box sx={{ textAlign: 'center', pb: 1 }}>
        <Box component="img" src="/wordmark-heroes.png" alt="HEROES" sx={{ height: 26, display: 'block', mx: 'auto' }} />
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, letterSpacing: 3, fontWeight: 700, color: brand.blue }}>
          ADMIN
        </Typography>
      </Box>
      <LoginForm />
    </Login>
  );
}
