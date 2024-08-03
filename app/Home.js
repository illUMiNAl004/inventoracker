'use client';
import { useState, useEffect } from 'react';
import { firestore, auth } from '../firebase';
import { Modal, Box, Typography, Stack, TextField, Button } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleIcon from '@mui/icons-material/Google';


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
      // The signed-in user info.
      const user = result.user;
      console.log('User signed in:', user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert(`Error: ${error.message}`); // Display error message to user
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
              border="0px solid #000000"
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
  <Box width="800px" bgcolor="#fff" display="flex" flexDirection="column" borderRadius={2}>
    {/* Sticky Headers */}
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
      height='500px' 
      spacing={1} 
      overflow="auto" 
      bgcolor="white" 
      borderRadius={2}
      border="0px solid #333"
    >
      {inventory.map(({ name, quantity }) => (
        <Box
          key={name}
          width="100%"
          minHeight="150px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          bgcolor="#fff"
          padding={4}
          border="0px solid #333"
          borderRadius={2}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.1s ease-in-out',
            '&:hover': {
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 0,
              height: 0,
              background: 'rgba(0, 255, 255, 0.2)',
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
          <Typography variant='h4' color='#000' fontFamily="Avenir, sans-serif" sx={{ textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </Typography>
          <Box display="flex" alignItems="center" gap={4}>
            <Typography variant='h4' color='#000' fontFamily="Avenir, sans-serif" sx={{ textTransform: 'uppercase', position: 'relative', zIndex: 1 }}>
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
                    backgroundColor: "#333"
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
                    backgroundColor: "#333"
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
              marginRight="275px"
              sx={{ 
                fontFamily: "Avenir, sans-serif", 
                backgroundColor: "black",
                color: "white",
                '&:hover': {
                  backgroundColor: "#fff",
                  color: "black"
                }
              }}
            >
              Sign Out
            </Button>
            <Button 
              variant="contained" 
              onClick={handleOpen} 
              marginLeft="275px"
              sx={{ 
                fontFamily: "Avenir, sans-serif", 
                backgroundColor: "black",
                color: "white",
                '&:hover': {
                  backgroundColor: "#fff",
                  color: "black"
                }
              }}
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
            <Button
            variant="contained"
              onClick={handleGoogleSignIn}
              startIcon={<GoogleIcon />}
              sx={{
                width: '300px',
                fontFamily: 'Montserrat, sans-serif',
                marginTop: '10px',
                backgroundColor: 'black',
                color: '#fff',
                textTransform: 'none',
                boxShadow: '0 2px 4px 0 rgba(0,0,0,.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#fff',
                  color: 'black',
                  boxShadow: '0 0 3px 3px rgba(66,133,244,.3)',
                },
                '& .MuiSvgIcon-root': {
                  background: 'conic-gradient(from -45deg, #ea4335 110deg, #4285f4 90deg 180deg, #34a853 180deg 270deg, #fbbc05 270deg) 73% 55%/150% 150% no-repeat',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textFillColor: 'transparent',
                },
              }}
            >
              Continue with Google
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}