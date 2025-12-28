// GameContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getUserGames } from './api';

type GameContextType = {
    gameCount: number;
    setGameCount: React.Dispatch<React.SetStateAction<number>>;
    refreshGameCount: () => Promise<void>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [gameCount, setGameCount] = useState(0);

    const refreshGameCount = useCallback(async () => {
        try {
            const lib = await getUserGames(); // pulls userId from sessionStorage / header
            setGameCount(lib.length);
        } catch {
            /* bootstrap may not be done yet; ignore */
        }
    }, []);

    useEffect(() => {
        void refreshGameCount(); // first attempt (no-op if user not ready)
        const onReady = () => void refreshGameCount();
        window.addEventListener('clm:user-ready', onReady);
        return () => window.removeEventListener('clm:user-ready', onReady);
    }, [refreshGameCount]);


    return (
        <GameContext.Provider value={{ gameCount, setGameCount, refreshGameCount }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameContext() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error('useGameContext must be used inside a GameProvider');
    return ctx;
}
