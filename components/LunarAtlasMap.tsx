import { lunarStates } from "@/lib/moon-data";

export default function LunarAtlasMap() {
  return (
    <div className="relative mx-auto mt-12 aspect-square max-w-5xl overflow-hidden rounded-full border border-yellow-400/50 bg-black shadow-2xl">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f5f5f5_0%,#b8b8b8_25%,#5f5f5f_55%,#111_82%)]" />

      <div className="absolute inset-0 rounded-full opacity-50 bg-[radial-gradient(circle_at_30%_38%,transparent_0,transparent_7%,rgba(0,0,0,0.6)_8%,transparent_11%),radial-gradient(circle_at_58%_30%,transparent_0,transparent_5%,rgba(0,0,0,0.5)_6%,transparent_9%),radial-gradient(circle_at_55%_66%,transparent_0,transparent_8%,rgba(0,0,0,0.5)_9%,transparent_12%),radial-gradient(circle_at_42%_58%,transparent_0,transparent_4%,rgba(0,0,0,0.4)_5%,transparent_7%)]" />

      <div className="absolute inset-8 rounded-full border border-yellow-400/30" />
      <div className="absolute inset-20 rounded-full border border-yellow-400/20" />
      <div className="absolute left-1/2 top-8 h-[calc(100%-4rem)] border-l border-yellow-400/20" />
      <div className="absolute left-8 top-1/2 w-[calc(100%-4rem)] border-t border-yellow-400/20" />

      <div className="absolute inset-0">
        {lunarStates.slice(0, 57).map((state, index) => {
          const angle = (index / 57) * Math.PI * 2;
          const ring = index % 3;
          const radius = ring === 0 ? 28 : ring === 1 ? 36 : 44;

          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;

          return (
            <a
              key={state.name}
              href={`/states/${encodeURIComponent(state.name)}`}
              title={state.name}
              className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-yellow-400/60 bg-black/60 text-xs font-black text-yellow-300 backdrop-blur-sm transition hover:z-10 hover:scale-125 hover:bg-yellow-400 hover:text-black"
              style={{
                left: `${x}%`,
                top: `${y}%`,
              }}
            >
              {index + 1}
            </a>
          );
        })}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full border border-yellow-400/40 bg-black/70 px-5 py-2 text-sm font-bold text-yellow-300">
        Orbital One Lunar Atlas · 57 States
      </div>
    </div>
  );
}