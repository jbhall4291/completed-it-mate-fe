import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import GameCard from './GameCard';
import type { GameCardViewModel } from '@/types/gameCard';

const mockGame: GameCardViewModel = {
    id: 'resident-evil-2',
    slug: 'resident-evil-2',
    title: 'Resident Evil 2',
    imageUrl: 'https://media.rawg.io/media/games/053/053fc543bf488349610f1ae2d0c1b51b.jpg',
    parentPlatforms: ['pc', 'playstation', 'xbox'],
    releaseDate: '2019-01-25',
    avgCompletionTime: 8,
    completedCount: 1,
    isInLibrary: false,
    userStatus: undefined,
    userGameId: undefined,
};

const createProps = (
    overrides: Partial<ComponentProps<typeof GameCard>> = {}
): ComponentProps<typeof GameCard> => ({
    game: mockGame,
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
            screen.getByRole('link', { name: /view details for resident evil 2/i })
        ).toHaveAttribute('href', '/games/resident-evil-2');
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

    it('calls onAdd with owned status when Add to collection is clicked', async () => {
        const user = userEvent.setup();
        const onAdd = vi.fn();

        render(<GameCard {...createProps({ onAdd })} />);

        await user.click(
            screen.getByRole('button', { name: /add to collection/i })
        );

        expect(onAdd).toHaveBeenCalledWith('resident-evil-2', 'owned');
    });

    it('shows the current library status when the game is already in the library', () => {
        render(
            <GameCard
                {...createProps({
                    game: {
                        ...mockGame,
                        isInLibrary: true,
                        userStatus: 'completed',
                        userGameId: 'library-item-1',
                    },
                })}
            />
        );

        expect(screen.getByText(/completed/i)).toBeInTheDocument();
    });

    it('calls onUpdate when a status option is selected', async () => {
        const user = userEvent.setup();
        const onUpdate = vi.fn();

        render(
            <GameCard
                {...createProps({
                    game: {
                        ...mockGame,
                        isInLibrary: true,
                        userStatus: 'owned',
                        userGameId: 'library-item-1',
                    },
                    open: true,
                    onUpdate,
                })}
            />
        );

        await user.click(
            await screen.findByRole('menuitem', { name: /mark as completed/i })
        );

        expect(onUpdate).toHaveBeenCalledWith('resident-evil-2', 'completed');
    });

    it('calls onRemove when Remove from collection is clicked', async () => {
        const user = userEvent.setup();
        const onRemove = vi.fn();

        render(
            <GameCard
                {...createProps({
                    game: {
                        ...mockGame,
                        isInLibrary: true,
                        userStatus: 'completed',
                        userGameId: 'library-item-1',
                    },
                    open: true,
                    onRemove,
                })}
            />
        );

        await user.click(
            await screen.findByRole('menuitem', { name: /remove from collection/i })
        );

        expect(onRemove).toHaveBeenCalledWith('resident-evil-2');
    });

    it('does not show remove option when the game is not in the library', () => {
        render(
            <GameCard
                {...createProps({
                    game: {
                        ...mockGame,
                        isInLibrary: false,
                        userStatus: undefined,
                        userGameId: undefined,
                    },
                    open: true,
                })}
            />
        );

        expect(
            screen.queryByRole('menuitem', { name: /remove from collection/i })
        ).not.toBeInTheDocument();
    });
});

