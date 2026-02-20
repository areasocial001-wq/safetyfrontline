export interface Risk {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  size: number; // size in pixels
  description: string;
  severity: 'low' | 'medium' | 'high';
  points: number;
}

export interface Scenario {
  id: string;
  type: 'office' | 'warehouse' | 'general';
  title: string;
  description: string;
  imageUrl: string;
  risks: Risk[];
  timeLimit: number; // seconds
}

export interface GameSession {
  scenario: Scenario;
  startTime: number;
  risksFound: string[];
  score: number;
  completed: boolean;
}
