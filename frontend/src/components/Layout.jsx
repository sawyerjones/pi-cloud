import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Avatar, Chip, Tooltip, Fade } from '@mui/material';
import { LogoutOutlined, FolderOutlined, CloudOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh' }}>
      <AppBar 
        position="sticky"
        sx={{
          background: 'rgba(10, 10, 10, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
              <CloudOutlined 
                sx={{ 
                  mr: 1.5, 
                  fontSize: 24,
                  color: 'primary.main',
                }} 
              />
              <Typography 
                variant="h5" 
                component="div"
                sx={{
                  background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontWeight: 600,
                }}
              >
                pi cloud
              </Typography>
            </Box>
            
            <Chip
              icon={<FolderOutlined />}
              label="File Manager"
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(0, 212, 255, 0.3)',
                color: 'primary.main',
                '& .MuiChip-icon': {
                  color: 'primary.main',
                },
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Fade in timeout={600}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: '#00d4ff',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                    {user?.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Online
                  </Typography>
                </Box>
              </Box>
            </Fade>
            
            <Tooltip title="Sign Out" arrow>
              <IconButton 
                color="inherit" 
                onClick={logout}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'secondary.main',
                    background: 'rgba(255, 0, 128, 0.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <LogoutOutlined />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box 
        sx={{ 
          p: 3,
          minHeight: 'calc(100vh - 64px)',
          background: 'transparent',
        }}
      >
        <Fade in timeout={800}>
          <Box>
            {children}
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default Layout;