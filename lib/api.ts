//api.ts
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api'; // adjust if your backend is on a different port

export type User = {
  _id: string;
  username: string;
  gamesOwned: Game[];
  email: string;
};

export type Game = {
  _id: string;
  title: string;
  platform: string;
};

export async function getUsers(): Promise<User[]> {
  const res = await axios.get(`${API_BASE}/users`);
  return res.data;
}

export async function getUser(userId: string): Promise<User> {
  const res = await axios.get(`${API_BASE}/users/${userId}`);
  return res.data;
}


export async function getUserGames(userId: string): Promise<Game[]> {
  const res = await axios.get(`${API_BASE}/users/${userId}/games`);
  return res.data;
}

export async function addGame(userId: string, gameId: string): Promise<void> {
  await axios.post(`${API_BASE}/users/${userId}/games`,
    { gameId });
}



export async function deleteGame(userId: string, gameId: string): Promise<void> {
  await axios.delete(`${API_BASE}/users/${userId}/games`, {
    data: { gameId },
  });
}


export async function getAllGames(): Promise<Game[]> {
  const res = await axios.get(`${API_BASE}/games/`);
  return res.data;
}