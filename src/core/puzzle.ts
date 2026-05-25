export type SolutionPixel = 0 | 1;
export type PlayerPixel = "unknown" | "filled" | "crossed";
export type Difficulty = "starter" | "easy" | "medium" | "hard" | "expert";

export interface Puzzle {
  id: string;
  title: string;
  width: number;
  height: number;
  difficulty: Difficulty;
  pixels: SolutionPixel[][];
  tags?: string[];
}
