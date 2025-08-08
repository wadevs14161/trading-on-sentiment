import React from 'react';
import { AppBar, Toolbar, Typography, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NavBar: React.FC = () => (
  <AppBar 
    position="fixed" 
    sx={{ 
      zIndex: (theme) => theme.zIndex.drawer + 1,
      backgroundColor: '#ffffff',
      color: '#2c3e50',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      borderBottom: '1px solid #e9ecef'
    }}
  >
    <Toolbar>
      <Typography
        variant="h6"
        component={RouterLink}
        to="/"
        sx={{ 
          textDecoration: 'none', 
          color: '#2c3e50', 
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        Trading on Sentiment
      </Typography>
      <MuiLink
        component={RouterLink}
        to="/about"
        sx={{ 
          fontSize: '1.1rem', 
          ml: 10,
          color: '#6c757d',
          textDecoration: 'none',
          '&:hover': {
            color: '#2c3e50',
            textDecoration: 'underline'
          }
        }}
      >
        About
      </MuiLink>
    </Toolbar>
  </AppBar>
);

export default NavBar;