import Visualizer from "@/components/visualizer";
import { GRID_ROWS, GRID_COLS } from "@/constants";
import { createRandomGrid } from "@/gridFunctions";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl text-center font-robotomono mb-6 md:mb-9">
        Pathfinding Visualizer
      </h1>
      <div className="-z-20 bg-[url('/tech-pattern.svg')] bg-cover bg-center bg-no-repeat absolute inset-0 opacity-60 before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-transparent before:to-background"></div>
      <Visualizer initialGrid={createRandomGrid(GRID_ROWS, GRID_COLS)} />
    </main>
  );
}
