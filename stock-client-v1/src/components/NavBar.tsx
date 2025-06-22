import React from 'react';
import { AppBar, Toolbar, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NavBar: React.FC = () => (
  <AppBar position="fixed" color="primary" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
    <Toolbar>
      <Typography
        variant="h6"
        component={RouterLink}
        to="/"
        style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
      >
        Trading on Sentiment
      </Typography>
      <MuiLink
        component={RouterLink}
        to="/about"
        color="inherit"
        underline="hover"
        sx={{ fontSize: '1.1rem', ml: 10 }}
      >
        About
      </MuiLink>
    </Toolbar>
  </AppBar>
);

export default NavBar;