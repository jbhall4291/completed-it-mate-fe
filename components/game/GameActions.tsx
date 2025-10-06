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
    initialStatus?: LibraryStatus;   // from GET /games/:id?userId=...
    initialUserGameId?: string;      // from GET /games/:id?userId=...
};

const hardcodedUserId = '6890a2561ffcdd030b19c08c';

export default function GameActions({ gameId, initialStatus, initialUserGameId }: Props) {
    const [status, setStatus] = useState<LibraryStatus | undefined>(initialStatus);
    const [userGameId, setUserGameId] = useState<string | undefined>(initialUserGameId);
    const [disabled, setDisabled] = useState(false);
    const isAdded = !!userGameId;

    const { refreshGameCount } = useGameContext();

    // re-check the user's library once on mount (handles "clicked really fast" race).
    useEffect(() => {
        if (userGameId || status) return; // already known
        let cancelled = false;
        (async () => {
            try {
                const lib = await getUserGames(hardcodedUserId);
                if (cancelled) return;
                const match = lib.find(i => i.gameId._id === gameId);
                if (match) {
                    setUserGameId(match._id);
                    setStatus(match.status);
                }
            } catch (e) {
                // ignore; UI will still work via optimistic flows
                console.warn('verify-on-mount failed', e);
            }
        })();
        return () => { cancelled = true; };
    }, [gameId, userGameId, status]);


    async function handleAdd(s: LibraryStatus) {
        // optimistic UI
        setDisabled(true);
        setStatus(s);
        // mark as added optimistically (so label flips immediately)
        setUserGameId(prev => prev ?? 'pending');

        try {
            const created = await addGame(hardcodedUserId, gameId, s);
            // backend must return {_id: <userGameId>} — verify this if it stays undefined
            setUserGameId(created._id);
            await refreshGameCount(hardcodedUserId);
        } catch (e) {
            console.error('Add failed', e);
            // (no rollback by design)
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
            await refreshGameCount(hardcodedUserId);
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
