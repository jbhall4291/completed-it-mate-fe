// lib/api.ts
import axiosInstance from './axiosInstance';
import axios, { CanceledError, AxiosError } from 'axios';

// 👇 import shared DTOs with a simple relative path
import type {
  GameCardDTO as Game,
  LibraryItemDTO as LibraryItem,
  LibraryStatus,
} from '../types';

// Keep User here (or move later if you want)
export type User = {
  _id: string;
  username: string;
  email: string;
  gameCount: number;
};

// Re-export so the rest of the app can keep `import type { Game, LibraryItem, LibraryStatus } from '@/lib/api'`
export type { Game, LibraryItem, LibraryStatus };

export type UserGameCreated = {
  _id: string;
  userId: string;
  gameId: string;             // POST response not populated
  status: LibraryStatus;
  createdAt: string;
  updatedAt: string;
};

export class DuplicateResourceError extends Error {
  readonly status = 409 as const;
  constructor(msg = 'Game already in library') { super(msg); this.name = 'DuplicateResourceError'; }
}

export async function getUsers(): Promise<User[]> {
  const res = await axiosInstance.get(`/users`);
  return res.data;
}
export async function getUser(userId: string): Promise<User> {
  const res = await axiosInstance.get(`/users/${userId}`);
  return res.data;
}
export async function getUserGames(userId: string): Promise<LibraryItem[]> {
  const res = await axiosInstance.get(`/library?userId=${userId}`);
  return res.data;
}

export async function addGame(
  userId: string,
  gameId: string,
  status: LibraryStatus = 'owned'           // ← don’t narrow to the literal type
) {
  try {
    const { data } = await axiosInstance.post('/library', { userId, gameId, status });
    return data;
  } catch (err: unknown) {
    if (err instanceof CanceledError) throw err;
    if (axios.isAxiosError(err) && err.response?.status === 409) {
      throw new DuplicateResourceError();
    }
    throw err as AxiosError;
  }
}

export async function updateGameStatus(userGameId: string, status: LibraryStatus) {
  const { data } = await axiosInstance.patch(`/library/${userGameId}`, { status });
  return data as { _id: string; status: LibraryStatus };
}

export async function deleteGame(userGameId: string): Promise<void> {
  await axiosInstance.delete(`/library/${userGameId}`);
}

export async function getAllGames(): Promise<Game[]> {
  const res = await axiosInstance.get(`/games/`);
  return res.data;
}

export async function searchGames(titleQuery: string, signal?: AbortSignal): Promise<Game[]> {
  try {
    const { data } = await axiosInstance.get<Game[]>('/games', { params: { titleQuery }, signal });
    return data;
  } catch (err: unknown) {
    if (err instanceof CanceledError || (axios.isCancel && axios.isCancel(err))) return [];
    throw err as AxiosError;
  }
}

export async function deleteAllGamesFromTestUser(): Promise<void> {
  const res = await axiosInstance.delete(`/test/reset-library`);
  return res.data;
}
