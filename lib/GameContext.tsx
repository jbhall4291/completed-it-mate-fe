// GameContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser } from './api';

type GameContextType = {
    gameCount: number;
    setGameCount: React.Dispatch<React.SetStateAction<number>>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
    const [gameCount, setGameCount] = useState(0);
    const hardcodedUserId = '687bd767e7f8c28253f33359';

    // Fetch initial count on mount (after refresh)
    useEffect(() => {
        async function fetchCount() {
            try {
                const user = await getUser(hardcodedUserId);
                setGameCount(user.gamesOwned.length);
            } catch (err) {
                console.error('Failed to fetch initial game count:', err);
            }
        }
        fetchCount();
    }, []);

    return (
        <GameContext.Provider value={{ gameCount, setGameCount }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGameContext() {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGameContext must be used inside a GameProvider');
    }
    return context;
}
