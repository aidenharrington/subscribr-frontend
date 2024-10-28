// userService.ts
import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export const getUserById = async (userId: string) => {
  const response = await axios.get(`${BASE_URL}/users/${userId}`);
  return response.data;
};

export const getSubscriptionsById = async (userId: string) => {
  const response = await axios.get(`${BASE_URL}/subscriptions/${userId}`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await axios.get(`${BASE_URL}/users`);
  return response.data;
};

export const postVideo = async (userId: string, videoData: { name: string; videoUploaderId: string }) => {
  await axios.post(`${BASE_URL}/videos/${userId}/post-video`, videoData);
};

export const subscribeToUser = async (userId: string, subscriptionToId: string) => {
  await axios.post(`${BASE_URL}/subscriptions/${userId}/subscribe/${subscriptionToId}`);
};

export const unsubscribeToUser = async (userId: string, subscriptionToId: string) => {
  await axios.post(`${BASE_URL}/subscriptions/${userId}/unsubscribe/${subscriptionToId}`);
};

export const subscribeToWebhookEvents = (userId: string) => {
  return new EventSource(`${BASE_URL}/subscribe-to-events/${userId}`);
};
