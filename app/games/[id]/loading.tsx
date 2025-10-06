// app/games/[id]/loading.tsx
export default function Loading() {
    return (
        <div className="p-6 max-w-5xl mx-auto animate-pulse">
            <div className="h-64 rounded-xl bg-white/10" />
            <div className="mt-4 h-6 w-2/3 rounded bg-white/10" />
            <div className="mt-2 h-4 w-1/2 rounded bg-white/10" />
        </div>
    );
}
