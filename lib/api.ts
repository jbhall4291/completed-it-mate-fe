//api.ts
import axiosInstance from './axiosInstance';

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
  const res = await axiosInstance.get(`/users`);
  return res.data;
}

export async function getUser(userId: string): Promise<User> {
  const res = await axiosInstance.get(`/users/${userId}`);
  return res.data;
}


export async function getUserGames(userId: string): Promise<Game[]> {
  const res = await axiosInstance.get(`/users/${userId}/games`);
  return res.data;
}

export async function addGame(userId: string, gameId: string): Promise<void> {
  await axiosInstance.post(`/users/${userId}/games`,
    { gameId });
}



export async function deleteGame(userId: string, gameId: string): Promise<void> {
  await axiosInstance.delete(`/users/${userId}/games`, {
    data: { gameId },
  });
}


export async function getAllGames(): Promise<Game[]> {
  const res = await axiosInstance.get(`/games/`);
  return res.data;
}

export async function deleteAllGamesFromTestUser(): Promise<void> {
  const res = await axiosInstance.delete(`/test/reset-library`);
  return res.data;
}