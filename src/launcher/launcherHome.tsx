import React, { useState } from 'react';
import axios from 'axios';

const LauncherHome: React.FC = () => {
    const [nameInput, setName] = useState<string>('');
    const [userIdInput, setUserId] = useState<string>('');
  
    // REST API URL constants
    const CREATE_USER_API = 'http://localhost:8080/users/create';
    const GET_USER_API = (userId) => `http://localhost:8080/users/${userId}`;
  
    // Function to handle creating a new user
    const createUser = async () => {
      if (!nameInput) {
        alert('Please enter a name.');
        return;
      }

      const createUserRequestBody = {
        username: nameInput
      };

      try {
        const response = await axios.post(CREATE_USER_API, createUserRequestBody);
        console.log('User created:', response.data);

        const userId = response.data.id;
        alert(`User created successfully! User ID: ${response.data.id}`);

        // Open a new tab showing uers home
        window.open(`/users/${userId}`, '_blank');

      } catch (error) {
        if (error.response.status === 409) {
          console.error('Duplicate username');
          alert('Duplicate username, please choose another.');
        } else {
          console.error('Error creating user:', error);
          alert('Failed to create user.');
        }
      }
    };
  
    // Function to handle logging in a user
    const loginUser = async () => {
      if (!userIdInput) {
        alert('Please enter a user ID.');
        return;
      }
      try {
        const response = await axios.get(GET_USER_API(userIdInput));
        console.log('User logged in:', response.data);

        const userId = response.data.id;

        // Open a new tab showing uers home
        window.open(`/users/${userId}`, '_blank');

      } catch (error) {
        console.error('Error logging in user:', error);
        alert('Failed to log in.');
      }
    };
  
    return (
      <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <h1>User Management</h1>
        {/* Create New User Section */}
        <div>
          <h2>Create a New User</h2>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter user name"
            style={{ marginRight: '10px', padding: '5px', width: '70%' }}
          />
          <button onClick={createUser} style={{ padding: '5px' }}>
            Create User
          </button>
        </div>
        <hr />
        {/* Login Section */}
        <div>
          <h2>Login User</h2>
          <input
            type="text"
            value={userIdInput}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            style={{ marginRight: '10px', padding: '5px', width: '70%' }}
          />
          <button onClick={loginUser} style={{ padding: '5px' }}>
            Login
          </button>
        </div>
      </div>
    );
  };
  
  export default LauncherHome;