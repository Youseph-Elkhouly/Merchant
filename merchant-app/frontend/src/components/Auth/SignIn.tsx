import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import AuthService from '../../services/AuthService';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await AuthService.signIn(email, password);
      navigate('/'); // Redirect to home page after successful sign in
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        mx: 'auto',
        p: 4,
        background: '#1C1C1C',
        color: '#ffffff',
      }}
    >
      <Typography 
        variant="h5" 
        component="h1" 
        gutterBottom
        sx={{ 
          color: '#ffffff',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
          textAlign: 'center',
          mb: 3
        }}
      >
        Welcome Back
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              color: '#ff4444'
            }
          }}
        >
          {error}
        </Alert>
      )}

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            color: '#ffffff',
            '& fieldset': {
              borderColor: 'rgba(255, 69, 0, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 69, 0, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF4500',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#FF4500',
            },
          },
        }}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            color: '#ffffff',
            '& fieldset': {
              borderColor: 'rgba(255, 69, 0, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 69, 0, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#FF4500',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            '&.Mui-focused': {
              color: '#FF4500',
            },
          },
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        sx={{
          mt: 3,
          mb: 2,
          bgcolor: '#FF4500',
          color: '#ffffff',
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          fontSize: '1rem',
          padding: '0.75rem',
          borderRadius: '8px',
          textTransform: 'none',
          boxShadow: '0 2px 8px rgba(255, 69, 0, 0.2)',
          '&:hover': {
            bgcolor: '#ff5722',
            boxShadow: '0 4px 12px rgba(255, 69, 0, 0.3)',
          },
        }}
      >
        Sign In
      </Button>

      <Typography 
        variant="body2" 
        align="center" 
        sx={{ 
          mt: 2,
          color: 'rgba(255, 255, 255, 0.7)',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Don't have an account?{' '}
        <Button
          onClick={() => navigate('/signup')}
          sx={{
            textTransform: 'none',
            color: '#FF4500',
            fontFamily: "'Poppins', sans-serif",
            '&:hover': {
              bgcolor: 'rgba(255, 69, 0, 0.1)',
            },
          }}
        >
          Sign Up
        </Button>
      </Typography>
    </Box>
  );
};

export default SignIn;
