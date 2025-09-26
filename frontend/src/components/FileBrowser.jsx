import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Chip,
  Fade,
  Zoom,
} from '@mui/material';
import {
  FolderOutlined,
  InsertDriveFileOutlined,
  HomeOutlined,
  MoreVertOutlined,
  CloudUploadOutlined,
  CloudOutlined,
  CreateNewFolderOutlined,
  DownloadOutlined,
  DeleteOutlined,
  RefreshOutlined,
  StorageOutlined,
  SpeedOutlined,
} from '@mui/icons-material';
import { fileService } from '../services/file_service';
import { useAuth } from '../contexts/AuthContext';
import FileUpload from './FileUpload';

const FileBrowser = ({ 
  currentPath: propCurrentPath, 
  onPathChange, 
  viewMode = 'list',
  refreshTrigger,
  onRefresh 
}) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const defaultPath = user?.username === 'demo' ? '/demo' : '/';
  const [currentPath, setCurrentPath] = useState(propCurrentPath !== undefined ? propCurrentPath : defaultPath);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // UI state
  const [showUpload, setShowUpload] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);

  useEffect(() => {
    if (propCurrentPath !== undefined) {
      setCurrentPath(propCurrentPath);
    }
  }, [propCurrentPath]);

  useEffect(() => {
    if (propCurrentPath === undefined) {
      setCurrentPath(user?.username === 'demo' ? '/demo' : '/');
    }
  }, [user, propCurrentPath]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, refreshTrigger]);

  // Show demo modal for demo users
  useEffect(() => {
    if (user?.username === 'demo') {
      setShowDemoModal(true);
    }
  }, [user]);

  const loadDirectory = async (path) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fileService.listDirectory(path);
      setFiles(data.items);
    } catch (error) {
      setError(error.response?.data?.error || error.response?.data?.detail || 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = (path) => {
    setCurrentPath(path);
    onPathChange?.(path);
  };

  const handleItemClick = async (item) => {
    if (item.type === 'directory') {
      navigateToPath(item.path);
    } else {
      // Handle file click - download by default
      try {
        await fileService.downloadFile(item.path);
        showSnackbar('File download started');
      } catch (error) {
        showSnackbar('Download failed: ' + (error.response?.data?.detail || error.message));
      }
    }
  };

  const handleMenuClick = (event, item) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleDownload = async () => {
    try {
      await fileService.downloadFile(selectedItem.path);
      showSnackbar('Download started');
    } catch (error) {
      showSnackbar('Download failed: ' + (error.response?.data?.detail || error.message));
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      await fileService.deleteFile(selectedItem.path);
      showSnackbar(`${selectedItem.type === 'directory' ? 'Folder' : 'File'} deleted successfully`);
      loadDirectory(currentPath); // Refresh
      onRefresh?.(); // Trigger parent refresh
    } catch (error) {
      showSnackbar('Delete failed: ' + (error.response?.data?.detail || error.message));
    }
    handleMenuClose();
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await fileService.createDirectory(newFolderName, currentPath);
      showSnackbar('Folder created successfully');
      setNewFolderName('');
      setShowCreateDialog(false);
      loadDirectory(currentPath); // Refresh
      onRefresh?.(); // Trigger parent refresh
    } catch (error) {
      showSnackbar('Create folder failed: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleUploadComplete = () => {
    loadDirectory(currentPath); // Refresh
    onRefresh?.(); // Trigger parent refresh
    setShowUpload(false);
    showSnackbar('Upload completed successfully');
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const paths = ['/', ...parts.map((_, index) => 
      '/' + parts.slice(0, index + 1).join('/')
    )];

    return (
      <Card 
        sx={{ 
          mb: 3,
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Breadcrumbs 
              sx={{ 
                '& .MuiBreadcrumbs-separator': {
                  color: 'primary.main',
                }
              }}
            >
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigateToPath('/')}
                sx={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.light',
                  }
                }}
              >
                <HomeOutlined sx={{ mr: 0.5, fontSize: 20 }} />
                Home
              </Link>
              {parts.map((part, index) => {
                const path = paths[index + 1];
                const isLast = index === parts.length - 1;
                
                return isLast ? (
                  <Typography 
                    color="text.primary" 
                    key={path}
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                    }}
                  >
                    {part}
                  </Typography>
                ) : (
                  <Link
                    key={path}
                    underline="hover"
                    color="inherit"
                    onClick={() => navigateToPath(path)}
                    sx={{ 
                      cursor: 'pointer',
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'primary.main',
                      }
                    }}
                  >
                    {part}
                  </Link>
                );
              })}
            </Breadcrumbs>
            
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<StorageOutlined />}
                label={`${files.length} items`}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'rgba(0, 212, 255, 0.3)',
                  color: 'primary.main',
                }}
              />
              <Chip
                icon={<SpeedOutlined />}
                label="Active"
                size="small"
                variant="outlined"
                color="success"
                sx={{
                  borderColor: 'rgba(76, 175, 80, 0.3)',
                  color: '#4caf50',
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={8}>
        <Box sx={{ position: 'relative' }}>
          <CircularProgress 
            size={60} 
            thickness={4}
            sx={{ 
              color: 'primary.main',
              filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))',
            }} 
          />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
              animation: 'pulse 2s infinite',
            }}
          />
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 3 }}>
          Loading files...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with breadcrumbs */}
      {renderBreadcrumbs()}
      
      {/* Action buttons */}
      <Card 
        sx={{ 
          mb: 3,
        }}
      >
        <CardContent sx={{ py: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              startIcon={<CloudUploadOutlined />}
              variant="contained"
              size="medium"
              onClick={() => setShowUpload(!showUpload)}
              sx={{
                background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4ddbff 0%, #00d4ff 100%)',
                  boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
                },
              }}
            >
              Upload Files
            </Button>
            <Button
              startIcon={<CreateNewFolderOutlined />}
              variant="outlined"
              size="medium"
              onClick={() => setShowCreateDialog(true)}
              sx={{
                borderColor: 'rgba(0, 212, 255, 0.5)',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  background: 'rgba(0, 212, 255, 0.1)',
                },
              }}
            >
              New Folder
            </Button>
            <Button
              startIcon={<RefreshOutlined />}
              variant="outlined"
              size="medium"
              onClick={() => loadDirectory(currentPath)}
              sx={{
                borderColor: 'rgba(0, 212, 255, 0.5)',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.main',
                  background: 'rgba(0, 212, 255, 0.1)',
                },
              }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Upload area */}
      {showUpload && (
        <Fade in timeout={300}>
          <Card 
            sx={{ 
              mb: 3,
              background: 'rgba(20, 20, 30, 0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 212, 255, 0.2)',
            }}
          >
            <CardContent>
              <FileUpload
                currentPath={currentPath}
                onUploadComplete={handleUploadComplete}
                onCancel={() => setShowUpload(false)}
              />
            </CardContent>
          </Card>
        </Fade>
      )}

      {error && (
        <Fade in timeout={300}>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              background: 'rgba(255, 0, 128, 0.1)',
              border: '1px solid rgba(255, 0, 128, 0.3)',
              '& .MuiAlert-icon': {
                color: 'secondary.main',
              }
            }}
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* File list */}
      <Card 
        sx={{ 
          flex: 1,
          background: 'rgba(20, 20, 30, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
        }}
      >
        {files.length > 0 ? (
          <Grid container spacing={2} sx={{ p: 2 }}>
            {files.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.path}>
                <Zoom in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'rgba(20, 20, 30, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                      },
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            background: item.type === 'directory' 
                              ? 'rgba(0, 212, 255, 0.1)' 
                              : 'rgba(255, 255, 255, 0.05)',
                            mr: 2,
                          }}
                        >
                          {item.type === 'directory' ? (
                            <FolderOutlined 
                              sx={{ 
                                color: 'primary.main',
                                fontSize: 24,
                                filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))',
                              }} 
                            />
                          ) : (
                            <InsertDriveFileOutlined 
                              sx={{ 
                                color: 'text.secondary',
                                fontSize: 24,
                              }} 
                            />
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuClick(e, item);
                          }}
                          sx={{
                            ml: 'auto',
                            color: 'text.secondary',
                            '&:hover': {
                              color: 'primary.main',
                              background: 'rgba(0, 212, 255, 0.1)',
                            },
                          }}
                        >
                          <MoreVertOutlined />
                        </IconButton>
                      </Box>
                      
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          mb: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          label={item.type === 'file' ? formatFileSize(item.size) : 'Folder'}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: item.type === 'directory' 
                              ? 'rgba(0, 212, 255, 0.3)' 
                              : 'rgba(255, 255, 255, 0.2)',
                            color: item.type === 'directory' 
                              ? 'primary.main' 
                              : 'text.secondary',
                            fontSize: '0.75rem',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(item.modified)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', p: 8 }}>
            <Box sx={{ mb: 4 }}>
              <CloudOutlined 
                sx={{ 
                  fontSize: 80, 
                  color: 'text.secondary',
                  opacity: 0.5,
                  mb: 2,
                }} 
              />
              <Typography color="text.secondary" variant="h5" gutterBottom>
                This directory is empty
              </Typography>
              <Typography color="text.secondary" variant="body1" sx={{ mb: 4 }}>
                Upload your first file to get started
              </Typography>
            </Box>
            <Button
              startIcon={<CloudUploadOutlined />}
              variant="contained"
              size="large"
              onClick={() => setShowUpload(true)}
            >
              Upload your first file
            </Button>
          </Box>
        )}
      </Card>

      {/* Mobile FAB for upload */}
      {isMobile && !showUpload && (
        <Fab
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            '&:hover': {
              boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
            },
            transition: 'all 0.2s ease',
          }}
          onClick={() => setShowUpload(true)}
        >
          <CloudUploadOutlined />
        </Fab>
      )}

      {/* Context menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 30, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }
        }}
      >
        {selectedItem?.type === 'file' && (
          <MenuItem 
            onClick={handleDownload}
            sx={{
              color: 'primary.main',
              '&:hover': {
                background: 'rgba(0, 212, 255, 0.1)',
              }
            }}
          >
            <DownloadOutlined sx={{ mr: 1 }} />
            Download
          </MenuItem>
        )}
        <MenuItem 
          onClick={handleDelete}
          sx={{
            color: 'secondary.main',
            '&:hover': {
              background: 'rgba(255, 0, 128, 0.1)',
            }
          }}
        >
          <DeleteOutlined sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create folder dialog */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 30, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{ color: 'primary.main', fontWeight: 600 }}>
          Create New Folder
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            fullWidth
            variant="outlined"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateFolder();
              }
            }}
            sx={{
              mt: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 212, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00d4ff',
                  boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.2)',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowCreateDialog(false)}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFolder} 
            variant="contained"
            disabled={!newFolderName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Demo Welcome Modal */}
      <Dialog 
        open={showDemoModal} 
        onClose={() => setShowDemoModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(20, 20, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          color: 'primary.main', 
          fontWeight: 600,
          textAlign: 'center',
          fontSize: '1.5rem',
          pt: 4,
          pb: 2
        }}>
          Welcome to the pi cloud demo
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 2 }}>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: '1.1rem',
              lineHeight: 1.6,
              mb: 3
            }}
          >
            Any files you upload will be deleted after two hours. Do not upload ANY potentially sensitive information. Both I and any other viewers of the demo will be able to view it. 
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mb: 2
          }}>
            <CloudOutlined 
              sx={{ 
                fontSize: 48, 
                color: 'primary.main',
                opacity: 0.7,
                filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.3))'
              }} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          justifyContent: 'center', 
          p: 4,
          pt: 2
        }}>
          <Button 
            onClick={() => setShowDemoModal(false)}
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 500,
              background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4ddbff 0%, #00d4ff 100%)',
                boxShadow: '0 8px 25px rgba(0, 212, 255, 0.4)',
              },
            }}
          >
            Got it, let's start!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error snackbar */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
        ContentProps={{
          sx: {
            background: 'rgba(20, 20, 30, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            color: 'primary.main',
            fontWeight: 500,
          }
        }}
      />
    </Box>
  );
};

export default FileBrowser;