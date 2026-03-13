import { useGoogleLogin } from '@react-oauth/google';
import { Button, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import useThinkify from '../../src/hooks/useThinkify';

/**
 * Shared Google login button.
 * Works on both Login and Registration pages.
 * Sends the Google credential to the backend, sets cookies, and navigates.
 */
const GoogleLoginButton = () => {
    const navigate = useNavigate();
    const { setAlertBoxOpenStatus, setAlertMessage, setAlertSeverity } = useThinkify();
    const [loading, setLoading] = useState(false);

    const handleGoogleSuccess = async (tokenResponse) => {
        setLoading(true);
        try {
            // useGoogleLogin implicit flow returns access_token, not credential
            const response = await axios.post(
                `${import.meta.env.VITE_SERVER_ENDPOINT}/auth/google`,
                { accessToken: tokenResponse.access_token }
            );

            if (response.data.status) {
                const { token, user } = response.data;

                Cookies.set(import.meta.env.VITE_TOKEN_KEY, token, {
                    expires: Number(import.meta.env.VITE_COOKIE_EXPIRES),
                    path: '',
                });
                Cookies.set(import.meta.env.VITE_USER_ROLE, user.role, {
                    expires: Number(import.meta.env.VITE_COOKIE_EXPIRES),
                    path: '',
                });

                if (user.role === 'user') navigate('/profile');
                else if (user.role === 'admin') navigate('/dashboard');
            } else {
                setAlertBoxOpenStatus(true);
                setAlertSeverity('error');
                setAlertMessage(response.data.message || 'Google login failed');
            }
        } catch (error) {
            setAlertBoxOpenStatus(true);
            setAlertSeverity('error');
            const msg = error?.response?.data?.message || error?.message || 'Google login failed';
            setAlertMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    const login = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => {
            setAlertBoxOpenStatus(true);
            setAlertSeverity('error');
            setAlertMessage('Google sign-in was cancelled or failed. Please try again.');
        },
        flow: 'implicit',  // returns { access_token } — sent to backend via /auth/google
        prompt: 'select_account', // always show the account chooser
    });

    return (
        <Button
            type="button"
            variant="contained"
            fullWidth
            startIcon={loading ? null : <GoogleIcon />}
            onClick={() => login()}
            disabled={loading}
            sx={{
                background: loading ? 'rgba(255,255,255,0.08)' : 'white',
                color: '#444',
                fontWeight: 600,
                fontSize: '14px',
                py: 1.4,
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                    background: '#f5f5f5',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    transform: 'translateY(-1px)',
                },
                '&:disabled': {
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.3)',
                },
                transition: 'all 0.2s ease',
            }}
        >
            {loading
                ? <CircularProgress size={20} sx={{ color: '#59e3a7' }} />
                : 'Continue with Google'
            }
        </Button>
    );
};

export default GoogleLoginButton;
