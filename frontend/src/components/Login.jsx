import React, { useState } from "react";
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress, Container, Fade, Stack } from '@mui/material';
import { CloudOutlined } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loginDemo, loading, error } = useAuth();

    let navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(username, password);
        if (success) {
            navigate('/files');
        }
    }
    return (
        <Box
            sx={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
            }}
        >

            <Container 
                component="main" 
                maxWidth="sm" 
                sx={{ 
                    position: 'relative', 
                    zIndex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    py: 2
                }}
            >
                <Fade in timeout={800}>
                    <Card
                        sx={{
                            width: '100%',
                            maxWidth: 400,
                            background: 'rgba(20, 20, 30, 0.6)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                            borderRadius: 2,
                        }}
                    >
                        <CardContent sx={{ p: 5 }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <CloudOutlined 
                                    sx={{ 
                                        fontSize: 60, 
                                        color: 'primary.main', 
                                        mb: 2,
                                    }} 
                                />
                                
                                <Typography 
                                    variant="h4" 
                                    component="h1" 
                                    gutterBottom
                                    sx={{
                                        background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        fontWeight: 600,
                                        mb: 1,
                                    }}
                                >
                                    pi cloud
                                </Typography>
                                
                                <Typography 
                                    variant="body1" 
                                    color="text.secondary"
                                    sx={{ 
                                        fontWeight: 400,
                                    }}
                                >
                                    Personal cloud storage
                                </Typography>
                            </Box>

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

                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    variant="outlined"
                                    margin="normal"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                    required
                                    autoFocus
                                    sx={{
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
                                
                                <TextField
                                    fullWidth
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    margin="normal"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    required
                                    sx={{
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

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        sx={{ 
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                        }}
                                        disabled={loading}
                                        size="large"
                                    >
                                        {loading ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CircularProgress size={20} sx={{ color: 'white' }} />
                                                <span>Signing in...</span>
                                            </Box>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            const success = await loginDemo();
                                            if (success) {
                                                navigate('/files');
                                            }
                                        }}
                                        fullWidth
                                        variant="outlined"
                                        size="large"
                                        sx={{
                                            py: 1.5,
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            borderColor: 'rgba(0, 212, 255, 0.5)',
                                            color: 'primary.main',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                background: 'rgba(0, 212, 255, 0.1)',
                                            },
                                        }}
                                        disabled={loading}
                                    >
                                        Demo
                                    </Button>
                                </Stack>
                            </form>
                            
                        </CardContent>
                    </Card>
                </Fade>
            </Container>
        </Box>
    );
};

export default Login;