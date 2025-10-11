// components/game/AddToLibraryButton.tsx
'use client';

import { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import type { LibraryStatus } from '@/lib/api';

type Props = {
    isAdded: boolean;
    currentStatus?: LibraryStatus;
    onAdd?: (status: LibraryStatus) => void;
    onUpdate?: (status: LibraryStatus) => void;
    onRemove?: () => void;
    disabled?: boolean;
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
    const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number } | null>(null);

    // Close on outside click (works for both inline and portal)
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            const root = rootRef.current;
            if (!root) return setOpen(false);
            if (!root.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, setOpen]);

    // Recalculate menu position
    const updateMenuPos = useCallback(() => {
        const el = rootRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const gap = 6; // px below the trigger
        setMenuPos({ left: Math.round(rect.left), top: Math.round(rect.bottom + gap), width: Math.round(rect.width) });
    }, []);

    useLayoutEffect(() => {
        if (!isOpen) return;
        updateMenuPos();
        const onScroll = () => updateMenuPos();
        const onResize = () => updateMenuPos();
        window.addEventListener('scroll', onScroll, true); // capture to catch scrollable parents
        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('resize', onResize);
        };
    }, [isOpen, updateMenuPos]);

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

    const Menu = (
        <div
            className="bg-white border rounded shadow-lg z-[1000] text-background"
            style={{
                position: 'fixed',
                left: menuPos?.left ?? 0,
                top: menuPos?.top ?? 0,
                width: menuPos?.width ?? 'auto',
            }}
            // prevent clicks inside menu from bubbling to document mousedown handler until button handlers run
            onMouseDown={(e) => e.stopPropagation()}
        >
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
    );

    return (
        <div ref={rootRef} className="relative inline-block w-full">
            <div className={containerClasses}>
                <button
                    type="button"
                    onClick={disabled ? undefined : leftOnClick}
                    className="flex-1 py-2 px-4 font-semibold text-left focus:outline-none"
                >
                    {leftLabel}
                </button>

                <button
                    type="button"
                    aria-label={isAdded ? 'Change status' : 'Choose add status'}
                    aria-expanded={isOpen}
                    onClick={disabled ? undefined : () => setOpen(!isOpen)}
                    className="shrink-0 px-3 border-l border-white/20 focus:outline-none"
                >
                    <ChevronDown className="w-4 h-4" />
                </button>
            </div>

            {/* portal the menu so it escapes Embla's overflow:hidden */}
            {isOpen && !disabled && menuPos && createPortal(Menu, document.body)}
        </div>
    );
}
