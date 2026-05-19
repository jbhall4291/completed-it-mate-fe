import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import GameCard from './GameCard';
import type { GameCardDTO } from '@/types';

const mockGame: GameCardDTO = {
    _id: 'resident-evil-2',
    slug: 'resident-evil-2',
    title: 'Resident Evil 2',
    imageUrl: 'https://media.rawg.io/media/games/053/053fc543bf488349610f1ae2d0c1b51b.jpg',
    parentPlatforms: ['pc', 'playstation', 'xbox'],
    releaseDate: '2019-01-25',
    avgCompletionTime: 8,
    completedCount: 1,
};

const createProps = (
    overrides: Partial<ComponentProps<typeof GameCard>> = {}
): ComponentProps<typeof GameCard> => ({
    game: mockGame,
    isAdded: false,
    currentStatus: undefined,
    open: false,
    onOpenChange: vi.fn(),
    onAdd: vi.fn(),
    onUpdate: vi.fn(),
    onRemove: vi.fn(),
    hidePlatformChips: false,
    ...overrides,
});

describe('GameCard', () => {
    it('renders a link to the game detail page', () => {
        render(<GameCard {...createProps()} />);

        expect(
            screen.getByRole('link', { name: 'Open Resident Evil 2' })
        ).toHaveAttribute('href', '/games/resident-evil-2');
    });

    it('renders the game image with alt text', () => {
        render(<GameCard {...createProps()} />);

        expect(
            screen.getByRole('img', { name: 'Resident Evil 2' })
        ).toBeInTheDocument();
    });

    it('renders the game title', () => {
        render(<GameCard {...createProps()} />);

        expect(screen.getByText('Resident Evil 2')).toBeInTheDocument();
    });

    it('renders the singular completion count', () => {
        render(<GameCard {...createProps()} />);

        expect(screen.getByText('1 COMPLETION')).toBeInTheDocument();
    });

    it('renders plural completion count', () => {
        render(
            <GameCard
                {...createProps({
                    game: {
                        ...mockGame,
                        completedCount: 3,
                    },
                })}
            />
        );

        expect(screen.getByText('3 COMPLETIONS')).toBeInTheDocument();
    });

    it('renders platform chips by default', () => {
        render(<GameCard {...createProps()} />);

        expect(screen.getByText('pc')).toBeInTheDocument();
        expect(screen.getByText('playstation')).toBeInTheDocument();
        expect(screen.getByText('xbox')).toBeInTheDocument();
    });

    it('hides platform chips when requested', () => {
        render(<GameCard {...createProps({ hidePlatformChips: true })} />);

        expect(screen.queryByText('pc')).not.toBeInTheDocument();
        expect(screen.queryByText('playstation')).not.toBeInTheDocument();
        expect(screen.queryByText('xbox')).not.toBeInTheDocument();
    });
});