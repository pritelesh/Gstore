"use client";

import { useRef, useState } from "react";
import { CloudRain, Sun, Snowflake } from "lucide-react";

export type Season = "rainy" | "summer" | "winter";

interface SeasonSelectorProps {
  selectedSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const SEASONS: Season[] = ["rainy", "summer", "winter"];
const STOP_PCT = [0, 50, 100];

export default function SeasonSelector({ selectedSeason, onSeasonChange }: SeasonSelectorProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const idx = SEASONS.indexOf(selectedSeason);
  const knobPct = STOP_PCT[idx];

  const snap = useRef((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    let min = Infinity, best = 0;
    STOP_PCT.forEach((s, i) => { const d = Math.abs(pct - s); if (d < min) { min = d; best = i; } });
    onSeasonChange(SEASONS[best]);
  }).current;

  const down = (e: React.PointerEvent) => {
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    snap(e.clientX);
  };
  const move = (e: React.PointerEvent) => { if (dragging) snap(e.clientX); };
  const up = () => setDragging(false);

  const Icon = selectedSeason === "rainy" ? CloudRain : selectedSeason === "summer" ? Sun : Snowflake;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        ref={trackRef}
        className="relative h-[90px] rounded-full px-5 select-none cursor-pointer mx-auto"
        style={{ maxWidth: "700px", width: "100%", background: "#2F3D9A", boxShadow: "8px 8px 16px rgba(0,0,0,0.45), -8px -8px 16px rgba(255,255,255,0.06)" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-l-full transition-all duration-300"
          style={{ width: `${knobPct}%`, background: "#FE7F2D" }}
        />

        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#293681" }}>
          <CloudRain size={20} color="#FAFFC4" />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#293681" }}>
          <Sun size={20} color="#FAFFC4" />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-full left-full w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "#293681" }}>
          <Snowflake size={20} color="#FAFFC4" />
        </div>

        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[70px] h-[70px] rounded-full flex items-center justify-center transition-all duration-300"
          style={{ left: `${knobPct}%`, background: "#FAFFC4", boxShadow: "4px 6px 12px rgba(0,0,0,0.3)" }}
        >
          <Icon size={28} color="#293681" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: "#FE7F2D" }} />
        <span className="text-sm font-semibold tracking-widest text-text">{selectedSeason.toUpperCase()} SELECTED</span>
      </div>
    </div>
  );
}