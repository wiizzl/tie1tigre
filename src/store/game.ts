import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const highScoreAtom = atomWithStorage("highscore", 0);
const currentScoreAtom = atom(0);
const isGameOverAtom = atom(false);

export { currentScoreAtom, highScoreAtom, isGameOverAtom };
