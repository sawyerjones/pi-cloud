import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Breadcrumbs, Link, CircularProgress, Alert } from '@mui/material';
import { FolderOutlined, InsertDriveFileOutlined, HomeOutlined } from '@mui/icons-material';
import { fileService } from '../services/file_service';

const FileBrowser = () => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  const loadDirectory = async (path) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fileService.listDirectory(path);
      setFiles(data.items);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = (path) => {
    setCurrentPath(path);
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const paths = ['/', ...parts.map((_, index) => 
      '/' + parts.slice(0, index + 1).join('/')
    )];

    return (
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={() => navigateToPath('/')}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <HomeOutlined sx={{ mr: 0.5, fontSize: 20 }} />
          Home
        </Link>
        {parts.map((part, index) => {
          const path = paths[index + 1];
          const isLast = index === parts.length - 1;
          
          return isLast ? (
            <Typography color="text.primary" key={path}>
              {part}
            </Typography>
          ) : (
            <Link
              key={path}
              underline="hover"
              color="inherit"
              onClick={() => navigateToPath(path)}
              sx={{ cursor: 'pointer' }}
            >
              {part}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {renderBreadcrumbs()}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {files.map((item) => (
          <ListItem key={item.path} disablePadding>
              <ListItemIcon>
                {item.type === 'directory' ? (
                  <FolderOutlined color="primary" />
                ) : (
                  <InsertDriveFileOutlined />
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                secondary={
                  item.type === 'file' 
                    ? `${(item.size / 1024).toFixed(1)} KB`
                    : 'Directory'
                }
              />
          </ListItem>
        ))}
      </List>

      {files.length === 0 && !loading && (
        <Typography 
          color="text.secondary" 
          align="center" 
          sx={{ mt: 4 }}
        >
          This directory is empty
        </Typography>
      )}
    </Box>
  );
};

export default FileBrowser;