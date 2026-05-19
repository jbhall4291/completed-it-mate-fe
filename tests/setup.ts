import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
    default: ({
        src,
        alt,
        fill,
        priority,
        blurDataURL,
        placeholder,
        onLoadingComplete,
        ...props
    }: any) =>
        React.createElement('img', {
            src: typeof src === 'string' ? src : src?.src,
            alt,
            ...props,
        }),
}));