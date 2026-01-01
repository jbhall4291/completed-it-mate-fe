// GameActions.tsx
'use client';

import { useEffect, useState } from 'react';
import AddToLibraryButton from './AddToLibraryButton';
import {
    addGame,
    updateGameStatus,
    deleteGame,
    getUserGames,
    type LibraryStatus,
} from '@/lib/api';
import { useGameContext } from '@/lib/GameContext';

type Props = {
    gameId: string;
    initialStatus?: LibraryStatus;   // optional SSR hint
    initialUserGameId?: string;      // optional SSR hint
};

const USER_READY_EVENT = 'clm:user-ready';

export default function GameActions({ gameId, initialStatus, initialUserGameId }: Props) {
    const [status, setStatus] = useState<LibraryStatus | undefined>(initialStatus);
    const [userGameId, setUserGameId] = useState<string | undefined>(initialUserGameId);
    const [disabled, setDisabled] = useState(false);
    const isAdded = !!userGameId;

    const { refreshGameCount } = useGameContext();

    // Verify on mount (and when anon user becomes available on first visit)
    useEffect(() => {
        let cancelled = false;

        async function checkLibrary() {
            try {
                // already have info (SSR or optimistic) → skip
                if (userGameId || status) return;

                const lib = await getUserGames(); // auto-injects userId via session/header
                if (cancelled) return;

                const match = lib.find(i => i.gameId._id === gameId);
                if (match) {
                    setUserGameId(match._id);
                    setStatus(match.status);
                }
            } catch {
                /* ignore; UI still works via optimistic flows */
            }
        }

        // if user already exists this session, check now; otherwise wait for bootstrap
        const existing = typeof window !== 'undefined' ? sessionStorage.getItem('clm_user_id_v2') : null;
        if (existing) {
            void checkLibrary();
        } else {
            const onReady = () => void checkLibrary();
            window.addEventListener(USER_READY_EVENT, onReady);
            return () => window.removeEventListener(USER_READY_EVENT, onReady);
        }

        return () => { cancelled = true; };
    }, [gameId, userGameId, status]);

    const userReady = () => typeof window !== 'undefined' && !!sessionStorage.getItem('clm_user_id_v2');
    async function handleAdd(s: LibraryStatus) {
        if (!userReady()) return;

        setDisabled(true);
        setStatus(s);                          // optimistic
        setUserGameId(prev => prev ?? 'pending'); // show "added" immediately

        try {
            const created = await addGame(gameId, s); // userId auto
            setUserGameId(created._id);
            await refreshGameCount();
        } catch (e) {
            console.error('Add failed', e);
            // no rollback by design
        } finally {
            setDisabled(false);
        }
    }

    async function handleUpdate(s: LibraryStatus) {
        if (!userGameId) return;
        setDisabled(true);
        setStatus(s); // optimistic
        try {
            await updateGameStatus(userGameId, s);
        } catch (e) {
            console.error('Update failed', e);
        } finally {
            setDisabled(false);
        }
    }

    async function handleRemove() {
        if (!userGameId) return;
        setDisabled(true);
        // optimistic: flip back to not-added
        setUserGameId(undefined);
        setStatus(undefined);
        try {
            await deleteGame(userGameId);
            await refreshGameCount();
        } catch (e) {
            console.error('Remove failed', e);
        } finally {
            setDisabled(false);
        }
    }

    return (
        <AddToLibraryButton
            isAdded={isAdded}
            currentStatus={status}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onRemove={handleRemove}
            disabled={disabled}
        />
    );
}
