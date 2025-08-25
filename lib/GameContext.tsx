// GameContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getUserGames } from './api';

type GameContextType = {
    gameCount: number;
    setGameCount: React.Dispatch<React.SetStateAction<number>>;
    refreshGameCount: (userId?: string) => Promise<void>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [gameCount, setGameCount] = useState(0);
    const hardcodedUserId = '6890a2561ffcdd030b19c08c';

    const refreshGameCount = useCallback(async (userId = hardcodedUserId) => {
        try {
            const lib = await getUserGames(userId); // ← /library?userId=
            setGameCount(lib.length);
        } catch (err) {
            console.error('Failed to refresh game count:', err);
        }
    }, []);

    useEffect(() => {
        void refreshGameCount();
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