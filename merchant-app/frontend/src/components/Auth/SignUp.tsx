import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import AuthService from '../../services/AuthService';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await AuthService.signUp(email, password, name);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  const textFieldStyles = {
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
    '& .MuiFormHelperText-root': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
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
        Create Account
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
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
        sx={textFieldStyles}
      />

      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        fullWidth
        sx={textFieldStyles}
      />

      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        fullWidth
        helperText="Password must be at least 8 characters long"
        sx={textFieldStyles}
      />

      <TextField
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        fullWidth
        error={password !== confirmPassword && confirmPassword !== ''}
        helperText={
          password !== confirmPassword && confirmPassword !== ''
            ? 'Passwords do not match'
            : ''
        }
        sx={textFieldStyles}
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
        Create Account
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
        Already have an account?{' '}
        <Button
          onClick={() => navigate('/signin')}
          sx={{
            textTransform: 'none',
            color: '#FF4500',
            fontFamily: "'Poppins', sans-serif",
            '&:hover': {
              bgcolor: 'rgba(255, 69, 0, 0.1)',
            },
          }}
        >
          Sign In
        </Button>
      </Typography>
    </Box>
  );
};

export default SignUp;
