'use client';
import { useEffect, useState } from 'react';
import { getMe, patchMe } from '@/lib/api';
import axios, { AxiosError } from 'axios';

export default function UsernameSetter() {
    const [value, setValue] = useState('');
    const [initial, setInitial] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    // load current username once
    useEffect(() => {
        (async () => {
            try {
                const me = await getMe();
                if (me?.username) {
                    setValue(me.username);
                    setInitial(me.username);
                }
            } catch (e) {
                console.error('Failed to load username', e);
            }
        })();
    }, []);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const name = value.trim();
        if (name.length < 2) { setErr('Too short'); return; }
        if (name === initial) return; // nothing changed

        setSaving(true);
        setErr(null);
        setOk(null);

        try {
            const res = await patchMe({ username: name });
            setOk(`Saved as “${res.username}”`);
            setInitial(res.username);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 409)
                    setErr('Username already taken, try another.');
                else
                    setErr('Failed to save, try again.');
            } else {
                setErr('Unexpected error, try again.');
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex items-center gap-2">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Set display name"
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-white/30"
                aria-label="Display name"
            />
            <button
                type="submit"
                disabled={saving || !value.trim() || value === initial}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-sm"
            >
                {saving ? 'Saving…' : 'Save'}
            </button>
            {ok && <span className="text-xs text-green-400">{ok}</span>}
            {err && <span className="text-xs text-red-400">{err}</span>}
        </form>
    );
}
