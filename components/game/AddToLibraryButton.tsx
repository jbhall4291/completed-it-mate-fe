// components/game/AddToLibraryButton.tsx
'use client';

import { useEffect, useRef, useState, useLayoutEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { Trophy, ChevronDown } from 'lucide-react';
import type { LibraryStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

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
    const menuId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

    const [menuPos, setMenuPos] = useState<{ left: number; top: number; width: number } | null>(null);

    useEffect(() => {
        if (!isOpen || !menuPos) return;

        requestAnimationFrame(() => {
            itemRefs.current[0]?.focus();
        });
    }, [isOpen, menuPos]);

    // Close on outside click (works for both inline and portal)
    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, setOpen]);

    // Recalculate menu position
    const updateMenuPos = useCallback(() => {
        const el = rootRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const gap = 6; // px below the trigger
        setMenuPos({ left: Math.round(rect.left), top: Math.round(rect.bottom + gap), width: Math.round(rect.width) });
    }, []);

    const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[];
        const currentIndex = items.findIndex((item) => item === document.activeElement);

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            items[nextIndex]?.focus();
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            items[prevIndex]?.focus();
        }

        if (e.key === "Home") {
            e.preventDefault();
            items[0]?.focus();
        }

        if (e.key === "End") {
            e.preventDefault();
            items[items.length - 1]?.focus();
        }
    };

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
        { label: 'Add to wishlist', status: 'wishlist' },
        { label: 'Add to collection', status: 'owned' },
        { label: 'Mark as in progress', status: 'playing' },
        { label: 'Mark as completed', status: 'completed' },
    ] as const;

    const STATUS_LABEL: Record<LibraryStatus, string> = {
        wishlist: 'On wishlist',
        owned: 'In backlog',
        playing: 'In progress',
        completed: 'Completed',
    };

    const leftLabel = isAdded
        ? STATUS_LABEL[currentStatus ?? 'owned']
        : 'Add to collection';

    const leftOnClick = () => onAdd?.("owned");

    const bgClasses = isAdded
        ? 'bg-green-700'
        : 'bg-blue-700 hover:bg-blue-800';

    const containerClasses = [
        'inline-flex w-full items-stretch rounded overflow-hidden',
        'motion-safe:transition-colors duration-150',
        bgClasses,
        disabled ? 'opacity-60 pointer-events-none' : '',
    ].join(' ');

    const Menu = (
        <div
            id={menuId}
            ref={menuRef}
            role="menu"
            aria-label={isAdded ? "Change library status" : "Choose add status"}
            className="bg-white border rounded shadow-lg z-[1000] text-background overflow-hidden"
            style={{
                position: "fixed",
                left: menuPos?.left ?? 0,
                top: menuPos?.top ?? 0,
                width: menuPos?.width ?? "auto",
            }}
            onKeyDown={handleMenuKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {options.map((opt, index) => (
                <button
                    key={opt.status}
                    ref={(el) => {
                        itemRefs.current[index] = el;
                    }}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                        (isAdded ? onUpdate : onAdd)?.(opt.status);
                        setOpen(false);
                        triggerRef.current?.focus();
                    }}
                    className={cn(
                        "block w-full px-4 py-2 text-left text-sm cursor-pointer",
                        "hover:bg-green-700 hover:text-white",
                        "focus-visible:outline-none focus-visible:bg-green-700 focus-visible:text-white",
                    )}
                >
                    {opt.label}
                </button>
            ))}

            {isAdded && onRemove && (
                <button
                    type="button"
                    role="menuitem"
                    ref={(el) => {
                        itemRefs.current[options.length] = el;
                    }}
                    onClick={() => {
                        onRemove();
                        setOpen(false);
                        triggerRef.current?.focus();
                    }}
                    className={cn(
                        "block w-full px-4 py-2 text-left text-sm text-red-600 cursor-pointer",
                        "hover:bg-red-700 hover:text-white",
                        "focus-visible:outline-none focus-visible:bg-red-700 focus-visible:text-white",
                    )}
                >
                    Remove from collection
                </button>
            )}
        </div>
    );

    return (
        <div ref={rootRef} className="relative inline-block w-[200px]">
            <div className={containerClasses}>
                {isAdded ? (
                    <div className="flex flex-1 flex-row items-center px-4 py-2 text-left font-semibold">
                        {currentStatus === "completed" && (
                            <Trophy
                                strokeWidth={3}
                                className="-ml-1 mr-2 h-4.5 w-4.5 text-yellow-500"
                                aria-hidden="true"
                            />
                        )}
                        {leftLabel}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={!disabled ? leftOnClick : undefined}
                        disabled={disabled}
                        className={[
                            "flex flex-1 flex-row items-center px-4 py-2 text-left font-semibold cursor-pointer",
                            "focus-visible:outline-none",
                            "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-400",
                            "disabled:cursor-not-allowed",
                        ].join(" ")}
                    >
                        {leftLabel}
                    </button>
                )}

                <button
                    ref={triggerRef}
                    type="button"
                    aria-label={isAdded ? "Change library status" : "Choose add status"}
                    aria-haspopup="menu"
                    aria-expanded={isOpen}
                    aria-controls={isOpen ? menuId : undefined}
                    onClick={disabled ? undefined : () => setOpen(!isOpen)}
                    disabled={disabled}
                    className={[
                        "shrink-0 px-3 border-l border-white/20 cursor-pointer",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-green-400",
                        "disabled:cursor-not-allowed",
                    ].join(" ")}
                >
                    <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>
            </div>

            {/* portal the menu so it escapes Embla's overflow:hidden */}
            {isOpen && !disabled && menuPos && createPortal(Menu, document.body)}
        </div>
    );
}
