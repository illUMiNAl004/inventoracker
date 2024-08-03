'use client';
import { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase';
import { Modal, Box, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        updateInventory();
      }
    });

    return () => unsubscribe();
  }, []);

  const updateInventory = async () => {
    if (user) {
      const snapshot = query(collection(firestore, 'inventories', user.uid, 'items'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        inventoryList.push({ name: doc.id, ...doc.data() });
      });
      setInventory(inventoryList);
    }
  };

  const addItem = async (item) => {
    if (user) {
      const docRef = doc(firestore, 'inventories', user.uid, 'items', item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        await updateDoc(docRef, { quantity: quantity + 1 });
      } else {
        await setDoc(docRef, { quantity: 1 });
      }

      await updateInventory();
    }
  };

  const removeItem = async (item) => {
    if (user) {
      const docRef = doc(firestore, 'inventories', user.uid, 'items', item);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        if (quantity === 1) {
          await deleteDoc(docRef);
        } else {
          await updateDoc(docRef, { quantity: quantity - 1 });
        }
      }

      await updateInventory();
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error signing in:", error);
      alert(`Error: ${error.message}`); // Display error message to user
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Account created successfully!');
    } catch (error) {
      console.error("Error creating account:", error);
      alert(`Error: ${error.message}`); // Display error message to user
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="teal">
      {user ? (
        <>

          <Modal open={open} onClose={handleClose}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width={400}
              bgcolor="white"
              border="5px solid #000000"
              borderRadius={2}
              boxShadow={24}
              p={4}
              display="flex"
              flexDirection="column"
              gap={3}
              sx={{
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Montserrat, sans-serif', 
                  fontWeight: 700,
                  marginBottom: 0,
                  textAlign: 'center'
                }}
              >
                ADD NEW ITEM
              </Typography>
              <Stack width="100%" direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    addItem(itemName);
                    setItemName("");
                    handleClose();
                  }}
                  sx={{ fontFamily: 'Avenir, sans-serif', fontSize: '20px' }}
                >
                  +
                </Button>
              </Stack>
            </Box>
          </Modal>
          
          <Box border="0px solid #333" mt={2} borderRadius={2}>
            <Box width="800px" height="100px" bgcolor="#ADD8E6" display="flex" alignItems="center" justifyContent="center" borderRadius={2} sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: 'bold' }}>
              <Typography variant="h2" color='#333' sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: '300', marginBottom: '10px' }}>INVENTORY ITEMS</Typography>
            </Box>
            <Box mt={2}></Box> 
            <Stack 
              width='800px' 
              height='500px' 
              spacing={1} 
              overflow="auto" 
              bgcolor="transparent" 

            >
              {inventory.map(({ name, quantity }) => (
                <Box
                key={name}
                width="100%"
                minHeight="150px"
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                bgcolor="#ff9f34"
                padding={2}
                border="2px solid #333"
                borderRadius={2}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease-in-out',
                  background: 'linear-gradient(45deg, #ffffff 0%, #ffffff 100%)',
                  '&:hover': {
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    '&::before': {
                      transform: 'scaleX(1)',
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, #ffffff 0%, #000000 100%)',
                    transition: 'transform 0.3s ease-in-out',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    zIndex: 0,
                  }
                }}
              >
                <Typography variant='h3' color='#333' fontFamily="Avenir, sans-serif">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant='h3' color='#333' fontFamily="Avenir, sans-serif">
                  {quantity}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" onClick={() => addItem(name)}>Add</Button>
                  <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
                </Stack>
              </Box>
              ))}
            </Stack>
          </Box>
          <Box 
            display="flex" 
            justifyContent="center" 
            gap={2} 
            marginTop="20px"
          >
            <Button 
              variant="contained" 
              onClick={handleSignOut} 
              sx={{ fontFamily: "Avenir, sans-serif", marginRight: '275px' }}
            >
              Sign Out
            </Button>
            <Button 
              variant="contained" 
              onClick={handleOpen} 
              sx={{ fontFamily: "Avenir, sans-serif", marginLeft: '275px' }}
            >
              Add New Item
            </Button>
            
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          gap={2}
          padding={6}
          bgcolor="WHITE"
          borderRadius={2}
          boxShadow={3}
        >
          <Typography 
            variant="h4" 
            color="textPrimary" 
            sx={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              marginBottom: 2,
            }}
          >
            INVENTORACKER
          </Typography>
          <Typography 
            variant="h5" 
            color="textPrimary" 
            sx={{
              fontFamily: 'Avenir, sans-serif',
              fontWeight: 700,
              marginBottom: -2,
            }}
          >
            LOGIN NOW
          </Typography>
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            sx={{
              marginBottom: '-10px',
              marginTop: '20px',
            }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            sx={{
              marginBottom: '20px',
            }}
          />
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box display="flex" justifyContent="center" gap={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSignIn}
                sx={{
                  width: '150px',
                  fontFamily: 'Avenir, sans-serif',
                }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleSignUp}
                sx={{
                  width: '150px',
                  fontFamily: 'Avenir, sans-serif',
                }}
              >
                Sign Up
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}