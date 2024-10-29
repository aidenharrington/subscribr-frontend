import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Divider, Snackbar, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../ui/Theme';
import { createUser, loginUser } from '../../services/launcherService';
import { AxiosError } from 'axios';

const LauncherHome: React.FC = () => {
    const [nameInput, setName] = useState<string>('');
    const [userIdInput, setUserIdInput] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [openError, setOpenError] = useState<boolean>(false);

    const handleError = (message: string) => {
        setErrorMessage(message);
        setOpenError(true);
    };

    const handleCloseError = () => {
        setOpenError(false);
    };

    const handleCreateUser = async () => {
        if (!nameInput) {
            handleError('Please enter a name.');
            return;
        }

        try {
            const userData = await createUser(nameInput);
            const userId = userData.id;

            setName('');

            // Open a new tab showing user's home
            window.open(`/users/${userId}`, '_blank');
        } catch (error) {
            const axiosError = error as AxiosError;

            if (axiosError.response?.status === 409) {
                handleError('Duplicate username, please choose another.');
            } else {
                handleError('Failed to create user.');
            }
        }
    };

    const handleLoginUser = async () => {
        if (!userIdInput) {
            handleError('Please enter a user ID.');
            return;
        }
        try {
            const userData = await loginUser(userIdInput);
            const userId = userData.id;

            setUserIdInput('');

            // Open a new tab showing user's home
            window.open(`/users/${userId}`);
        } catch (error) {

            const axiosError = error as AxiosError;

            if (axiosError.response?.status === 400) {
                handleError('Invalid user ID.');
            } else if (axiosError.response?.status === 404) {
                handleError('No account found for provided user ID.');
            } else {
                handleError('Failed to log in.');
            }
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Typography variant="h4" sx={{ color: theme.palette.primary.main, margin: '16px 0' }}>
                Subscribr
            </Typography>
            <Divider variant="middle" />
            <Container maxWidth="sm" style={{ marginTop: '40px' }}>
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
                    <Button fullWidth variant="contained" color="primary" onClick={handleLoginUser} sx={{ mt: 2 }}>
                        Login
                    </Button>
                </Box>
                <Divider variant="middle" />
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
                    <Button fullWidth variant="contained" color="primary" onClick={handleCreateUser} sx={{ mt: 2 }}>
                        Create User
                    </Button>
                </Box>
            </Container>
            <Snackbar open={openError} autoHideDuration={6000} onClose={handleCloseError}>
                <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
};

export default LauncherHome;

