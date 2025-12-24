import { Archer, ArcherScores, scoreKeys } from '../types';

export const getScores: (archer: Archer) => ArcherScores = (
  archer: Archer
): ArcherScores => ({
  score20: archer.score20,
  score18: archer.score18,
  score16: archer.score16,
  score14: archer.score14,
  score12: archer.score12,
  score10: archer.score10,
  score8: archer.score8,
  score6: archer.score6,
  score4: archer.score4,
  score0: archer.score0,
});

export const calculateTotalScore: (scores: ArcherScores) => number = (
  scores: ArcherScores
) => {
  if (
    scoreKeys.every(
      (points) => scores[`score${points}` as keyof ArcherScores] === null
    )
  )
    return -1;
  return scoreKeys.reduce<number>(
    (sum, points) =>
      sum + (scores[`score${points}` as keyof ArcherScores] ?? 0) * points,
    0
  );
};

const applySorting = (unsortedArchers: Archer[]) => {
  return [...unsortedArchers].sort((a: Archer, b: Archer) => {
    const diff: number =
      calculateTotalScore(getScores(b)) - calculateTotalScore(getScores(a));
    if (diff !== 0) return diff;
    for (const p of scoreKeys) {
      const d: number =
        (b[`score${p}` as keyof ArcherScores] ?? 0) -
        (a[`score${p}` as keyof ArcherScores] ?? 0);
      if (d !== 0) return d;
    }
    return a.first_name.localeCompare(b.first_name);
  });
};

export const useAdvancedArcherSorting = (archers: Archer[]) => {
  const sortedArchers: Archer[] = applySorting(archers);
  return sortedArchers;
};
