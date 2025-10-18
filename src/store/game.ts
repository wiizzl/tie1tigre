import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// High score persisted in localStorage
export const highScoreAtom = atomWithStorage("highscore", 0);

// Current score
export const currentScoreAtom = atom(0);

// Game state
export const isGameOverAtom = atom(false);
