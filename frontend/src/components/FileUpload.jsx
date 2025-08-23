import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Paper, Typography, LinearProgress, Alert, Chip, IconButton } from '@mui/material';
import { CloudUploadOutlined, DeleteOutlined } from '@mui/icons-material';
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
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadOutlined sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or click to select file
        </Typography>
      </Paper>

      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected File ({selectedFiles.length}):
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedFiles.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => removeFile(index)}
                deleteIcon={<DeleteOutlined />}
                variant="outlined"
              />
            ))}
          </Box>
          
          <button
            onClick={uploadFiles}
            disabled={uploading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: uploading ? 'not-allowed' : 'pointer',
            }}
          >
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </Box>
      )}

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary">
            {Math.round(uploadProgress)}% complete
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default FileUpload;