import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../ui/theme';

const UserHome: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [username, setUsername] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<User[]>([]);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [videoName, setVideoName] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  // REST API URL constants
  const GET_USER_BY_ID_API = (userId) => `http://localhost:8080/users/${userId}`;
  const GET_ALL_USERS_API = "http://localhost:8080/users";
  const POST_VIDEO_API = (userId) => `http://localhost:8080/users/${userId}/post-video`;
  const SUBSCRIBE_TO_USER = (userId, subscriptionToId) => `http://localhost:8080/users/${userId}/subscribe/${subscriptionToId}`;
  const UNSUBSCRIBE_TO_USER = (userId, subscriptionToId) => `http://localhost:8080/users/${userId}/unsubscribe/${subscriptionToId}`;
  const SUBSCRIBE_TO_WEBHOOK_EVENTS = (userId) => `http://localhost:8080/subscribe/${userId}`;

  const getUserData = useCallback(async () => {
    try {
      const response = await axios.get(GET_USER_BY_ID_API(userId));
      setUsername(response.data.username);
      setSubscriptions(response.data.subscriptions);
    } catch (error) {
      console.error('Error fetching user data: ', error);
    }
  }, [userId]);

  const getOtherUsers = useCallback(async () => {
    try {
      const response = await axios.get(GET_ALL_USERS_API);
      setOtherUsers(response.data);
    } catch (error) {
      console.error('Error fetching other users');
    }
  }, []);

  // Load user data
  useEffect(() => {
    getUserData();
  }, [getUserData]);

  // Load other users
  useEffect(() => {
    getOtherUsers();
  }, [getOtherUsers]);

  // Subscribe to Webhook Emitter events
  useEffect(() => {
    const eventSource = new EventSource(SUBSCRIBE_TO_WEBHOOK_EVENTS(userId));
    eventSource.addEventListener('video-upload-complete', (event) => {
        const data = event.data;
        console.log('Received video-upload-complete webhook event:', data);
        const notificationMessageText = `Video upload complete: ${data}`
        setSnackbarOpen(false);
        setNotificationMessage(notificationMessageText);
        setSeverity('success');
        setSnackbarOpen(true);
    });

    eventSource.addEventListener('new-subscribed-video-uploaded', (event) => {
        const data = event.data;
        console.log('Received new-subscribed-video-uploaded webhook event:', data);
        const notificationMessageText = `New video uploaded by subscribed channel: ${data}`
        setSnackbarOpen(false);
        setNotificationMessage(notificationMessageText);
        setSeverity('success');

    });

    return () => {
        eventSource.close();
    };

}, [userId]);


  const handleVideoPost = async () => {
    if (!videoName) {
      alert('Please provide a video name.');
      return;
    }

    const postVideoRequestBody = {
      name: videoName,
    };

    try {
      await axios.post(POST_VIDEO_API(userId), postVideoRequestBody);
      setVideoName('');
      setNotificationMessage('Video upload has started.');
      setSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error uploading video: ', error);
      setNotificationMessage('Error uploading video.');
      setSeverity('error');
    }
  };

  const subscribeToUser = async (subscriptionToId) => {
    try {
      await axios.post(SUBSCRIBE_TO_USER(userId, subscriptionToId));
      const userToSubscribe = otherUsers.find((user) => user.id === subscriptionToId);
      if (userToSubscribe) {
        setSubscriptions((prev) => [...prev, userToSubscribe]);
      }
    } catch (error) {
      console.error('Error subscribing to user: ', error);
    }
  };

  const unsubscribeToUser = async (subscriptionToId) => {
    try {
      await axios.post(UNSUBSCRIBE_TO_USER(userId, subscriptionToId));
      setSubscriptions((prev) => prev.filter((user) => user.id !== subscriptionToId));
    } catch (error) {
      console.error('Error unsubscribing to user: ', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setNotificationMessage(null);
  };

  return (
    <ThemeProvider theme={theme}>
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
      <Container maxWidth="md" style={{ marginTop: '40px' }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Welcome, {username}!
        </Typography>

        {/* Notification Banner */}
        <Snackbar open={snackbarOpen} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={severity}>
            {notificationMessage}
          </Alert>
        </Snackbar>

        <Divider sx={{ my: 4 }} />

        {/* Upload a Video Section */}
        <Typography variant="h5" color="secondary" gutterBottom>
          Upload a Video
        </Typography>
        <TextField
          fullWidth
          label="Enter video name"
          variant="outlined"
          value={videoName}
          onChange={(e) => setVideoName(e.target.value)}
          margin="normal"
        />
        <Button variant="contained" color="primary" onClick={handleVideoPost}>
          Upload Video
        </Button>

        <Divider sx={{ my: 4 }} />

        {/* User Subscriptions Section */}
        <Typography variant="h5" color="secondary" gutterBottom>
          Your Subscriptions
        </Typography>
        <List>
          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <ListItem key={sub.id}>
                <ListItemText primary={sub.username} />
                <Button variant="outlined" color="primary" onClick={() => unsubscribeToUser(sub.id)}>
                  Unsubscribe
                </Button>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No subscriptions found." />
            </ListItem>
          )}
        </List>

        <Divider sx={{ my: 4 }} />

        {/* Subscribe to New Channel Section */}
        <Typography variant="h5" color="secondary" gutterBottom>
          Subscribe to New Channel
        </Typography>
        <List>
          {otherUsers.length > 0 ? (
            otherUsers
              .filter(
                (user) =>
                  String(user.id) !== String(userId) &&
                  !subscriptions.some((sub) => String(sub.id) === String(user.id))
              )
              .map((user) => (
                <ListItem key={user.id}>
                  <ListItemText primary={user.username} />
                  <Button variant="outlined" color="primary" onClick={() => subscribeToUser(user.id)}>
                    Subscribe
                  </Button>
                </ListItem>
              ))
          ) : (
            <ListItem>
              <ListItemText primary="No users found." />
            </ListItem>
          )}
        </List>
      </Container>
    </ThemeProvider>
  );
};

export default UserHome;
