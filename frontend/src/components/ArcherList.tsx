import {
  Divider,
  Menu,
  TextInput,
  Stack,
  Table,
  Tooltip,
  Text,
  Progress,
  ActionIcon,
  Group,
  Paper,
} from '@mantine/core';
import {
  IconEdit,
  IconSearch,
  IconX,
  IconDots,
  IconSettings,
  IconUsers,
  IconTrash,
} from '@tabler/icons-react';
import { useMemo, useState, useCallback, type ChangeEvent } from 'react';
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
  DeletionAction,
  FilterableColumn,
} from '../types';
import MissingDataWrapper from './MissingDataWrapper';
import DeleteArcher from './modals/DeleteArcher';
import EditArcher from './modals/EditArcher';
import SelectAgeGroup from './SelectAgeGroup';
import SelectCategory from './SelectCategory';
import SelectClub from './SelectClub';
import SelectGender from './SelectGender';
import { capitalize, removeSpaces } from '@/utils/text_utils';
import { useArcherClearScore } from '@/hooks/useArcherClearScore';

export const SORTING = 'desc';
const NUM_OF_FIXED_COLS = 7;
const NUM_OF_SCORE_COLS = scoreKeys.length + 1 + 1;

function getScoreArray(archer: Archer): number[] {
  const scores: ArcherScores = getScores(archer);
  return scoreKeys.map(
    (key) => scores[`score${key}` as keyof ArcherScores] ?? 0
  );
}

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
  const { mutate: clearArcherScore } = useArcherClearScore();
  const { mutate: deleteArcher } = useDeleteArcher();
  const {
    setClubFilter,
    setCategoryFilter,
    setGenderFilter,
    setAgeGroupFilter,
  } = useFilterStore();

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

  const getTranslation = (column: FilterableColumn, value: string): string => {
    const capitalizedValue: string = capitalize(value);
    const formattedValue: string = removeSpaces(capitalizedValue);
    switch (column) {
      case 'age':
        return t(`tableAgeGroup${formattedValue}`);
      case 'gender':
        return t(`tableGender${formattedValue}`);
      case 'category':
        return t(`tableCategory${formattedValue}`);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const clubs: string[] = [
    'All',
    ...Array.from(
      new Set(allArchers?.map((archer: Archer) => archer.club).filter(Boolean))
    ),
  ];

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

  const sortedArchers: Archer[] = useAdvancedArcherSorting(searchedArchers);

  const numTableColumns: number = NUM_OF_FIXED_COLS + NUM_OF_SCORE_COLS;

  const headerKeys: (string | number)[] = [
    translations.tableScoreTotal,
    ...scoreKeys,
  ];

  const rankedArchers: ArcherExtended[] = useMemo(
    () => computeArcherRanks(sortedArchers),
    [sortedArchers]
  );

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch: () => void = useCallback(() => setSearchTerm(''), []);

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
      <Group gap='md' mb='md' align='center'>
        <TextInput
          placeholder={translations.archersSearch}
          leftSection={<IconSearch size={16} color='gray' />}
          rightSection={
            searchTerm ? (
              <IconX
                size={14}
                style={{ cursor: 'pointer', opacity: 0.5 }}
                onClick={clearSearch}
              />
            ) : undefined
          }
          value={searchTerm}
          onChange={handleSearchChange}
          w={300}
          size='sm'
        />

        <Tooltip label={translations.progressBarTooltip} position='bottom'>
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <Progress.Root size={32} radius='md'>
                <Progress.Section
                  value={progress}
                  color={progress >= 100 ? '#4abe4a' : 'brand.4'}
                />
              </Progress.Root>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                color: '#fff',
                textShadow: '0 0 4px rgba(0,0,0,0.7), 0 0 8px rgba(0,0,0,0.4)',
                pointerEvents: 'none',
              }}>
                {progress >= 100
                  ? translations.progressBarDone
                  : `${translations.progressBarDoing} ${formattedProgress}%`}
              </div>
            </div>
          </div>
        </Tooltip>

        <Tooltip label={translations.progressBarAbsNumberTooltip} position='bottom'>
          <Paper
            px='sm'
            py={4}
            radius='md'
            style={{
              backgroundColor: progress >= 100
                ? '#d4f5d4'
                : 'var(--mantine-color-brand-8)',
              color: progress >= 100 ? '#1a1a1a' : '#f0f0f0',
            }}
          >
            <Group gap='xs'>
              <IconUsers size={18} style={{ opacity: 0.6 }} />
              <Text fw={600} size='sm' style={{ cursor: 'default' }}>
                {archersWithScores.length}/{allArchers?.length}
              </Text>
            </Group>
          </Paper>
        </Tooltip>
      </Group>

      <Table.ScrollContainer minWidth={1200}>
        <Table
          striped
          highlightOnHover
          withTableBorder
          styles={{
            th: {
              backgroundColor: 'var(--mantine-color-brand-8)',
              color: '#f0f0f0',
              padding: '8px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 14,
            },
            td: {
              padding: '8px',
              textAlign: 'center',
              fontSize: 14,
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th rowSpan={2} style={{ width: 25, verticalAlign: 'middle' }}>
                #
              </Table.Th>
              <Table.Th rowSpan={2} style={{ width: 120, verticalAlign: 'middle' }}>
                {translations.tableFirstName}
              </Table.Th>
              <Table.Th rowSpan={2} style={{ width: 140, verticalAlign: 'middle' }}>
                {translations.tableLastName}
              </Table.Th>
              <Table.Th rowSpan={2} style={{ width: 150, verticalAlign: 'middle' }}>
                <Stack gap={4}>
                  <span>{translations.tableClub}</span>
                  <SelectClub
                    competitionId={selectedCompetition}
                    clubs={clubs}
                    selectedClub={club ?? ''}
                    onChange={setClubFilter}
                  />
                </Stack>
              </Table.Th>
              <Table.Th rowSpan={2} style={{ width: 120, verticalAlign: 'middle' }}>
                <Stack gap={4}>
                  <span style={{ whiteSpace: 'pre-line' }}>
                    {translations.tableAgeGroup}
                  </span>
                  <SelectAgeGroup
                    competitionId={selectedCompetition}
                    selectedAgeGroup={ageGroup ?? ''}
                    onChange={setAgeGroupFilter}
                  />
                </Stack>
              </Table.Th>
              <Table.Th rowSpan={2} style={{ width: 100, verticalAlign: 'middle' }}>
                <Stack gap={4}>
                  <span>{translations.tableGender}</span>
                  <SelectGender
                    competitionId={selectedCompetition}
                    selectedGender={gender ?? ''}
                    onChange={setGenderFilter}
                  />
                </Stack>
              </Table.Th>
              <Table.Th rowSpan={2} style={{ width: 160, verticalAlign: 'middle' }}>
                <Stack gap={4}>
                  <span>{translations.tableCategory}</span>
                  <SelectCategory
                    competitionId={selectedCompetition}
                    selectedCategory={category ?? ''}
                    onChange={setCategoryFilter}
                  />
                </Stack>
              </Table.Th>
              <Table.Th colSpan={12} style={{ verticalAlign: 'middle' }}>
                {translations.tableScore}
              </Table.Th>
              <Table.Th rowSpan={2} style={{ width: 50, verticalAlign: 'middle' }}>
                <IconSettings size={18} color='#f0f0f0' />
              </Table.Th>
            </Table.Tr>
            <Table.Tr>
              {headerKeys.map((score: string | number, index: number) => (
                <Table.Th
                  key={`${index}-${score}`}
                  style={{ verticalAlign: 'middle' }}
                  colSpan={score === translations.tableScoreTotal ? 2 : 1}
                >
                  {score}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedArchers.length > 0 ? (
              rankedArchers.map((archer: ArcherExtended) => {
                const ageGroupText = getTranslation('age', archer.age_group);
                const genderText = getTranslation('gender', archer.gender);
                const categoryText = getTranslation('category', archer.category);
                return (
                  <Table.Tr
                    key={archer.id}
                    style={archer.total >= 0 ? { backgroundColor: '#b3c1f2', color: '#1a1a1a' } : undefined}
                  >
                    <Table.Td>
                      <Text fw={600} size='sm' c='dimmed'>
                        {archer.rank}
                      </Text>
                    </Table.Td>
                    <Table.Td>{archer.first_name}</Table.Td>
                    <Table.Td>{archer.last_name}</Table.Td>
                    <Table.Td>{archer.club}</Table.Td>
                    <Table.Td>{ageGroupText}</Table.Td>
                    <Table.Td>{genderText}</Table.Td>
                    <Table.Td>{categoryText}</Table.Td>
                    <Table.Td colSpan={2}>
                      <Text fw={700} size='sm'>
                        {archer.total >= 0 ? archer.total : ''}
                      </Text>
                    </Table.Td>
                    {scoreKeys.map((points) => (
                      <Table.Td key={points}>
                        <Text size='sm' c={
                          (archer[`score${points}` as keyof ArcherScores] ?? 0) > 0
                            ? undefined
                            : 'dimmed'
                        }>
                          {(archer[`score${points}` as keyof ArcherScores] ?? 0) > 0
                            ? archer[`score${points}` as keyof ArcherScores]
                            : ''}
                        </Text>
                      </Table.Td>
                    ))}
                    <Table.Td>
                      <Menu position='bottom-end' withArrow shadow='sm'>
                        <Menu.Target>
                          <ActionIcon
                            variant={archer.total >= 0 ? 'filled' : 'light'}
                            color='brand'
                            size='md'
                          >
                            <IconDots size={20} color={archer.total >= 0 ? '#fff' : undefined} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<IconEdit size={16} color='light-dark(var(--mantine-color-brand-5), var(--mantine-color-brand-2))' />}
                            onClick={() => setEditingRow(archer.id)}
                          >
                            <Text size='sm' style={{ color: 'light-dark(var(--mantine-color-brand-5), var(--mantine-color-brand-2))' }}>
                              {translations.tableEditButton}
                            </Text>
                          </Menu.Item>
                          <Divider my={4} />
                          <Menu.Item
                            leftSection={<IconTrash size={16} color='#F54242' />}
                            onClick={() => setDeletingRow(archer.id)}
                          >
                            <Text size='sm' c='red'>
                              {translations.tableDeleteButton}
                            </Text>
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={numTableColumns + 1}>
                  <Text c='dimmed' ta='center' py='lg'>
                    {translations.noArchersFoundForFilters}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

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
        onDelete={(archerId: number, action: DeletionAction) => {
          if (action === 'clear-score') {
            clearArcherScore({ archerId });
          } else {
            deleteArcher({ archerId });
          }
        }}
        onClose={() => setDeletingRow(null)}
      />
    </MissingDataWrapper>
  );
};

export default ArcherList;
