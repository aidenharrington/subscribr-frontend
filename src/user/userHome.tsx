import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserHome: React.FC = () => {
    const { userId } = useParams<{ userId: string }>(); // Get userId from URL
    const [username, setUsername] = useState<string>('');
    const [subscriptions, setSubscriptions] = useState<User[]>([]);
    const [otherUsers, setOtherUsers] = useState<User[]>([]);
    const [videoName, setVideoName] = useState<string>('');
    const [webhookData, setWebhookData] = useState<string | null>(null);

    // REST API URL constants
    const GET_USER_BY_ID_API = (userId) => `http://localhost:8080/users/${userId}`;
    const GET_ALL_USERS_API = "http://localhost:8080/users";
    const SUBSCRIBE_TO_WEBHOOK_EVENTS = (userId) => `http://localhost:8080/subscribe/${userId}`;
    const POST_VIDEO_API = (userId) => `http://localhost:8080/users/${userId}/post-video`;
    const SUBSCRIBE_TO_USER = (userId, subscriptionToId) => `http://localhost:8080/users/${userId}/subscribe/${subscriptionToId}`

    
    useEffect(() => {
        // Populate user data
        const getUserData = async () => {
            try {
                const response = await axios.get(GET_USER_BY_ID_API(userId))
                setUsername(response.data.username);
                setSubscriptions(response.data.subscriptions);
            } catch (error) {
                console.error('Error fetching user data: ', error);
            }
        };

        getUserData();

        // Populate  other users
        const getOtherUsers = async () => {
            try {
                const response = await axios.get(GET_ALL_USERS_API);
        
                setOtherUsers(response.data);
            } catch (error) {
                console.error('Error fetching other users');
            }
        };

        getOtherUsers();

        // Subscribe to Webhook Emitter events
        const eventSource = new EventSource(SUBSCRIBE_TO_WEBHOOK_EVENTS(userId));
        eventSource.addEventListener('video-upload-complete', (event) => {
            const data = event.data;
            console.log('Received webhook event:', data);
            setWebhookData(data);

            // Clear notifications after 5 seconds
            setTimeout(() => {
                setWebhookData(null);
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

            alert(`Successfully subscribed to user: ${subscriptionToId}`);
        } catch (error) {
            console.error('Error subscribing to user: ', error);
        }
        
    };


    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Welcome, {username}!</h1>

            {/* Conditionally display the notification banner */}
            {webhookData && (
                <div style={notificationBannerStyle}>
                    <p>{webhookData}</p>
                </div>
            )}

            <h2>Your Subscriptions</h2>
            <ul>
                {subscriptions.length > 0 ? (
                    subscriptions
                        .map((sub) => <li key={sub.id}>{sub.username}</li>)
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