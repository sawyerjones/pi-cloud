import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, Typography, LinearProgress, Alert, Chip, Button, Fade } from '@mui/material';
import { CloudUploadOutlined, DeleteOutlined, UploadFileOutlined } from '@mui/icons-material';
import { fileService } from '../services/file_service';

const FileUpload = ({ currentPath, onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
        setError(null);
    }, []);

    // handle multiple files later
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
         accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.bmp', '.webp'],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/*': ['.txt', '.csv', '.json', '.xml'],
            'application/zip': ['.zip', '.rar', '.7z'],
            'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
            'audio/*': ['.mp3', '.wav', '.ogg', '.flac'],
            },
    });

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    }

    // eslint-disable-next-line
    const clearAllFiles = () => {
        setSelectedFiles([]);
        setError(null);
    }

    const uploadFiles = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setError(null);

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                setUploadProgress((i / selectedFiles.length) * 100);
            
                await fileService.uploadFile(file, currentPath);
            }
            
            setUploadProgress(100);
            setSelectedFiles([]);
            onUploadComplete?.();

            setTimeout(() => {
                setUploadProgress(0);
            }, 1000)
        } catch (error) {
            setError(error.response?.data?.error || "Upload failed");
        } finally {
            setUploading(false)
        }
    }
    
    return (
     <Box sx={{ mb: 3 }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
          background: isDragActive 
            ? 'rgba(0, 212, 255, 0.1)' 
            : 'rgba(20, 20, 30, 0.6)',
          backdropFilter: 'blur(20px)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: 'primary.main',
            background: 'rgba(0, 212, 255, 0.05)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 212, 255, 0.2)',
          },
        }}
      >
        <input {...getInputProps()} />
        
        <Box>
          <CloudUploadOutlined 
            sx={{ 
              fontSize: 48, 
              color: isDragActive ? 'primary.main' : 'text.secondary',
              mb: 2,
              transition: 'all 0.2s ease',
            }} 
          />
          
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{
              color: isDragActive ? 'primary.main' : 'text.primary',
              fontWeight: 500,
              mb: 1,
            }}
          >
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            or click to select files
          </Typography>
          
          <Typography variant="caption" color="text.secondary">
            Supports: Images, PDFs, Documents, Archives, Media files
          </Typography>
        </Box>
      </Paper>

      {selectedFiles.length > 0 && (
        <Fade in timeout={300}>
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Selected Files ({selectedFiles.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {selectedFiles.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => removeFile(index)}
                  deleteIcon={<DeleteOutlined />}
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(0, 212, 255, 0.3)',
                    color: 'primary.main',
                    '& .MuiChip-deleteIcon': {
                      color: 'secondary.main',
                      '&:hover': {
                        color: 'secondary.dark',
                      },
                    },
                  }}
                />
              ))}
            </Box>
            
            <Button
              onClick={uploadFiles}
              disabled={uploading}
              variant="contained"
              size="large"
              startIcon={uploading ? <UploadFileOutlined /> : <CloudUploadOutlined />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </Box>
        </Fade>
      )}

      {uploading && (
        <Fade in timeout={300}>
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ mr: 2, color: 'primary.main', fontWeight: 500 }}>
                Uploading...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(uploadProgress)}% complete
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: '#00d4ff',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </Fade>
      )}

      {error && (
        <Fade in timeout={300}>
          <Alert 
            severity="error" 
            sx={{ 
              mt: 3,
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
    </Box>
  );
};

export default FileUpload;