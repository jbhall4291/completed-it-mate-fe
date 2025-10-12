// components/game/GameScreenshots.tsx
'use client';

import EmblaRow from '@/components/EmblaRow';

export default function GameScreenshots({ shots }: { shots: string[] }) {
    if (!shots?.length) return null;

    return (
        <section className="mt-8 select-none">
            <h2 className="text-xl font-semibold mb-3">Screenshots</h2>

            <EmblaRow
                title=""
                items={shots}
                options={{ align: "start", containScroll: "trimSnaps", loop: false, dragFree: true }}
                basisClass="basis-[18rem] md:basis-[20rem]"
                loading={false}
                renderItem={(src) => (
                    <div className="relative h-44 md:h-48 w-[18rem] md:w-[20rem] overflow-hidden rounded-lg">
                        <img
                            src={src}
                            alt="Game screenshot"
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                )}
            />
        </section>
    );
}
