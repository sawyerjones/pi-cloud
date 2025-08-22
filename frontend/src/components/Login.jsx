import React, { useState } from "react";
import { Box, Card, CardContent, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { useAuth } from "../contexts/AuthContext";


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(username, password);
    }

    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            bgcolor="grey.100"
        >
            <Card sx={{ minWidth: 400, maxWidth: 500 }}>
                <CardContent sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    File Server
                </Typography>
                
                <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                    Sign in to access your files
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
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

                <Typography variant="caption" color="text.secondary" align="center" display="block">
                    Default: admin / test123
                </Typography>
                </CardContent>
            </Card>
            </Box>
    );
}

export default Login;