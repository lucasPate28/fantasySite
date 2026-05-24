import PlayerSearcher from "./components/PlayerSearcher"
export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#fff,#fff 1px,transparent 1px,transparent 48px),repeating-linear-gradient(90deg,#fff,#fff 1px,transparent 1px,transparent 48px)" }} />
 
        <PlayerSearcher />
      
    </div>
  );
}
