import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  useTheme,
  useMediaQuery,
  Tooltip,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  FolderOutlined,
  InsertDriveFileOutlined,
  HomeOutlined,
  MoreVertOutlined,
  CloudUploadOutlined,
  CreateNewFolderOutlined,
  DownloadOutlined,
  DeleteOutlined,
  DriveFileMoveOutlined,
  RefreshOutlined,
} from '@mui/icons-material';
import { fileService } from '../services/file_service';
import FileUpload from './FileUpload';

const FileBrowser = ({ 
  currentPath: propCurrentPath, 
  onPathChange, 
  viewMode = 'list',
  refreshTrigger,
  onRefresh 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [currentPath, setCurrentPath] = useState(propCurrentPath || '/');
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

  useEffect(() => {
    if (propCurrentPath !== undefined) {
      setCurrentPath(propCurrentPath);
    }
  }, [propCurrentPath]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, refreshTrigger]);

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
      await fileService.createDirectory(currentPath, newFolderName);
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header with breadcrumbs and actions */}
      <Box sx={{ mb: 2 }}>
        {renderBreadcrumbs()}
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<CloudUploadOutlined />}
            variant="outlined"
            size="small"
            onClick={() => setShowUpload(!showUpload)}
          >
            Upload
          </Button>
          <Button
            startIcon={<CreateNewFolderOutlined />}
            variant="outlined"
            size="small"
            onClick={() => setShowCreateDialog(true)}
          >
            New Folder
          </Button>
          <Button
            startIcon={<RefreshOutlined />}
            variant="outlined"
            size="small"
            onClick={() => loadDirectory(currentPath)}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Upload area */}
      {showUpload && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <FileUpload
            currentPath={currentPath}
            onUploadComplete={handleUploadComplete}
            onCancel={() => setShowUpload(false)}
          />
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* File list */}
      <Paper sx={{ flex: 1, overflow: 'auto' }}>
        <List>
          {files.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton onClick={() => handleItemClick(item)}>
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
                    <Box>
                      <Typography variant="caption" component="div">
                        {item.type === 'file' 
                          ? formatFileSize(item.size)
                          : 'Directory'
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(item.modified)}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
              
              <ListItemSecondaryAction>
                <Tooltip title="More actions">
                  <IconButton 
                    edge="end" 
                    onClick={(e) => handleMenuClick(e, item)}
                  >
                    <MoreVertOutlined />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

        {files.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography color="text.secondary" variant="h6" gutterBottom>
              This directory is empty
            </Typography>
            <Button
              startIcon={<CloudUploadOutlined />}
              variant="contained"
              onClick={() => setShowUpload(true)}
              sx={{ mt: 2 }}
            >
              Upload your first file
            </Button>
          </Box>
        )}
      </Paper>

      {/* Mobile FAB for upload */}
      {isMobile && !showUpload && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
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
      >
        {selectedItem?.type === 'file' && (
          <MenuItem onClick={handleDownload}>
            <DownloadOutlined sx={{ mr: 1 }} />
            Download
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete}>
          <DeleteOutlined sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create folder dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)}>
        <DialogTitle>Create New Folder</DialogTitle>
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
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>
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

      {/* Success/Error snackbar */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default FileBrowser;