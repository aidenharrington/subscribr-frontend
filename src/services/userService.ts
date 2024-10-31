import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const getUserById = async (userId: string) => {
  const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
  return response.data;
};

export const getSubscriptionsById = async (userId: string) => {
  const response = await axios.get(`${API_BASE_URL}/subscriptions/${userId}`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};

export const postVideo = async (userId: string, videoData: { name: string; videoUploaderId: string }) => {
  await axios.post(`${API_BASE_URL}/videos/${userId}/post-video`, videoData);
};

export const subscribeToUser = async (userId: string, subscriptionToId: string) => {
  await axios.post(`${API_BASE_URL}/subscriptions/${userId}/subscribe/${subscriptionToId}`);
};

export const unsubscribeToUser = async (userId: string, subscriptionToId: string) => {
  await axios.post(`${API_BASE_URL}/subscriptions/${userId}/unsubscribe/${subscriptionToId}`);
};

export const subscribeToWebhookEvents = (userId: string) => {
  return new EventSource(`${API_BASE_URL}/subscribe-to-events/${userId}`);
};
