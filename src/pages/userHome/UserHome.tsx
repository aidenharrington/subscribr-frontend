import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../ui/Theme';
import {
  getUserById,
  getSubscriptionsById,
  getAllUsers,
  postVideo,
  subscribeToUser,
  unsubscribeToUser,
  subscribeToWebhookEvents,
} from '../../services/userService';
import { User } from '../../types/User';

const UserHome: React.FC = () => {
  const { userIdParam } = useParams<{ userIdParam: string }>();
  const [userId, setUserId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<User[]>([]);
  const [otherUsers, setOtherUsers] = useState<User[]>([]);
  const [videoName, setVideoName] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'success' | 'error'>('success');
  const navigate = useNavigate();

  // Ensure userId is present in path parameters
  useEffect(() => {
    if (!userIdParam) {
      navigate('/error');
    } else {
      setUserId(userIdParam);
    }
  }, [userIdParam, navigate]);

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getUserById(userId);
      setUsername(user.username);
    } catch (error) {
      console.error('Error fetching user data: ', error);
    }
  }, [userId]);

  const fetchUserSubscriptions = useCallback(async () => {
    try {
      const userSubscriptions = await getSubscriptionsById(userId);
      setSubscriptions(userSubscriptions);
    } catch (error) {
      console.error('Error fetching user subscriptions: ', error);
    }
  }, [userId]);

  const fetchOtherUsers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      setOtherUsers(users);
    } catch (error) {
      console.error('Error fetching other users: ', error);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchUserSubscriptions();
    fetchOtherUsers();
  }, [fetchUserData, fetchUserSubscriptions, fetchOtherUsers]);

  useEffect(() => {
    const eventSource = subscribeToWebhookEvents(userId);

    eventSource.addEventListener('video-upload-complete', (event) => {
      const data = JSON.parse(event.data);
      const notificationMessageText = `Your video: ${data.name} has finished uploading.`;
      setNotificationMessage(notificationMessageText);
      setSeverity('success');
      setSnackbarOpen(true);
    });

    eventSource.addEventListener('new-subscribed-video-uploaded', (event) => {
      const data = JSON.parse(event.data);
      const notificationMessageText = `New video: ${data.name} uploaded by ${data.uploaderUsername}`;
      setNotificationMessage(notificationMessageText);
      setSeverity('success');
      setSnackbarOpen(true);
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
      videoUploaderId: userId,
    };

    try {
      await postVideo(userId, postVideoRequestBody);
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

  const handleSubscribe = async (subscriptionToId: string) => {
    try {
      await subscribeToUser(userId, subscriptionToId);
      const userToSubscribe = otherUsers?.find((user) => user.id === subscriptionToId);
      if (userToSubscribe) {
        setSubscriptions((prev) => [...(prev ?? []), userToSubscribe]);
      }
    } catch (error) {
      console.error('Error subscribing to user: ', error);
    }
  };

  const handleUnsubscribe = async (subscriptionToId: string) => {
    try {
      await unsubscribeToUser(userId, subscriptionToId);
      setSubscriptions((prev) => prev.filter((user) => user.id !== subscriptionToId));
    } catch (error) {
      console.error('Error unsubscribing from user: ', error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
    setNotificationMessage(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Typography variant="h4" sx={{ color: theme.palette.primary.main, margin: '16px 0' }}>
        Subscribr
      </Typography>
      <Container maxWidth="md" style={{ marginTop: '40px' }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Welcome, {username}!
        </Typography>

        <Snackbar open={snackbarOpen} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity={severity}>
            {notificationMessage}
          </Alert>
        </Snackbar>

        <Divider sx={{ my: 4 }} />

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

        <Typography variant="h5" color="secondary" gutterBottom>
          Your Subscriptions
        </Typography>
        <List>
          {subscriptions.length > 0 ? (
            subscriptions.map((sub) => (
              <ListItem key={sub.id}>
                <ListItemText primary={sub.username} />
                <Button variant="outlined" color="primary" onClick={() => handleUnsubscribe(sub.id)}>
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

        <Typography variant="h5" color="secondary" gutterBottom>
          Subscribe to New Channel
        </Typography>
        <List>
          {otherUsers.length > 0 ? (
            otherUsers
              .filter((user) => String(user.id) !== String(userId) && !subscriptions.some((sub) => String(sub.id) === String(user.id)))
              .map((user) => (
                <ListItem key={user.id}>
                  <ListItemText primary={user.username} />
                  <Button variant="contained" color="primary" onClick={() => handleSubscribe(user.id)}>
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
