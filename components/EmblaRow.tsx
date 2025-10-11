// components/EmblaRow.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel, { EmblaOptionsType, EmblaCarouselType } from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props<T> = {
    title: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode; // your GameCard
    options?: EmblaOptionsType;
    basisClass?: string; // width per slide
    skeleton?: React.ReactNode;
    loading?: boolean;
};

export default function EmblaRow<T>({
    title,
    items,
    renderItem,
    options = { align: "start", containScroll: "trimSnaps", dragFree: false },
    basisClass = "basis-[18rem] md:basis-[20rem]", // matches card sizes
    skeleton,
    loading = false,
}: Props<T>) {
    const [emblaRef, emblaApi] = useEmblaCarousel(options);
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true);
    const [progress, setProgress] = useState(0);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setPrevDisabled(!api.canScrollPrev());
        setNextDisabled(!api.canScrollNext());
        const p = Math.max(0, Math.min(1, api.scrollProgress()));
        setProgress(p);
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on("reInit", onSelect).on("select", onSelect).on("scroll", () => onSelect(emblaApi));
    }, [emblaApi, onSelect]);

    return (
        <section className="relative">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="hidden sm:flex items-center gap-2">
                    <button
                        onClick={() => emblaApi?.scrollPrev()}
                        disabled={prevDisabled}
                        className="h-8 w-8 rounded-full border bg-background/80 backdrop-blur
                       data-[disabled=true]:opacity-40 data-[disabled=true]:pointer-events-none
                       flex items-center justify-center"
                        data-disabled={prevDisabled}
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => emblaApi?.scrollNext()}
                        disabled={nextDisabled}
                        className="h-8 w-8 rounded-full border bg-background/80 backdrop-blur
                       data-[disabled=true]:opacity-40 data-[disabled=true]:pointer-events-none
                       flex items-center justify-center"
                        data-disabled={nextDisabled}
                        aria-label="Next"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* viewport */}
            <div ref={emblaRef} className="overflow-hidden">
                {/* container: use -ml-6 to match gap-6 */}
                <div className="-ml-6 flex touch-pan-x">
                    {(loading ? Array.from({ length: 6 }).map((_, i) => null) : items).map(
                        // @ts-ignore — skeleton branch OK
                        (item: T, i: number) => (
                            <div key={(item as any)?._id ?? i} className={`pl-6 shrink-0 ${basisClass}`}>
                                {loading ? skeleton : renderItem(item)}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* edge fades */}
            <div className="pointer-events-none absolute left-0 top-10 md:top-10 h-[calc(100%-2.5rem)] w-8
                      bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute right-0 top-10 md:top-10 h-[calc(100%-2.5rem)] w-8
                      bg-gradient-to-l from-background to-transparent" />

            {/* progress bar */}
            <div className="mt-2 h-1 rounded bg-border/40">
                <div
                    className="h-1 rounded bg-primary transition-[width]"
                    style={{ width: `${Math.round(progress * 100)}%` }}
                    aria-hidden
                />
            </div>
        </section>
    );
}
