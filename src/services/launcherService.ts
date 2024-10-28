import axios from 'axios';

// REST API URL constants
const CREATE_USER_API = 'http://localhost:8080/users/create';
const GET_USER_API = (userId: string) => `http://localhost:8080/users/${userId}`;

// Function to create a new user
export const createUser = async (username: string) => {
    const createUserRequestBody = { username };
    const response = await axios.post(CREATE_USER_API, createUserRequestBody);
    return response.data;
};

// Function to log in a user
export const loginUser = async (userId: string) => {
    const response = await axios.get(GET_USER_API(userId));
    return response.data;
};