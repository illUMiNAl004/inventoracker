'use client';
import { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase';
import { Modal, Box, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';
import bgImage from './bgimage.jpg';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in:', user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert(`Error: ${error.message}`);
    }
  };

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
      alert(`Error: ${error.message}`);
    }
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Account created successfully!');
    } catch (error) {
      console.error("Error creating account:", error);
      alert(`Error: ${error.message}`);
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
    <Box 
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      sx={{
        backgroundImage: `url(${bgImage.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        padding: 2,
      }}
    >
      {user ? (
        <>
          
          
          <Modal open={open} onClose={handleClose}>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              width="90vw"
              maxWidth={400}
              bgcolor="white"
              border="0px solid #000000"
              borderRadius={2}
              boxShadow={24}
              p={2}
              display="flex"
              flexDirection="column"
              gap={2}
              sx={{
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  fontFamily: 'Montserrat, sans-serif', 
                  fontWeight: 700,
                  textAlign: 'center'
                }}
              >
                ADD NEW ITEM
              </Typography>
              <Stack width="100%" direction="row" spacing={1} alignItems="center">
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
                  sx={{ fontFamily: 'Avenir, sans-serif', fontSize: '1.5rem' }}
                >
                  +
                </Button>
              </Stack>
            </Box>
          </Modal>
          
          <Box 
            width="90vw" 
            maxWidth="800px" 
            bgcolor="#fff" 
            borderRadius={2}
            overflow="hidden"
            mt={2}
          >
            <Box
              width="100%"
              bgcolor="#fff"
              display="flex"
              justifyContent="space-between"
              padding={2}
              borderBottom="1px solid #ddd"
              sx={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 1 }}
            >
              <Typography variant="h6" color='#333' sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: '300' }}>NAME</Typography>
              <Typography variant="h6" color='#333' sx={{ fontFamily: "Montserrat, sans-serif", fontWeight: '300' }}>AMOUNT</Typography>
            </Box>

            <Stack 
              width='100%' 
              height='50vh' 
              spacing={1} 
              overflow="auto" 
              bgcolor="white"
            >
              {inventory.map(({ name, quantity }) => (
                <Box
                  key={name}
                  width="100%"
                  minHeight="100px"
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  bgcolor="#fff"
                  padding={2}
                  border="0px solid #333"
                  borderRadius={2}
                  sx={{
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.1s ease-in-out',
                    fontSize: '0.875rem',
                    '&:hover': {
                      boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      fontSize: '1rem',
                      top: '50%',
                      left: '50%',
                      width: 0,
                      height: 0,
                      background: 'rgba(0, 255, 127, 0.2)',
                      borderRadius: '150%',
                      transform: 'translate(-50%, -50%)',
                      transition: 'width 0.1s ease-out, height 0.1s ease-out',
                      pointerEvents: 'none',
                      zIndex: 0,
                    },
                    '&:hover::after': {
                      width: '300%',
                      height: '300%',
                    }
                  }}
                >
                  <Typography variant='h5' color='#000' fontFamily="Avenir, sans-serif" sx={{ textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant='h5' color='#000' fontFamily="Avenir, sans-serif" sx={{ textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
                      {quantity}
                    </Typography>
                    <Stack direction="column" spacing={1} sx={{ position: 'relative', zIndex: 1 }}>
                      <Button 
                        variant="contained" 
                        onClick={() => addItem(name)} 
                        sx={{ 
                          fontFamily: "Avenir, sans-serif", 
                          backgroundColor: "black",
                          color: "white",
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '50%',
                          padding: 0,
                          fontSize: '24px',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: "#fff",
                            color: "black"
                          }
                        }}
                      >
                        +
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={() => removeItem(name)} 
                        sx={{ 
                          fontFamily: "Avenir, sans-serif", 
                          backgroundColor: "black",
                          color: "white",
                          width: '40px',
                          height: '40px',
                          minWidth: '40px',
                          borderRadius: '50%',
                          padding: 0,
                          fontSize: '24px',
                          fontWeight: 'bold',
                          '&:hover': {
                            backgroundColor: "#fff",
                            color: "black"
                          }
                        }}
                      >
                        -
                      </Button>
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
          >
            <Button 
              variant="contained" 
              onClick={handleSignOut} 
              sx={{ 
                marginTop: '10px',
                backgroundColor: 'black', 
                color: 'white', 
                fontFamily: 'Avenir, sans-serif',
                '&:hover': {
                  backgroundColor: '#333',
                }
              }}
            >
              Sign Out
            </Button>
            <Button 
              variant="contained" 
              onClick={handleOpen} 
              sx={{ 
                marginTop: '10px',
                backgroundColor: 'black', 
                color: 'white', 
                fontFamily: 'Avenir, sans-serif',
                '&:hover': {
                  backgroundColor: '#333',
                }
              }}
            >
              Add New Item
            </Button>
          </Box>
          
        </>
      ) : (
        <Stack spacing={2} width="90vw" maxWidth="400px" padding={5} bgcolor="#fff" borderRadius={2} boxShadow={3} >
          <Typography variant="h3" component="h1" align="center" fontFamily="Montserrat, sans-serif" fontWeight="bold" fontSize={{ xs: '1rem', sm: '1.5rem', md: '2rem' }}>INVENTORACKER</Typography>
          <TextField 
            label="Email" 
            type="email" 
            variant="outlined" 
            fullWidth 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField 
            label="Password" 
            type="password" 
            variant="outlined" 
            fullWidth 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
          />
          <Box mt={4} mb={4}></Box>
          <Stack spacing={2}>
            <Button 
              variant="outlined" 
              onClick={handleSignIn} 
              sx={{ 
                fontFamily: 'Avenir, sans-serif',
                backgroundColor: 'white',
                color: 'black',
                borderColor: '#000',
                border: '2px solid #000',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#000',
                  color: 'white',
                  borderColor: '#000',
                  border: '2px solid #000',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                },
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleSignUp} 
              sx={{ 
                fontFamily: 'Avenir, sans-serif',
                backgroundColor: 'white',
                color: 'black',
                borderColor: '#000',
                border: '2px solid #000',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#000',
                  color: 'white',
                  borderColor: '#000',
                  border: '2px solid #000',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                },
              }}
            >
              Sign Up
            </Button>
          </Stack>
          <Button 
            variant="contained" 
            startIcon={<GoogleIcon />} 
            onClick={handleGoogleSignIn}
            sx={{ 
              fontFamily: 'montserrat, sans-serif',
              backgroundColor: 'black',
              color: 'white',
              '&:hover': {
                backgroundColor: '#333'
              },
              '& .MuiSvgIcon-root': {
                color: 'inherit'
              }
            }}
          >
            Sign In with Google
          </Button>
        </Stack>
      )}
    </Box>
  );
}