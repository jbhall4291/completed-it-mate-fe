// components/game/AddToLibraryButton.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { LibraryStatus } from '@/lib/api';

type Props = {
    isAdded: boolean;
    currentStatus?: LibraryStatus;
    onAdd?: (status: LibraryStatus) => void;
    onUpdate?: (status: LibraryStatus) => void;
    onRemove?: () => void;
    disabled?: boolean;

    // NEW: control the dropdown from parent
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export default function AddToLibraryButton({
    isAdded,
    currentStatus,
    onAdd,
    onUpdate,
    onRemove,
    disabled = false,
    open,
    onOpenChange,
}: Props) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = open ?? internalOpen;
    const setOpen = onOpenChange ?? setInternalOpen;

    const rootRef = useRef<HTMLDivElement>(null);

    // close on outside click
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, setOpen]);

    const options: ReadonlyArray<{ label: string; status: LibraryStatus }> = [
        { label: 'Wishlist', status: 'wishlist' },
        { label: 'Own it', status: 'owned' },
        { label: 'Currently playing', status: 'playing' },
        { label: 'Completed it mate', status: 'completed' },
    ] as const;

    const leftLabel = isAdded ? `${currentStatus ?? 'owned'}` : 'Add to Library';
    const leftOnClick = isAdded
        ? () => onUpdate?.(currentStatus ?? 'owned')
        : () => onAdd?.('owned');

    const bgClasses = isAdded ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600';
    const containerClasses = [
        'inline-flex w-full items-stretch rounded overflow-hidden',
        'motion-safe:transition-colors duration-150',
        bgClasses,
        disabled ? 'opacity-60 pointer-events-none' : '',
    ].join(' ');

    return (
        <div ref={rootRef} className="relative inline-block w-full">
            <div className={containerClasses}>
                <button
                    type="button"
                    onClick={disabled ? undefined : leftOnClick}
                    className="flex-1 py-2 px-4 font-semibold text-white text-left focus:outline-none"
                >
                    {leftLabel}
                </button>

                <button
                    type="button"
                    aria-label={isAdded ? 'Change status' : 'Choose add status'}
                    aria-expanded={isOpen}
                    onClick={disabled ? undefined : () => setOpen(!isOpen)}
                    className="shrink-0 px-3 text-white border-l border-white/20 focus:outline-none"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {isOpen && !disabled && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white border rounded shadow-lg z-50 text-black">
                    {options.map(opt => (
                        <button
                            key={opt.status}
                            type="button"
                            onClick={() => {
                                (isAdded ? onUpdate : onAdd)?.(opt.status);
                                setOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        >
                            {opt.label}
                        </button>
                    ))}
                    {isAdded && onRemove && (
                        <button
                            type="button"
                            onClick={() => {
                                onRemove();
                                setOpen(false);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100"
                        >
                            Remove from library
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
