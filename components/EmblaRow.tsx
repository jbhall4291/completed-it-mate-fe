// components/EmblaRow.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType, EmblaCarouselType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props<T extends { _id?: string }> = {
    title: string;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    options?: EmblaOptionsType;
    basisClass?: string;
    skeleton?: React.ReactNode;
    loading?: boolean;
    skeletonCount?: number;
};

export default function EmblaRow<T extends { _id?: string }>({
    title,
    items,
    renderItem,
    options = { align: "start", containScroll: "trimSnaps" },
    basisClass = "basis-[18rem] md:basis-[20rem]",
    skeleton,
    loading = false,
    skeletonCount = 6,
}: Props<T>) {
    const [emblaRef, emblaApi] = useEmblaCarousel(options);
    const [prevDisabled, setPrevDisabled] = useState(true);
    const [nextDisabled, setNextDisabled] = useState(true);
    const [progress, setProgress] = useState(0);

    const onSelect = useCallback((api: EmblaCarouselType) => {
        setPrevDisabled(!api.canScrollPrev());
        setNextDisabled(!api.canScrollNext());
        setProgress(Math.max(0, Math.min(1, api.scrollProgress())));
    }, []);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect(emblaApi);
        emblaApi.on("reInit", onSelect).on("select", onSelect).on("scroll", () => onSelect(emblaApi));
    }, [emblaApi, onSelect]);

    // ✅ Normalise to a single, known type before .map
    const itemsToRender: Array<T | null> = loading
        ? Array.from({ length: skeletonCount }, () => null)
        : items;

    return (
        <section className="relative">
            <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{title}</h2>
                <div className="hidden sm:flex items-center gap-2">
                    <button
                        onClick={() => emblaApi?.scrollPrev()}
                        data-disabled={prevDisabled}
                        disabled={prevDisabled}
                        className="h-8 w-8 rounded-full border bg-background/80 data-[disabled=true]:opacity-40 data-[disabled=true]:pointer-events-none flex items-center justify-center"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => emblaApi?.scrollNext()}
                        data-disabled={nextDisabled}
                        disabled={nextDisabled}
                        className="h-8 w-8 rounded-full border bg-background/80 data-[disabled=true]:opacity-40 data-[disabled=true]:pointer-events-none flex items-center justify-center"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div ref={emblaRef} className="overflow-hidden">
                <div className="-ml-6 flex">
                    {itemsToRender.map((item, i) => (
                        <div key={item?._id ?? i} className={`pl-6 shrink-0 ${basisClass}`}>
                            {item === null ? skeleton : renderItem(item)}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-2 h-1 rounded bg-border/40">
                <div className="h-1 rounded bg-primary transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
        </section>
    );
}
