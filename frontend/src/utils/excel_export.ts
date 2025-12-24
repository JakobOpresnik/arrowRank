import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { computeArcherRanks } from '../components/ArcherList';
import {
  Archer,
  ArcherExtended,
  ArcherScores,
  ExcelRow,
  scoreKeys,
} from '../types';

const exportTableToExcel = (archers: Archer[]): void => {
  if (!archers || archers.length === 0) return;

  const category = archers[0].category ?? '';
  const gender = archers[0].gender ?? '';
  const ageGroup = archers[0].age_group ?? '';
  const topHeaderText = `${category} ${gender} ${ageGroup}`
    .toUpperCase()
    .trim();

  // define column order
  const headers = [
    '#',
    'Name',
    'Club',
    'Total',
    ...scoreKeys.map((k) => `${k}`),
  ];

  const rankedArchers: ArcherExtended[] = computeArcherRanks(archers);

  // build data as array of arrays to preserve column order
  const rows: ExcelRow[] = rankedArchers.map((archer: ArcherExtended) => {
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

    const total: number | undefined = scoreKeys.every(
      (key) =>
        (scores[`score${key}` as keyof ArcherScores] ?? undefined) === undefined
    )
      ? undefined
      : scoreKeys.reduce((sum: number, key) => {
          const count = scores[`score${key}` as keyof ArcherScores] ?? 0;
          return sum + count * key;
        }, 0);

    // create row in exact column order
    return [
      archer.rank ?? '',
      `${archer.first_name} ${archer.last_name}`,
      archer.club,
      total ?? '',
      ...scoreKeys.map((k) => {
        const value = scores[`score${k}` as keyof ArcherScores];
        return value && value > 0 ? value : '';
      }),
    ];
  });

  // create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([]);

  // add top merged row
  XLSX.utils.sheet_add_aoa(worksheet, [[topHeaderText]], { origin: 0 });

  // merge top row
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
  ];

  // add header row
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 1 });

  // add data rows
  XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: 2 });

  // style header row
  for (let c = 0; c < headers.length; c++) {
    const cell = XLSX.utils.encode_cell({ r: 1, c });
    if (worksheet[cell]) {
      worksheet[cell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: 'FFD9EAD3' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };
    }
  }

  // create workbook and append sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Archers');

  // export
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'archers.xlsx');
};

export { exportTableToExcel };
