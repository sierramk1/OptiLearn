import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import MultiDimAlgorithmViewer from './MultiDimAlgorithmViewer.jsx';

function MultiDAlgorithmsPage() {
  return (
    <div style={{
      padding: '0px', 
      backgroundColor: '#F4F2EF', // Main content area background color
      fontFamily: 'Roboto, Arial, sans-serif' 
    }}>
      {/* --- TOP HEADER AND NAVIGATION --- */}
      <AppBar 
        position="static" 
        sx={{
          backgroundColor: '#FFF5E6',
          height: '77px',
          boxShadow: 'none',
          borderBottom: '1px solid #ccc'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', padding: '0 20px' }}>
          {/* OptiLearn as a Link to Home */}
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/character.png" 
              alt="Owl Character" 
              style={{ maxWidth: '50px', height: 'auto', marginRight: '10px' }} 
            />
            <Typography
              variant="h4"
              sx={{
                color: '#72A8C8',
                fontFamily: 'Roboto',
                fontWeight: '700',
                fontSize: '38px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              OptiLearn
            </Typography>
          </Link>

          <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {/* One-Dimensional / Multi-Dimensional buttons in Header */}
            <Button
              component={Link}
              to="/one-dimensional"
              sx={{
                color: '#666',
                fontSize: '1.2em',
                fontWeight: 'normal',
                textDecoration: 'none',
                textTransform: 'none',
                minWidth: '180px',
                padding: '0',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              One-Dimensional
            </Button>
            <Button
              component={Link}
              to="/multi-dimensional"
              sx={{
                color: '#3C667E',
                fontSize: '1.2em',
                fontWeight: 'bold',
                textDecoration: 'none',
                textTransform: 'none',
                minWidth: '180px',
                padding: '0',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Multi-Dimensional
            </Button>
            <Button
              component={Link}
              to="/gen-ai-guide"
              sx={{
                color: '#666',
                fontSize: '1.2em',
                fontWeight: 'normal',
                textDecoration: 'none',
                textTransform: 'none',
                minWidth: '180px',
                padding: '0',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Gen-AI Guide
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* --- Algorithm Content --- */}
      <div style={{ padding: '0px', minHeight: 'calc(100vh - 77px)' }}> 
        <MultiDimAlgorithmViewer />
      </div>

    </div>
  );
}

export default MultiDAlgorithmsPage;
