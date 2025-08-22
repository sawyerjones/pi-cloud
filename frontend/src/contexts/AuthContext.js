import { createContext, useContext, useState, useEffect} from 'react'
import api from '../services/api'

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be within AuthProvider");
    }
    return context;
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            verifyToken();
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async () => {
        try {
            const response = await api.post("/auth/verify");
            setUser(response.data);
            setError(null);
        } catch (error) {
            console.error('Token verification failed: ', error);
            localStorage.removeItem('authToken');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    const login = async (username, password) => {
        try {
            setLoading(true);
            setError(null); // reset
            const response = await api.post('/auth/login',
               { username, password }
            );

            const { access_token } = response.data;
            localStorage.setItem('authToken', access_token);
            // pull user data
            const userResponse = await api.get('/auth/me');
            setUser(userResponse.data);

            return  {success: true }
        } catch (error) {
            // catch failed logins
            const message = error.response?.data?.error || "Login Failed";
            setError(message);
            return { sucess: false, error: message}
        } finally {
            setLoading(false);
        }
    }

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setError(null);
    }

    const values = {
        user, loading, error, login, logout, isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
};