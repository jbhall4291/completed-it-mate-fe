'use client';

import { useEffect, useState } from 'react';
import { patchMe } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import axios from 'axios';

export default function ProfilePage() {
    const { me, refreshMe } = useUser();

    const [value, setValue] = useState('');
    const [initial, setInitial] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (me?.username) {
            setValue(me.username);
            setInitial(me.username);
        }
    }, [me?.username]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const name = value.trim();

        if (name.length < 2) {
            setErr('Too short');
            return;
        }
        if (name === initial) return;

        setSaving(true);
        setErr(null);
        setOk(null);

        try {
            const res = await patchMe({ username: name });
            setOk(`Saved as “${res.username}”`);
            setInitial(res.username);
            await refreshMe();
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 409) {
                setErr('Username already taken, try another.');
            } else {
                setErr('Failed to save, try again.');
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <main className="p-6 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            <div className="max-w-md rounded-xl bg-white/5 border border-white/10 p-6 space-y-6">
                <div>
                    <h2 className="text-lg font-semibold mb-1">Account</h2>
                    {me?.createdAt && (
                        <p className="text-sm text-white/70">
                            Member since:{' '}
                            <span className="text-white">
                                {new Date(me.createdAt).toLocaleDateString('en-GB', {
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </p>
                    )}
                </div>

                <form onSubmit={onSubmit} className="space-y-3">
                    <label className="text-sm font-medium text-white/80">
                        Display name
                    </label>

                    <div className="flex items-center gap-2">
                        <input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm w-48"
                        />
                        <button
                            type="submit"
                            disabled={saving || value === initial}
                            className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 text-sm"
                        >
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>

                    {/* Danger zone stuff:
                    TODO: confirmation upon resetting collection
                    TODO: Log out
                    TODO: surface no white space error when changing username */}

                    {ok && <p className="text-xs text-green-400">{ok}</p>}
                    {err && <p className="text-xs text-red-400">{err}</p>}
                </form>
            </div>
        </main>
    );
}
