// lib/api.ts
import axiosInstance from './axiosInstance';
import axios, { CanceledError, AxiosError } from 'axios';
import type { GameDetailDTO } from '@/types';
import type { GameCardDTO as Game, LibraryItemDTO as LibraryItem, LibraryStatus } from '../types';

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

export async function fetchGamesPaged(params: { page?: number; pageSize?: number; titleQuery?: string } = {}) {
  const { page = 1, pageSize = 24, titleQuery } = params;
  const r = await axiosInstance.get('/games', { params: { page, pageSize, titleQuery } });
  return r.data as Paged<Game>;
}

// --- helper: get current user id from sessionStorage ---
function currentUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return sessionStorage.getItem('clm_user_id') || undefined;
}

function requireUserId(): string {
  const id = typeof window !== 'undefined' ? sessionStorage.getItem('clm_user_id') || undefined : undefined;
  if (!id) throw new Error('User not initialized yet');
  return id;
}

// Keep User here (or move later if you want)
export type User = {
  _id: string;
  username: string;
  email: string;
  gameCount: number;
};
export type { Game, LibraryItem, LibraryStatus };

export type UserGameCreated = {
  _id: string;
  userId: string;
  gameId: string;
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

export async function getMe() {
  const r = await axiosInstance.get('/users/me');
  return r.data as { _id: string; username?: string };
}


export async function patchMe(body: { username: string }) {
  const r = await axiosInstance.patch('/users/me', body);
  return r.data as { userId?: string; username: string };
}


export async function getTopRatedGames(limit = 5): Promise<Game[]> {
  const r = await axiosInstance.get('/games/top', { params: { limit } });
  return r.data as Game[];
}

export async function getLatestReleases(limit = 5): Promise<Game[]> {
  const r = await axiosInstance.get('/games/latest', { params: { limit } });
  return r.data as Game[];
}

// ✅ if caller omits userId, use the one we bootstrapped this tab with
export async function getUserGames(userId?: string): Promise<LibraryItem[]> {
  const uid = userId ?? currentUserId();
  if (!uid) return [];                                 // ← guard
  const res = await axiosInstance.get(`/library`, { params: { userId: uid } });
  return res.data;
}


export async function addGame(
  a: string,                               // either gameId (new) or userId (old)
  b?: string | LibraryStatus,              // either status (new) or gameId (old)
  c?: LibraryStatus                        // status (old) — NOTE: no default here
) {
  let userId: string;
  let gameId: string;
  let status: LibraryStatus;

  if (typeof c !== 'undefined') {
    // OLD CALL SHAPE: addGame(userId, gameId, status)
    userId = a;
    gameId = b as string;
    status = c;
  } else {
    // NEW CALL SHAPE: addGame(gameId, status)
    userId = requireUserId();
    gameId = a;
    status = (b as LibraryStatus) ?? 'owned';
  }

  const body = { userId, gameId, status };
  const { data } = await axiosInstance.post('/library', body);
  return data;
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

export async function getGameDetail(
  idOrSlug: string,
  userId?: string,
): Promise<GameDetailDTO | null> {
  try {
    const uid = userId ?? currentUserId();
    const { data } = await axiosInstance.get(`/games/${encodeURIComponent(idOrSlug)}`, {
      params: uid ? { userId: uid } : undefined,
    });
    return data as GameDetailDTO;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) return null;
    throw e;
  }
}
