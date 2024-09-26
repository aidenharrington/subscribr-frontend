import React, { useState } from 'react';
import axios from 'axios';

const App: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [userId, setUserId] = useState<string>('');
  
    // REST API URL constants
    const CREATE_USER_API = 'https://localhost:8080/users/create';
    const LOGIN_USER_API = 'https://localhost:8080/users/{id}';
  
    // Function to handle creating a new user
    const createUser = async () => {
      if (!name) {
        alert('Please enter a name.');
        return;
      }
      try {
        const response = await axios.post(CREATE_USER_API, { name });
        console.log('User created:', response.data);
        alert(`User created successfully! User ID: ${response.data.id}`);
      } catch (error) {
        console.error('Error creating user:', error);
        alert('Failed to create user.');
      }
    };
  
    // Function to handle logging in a user
    const loginUser = async () => {
      if (!userId) {
        alert('Please enter a user ID.');
        return;
      }
      try {
        const response = await axios.post(LOGIN_USER_API, { id: userId });
        console.log('User logged in:', response.data);
        alert(`User logged in successfully!`);
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
            value={name}
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
            value={userId}
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
  
  export default App;