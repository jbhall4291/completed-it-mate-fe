//api.ts
import axiosInstance from './axiosInstance';
import axios, { CanceledError, AxiosError } from "axios";

export type User = {
  _id: string;
  username: string;
  email: string;
  gameCount: number;
};

export type Game = {
  _id: string;
  title: string;
  platform: string;
  imageUrl: string;
};

export type LibraryItem = {
  _id: string;          // userGameId
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  gameId: {
    _id: string;
    title: string;
    platform: string;
    releaseDate?: string;
    avgCompletionTime?: number;
  };
};

export type LibraryStatus = 'owned' | 'playing' | 'completed' | 'backlog' | 'wishlist';

export type UserGameCreated = {
  _id: string;
  userId: string;
  gameId: string;            // note: POST response is usually NOT populated
  status: LibraryStatus;
  createdAt: string;
  updatedAt: string;
};

export class DuplicateResourceError extends Error {
  readonly status = 409 as const;
  constructor(msg = "Game already in library") {
    super(msg);
    this.name = "DuplicateResourceError";
  }
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
  status: "owned" | "playing" | "completed" | "backlog" | "wishlist" = "owned"
) {
  try {
    const { data } = await axiosInstance.post("/library", { userId, gameId, status });
    return data;
  } catch (err: unknown) {
    // swallow cancels if you ever pass AbortSignal here
    if (err instanceof CanceledError) throw err;

    if (axios.isAxiosError(err) && err.response?.status === 409) {
      throw new DuplicateResourceError();
    }
    throw err as AxiosError;
  }
}


export async function deleteGame(userGameId: string,): Promise<void> {
  await axiosInstance.delete(`/library/${userGameId}`, {
    // data: { gameId },
  });
}


export async function getAllGames(): Promise<Game[]> {
  const res = await axiosInstance.get(`/games/`);
  return res.data;
}

export async function searchGames(titleQuery: string, signal?: AbortSignal): Promise<Game[]> {
  try {
    const { data } = await axiosInstance.get<Game[]>("/games", {
      params: { titleQuery },
      signal,
    });
    return data;
  } catch (err: unknown) {
    // axios v1 cancellation when using AbortController
    if (err instanceof CanceledError || (axios.isCancel && axios.isCancel(err))) {
      return []; // canceled: return empty to keep UI simple
    }
    throw err as AxiosError;
  }
}



export async function deleteAllGamesFromTestUser(): Promise<void> {
  const res = await axiosInstance.delete(`/test/reset-library`);
  return res.data;
}