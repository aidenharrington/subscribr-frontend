import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Divider, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../ui/theme';

const LauncherHome: React.FC = () => {
    const [nameInput, setName] = useState<string>('');
    const [userIdInput,  setUserIdInput] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [openError, setOpenError] = useState<boolean>(false);
  
    // REST API URL constants
    const CREATE_USER_API = 'http://localhost:8080/users/create';
    const GET_USER_API = (userId) => `http://localhost:8080/users/${userId}`;
  
    const handleError = (message: string) => {
      setErrorMessage(message);
      setOpenError(true);
    };

    const handleCloseError = () => {
      setOpenError(false);
    };

    // Function to handle creating a new user
    const createUser = async () => {
      if (!nameInput) {
        handleError('Please enter a name.');
        return;
      }

      const createUserRequestBody = {
        username: nameInput
      };

      try {
        const response = await axios.post(CREATE_USER_API, createUserRequestBody);
        console.log('User created:', response.data);

        const userId = response.data.id;

        setName('');



        // Open a new tab showing uers home
        window.open(`/users/${userId}`, '_blank');

      } catch (error) {
        if (error.response.status === 409) {
          console.error('Duplicate username');
          handleError('Duplicate username, please choose another.');
        } else {
          console.error('Error creating user:', error);
          handleError('Failed to create user.');
        }
      }
    };
  
    // Function to handle logging in a user
    const loginUser = async () => {
      if (!userIdInput) {
        handleError('Please enter a user ID.');
        return;
      }
      try {
        const response = await axios.get(GET_USER_API(userIdInput));
        console.log('User logged in:', response.data);

        const userId = response.data.id;

        setUserIdInput('');

        // Open a new tab showing uers home
        window.open(`/users/${userId}`, '_blank');

      } catch (error) {
        console.error('Error logging in user:', error);
        handleError('Failed to log in.');
      }
    };
  
    return (
      <ThemeProvider theme={theme}>
        {/* Application Name */}
        <Typography
          variant="h4"
          sx={{
            color: theme.palette.primary.main,
            margin: '16px 0', // Add some margin for spacing
            marginLeft: '16px', // Align it to the left
          }}
        >
          Subscribr
        </Typography>

        <Divider variant="middle" />


        <Container maxWidth="sm" style={{ marginTop: '40px' }}>
    
          {/* Login Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" color="secondary" gutterBottom>
              User Login
            </Typography>
            <TextField
              fullWidth
              label="Enter user ID"
              variant="outlined"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={loginUser}
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </Box>
    
          <Divider variant="middle" />
    
          {/* Create New User Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" color="secondary" gutterBottom>
              Create a New User
            </Typography>
            <TextField
              fullWidth
              label="Enter user name"
              variant="outlined"
              value={nameInput}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={createUser}
              sx={{ mt: 2 }}
            >
              Create User
            </Button>
          </Box>
        </Container>

        {/* Snackbar for Error Alerts */}
        <Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>


      </ThemeProvider>
    );    
  };
  
  export default LauncherHome;