import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GameCard from './GameCard';
import type { Game, LibraryStatus } from '@/lib/api';
import { fn } from 'storybook/test';

const mockGame: Game = {
    _id: 'resident-evil-2',
    title: 'Resident Evil 2',
    imageUrl: 'https://media.rawg.io/media/games/053/053fc543bf488349610f1ae2d0c1b51b.jpg',
    parentPlatforms: ['pc', 'playstation', 'xbox'],
    completedCount: 1,
} as Game;

const meta = {
    title: 'Components/GameCard',
    component: GameCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
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
        isAdded: false,
        currentStatus: undefined,
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
        isAdded: false,
        currentStatus: undefined,
    },
};

export const Owned: Story = {
    args: {
        isAdded: true,
        currentStatus: 'owned' satisfies LibraryStatus,
    },
};

export const Playing: Story = {
    args: {
        isAdded: true,
        currentStatus: 'playing' satisfies LibraryStatus,
    },
};

export const Completed: Story = {
    args: {
        isAdded: true,
        currentStatus: 'completed' satisfies LibraryStatus,
    },
};

export const Wishlist: Story = {
    args: {
        isAdded: true,
        currentStatus: 'wishlist' satisfies LibraryStatus,
    },
};

export const MultipleCompletions: Story = {
    args: {
        game: {
            ...mockGame,
            completedCount: 3,
        },
        isAdded: true,
        currentStatus: 'completed' satisfies LibraryStatus,
    },
};

export const NoCompletions: Story = {
    args: {
        game: {
            ...mockGame,
            completedCount: 0,
        },
        isAdded: false,
        currentStatus: undefined,
    },
};

export const ManyPlatforms: Story = {
    args: {
        game: {
            ...mockGame,
            parentPlatforms: ['pc', 'playstation', 'xbox', 'nintendo', 'mac'],
        },
        isAdded: false,
        currentStatus: undefined,
    },
};

export const WithoutPlatformChips: Story = {
    args: {
        hidePlatformChips: true,
    },
};

export const MenuOpen: Story = {
    args: {
        isAdded: true,
        currentStatus: 'completed' satisfies LibraryStatus,
        open: true,
    },
};