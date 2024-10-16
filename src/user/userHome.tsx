import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserHome: React.FC = () => {
    const { userId } = useParams<{ userId: string }>(); // Get userId from URL
    const [username, setUsername] = useState<string>('');
    const [subscriptions, setSubscriptions] = useState<User[]>([]);
    const [otherUsers, setOtherUsers] = useState<User[]>([]);
    const [videoName, setVideoName] = useState<string>('');
    const [videoUploadCompleteWebhookData, setVideoUploadCompleteWebhookData] = useState<string | null>(null);
    const [newSubscriberVideoWebhookData, setNewSubscriberVideoWebhookData] = useState<string | null>(null);

    // REST API URL constants
    const GET_USER_BY_ID_API = (userId) => `http://localhost:8080/users/${userId}`;
    const GET_ALL_USERS_API = "http://localhost:8080/users";
    const SUBSCRIBE_TO_WEBHOOK_EVENTS = (userId) => `http://localhost:8080/subscribe/${userId}`;
    const POST_VIDEO_API = (userId) => `http://localhost:8080/users/${userId}/post-video`;
    const SUBSCRIBE_TO_USER = (userId, subscriptionToId) => `http://localhost:8080/users/${userId}/subscribe/${subscriptionToId}`
    const UNSUBSCRIBE_TO_USER = (userId, subscriptionToId) => `http://localhost:8080/users/${userId}/unsubscribe/${subscriptionToId}`

    const getUserData = useCallback(async () => {
        try {
            const response = await axios.get(GET_USER_BY_ID_API(userId))
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
            setVideoUploadCompleteWebhookData(data);

            // Clear notifications after 5 seconds
            setTimeout(() => {
                setVideoUploadCompleteWebhookData(null);
            }, 5000);
        });

        eventSource.addEventListener('new-subscribed-video-uploaded', (event) => {
            const data = event.data;
            console.log('Received new-subscribed-video-uploaded webhook event:', data);
            setNewSubscriberVideoWebhookData(data);

            // Clear notifications after 5 seconds
            setTimeout(() => {
                setVideoUploadCompleteWebhookData(null);
            }, 5000);
        });

        return () => {
            eventSource.close();
        };

    }, [userId]);

    const handleVideoPost =async () => {
        console.log("test")
        if (!videoName) {
            alert('Please provide a video name.');
            return;
        }

        const postVideoRequestBody = {
            name: videoName
          };

        try {
            await axios.post(POST_VIDEO_API(userId), postVideoRequestBody);
            setVideoName('');
        } catch (error) {
            console.error('Error uploading video: ', error);
            alert('Failed to upload video.');
        }
    };

    const subscribeToUser = async (subscriptionToId) => {
        try {
            await axios.post(SUBSCRIBE_TO_USER(userId, subscriptionToId))

            // Find the user to subscribe to
            const userToSubscribe = otherUsers.find(user => user.id === subscriptionToId);


            // Update subscriptions
            if (userToSubscribe) {
                setSubscriptions((prev) => [...prev, userToSubscribe]);
            }

            
        } catch (error) {
            console.error('Error subscribing to user: ', error);
        }
        
    };

    const unsubscribeToUser = async (subscriptionToId) => {
        try {
            await axios.post(UNSUBSCRIBE_TO_USER(userId, subscriptionToId))

            // Update subscriptions
            setSubscriptions((prev) => prev.filter(user => user.id !== subscriptionToId));

            
        } catch (error) {
            console.error('Error unsubscribing to user: ', error);
        }
        
    };


    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Welcome, {username}!</h1>

            {/* Conditionally display the notification banner */}
            {videoUploadCompleteWebhookData && (
                <div style={notificationBannerStyle}>
                    <p>{videoUploadCompleteWebhookData}</p>
                </div>
            )}

            <h2>Your Subscriptions</h2>
            <ul>
                {subscriptions.length > 0 ? (
                    subscriptions
                        .map(sub => 
                            <li key={sub.id}>
                                {sub.username}
                                <button onClick={() => unsubscribeToUser(sub.id)}>Unsubscribe</button>
                            </li>
                        )
                ) : (
                    <li>No subscriptions found.</li>
                )}
            </ul>


            <hr />

            <h2>Upload a Video</h2>
            <input
                type="text"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="Enter video name"
                style={{ marginRight: '10px', padding: '5px', width: '70%' }}
            />
            <button onClick={handleVideoPost} style={{ padding: '5px' }}>
                Upload Video
            </button>

            <hr />

            <h2>Subscribe to New Channel</h2>
            <ul>
                {otherUsers.length > 0 ? (
                    otherUsers
                        .filter(user => 
                            String(user.id) !== String(userId) &&
                            !subscriptions.some(sub => String(sub.id) === String(user.id))
                        )
                        .map(user => 
                            <li key={user.id}>
                                {user.username}
                                <button onClick={() => subscribeToUser(user.id)}>Subscribe</button>
                            </li>
                        )
                ) : (
                    <li>No users found.</li>
                )}
            </ul>


        </div>


    );
};

// Styles for the notification banner with correct types
const notificationBannerStyle: React.CSSProperties = {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    margin: '10px 0',
    border: '1px solid #f5c6cb',
    borderRadius: '5px',
    fontWeight: 'bold',
    textAlign: 'center' as 'center', // 'center' must match one of the allowed values
};

export default UserHome;