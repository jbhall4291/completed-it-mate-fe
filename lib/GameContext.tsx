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
    const hardcodedUserId = '6890a2561ffcdd030b19c08c';

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
