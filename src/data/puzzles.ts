import type { Puzzle } from "../core/puzzle";

export const puzzles: Puzzle[] = [
  {
    id: "starter-001",
    title: "Tiny Rocket",
    width: 5,
    height: 5,
    difficulty: "starter",
    pixels: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1],
    ],
    tags: ["starter", "space"],
  },
];
