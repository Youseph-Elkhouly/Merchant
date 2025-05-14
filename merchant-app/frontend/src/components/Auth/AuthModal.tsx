import React from 'react';
import { Dialog, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SignIn from './SignIn';
import SignUp from './SignUp';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, mode }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: '#1C1C1C',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 69, 0, 0.1)',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: 'rgba(255, 255, 255, 0.5)',
          '&:hover': {
            color: '#ffffff',
            bgcolor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
      
      <DialogContent sx={{ p: 0 }}>
        {mode === 'signin' ? <SignIn /> : <SignUp />}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
