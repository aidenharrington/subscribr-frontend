import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserHome: React.FC = () => {
    const { userId } = useParams<{ userId: string }>(); // Get userId from URL
    const [username, setUsername] = useState<string>('');
    const [subscriptions, setSubscriptions] = useState<User[]>([]);
    const [videoName, setVideoName] = useState<string>('');

    // REST API URL constants
    const GET_USER_API = (userId) => `http://localhost:8080/users/${userId}`;
    const POST_VIDEO_API = (userId) => `http://localhost:8080/users/${userId}/post-video`;

    
    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await axios.get(GET_USER_API(userId))
                setUsername(response.data.username);
                setSubscriptions(response.data.subscriptions);
            } catch (error) {
                console.error('Error fetching user data: ', error);
            }
        };

        getUserData();
    }, [userId]);

    const handleVideoPost =async () => {
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


    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Welcome, {username}!</h1>

            <h2>Your Subscriptions</h2>
            <ul>
                {subscriptions.length > 0 ? (
                    subscriptions.map((sub) => <li key={sub.id}>{sub.username}</li>)
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
        </div>
    );
};

export default UserHome;