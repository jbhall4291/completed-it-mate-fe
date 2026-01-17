'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
    src: string;
    alt: string;
};

export default function GameImage({ src, alt }: Props) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="relative w-full h-full overflow-hidden">
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                placeholder="blur"
                blurDataURL="/blur.png"
                onLoadingComplete={() => setLoaded(true)}
                className={`
                    object-cover
                    scale-100
                    group-hover:scale-[1.1]
                    transition-transform
                    duration-700
                    ease-out
                    ${loaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}
                `}
            />
        </div>
    );
}
