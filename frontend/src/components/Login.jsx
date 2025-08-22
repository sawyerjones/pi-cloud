import React, { useState } from "react";
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress, Container } from '@mui/material';
import { CloudOutlined } from '@mui/icons-material';
import { useAuth } from "../contexts/AuthContext";


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e) => {
        console.log("handlesubmit fired");
        e.preventDefault();
        await login(username, password);
    }
    return (
        <Container component="main" maxWidth="sm">
        <Box
            sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'grey.50',
            }}
        >
            <Card
            sx={{
                width: '100%',
                maxWidth: 400,
                boxShadow: 3,
            }}
            >
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                <CloudOutlined sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom>
                    File Server
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Sign in to access personal cloud storage
                </Typography>
                </Box>

                {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
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
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                    size="large"
                >
                    {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    Default credentials: test_admin / test123
                </Typography>
                </Box>
            </CardContent>
            </Card>
        </Box>
        </Container>
    );
};

export default Login;