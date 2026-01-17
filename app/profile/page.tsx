'use client';

import { useEffect, useState } from 'react';
import { patchMe } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import axios from 'axios';
import { LoaderCircle, Pencil, Save, UserRound } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { me, refreshMe } = useUser();

    const [value, setValue] = useState('');
    const [initial, setInitial] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const [editing, setEditing] = useState(false);


    useEffect(() => {
        if (me?.username) {
            setValue(me.username);
            setInitial(me.username);
        }
    }, [me?.username]);

    useEffect(() => {
        if (!ok) return;
        const t = setTimeout(() => setOk(null), 5000);
        return () => clearTimeout(t);
    }, [ok]);

    const hasUsername = Boolean(me?.username);
    const avatarLabel = me?.username?.[0]?.toUpperCase() ?? null;
    const isUsernameDirty = value.trim() !== (initial ?? '');


    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editing) return;
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
            setEditing(false); // only on success
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
            <h1 className="text-3xl font-bold mb-6">Account</h1>
            <div className="max-w-2xl rounded-xl  bg-[#242528]  p-6 space-y-6">
                <div className="flex flex-row gap-x-3 items-center mb-4">
                    <div
                        className={cn(
                            "h-14 w-14 rounded-full flex items-center justify-center font-semibold text-2xl",
                            hasUsername ? "bg-green-600 text-white" : "bg-[#3a3b3e] text-white"
                        )}
                    >
                        {avatarLabel ? (
                            <span>{avatarLabel}</span>
                        ) : (
                            <UserRound strokeWidth={2.5} />
                        )}
                    </div>

                    <form onSubmit={onSubmit} className="space-y-3">

                        <div className="flex items-center gap-2">
                            {!editing ? (
                                <span className="text-lg font-semibold">
                                    {me?.username ?? 'Anonymous Player'}
                                </span>
                            ) : (
                                <input
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    autoFocus
                                    className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm w-48"
                                />
                            )}

                            <button
                                type={editing ? 'submit' : 'button'}
                                disabled={saving || (editing && !isUsernameDirty)}
                                onClick={() => {
                                    if (!editing) {
                                        setEditing(true);
                                        setErr(null);
                                        setOk(null);
                                    }
                                }}

                                className={cn(
                                    "px-2 py-2 rounded-lg transition",
                                    "bg-white/10 hover:bg-white/20",
                                    "disabled:bg-white/5 disabled:text-white/30 disabled:hover:bg-white/5",
                                    "disabled:cursor-not-allowed"
                                )}

                            >
                                {saving ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : editing ? (
                                    <Save />
                                ) : (
                                    <Pencil />
                                )}
                            </button>


                            <div>
                                {ok && <p className="text-xs text-green-400">{ok}</p>}
                                {err && <p className="text-xs text-red-400">{err}</p>}
                            </div>

                        </div>

                        {/* Danger zone stuff:
                    TODO: confirmation upon resetting collection                    
                    TODO: surface no white space error when changing username */}

                    </form>
                </div>


                <div>
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

                <button className="bg-red-300">Remove all games from collection</button>

            </div>
        </main>
    );
}
