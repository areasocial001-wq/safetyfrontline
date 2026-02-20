import { Trophy, Zap, Shield, Target, Map, Award, Droplets } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  rarity: "common" | "rare" | "epic" | "legendary";
  condition: (stats: GameStats) => boolean;
}

export interface GameStats {
  risksFound: number;
  totalRisks: number;
  criticalRisksFound: number;
  totalCriticalRisks: number;
  timeElapsed: number;
  collisions: number;
  exploredCells: Set<string>;
  totalCells: number;
  riskFoundOrder: string[]; // Array of risk IDs in order found
  sprinklerRisksFound?: number; // Risks found while sprinklers active
}

export const achievements: Achievement[] = [
  {
    id: "speed_demon",
    name: "Demone della Velocità",
    description: "Completa lo scenario in meno di 2 minuti",
    icon: Zap,
    rarity: "epic",
    condition: (stats) =>
      stats.risksFound === stats.totalRisks && stats.timeElapsed < 120,
  },
  {
    id: "flawless",
    name: "Impeccabile",
    description: "Completa senza alcuna collisione",
    icon: Shield,
    rarity: "rare",
    condition: (stats) =>
      stats.risksFound === stats.totalRisks && stats.collisions === 0,
  },
  {
    id: "priority_master",
    name: "Maestro delle Priorità",
    description: "Trova tutti i rischi critici per primi",
    icon: Target,
    rarity: "legendary",
    condition: (stats) => {
      if (stats.totalCriticalRisks === 0) return false;
      if (stats.riskFoundOrder.length < stats.totalCriticalRisks) return false;
      
      // Check if first N risks found were all critical
      const firstRisks = stats.riskFoundOrder.slice(0, stats.totalCriticalRisks);
      return firstRisks.length === stats.totalCriticalRisks;
    },
  },
  {
    id: "explorer",
    name: "Esploratore Completo",
    description: "Esplora il 100% della mappa",
    icon: Map,
    rarity: "rare",
    condition: (stats) => {
      const explorationPercentage = (stats.exploredCells.size / stats.totalCells) * 100;
      return explorationPercentage >= 100;
    },
  },
  {
    id: "under_pressure",
    name: "Sotto Pressione",
    description: "Trova 3+ rischi mentre gli sprinkler sono attivi",
    icon: Droplets,
    rarity: "epic",
    condition: (stats) => (stats.sprinklerRisksFound ?? 0) >= 3,
  },
  {
    id: "perfectionist",
    name: "Perfezionista",
    description: "Ottieni tutti gli altri achievement in una singola partita",
    icon: Trophy,
    rarity: "legendary",
    condition: (stats) => {
      return achievements
        .filter((a) => a.id !== "perfectionist")
        .every((a) => a.condition(stats));
    },
  },
  {
    id: "first_blood",
    name: "Primo Sangue",
    description: "Trova il tuo primo rischio",
    icon: Award,
    rarity: "common",
    condition: (stats) => stats.risksFound >= 1,
  },
];

export const getRarityColor = (rarity: Achievement["rarity"]) => {
  switch (rarity) {
    case "common":
      return "text-gray-500 border-gray-500";
    case "rare":
      return "text-blue-500 border-blue-500";
    case "epic":
      return "text-purple-500 border-purple-500";
    case "legendary":
      return "text-amber-500 border-amber-500";
  }
};

export const getRarityBg = (rarity: Achievement["rarity"]) => {
  switch (rarity) {
    case "common":
      return "bg-gray-500/10";
    case "rare":
      return "bg-blue-500/10";
    case "epic":
      return "bg-purple-500/10";
    case "legendary":
      return "bg-amber-500/10";
  }
};

export const getRarityLabel = (rarity: Achievement["rarity"]) => {
  switch (rarity) {
    case "common":
      return "Comune";
    case "rare":
      return "Raro";
    case "epic":
      return "Epico";
    case "legendary":
      return "Leggendario";
  }
};
