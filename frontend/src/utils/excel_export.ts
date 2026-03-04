import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import ptlLogoUrl from '../assets/ptl_logo.png';
import { computeArcherRanks } from '../components/ArcherList';
import { Archer, ArcherExtended, Competition, scoreKeys } from '../types';
import { BE_BASE_URL } from '../constants';
import sl from '../locales/sl/translations.json';

// ── Layout constants ──────────────────────────────────────────────────────────

// 1-indexed columns (exceljs convention)
const TOTAL_COLS = 14; // A–N
const FILL_COLS = 50; // white fill extends to column AX
const COL_RANK = 1; // A
const COL_NAME = 2; // B
const COL_CLUB = 3; // C
const COL_TOTAL = 4; // D
const COL_SCORES_START = 5; // E–N

// Header text area sits between the two logos (1-indexed)
const HDR_TEXT_START = 2; // B
const HDR_TEXT_END = 13; // M

// ── Colors ────────────────────────────────────────────────────────────────────

const WHITE = 'FFFFFFFF';
const BLACK = 'FF000000';

const whiteFill: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: WHITE },
};

const thinLine: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: { argb: BLACK },
};
const mediumLine: Partial<ExcelJS.Border> = {
  style: 'medium',
  color: { argb: BLACK },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const SL: Record<string, string> = {
  barebow: sl.tableCategoryBarebow,
  'long bow': sl.tableCategoryLongbow,
  'traditional bow': sl.tableCategoryTraditionalbow,
  'primitive bow': sl.tableCategoryPrimitivebow,
  guest: sl.tableCategoryGuest,
  male: sl.tableGenderMale,
  female: sl.tableGenderFemale,
  mixed: sl.tableGenderMixed,
  adults: '',
  u10: sl.tableAgeGroupU10,
  u15: sl.tableAgeGroupU15,
};

function getCategoryLabel(archer: Archer): string {
  const translate = (s: string) => SL[s.toLowerCase()] ?? s;
  return [archer.age_group, archer.gender, archer.category]
    .map(translate)
    .filter(Boolean)
    .join(' ')
    .trim()
    .toUpperCase();
}

function groupByCategory(archers: Archer[]): Map<string, Archer[]> {
  const map = new Map<string, Archer[]>();
  for (const archer of archers) {
    const key = getCategoryLabel(archer);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(archer);
  }
  return map;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
}

function computeTotal(archer: ArcherExtended): number | '' {
  const hasAny = scoreKeys.some(
    (k) => (archer[`score${k}` as keyof Archer] as number | undefined) != null,
  );
  if (!hasAny) return '';
  return scoreKeys.reduce<number>(
    (sum, k) =>
      sum + ((archer[`score${k}` as keyof Archer] as number) ?? 0) * k,
    0,
  );
}

async function fetchBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

// Fetches a logo from the backend via a base64 JSON endpoint to avoid CORS issues
async function fetchLogoBuffer(logoUrl: string): Promise<ArrayBuffer | null> {
  try {
    const filename = logoUrl.split('/logos/')[1];
    if (!filename) return null;
    const res = await fetch(`${BE_BASE_URL}/logos/${filename}/base64`);
    if (!res.ok) return null;
    const { data } = (await res.json()) as { data: string };
    const binary = atob(data);
    const buffer = new ArrayBuffer(binary.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
    return buffer;
  } catch {
    return null;
  }
}

function applyWhite(cell: ExcelJS.Cell) {
  if (!(cell.fill as ExcelJS.Fill & { fgColor?: unknown })?.fgColor) {
    cell.fill = whiteFill;
  }
}

// ── Main export function ──────────────────────────────────────────────────────

const exportTableToExcel = async (
  archers: Archer[],
  competition?: Competition | null,
): Promise<void> => {
  if (!archers || archers.length === 0) return;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Rezultati');

  ws.columns = [
    { width: 5 }, // A rank
    { width: 26 }, // B name
    { width: 22 }, // C club
    { width: 9 }, // D total
    ...scoreKeys.map(() => ({ width: 5 })), // E–N scores
    ...Array(FILL_COLS - TOTAL_COLS).fill({ width: 8 }), // extra white cols
  ];

  let r = 1; // 1-indexed

  // ── Row 1: top padding ─────────────────────────────────────────────────────
  ws.getRow(r).height = 10;
  r++;

  // ── Rows 2-3: competition header text ──────────────────────────────────────
  const headerImageStartRow = r; // used for image placement

  if (competition) {
    // const orgLine = competition.organizer
    //   ? competition.organizer
    //   : competition.name;

    // const orgCell = ws.getCell(r, HDR_TEXT_START);
    // orgCell.value = orgLine;
    // orgCell.font = { name: 'Calibri', size: 13, color: { argb: BLACK } };
    // orgCell.fill = whiteFill;
    // orgCell.alignment = { horizontal: 'center', vertical: 'middle' };
    // ws.mergeCells(r, HDR_TEXT_START, r, HDR_TEXT_END);
    // ws.getRow(r).height = 22;
    // r++;

    const eventCell = ws.getCell(r, HDR_TEXT_START);
    eventCell.value = `Pokal tradicionalnih lokov\n${competition.location} ${formatDate(competition.date)}`;
    eventCell.font = { name: 'Calibri', size: 12, color: { argb: BLACK } };
    eventCell.fill = whiteFill;
    eventCell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true,
    };
    ws.mergeCells(r, HDR_TEXT_START, r, HDR_TEXT_END);
    ws.getRow(r).height = 36;
    r++;
  }

  const headerImageEndRow = r; // exclusive

  // ── Logos (tl/br are 0-indexed in exceljs image API) ─────────────────────
  const imgTlRow = headerImageStartRow - 1;
  const imgBrRow = headerImageEndRow - 1;

  const ptlBuffer = await fetchBuffer(ptlLogoUrl);
  if (ptlBuffer) {
    const id = wb.addImage({ buffer: ptlBuffer, extension: 'png' });
    // PTL logo is 247×322 portrait; span 2.5 score cols for a bit more width
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ws.addImage(id, {
      tl: { col: TOTAL_COLS - 1.7, row: imgTlRow },
      br: { col: TOTAL_COLS, row: imgBrRow },
      editAs: 'oneCell',
    } as any);
  }

  if (competition?.logo_url) {
    const orgBuffer = await fetchLogoBuffer(competition.logo_url);
    if (orgBuffer) {
      const ext = competition.logo_url.split('.').pop() ?? 'png';
      const id = wb.addImage({
        buffer: orgBuffer,
        extension: ext as 'png' | 'jpeg' | 'gif',
      });
      // Use fixed pixel size so the organizer logo isn't distorted regardless of column widths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ws.addImage(id, {
        tl: { col: 0.1, row: imgTlRow },
        ext: { width: 110, height: 80 },
      } as any);
    }
  }

  // ── Empty rows ─────────────────────────────────────────────────────────────
  for (let i = 0; i < 4; i++) {
    ws.getRow(r).height = 8;
    r++;
  }

  // ── REZULTATI title ────────────────────────────────────────────────────────
  const rezCell = ws.getCell(r, 1);
  rezCell.value = 'REZULTATI';
  rezCell.font = {
    name: 'Calibri',
    size: 22,
    bold: false,
    color: { argb: BLACK },
  };
  rezCell.fill = whiteFill;
  rezCell.alignment = { horizontal: 'center', vertical: 'middle' };
  rezCell.border = {
    top: mediumLine,
    bottom: mediumLine,
    left: mediumLine,
    right: mediumLine,
  };
  ws.mergeCells(r, 1, r, TOTAL_COLS);
  for (let c = 2; c <= TOTAL_COLS; c++) {
    const mc = ws.getCell(r, c);
    mc.fill = whiteFill;
    mc.border = {
      top: mediumLine,
      bottom: mediumLine,
      ...(c === TOTAL_COLS ? { right: mediumLine } : {}),
    };
  }
  ws.getRow(r).height = 38;
  r++;

  // ── Empty rows after title ─────────────────────────────────────────────────
  for (let i = 0; i < 2; i++) {
    ws.getRow(r).height = 8;
    r++;
  }

  // ── Category groups ────────────────────────────────────────────────────────
  const groups = groupByCategory(archers);
  const colHeaders: (string | number)[] = [
    'Št.',
    'Ime in priimek',
    'Klub',
    'Rezultat',
    ...scoreKeys,
  ];

  for (const [label, groupArchers] of groups) {
    // Category header
    const catCell = ws.getCell(r, 1);
    catCell.value = label;
    catCell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: BLACK },
    };
    catCell.fill = whiteFill;
    catCell.alignment = { horizontal: 'center', vertical: 'middle' };
    catCell.border = { bottom: thinLine };
    ws.mergeCells(r, 1, r, TOTAL_COLS);
    for (let c = 2; c <= TOTAL_COLS; c++) {
      const mc = ws.getCell(r, c);
      mc.fill = whiteFill;
      mc.border = { bottom: thinLine };
    }
    ws.getRow(r).height = 18;
    r++;

    // Column headers
    colHeaders.forEach((header, ci) => {
      const col = ci + 1;
      const isNumeric = col >= COL_TOTAL || col === COL_RANK;
      const cell = ws.getCell(r, col);
      cell.value = header;
      cell.font = {
        name: 'Calibri',
        size: 11,
        bold: col !== COL_RANK,
        color: { argb: BLACK },
      };
      cell.fill = whiteFill;
      cell.alignment = {
        horizontal: isNumeric ? 'center' : 'left',
        vertical: 'middle',
      };
      cell.border = { bottom: thinLine };
    });
    ws.getRow(r).height = 15;
    r++;

    // Data rows
    const ranked: ArcherExtended[] = computeArcherRanks(groupArchers);
    ranked.forEach((archer, idx) => {
      const isLast = idx === ranked.length - 1;
      const bottomBorder = isLast ? { bottom: thinLine } : {};

      const setCell = (
        col: number,
        value: string | number,
        align: 'left' | 'center' = 'left',
        bold = false,
      ) => {
        const cell = ws.getCell(r, col);
        cell.value = value;
        cell.font = { name: 'Calibri', size: 11, bold, color: { argb: BLACK } };
        cell.fill = whiteFill;
        cell.alignment = { horizontal: align, vertical: 'middle' };
        cell.border = { ...bottomBorder };
      };

      const rank = archer.rank ?? idx + 1;
      const total = computeTotal(archer);

      setCell(COL_RANK, rank, 'center');
      setCell(COL_NAME, `${archer.first_name} ${archer.last_name}`, 'left');
      setCell(COL_CLUB, archer.club, 'left');
      setCell(COL_TOTAL, total, 'center', true);
      scoreKeys.forEach((k, si) => {
        const v = archer[`score${k}` as keyof Archer] as number | undefined;
        setCell(COL_SCORES_START + si, v && v > 0 ? v : '', 'center');
      });

      ws.getRow(r).height = 15;
      r++;
    });

    ws.getRow(r).height = 10;
    r++;
  }

  // ── Fill all remaining cells white ─────────────────────────────────────────
  for (let row = 1; row < r; row++) {
    for (let col = 1; col <= FILL_COLS; col++) {
      applyWhite(ws.getCell(row, col));
    }
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf as ArrayBuffer], {
    type: 'application/octet-stream',
  });
  const filename = competition
    ? `${competition.name}_rezultati.xlsx`
    : 'rezultati.xlsx';
  saveAs(blob, filename);
};

export { exportTableToExcel };
