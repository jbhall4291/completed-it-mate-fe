'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { patchMe, resetMyLibrary } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import { LoaderCircle, Pencil, Save, UserRound } from 'lucide-react';
import { cn } from "@/lib/utils";

type ConfirmState = 'confirm' | 'processing' | 'success' | 'error';

function useConfirm() {
    const [pending, setPending] = useState<null | {
        message: string;
        state: ConfirmState;
        resolve: (ok: boolean) => void;
        error?: string;
    }>(null);

    const overlayRef = useRef<HTMLDivElement>(null);

    const confirm = useCallback((message: string) => {
        return new Promise<boolean>(resolve => {
            setPending({ message, state: 'confirm', resolve });
        });
    }, []);

    const setState = (state: ConfirmState, error?: string) => {
        setPending(p => (p ? { ...p, state, error } : null));
    };

    const resolveConfirm = (ok: boolean) => {
        pending?.resolve(ok);
    };

    const close = () => {
        setPending(null);
    };

    useEffect(() => {
        if (!pending) return;

        const el = overlayRef.current;
        if (!el) return;

        el.focus();

        const prevent = (e: Event) => e.preventDefault();

        el.addEventListener('wheel', prevent, { passive: false });
        el.addEventListener('touchmove', prevent, { passive: false });

        return () => {
            el.removeEventListener('wheel', prevent as any);
            el.removeEventListener('touchmove', prevent as any);
        };
    }, [pending]);

    const ConfirmUI = !pending ? null : (
        <div
            ref={overlayRef}
            tabIndex={-1}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 touch-none"
            role="dialog"
            aria-modal="true"
            onClick={close}
            onKeyDown={(e) => {
                if (e.key === 'Escape') close();
                if (e.key === 'Enter' && pending.state === 'confirm') {
                    resolveConfirm(true);
                }
            }}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-background border border-white/10 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-5 py-4">
                    <h2 className="text-lg font-semibold">Reset collection?</h2>
                </div>

                {/* BODY */}
                <div className="px-5 py-4 text-sm space-y-2">
                    {pending.state === 'confirm' && pending.message}

                    {pending.state === 'processing' && (
                        <div className="flex items-center gap-2 text-white/80">
                            <LoaderCircle className="animate-spin" />
                            <span>Clearing your collection…</span>
                        </div>
                    )}

                    {pending.state === 'success' && (
                        <p className="text-green-400">
                            Collection cleared successfully.
                        </p>
                    )}

                    {pending.state === 'error' && (
                        <p className="text-red-400">
                            {pending.error ?? 'Something went wrong.'}
                        </p>
                    )}
                </div>

                {/* FOOTER */}
                <div className="px-5 py-6 flex items-center justify-end gap-2">
                    {pending.state === 'confirm' && (
                        <>
                            <button
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                                onClick={() => {
                                    resolveConfirm(false);
                                    close();
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-3 py-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 cursor-pointer"
                                onClick={() => resolveConfirm(true)}
                            >
                                Remove all
                            </button>
                        </>
                    )}

                    {(pending.state === 'success' || pending.state === 'error') && (
                        <button
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                            onClick={close}
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return { confirm, ConfirmUI, setState };
}

export default function ProfilePage() {
    const { me, refreshMe } = useUser();

    const [value, setValue] = useState('');
    const [initial, setInitial] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [ok, setOk] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [editing, setEditing] = useState(false);

    const { confirm, ConfirmUI, setState } = useConfirm();

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
        } catch (error: unknown) {
            let status: number | undefined;

            if (
                typeof error === 'object' &&
                error !== null &&
                'response' in error &&
                typeof (error as { response?: unknown }).response === 'object' &&
                (error as { response?: { status?: unknown } }).response !== null &&
                typeof (error as { response?: { status?: unknown } }).response?.status === 'number'
            ) {
                status = (error as { response: { status: number } }).response.status;
            }

            if (status === 409) {
                setErr('Username already taken, try another.');
            } else {
                setErr('Failed to save, try again.');
            }
        }

        finally {
            setSaving(false);
        }
    }

    async function onResetLibrary() {
        const ok = await confirm(
            'This will remove all games and progress from your collection.\n\nThis cannot be undone.'
        );

        if (!ok) return;

        try {
            setState('processing');
            await resetMyLibrary();
            await refreshMe();

            setState('success');

        } catch {
            setState('error', 'Failed to reset your collection.');
        }
    }





    return (
        <main className="p-6 min-h-screen">
            <h1 className="text-3xl font-bold mb-6">Profile</h1>

            <div className="max-w-2xl space-y-6">
                {/* Account details */}
                <div className="rounded-xl bg-[#242528] p-6">
                    <div className="flex flex-row gap-x-3 items-center mb-4">
                        <div
                            className={cn(
                                "h-14 w-14 rounded-full flex items-center justify-center font-semibold text-2xl",
                                hasUsername ? "bg-green-600 text-white" : "bg-[#3a3b3e] text-white"
                            )}
                        >
                            {avatarLabel ? <span>{avatarLabel}</span> : <UserRound strokeWidth={2.5} />}
                        </div>

                        <form onSubmit={onSubmit}>
                            <div className="flex items-center gap-3">
                                {!editing ? (
                                    <span className="text-lg font-semibold">
                                        {me?.username ?? 'Anonymous Player'}
                                    </span>
                                ) : (
                                    <input
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        autoFocus
                                        className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm w-24"
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
                                        "px-2 py-2 rounded-lg transition cursor-pointer",
                                        "bg-white/10 hover:bg-white/20",
                                        "disabled:bg-white/5 disabled:text-white/30 disabled:hover:bg-white/5",
                                        "disabled:cursor-not-allowed"
                                    )}
                                >
                                    {saving ? (
                                        <LoaderCircle className="animate-spin" size={16} />
                                    ) : editing ? (
                                        <Save size={16} />
                                    ) : (
                                        <Pencil size={16} />

                                    )}
                                </button>

                                <div>
                                    {ok && <p className="text-xs text-green-400">{ok}</p>}
                                    {err && <p className="text-xs text-red-400">{err}</p>}
                                </div>
                            </div>
                        </form>
                    </div>

                    {me?.createdAt && (
                        <p className="text-sm text-white/70">
                            Member since{' '}
                            <span className="text-white">
                                {new Date(me.createdAt).toLocaleDateString('en-GB', {
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </span>
                        </p>
                    )}
                </div>

                {/* Danger zone */}
                <div className="rounded-xl bg-[#242528] p-6">
                    <h2 className="text-base font-semibold text-red-400 mb-2">
                        Danger zone
                    </h2>

                    <p className="text-sm text-white/60 mb-3">
                        Irreversible actions affecting your account
                    </p>

                    <button
                        onClick={onResetLibrary}
                        className="rounded-lg bg-red-500/20 text-white px-4 py-2 text-sm hover:bg-red-500/30 disabled:opacity-50 cursor-pointer"
                    >
                        Reset game collection
                    </button>

                </div>
            </div>
            {ConfirmUI}

        </main>
    );

}
