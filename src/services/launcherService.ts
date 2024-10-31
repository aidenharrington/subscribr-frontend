import axios from 'axios';

// REST API URL constants
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const CREATE_USER_API = `${API_BASE_URL}/users/create`;
const GET_USER_API = (userId: string) => `${API_BASE_URL}/users/${userId}`;

export const createUser = async (username: string) => {
    const createUserRequestBody = { username };
    const response = await axios.post(CREATE_USER_API, createUserRequestBody);
    return response.data;
};

export const loginUser = async (userId: string) => {
    const response = await axios.get(GET_USER_API(userId));
    return response.data;
};
