// Auth.js
import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { TextField, Button, Box, Typography } from '@mui/material';

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Sign In</Typography>
      <TextField label="Email" type="email" onChange={(e) => setEmail(e.target.value)} fullWidth />
      <TextField label="Password" type="password" onChange={(e) => setPassword(e.target.value)} fullWidth />
      <Button onClick={handleSignIn}>Sign In</Button>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}

export function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h6">Sign Up</Typography>
      <TextField label="Email" type="email" onChange={(e) => setEmail(e.target.value)} fullWidth />
      <TextField label="Password" type="password" onChange={(e) => setPassword(e.target.value)} fullWidth />
      <Button onClick={handleSignUp}>Sign Up</Button>
      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
}

export function Logout() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err.message);
    }
  };

  return <Button onClick={handleLogout}>Logout</Button>;
}