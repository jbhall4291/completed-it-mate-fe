// lib/api.ts
import axiosInstance from './axiosInstance';
import axios, { CanceledError, AxiosError } from 'axios';
import type { GameDetailDTO } from '@/types';
import type { GameCardDTO as Game, LibraryItemDTO as LibraryItem, LibraryStatus } from '../types';

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

export type BrowseParams = {
  page?: number;
  pageSize?: number;
  titleQuery?: string;         // legacy alias (maps to ?titleQuery=)
  q?: string;                  // new alias (maps to ?q=)
  platforms?: string[];        // e.g. ['switch'] (maps to CSV)
  genres?: string[];           // e.g. ['rpg','strategy']
  years?: number[];            // e.g. [1998,2001] (exact years)
  yearMin?: number;
  yearMax?: number;
  sort?: 'metacritic-desc' | 'metacritic-asc' | 'released-desc' | 'released-asc' | 'title-asc' | 'title-desc';
  minScore?: number;           // optional, you might test it later
};

export async function fetchGamesPaged(params: BrowseParams = {}) {
  const {
    page = 1,
    pageSize = 24,
    titleQuery,
    q,
    platforms,
    genres,
    years,
    yearMin,
    yearMax,
    sort,
    minScore,
  } = params;

  // Build query object, only include defined keys
  const query: Record<string, any> = { page, pageSize };

  if (titleQuery) query.titleQuery = titleQuery;
  if (q) query.q = q;

  if (Array.isArray(platforms) && platforms.length) query.platforms = platforms.join(',');
  if (Array.isArray(genres) && genres.length) query.genres = genres.join(',');
  if (Array.isArray(years) && years.length) query.years = years.join(',');

  if (typeof yearMin === 'number') query.yearMin = yearMin;
  if (typeof yearMax === 'number') query.yearMax = yearMax;

  if (sort) query.sort = sort;
  if (typeof minScore === 'number') query.minScore = minScore;

  const r = await axiosInstance.get('/games', { params: query });
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


export async function getTopRatedGames(limit = 20): Promise<Game[]> {
  const r = await axiosInstance.get('/games/top', { params: { limit } });
  return r.data as Game[];
}

export async function getLatestReleases(limit = 20): Promise<Game[]> {
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


// lib/api.ts
export async function getGameFacets() {
  const { data } = await axiosInstance.get('/games/facets');
  return data as { platforms: { value: string, count: number }[]; genres: { value: string, count: number }[]; yearMin: number; yearMax: number };
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
