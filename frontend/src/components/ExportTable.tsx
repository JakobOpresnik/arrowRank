import { scoreKeys, type Archer, type ArcherScores } from '../types';

const ExportTable = (archers: Archer[]) => {
  if (!archers || archers.length === 0) return;

  // build sheet data
  const data = archers.map((archer) => {
    const scores: ArcherScores = {
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
    };

    const total = scoreKeys.every(
      (k) => (scores[`score${k}`] ?? undefined) === undefined
    )
      ? undefined
      : scoreKeys.reduce(
          (sum, key) => sum + (scores[`score${key}`] ?? 0) * key,
          0 as number
        );

    return {
      'First Name': archer.first_name,
      'Last Name': archer.last_name,
      Category: archer.category,
      Gender: archer.gender,
      'Age Group': archer.age_group,
      Total: total,
      ...scoreKeys.reduce((acc, k) => {
        acc[`Score ${k}`] = scores[`score${k}`] ?? '-';
        return acc;
      }, {} as Record<string, number | string>),
    };
  });

  return data;
};

export default ExportTable;
