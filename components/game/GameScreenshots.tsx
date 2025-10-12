// components/game/GameScreenshots.tsx
'use client';

import EmblaRow from '@/components/EmblaRow';

type ShotItem = { _id: string; src: string };

export default function GameScreenshots({ shots }: { shots: string[] }) {
    if (!shots?.length) return null;

    const items: ShotItem[] = shots.map((src, i) => ({
        _id: `shot-${i}`,
        src,
    }));

    return (
        <section className="mt-8 select-none">
            <EmblaRow<ShotItem>
                title="Screenshots"
                items={items}
                options={{ align: 'start', containScroll: 'trimSnaps', loop: false, dragFree: true }}
                basisClass="basis-[18rem] md:basis-[20rem]"
                loading={false}
                renderItem={(item) => (
                    <div className="relative h-44 md:h-48 w-[18rem] md:w-[20rem] overflow-hidden rounded-lg">
                        <img
                            src={item.src}
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
