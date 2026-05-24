import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';

import GameCard from './GameCard';
import { GameCardViewModel } from '@/types/gameCard';

const mockGame: GameCardViewModel = {
    id: 'resident-evil-2',
    slug: 'resident-evil-2',
    title: 'Resident Evil 2',
    imageUrl:
        'https://media.rawg.io/media/games/053/053fc543bf488349610f1ae2d0c1b51b.jpg',
    parentPlatforms: ['pc', 'playstation', 'xbox'],
    releaseDate: '2019-01-25',
    avgCompletionTime: 8,
    completedCount: 1,
    isInLibrary: false,
    userStatus: undefined,
    userGameId: undefined,
};

const createGame = (
    overrides: Partial<GameCardViewModel> = {}
): GameCardViewModel => ({
    ...mockGame,
    ...overrides,
});

const meta = {
    title: 'Components/GameCard',
    component: GameCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        onOpenChange: { action: 'open changed', control: false },
        onAdd: { action: 'add clicked', control: false },
        onUpdate: { action: 'status updated', control: false },
        onRemove: { action: 'remove clicked', control: false },
    },
    decorators: [
        (Story) => (
            <div className="w-[360px] bg-neutral-100 p-4">
                <Story />
            </div>
        ),
    ],
    args: {
        game: mockGame,
        open: false,
        onOpenChange: fn(),
        onAdd: fn(),
        onUpdate: fn(),
        onRemove: fn(),
        hidePlatformChips: false,
    },
} satisfies Meta<typeof GameCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NotInLibrary: Story = {
    args: {
        game: createGame({
            isInLibrary: false,
            userStatus: undefined,
            userGameId: undefined,
        }),
    },
};

export const Owned: Story = {
    args: {
        game: createGame({
            isInLibrary: true,
            userStatus: 'owned',
            userGameId: 'library-item-1',
        }),
    },
};

export const Playing: Story = {
    args: {
        game: createGame({
            isInLibrary: true,
            userStatus: 'playing',
            userGameId: 'library-item-1',
        }),
    },
};

export const Completed: Story = {
    args: {
        game: createGame({
            isInLibrary: true,
            userStatus: 'completed',
            userGameId: 'library-item-1',
        }),
    },
};

export const Wishlist: Story = {
    args: {
        game: createGame({
            isInLibrary: true,
            userStatus: 'wishlist',
            userGameId: 'library-item-1',
        }),
    },
};

export const MultipleCompletions: Story = {
    args: {
        game: createGame({
            completedCount: 3,
            isInLibrary: true,
            userStatus: 'completed',
            userGameId: 'library-item-1',
        }),
    },
};

export const NoCompletions: Story = {
    args: {
        game: createGame({
            completedCount: 0,
            isInLibrary: false,
            userStatus: undefined,
            userGameId: undefined,
        }),
    },
};

export const ManyPlatforms: Story = {
    args: {
        game: createGame({
            parentPlatforms: ['pc', 'playstation', 'xbox', 'nintendo', 'mac'],
        }),
    },
};

export const WithoutPlatformChips: Story = {
    args: {
        hidePlatformChips: true,
    },
};

export const MenuOpen: Story = {
    args: {
        game: createGame({
            isInLibrary: true,
            userStatus: 'completed',
            userGameId: 'library-item-1',
        }),
        open: true,
    },
};