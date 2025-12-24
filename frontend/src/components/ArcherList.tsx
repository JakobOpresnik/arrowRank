import {
  Divider,
  Dropdown,
  Input,
  LinearProgress,
  Menu,
  MenuButton,
  MenuItem,
  Stack,
  Table,
  Tooltip,
  Typography,
} from '@mui/joy';
import EditIcon from '@mui/icons-material/Edit';
import { useMemo, useState, useCallback, type ChangeEvent } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import {
  getScores,
  calculateTotalScore,
  useAdvancedArcherSorting,
} from '../hooks/useAdvancedArcherSorting';
import { useArchersFiltered } from '../hooks/useArchersFiltered';
import { useArchersUpdateScore } from '../hooks/useArchersUpdateScore';
import { useDeleteArcher } from '../hooks/useDeleteArcher';
import i18n from '../i18n';
import { useFilterStore } from '../stores/useFilterStore';
import {
  scoreKeys,
  Archer,
  ArcherScores,
  ArcherExtended,
  ArcherListProps,
} from '../types';
import MissingDataWrapper from './MissingDataWrapper';
import DeleteArcher from './modals/DeleteArcher';
import EditArcher from './modals/EditArcher';
import SelectAgeGroup from './SelectAgeGroup';
import SelectCategory from './SelectCategory';
import SelectClub from './SelectClub';
import SelectGender from './SelectGender';

export const SORTING = 'desc';
const NUM_OF_FIXED_COLS = 7;
const NUM_OF_SCORE_COLS = scoreKeys.length + 1 + 1; // +1 for TOTAL, +1 for actions

// compute score array for an archer
function getScoreArray(archer: Archer): number[] {
  const scores: ArcherScores = getScores(archer);
  return scoreKeys.map(
    (key) => scores[`score${key}` as keyof ArcherScores] ?? 0
  );
}

// check if two score arrays and totals are identical
function isSameScore(
  total: number,
  scoreArray: number[],
  lastTotal: number,
  lastScoreArray: number[]
): boolean {
  return (
    total === lastTotal &&
    scoreArray.every(
      (value: number, index: number) => value === lastScoreArray[index]
    )
  );
}

export const computeArcherRanks = (
  sortedArchers: Archer[]
): ArcherExtended[] => {
  let lastTotal = -1;
  let lastRank = 0;
  let sameRankCount = 0;
  let lastScoreArray: number[] = [];

  return sortedArchers.map((archer: Archer) => {
    const scoreArray: number[] = getScoreArray(archer);
    const total: number = calculateTotalScore(getScores(archer));
    const isScoreZero: boolean = total < 0;

    let rank: number | null;
    if (isScoreZero) {
      rank = null;
    } else if (isSameScore(total, scoreArray, lastTotal, lastScoreArray)) {
      rank = lastRank;
      sameRankCount++;
    } else {
      rank = lastRank + sameRankCount + 1;
      lastRank = rank;
      sameRankCount = 0;
      lastTotal = total;
      lastScoreArray = scoreArray;
    }

    return { ...archer, total, scoreArray, rank };
  });
};

const ArcherList = ({
  allArchers,
  selectedCompetition,
  selectedFilters,
  isLoadingArchers,
}: ArcherListProps) => {
  const { t } = useTranslation();
  const { club, category, gender, ageGroup } = selectedFilters;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [deletingRow, setDeletingRow] = useState<number | null>(null);

  const { mutate: updateScore } = useArchersUpdateScore(
    selectedCompetition ?? 0
  );
  const { mutate: deleteArcher } = useDeleteArcher();
  const {
    setClubFilter,
    setCategoryFilter,
    setGenderFilter,
    setAgeGroupFilter,
  } = useFilterStore();

  // memoized translations
  const translations = useMemo(
    () => ({
      tableFirstName: t('tableFirstName'),
      tableLastName: t('tableLastName'),
      tableClub: t('tableClub'),
      tableCategory: t('tableCategory'),
      tableGender: t('tableGender'),
      tableAgeGroup: t('tableAgeGroup'),
      tableScore: t('tableScore'),
      tableScoreTotal: t('tableScoreTotal'),
      tableEditButton: t('tableEditButton'),
      tableDeleteButton: t('tableDeleteButton'),
      noArchersFoundForFilters: t('noArchersFoundForFilters'),
      archersSearch: t('archersSearch'),
      progressBarTooltip: t('progressBarTooltip'),
      progressBarAbsNumberTooltip: t('progressBarAbsNumberTooltip'),
      progressBarDoing: t('progressBarDoing'),
      progressBarDone: t('progressBarDone'),
    }),
    [t]
  );

  // get all unique clubs from all archers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clubs: string[] = [
    'All',
    ...Array.from(
      new Set(allArchers?.map((archer: Archer) => archer.club).filter(Boolean))
    ),
  ];

  // filter archers with any scores
  const archersWithScores: Archer[] = useMemo(() => {
    if (!allArchers) return [];
    return allArchers.filter((archer: Archer) =>
      scoreKeys.some((key) => archer[`score${key}` as keyof Archer] !== null)
    );
  }, [allArchers]);

  const progress: number = useMemo(
    () =>
      Math.round(
        (archersWithScores.length / (allArchers?.length || 1)) * 1000
      ) / 10,
    [archersWithScores.length, allArchers?.length]
  );

  // filter archers
  const {
    data: archersFiltered,
    isLoading: isLoadingFilteredArchers,
    error,
  } = useArchersFiltered(
    selectedCompetition,
    club ?? '',
    category ?? '',
    gender ?? '',
    ageGroup ?? '',
    SORTING
  );

  const searchedArchers: Archer[] = useMemo(() => {
    if (!archersFiltered) return [];
    const term: string = searchTerm.toLowerCase();
    return archersFiltered.filter((archer: Archer) =>
      `${archer.first_name} ${archer.last_name}`.toLowerCase().includes(term)
    );
  }, [archersFiltered, searchTerm]);

  // sort archers
  const sortedArchers: Archer[] = useAdvancedArcherSorting(searchedArchers);

  const numTableColumns: number = NUM_OF_FIXED_COLS + NUM_OF_SCORE_COLS;

  // Table head component memoized
  const TableHead = useMemo(() => {
    const headerKeys: (string | number)[] = [
      translations.tableScoreTotal,
      ...scoreKeys,
    ];
    return (
      <thead>
        <tr>
          <th rowSpan={2} style={{ width: 25, verticalAlign: 'middle' }}>
            <Typography level='body-md'>#</Typography>
          </th>
          <th rowSpan={2} style={{ width: 120, verticalAlign: 'middle' }}>
            <Typography level='body-md'>
              {translations.tableFirstName}
            </Typography>
          </th>
          <th rowSpan={2} style={{ width: 140, verticalAlign: 'middle' }}>
            <Typography level='body-md'>
              {translations.tableLastName}
            </Typography>
          </th>
          <th rowSpan={2} style={{ width: 150, verticalAlign: 'middle' }}>
            <Stack direction='column' spacing={1.5}>
              <Typography level='body-md'>{translations.tableClub}</Typography>
              <SelectClub
                competitionId={selectedCompetition}
                clubs={clubs}
                selectedClub={club ?? ''}
                onChange={setClubFilter}
              />
            </Stack>
          </th>
          <th rowSpan={2} style={{ width: 120, verticalAlign: 'middle' }}>
            <Stack direction='column' spacing={1.5}>
              <Typography level='body-md' sx={{ whiteSpace: 'pre-line' }}>
                {translations.tableAgeGroup}
              </Typography>
              <SelectAgeGroup
                competitionId={selectedCompetition}
                selectedAgeGroup={ageGroup ?? ''}
                onChange={setAgeGroupFilter}
              />
            </Stack>
          </th>
          <th rowSpan={2} style={{ width: 100, verticalAlign: 'middle' }}>
            <Stack direction='column' spacing={1.5}>
              <Typography level='body-md'>
                {translations.tableGender}
              </Typography>
              <SelectGender
                competitionId={selectedCompetition}
                selectedGender={gender ?? ''}
                onChange={setGenderFilter}
              />
            </Stack>
          </th>
          <th rowSpan={2} style={{ width: 160, verticalAlign: 'middle' }}>
            <Stack direction='column' spacing={1.5}>
              <Typography level='body-md'>
                {translations.tableCategory}
              </Typography>
              <SelectCategory
                competitionId={selectedCompetition}
                selectedCategory={category ?? ''}
                onChange={setCategoryFilter}
              />
            </Stack>
          </th>
          <th colSpan={12} style={{ verticalAlign: 'middle' }}>
            <Typography level='body-md'>{translations.tableScore}</Typography>
          </th>
          <th rowSpan={2} style={{ width: 60, verticalAlign: 'middle' }}>
            <ManageAccountsIcon sx={{ width: 28, height: 28 }} />
          </th>
        </tr>
        <tr>
          {headerKeys.map((score: string | number, index: number) => (
            <th
              key={`${index}-${score}`}
              style={{ verticalAlign: 'middle' }}
              colSpan={score === translations.tableScoreTotal ? 2 : 1}
            >
              <Typography level='body-md'>{score}</Typography>
            </th>
          ))}
        </tr>
      </thead>
    );
  }, [
    translations,
    selectedCompetition,
    club,
    category,
    gender,
    ageGroup,
    setClubFilter,
    setCategoryFilter,
    setGenderFilter,
    setAgeGroupFilter,
    clubs,
  ]);

  // Table body memoized
  const TableBody = useMemo(() => {
    const rankedArchers: ArcherExtended[] = computeArcherRanks(sortedArchers);
    return (
      <tbody>
        {sortedArchers.length > 0 ? (
          rankedArchers.map((archer: ArcherExtended) => (
            <tr
              key={archer.id}
              className={archer.total < 0 ? 'zero-score' : ''}
            >
              <td>{archer.rank}</td>
              <td>{archer.first_name}</td>
              <td>{archer.last_name}</td>
              <td>{archer.club}</td>
              <td>{archer.age_group}</td>
              <td>{archer.gender}</td>
              <td>{archer.category}</td>
              <td colSpan={2}>{archer.total >= 0 ? archer.total : ''}</td>
              {scoreKeys.map((points) => (
                <td key={points}>
                  {(archer[`score${points}` as keyof ArcherScores] ?? 0) > 0
                    ? archer[`score${points}` as keyof ArcherScores]
                    : ''}
                </td>
              ))}
              <td>
                <Dropdown>
                  <MenuButton variant='plain' color='neutral'>
                    <MoreHorizIcon
                      style={{ width: 26, height: 26, cursor: 'pointer' }}
                    />
                  </MenuButton>
                  <Menu sx={{ width: 120 }}>
                    <Stack direction='column' spacing={1}>
                      <MenuItem onClick={() => setEditingRow(archer.id)}>
                        <Stack
                          direction='row'
                          alignItems='center'
                          spacing={1.5}
                        >
                          <EditIcon
                            style={{
                              width: 24,
                              height: 24,
                              cursor: 'pointer',
                            }}
                            color='primary'
                          />
                          <Typography level='body-md' color='primary'>
                            {translations.tableEditButton}
                          </Typography>
                        </Stack>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={() => setDeletingRow(archer.id)}>
                        <Stack
                          direction='row'
                          alignItems='center'
                          spacing={1.5}
                        >
                          <DeleteIcon
                            style={{
                              width: 24,
                              height: 24,
                              cursor: 'pointer',
                              color: '#F54242',
                            }}
                          />
                          <Typography level='body-md' sx={{ color: '#F54242' }}>
                            {translations.tableDeleteButton}
                          </Typography>
                        </Stack>
                      </MenuItem>
                    </Stack>
                  </Menu>
                </Dropdown>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={numTableColumns + 1}>
              <Typography color='neutral'>
                {translations.noArchersFoundForFilters}
              </Typography>
            </td>
          </tr>
        )}
      </tbody>
    );
  }, [sortedArchers, translations, numTableColumns, computeArcherRanks]);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch: () => void = useCallback(() => setSearchTerm(''), []);

  // format progress number (decimal) according to locale
  const formattedProgress: string = new Intl.NumberFormat(i18n.language, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(progress);

  return (
    <MissingDataWrapper
      data={archersFiltered}
      isLoading={isLoadingFilteredArchers && isLoadingArchers}
      error={error}
      isTable
    >
      <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
        <Input
          id='search-archers'
          name='search-archers'
          type='text'
          placeholder={translations.archersSearch}
          startDecorator={<SearchIcon color='primary' sx={{ mt: -0.35 }} />}
          endDecorator={
            searchTerm && (
              <ClearIcon
                color='error'
                sx={{ cursor: 'pointer' }}
                onClick={clearSearch}
              />
            )
          }
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ height: 30, width: 330, borderRadius: 8, padding: 1 }}
        />

        <Tooltip
          title={translations.progressBarTooltip}
          placement='bottom'
          variant='solid'
          arrow
          sx={{ marginBottom: 5 }}
        >
          <LinearProgress
            determinate
            variant='solid'
            size='md'
            thickness={36}
            value={progress}
            sx={{
              width: '100%',
              borderWidth: 2,
              borderColor: '#FFF',
              color: progress >= 100 ? '#5CD45B' : '#449bf2',
              borderRadius: 8,
            }}
          >
            <Typography
              level='body-sm'
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                zIndex: 100,
                color: '#000',
                wordSpacing: 5,
                cursor: 'default',
              }}
            >
              {progress >= 100
                ? translations.progressBarDone
                : `${translations.progressBarDoing} ${formattedProgress}%`}
            </Typography>
          </LinearProgress>
        </Tooltip>

        <Stack
          direction='row'
          alignItems='center'
          gap={2}
          px={2}
          borderRadius={8}
          bgcolor={progress >= 100 ? '#5CD45B' : '#C7DFF7'}
        >
          <PeopleAltIcon sx={{ color: '#000' }} />
          <Tooltip
            title={translations.progressBarAbsNumberTooltip}
            placement='bottom'
            variant='solid'
            arrow
            sx={{ marginBottom: 5 }}
          >
            <Typography
              alignContent='center'
              // px={2}
              fontSize='1.1rem'
              fontWeight={600}
              sx={{ color: '#000', cursor: 'default' }}
            >
              {archersWithScores.length} / {allArchers?.length}
            </Typography>
          </Tooltip>
        </Stack>
      </Stack>

      <Table
        border={1}
        cellPadding={2}
        sx={{
          borderRadius: '8px',
          overflow: 'hidden',
          '& th': {
            backgroundColor: '#9CC1FF',
            color: '#333',
            padding: '8px',
            textAlign: 'center',
          },
          '& td': {
            backgroundColor: '#D4E4FF',
            color: '#333',
            padding: '8px',
            textAlign: 'center',
            fontSize: '16px',
          },
          '& tr.zero-score td': { backgroundColor: '#FFDCDC' },
        }}
      >
        {TableHead}
        {TableBody}
      </Table>

      <EditArcher
        open={!!editingRow}
        selectedCompetition={selectedCompetition}
        selectedArcherId={editingRow}
        onArcherUpdate={updateScore}
        onClose={() => setEditingRow(null)}
      />

      <DeleteArcher
        open={!!deletingRow}
        archerId={deletingRow!}
        onDelete={deleteArcher}
        onClose={() => setDeletingRow(null)}
      />
    </MissingDataWrapper>
  );
};

export default ArcherList;
