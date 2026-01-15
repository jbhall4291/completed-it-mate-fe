// lib/UserContext.tsx
'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
    useCallback,
} from 'react';
import { getMe } from './api';

export type Me = {
    userId: string;
    username?: string;
    createdAt?: string;
} | null;

type UserContextType = {
    me: Me;
    loading: boolean;
    refreshMe: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [me, setMe] = useState<Me>(null);
    const [loading, setLoading] = useState(true);

    const refreshMe = useCallback(async () => {
        try {
            const user = await getMe();
            setMe(user);
        } catch {
            setMe(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshMe();
    }, [refreshMe]);

    return (
        <UserContext.Provider value={{ me, loading, refreshMe }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) {
        throw new Error('useUser must be used inside a UserProvider');
    }
    return ctx;
}
