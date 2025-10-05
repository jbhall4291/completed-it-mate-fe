import GameSearch from "@/components/game/GameSearch";

export default function HomePage() {
  return (
    <main className="p-6 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-600">Home Page</h1>
      <p className="mt-4 text-gray-600">Welcome to Completed It Mate!</p>

      <GameSearch />
    </main>
  );
}
