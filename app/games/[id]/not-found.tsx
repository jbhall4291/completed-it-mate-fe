// app/games/[id]/not-found.tsx
export default function NotFound() {
    return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold">Game not found</h1>
            <p className=" mt-2">It may have been removed or never existed.</p>
        </div>
    );
}
