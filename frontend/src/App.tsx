import './App.css';
import { useEffect, useMemo, useState } from 'react';
import CreateCompetition from './components/modals/CreateCompetition';
import {
  ActionIcon,
  Button,
  Group,
  Image,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import AddArchers from './components/modals/AddArchers';
import AddScore from './components/modals/AddScore';
import {
  scoreKeys,
  type Archer,
  type ArcherUpdate,
  type Competition,
} from './types';
import ArcherList, { SORTING } from './components/ArcherList';
import SelectCompetition from './components/SelectCompetition';
import { queryClient } from './lib/queryClient';
import { useArchersFiltered } from './hooks/useArchersFiltered';
import {
  IconPlus,
  IconListDetails,
  IconTrophy,
  IconTrophyOff,
  IconPhotoPlus,
  IconDownload,
  IconX,
  IconFilterOff,
  IconSun,
  IconMoon,
  IconTrash,
  IconTrashX,
} from '@tabler/icons-react';
import { useArchersClearScores } from './hooks/useArchersClearScores';
import { useArchersUpdateScore } from './hooks/useArchersUpdateScore';
import { useDeleteAllArchers } from './hooks/useDeleteAllArchers';
import { useDeleteCompetition } from './hooks/useDeleteCompetition';
import { exportTableToExcel } from './utils/excel_export';
import { useFilterStore } from './stores/useFilterStore';
import { useCompetitionStore } from './stores/useCompetitionStore';
import ConfirmClearScores from './components/modals/ConfirmClearScores';
import ConfirmDeleteAllArchers from './components/modals/ConfirmDeleteAllArchers';
import ConfirmDeleteCompetition from './components/modals/ConfirmDeleteCompetition';
import PtlLogo from './assets/ptl_logo.png';
import { useTranslation } from 'react-i18next';
import SelectLanguage from './components/SelectLanguage';
import { useLanguageStore } from './stores/useLanguageStore';
import { BE_BASE_URL } from './constants';
import { useAdvancedArcherSorting } from './hooks/useAdvancedArcherSorting';
import { useCompetitions } from './hooks/useCompetitions';

export type CompetitionState = 'created' | 'updated' | null;

function App() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const [isOpenCompetition, setIsOpenCompetition] = useState<boolean>(false);
  const [isOpenArchers, setIsOpenArchers] = useState<boolean>(false);
  const [isOpenScoreModal, setIsOpenScoreModal] = useState<boolean>(false);
  const [isOpenClearScores, setIsOpenClearScores] = useState<boolean>(false);
  const [isOpenAddLogo, setIsOpenAddLogo] = useState<boolean>(false);
  const [isOpenDeleteAllArchers, setIsOpenDeleteAllArchers] = useState<boolean>(false);
  const [isOpenDeleteCompetition, setIsOpenDeleteCompetition] = useState<boolean>(false);

  const {
    clubFilter,
    categoryFilter,
    genderFilter,
    ageGroupFilter,
    setClubFilter,
    setCategoryFilter,
    setGenderFilter,
    setAgeGroupFilter,
  } = useFilterStore();

  const { selectedCompetition, setSelectedCompetition } = useCompetitionStore();
  const { data: competitions } = useCompetitions();
  useEffect(() => {
    if (competitions && selectedCompetition) {
      const stillExists = competitions.some((c) => c.id === selectedCompetition.id);
      if (!stillExists) setSelectedCompetition(null);
    }
  }, [competitions, selectedCompetition, setSelectedCompetition]);

  const { data: archers, isLoading: isLoadingArchers } = useArchersFiltered(
    selectedCompetition?.id ?? 0,
    clubFilter ?? '',
    categoryFilter ?? '',
    genderFilter ?? '',
    ageGroupFilter ?? '',
    SORTING,
  );
  const { mutate: updateScore } = useArchersUpdateScore(
    selectedCompetition?.id ?? 0,
  );
  const { mutate: clearScores } = useArchersClearScores(
    selectedCompetition?.id ?? 0,
  );
  const { mutate: deleteAllArchers } = useDeleteAllArchers(
    selectedCompetition?.id ?? 0,
  );
  const { mutate: deleteCompetition } = useDeleteCompetition();

  const archersDataExists: boolean = useMemo(
    () => !!archers && archers.length > 0,
    [archers],
  );

  const areAnyFiltersApplied: boolean = useMemo(
    () =>
      !!selectedCompetition &&
      (!!clubFilter || !!categoryFilter || !!genderFilter || !!ageGroupFilter),
    [selectedCompetition, clubFilter, categoryFilter, genderFilter, ageGroupFilter],
  );

  const areAnyScoresPresent: boolean = useMemo(() => {
    if (!archers || archers.length === 0) return false;
    return archers.some((archer: Archer) =>
      scoreKeys.some(
        (points) => archer[`score${points}` as keyof Archer] !== null,
      ),
    );
  }, [archers]);

  const sortedArchers: Archer[] = useAdvancedArcherSorting(archers ?? []);

  const handleSubmit = (update: ArcherUpdate): void => {
    setIsOpenScoreModal(false);
    updateScore(update, {
      onError: (err: Error) => console.error(err),
      onSuccess: () => console.log('Score updated successfully!'),
    });
  };

  const resetFilters = (): void => {
    setClubFilter('');
    setCategoryFilter('');
    setGenderFilter('');
    setAgeGroupFilter('');
    queryClient.invalidateQueries({
      queryKey: [
        'archersFiltered',
        selectedCompetition,
        categoryFilter,
        genderFilter,
        ageGroupFilter,
      ],
    });
  };

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    return `${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
  }

  const showSuccessNotification = (state: CompetitionState): void => {
    const title =
      state === 'created'
        ? t('competitionCreatedSuccessfully')
        : t('competitionUpdatedSuccessfully');
    notifications.show({
      title,
      message: '',
      color: 'teal',
      autoClose: 2500,
    });
  };

  const headerLogoElement = (() => {
    if (!selectedCompetition) return null;
    const { logo_url } = selectedCompetition;
    const handleClick = () => setIsOpenAddLogo(true);

    if (!logo_url) {
      return (
        <Tooltip label={t('competitionLogoAddTooltip')} position='top'>
          <ActionIcon
            variant='subtle'
            color='gray'
            size={40}
            onClick={handleClick}
          >
            <IconPhotoPlus size={28} />
          </ActionIcon>
        </Tooltip>
      );
    }

    return (
      <Image
        src={`${BE_BASE_URL}${selectedCompetition.logo_url}`}
        alt={t('competitionLogoHeaderAltText')}
        h={120}
        w='auto'
        style={{ cursor: 'pointer' }}
        onClick={() => setIsOpenAddLogo(true)}
      />
    );
  })();

  const shouldDisplayClearFiltersButton: boolean =
    archersDataExists || areAnyFiltersApplied;

  return (
    <div className='App'>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: 'var(--mantine-spacing-xl)' }}>
        <Image src={PtlLogo} alt={t('ptlLogoAltText')} h={120} w='auto' style={{ justifySelf: 'start' }} />
        <Stack align='center' gap={4}>
          <Title order={1} fz='2.4rem' fw={700} lts={2}>
            PTL {t('scoreboard').toUpperCase()}
          </Title>
          {selectedCompetition && (
            <Text size='xl' fw={500} c='dimmed' ta='center'>
              {selectedCompetition.name} &middot; {formatDate(selectedCompetition.date)}
            </Text>
          )}
        </Stack>
        <div style={{ justifySelf: 'end' }}>{headerLogoElement}</div>
      </div>

      <Stack gap='md'>
        {/* Row 1: action buttons (left) + generate report (right) */}
        <Group justify='space-between'>
          <Group gap='sm'>
            <SelectCompetition
              onSelect={() =>
                queryClient.invalidateQueries({ queryKey: ['archers'] })
              }
            />
            <Button
              leftSection={<IconTrophy size={18} />}
              onClick={() => setIsOpenCompetition(true)}
            >
              {t('createCompetition')}
            </Button>
            {competitions && competitions.length > 0 && (
              <Button
                leftSection={<IconListDetails size={18} />}
                onClick={() => setIsOpenArchers(true)}
              >
                {t('addArchers')}
              </Button>
            )}
            <AddArchers
              open={isOpenArchers}
              onClose={() => setIsOpenArchers(false)}
              selectedCompetitionId={selectedCompetition?.id ?? null}
            />
            {archersDataExists && (
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setIsOpenScoreModal(true)}
              >
                {t('addScore')}
              </Button>
            )}
            <AddScore
              open={isOpenScoreModal}
              selectedCompetition={selectedCompetition?.id ?? 0}
              onArcherUpdate={async (update: ArcherUpdate) => {
                handleSubmit(update);
                queryClient.invalidateQueries({
                  queryKey: ['archers', selectedCompetition?.id],
                });
              }}
              onClose={() => setIsOpenScoreModal(false)}
            />
          </Group>
          {(archersDataExists || areAnyFiltersApplied) && (
            <Button
              leftSection={<IconDownload size={18} />}
              onClick={async () => {
                const notifId = 'excel-export';
                notifications.show({
                  id: notifId,
                  title: t('exportButton'),
                  message: t('exportingReport'),
                  color: 'blue',
                  loading: true,
                  autoClose: false,
                  withCloseButton: false,
                });
                try {
                  const savedPath = await exportTableToExcel(sortedArchers, selectedCompetition);
                  notifications.update({
                    id: notifId,
                    title: t('exportSuccess'),
                    message: savedPath ? (
                      <Button
                        size='xs'
                        mt={6}
                        variant='light'
                        onClick={() => window.electronApi?.openFile(savedPath)}
                      >
                        {t('openFolder')}
                      </Button>
                    ) : '',
                    color: 'teal',
                    loading: false,
                    autoClose: savedPath ? false : 3000,
                    withCloseButton: true,
                  });
                } catch {
                  notifications.update({
                    id: notifId,
                    title: t('exportError'),
                    message: '',
                    color: 'red',
                    loading: false,
                    autoClose: 3000,
                    withCloseButton: true,
                  });
                }
              }}
            >
              {t('exportButton')}
            </Button>
          )}
        </Group>

        {/* Row 2: language + theme (left) | clear filters + clear scores (right) */}
        <Group justify='space-between'>
          <Group gap='sm'>
            <SelectLanguage language={language} setLanguage={setLanguage} />
            <Tooltip
              label={colorScheme === 'dark' ? 'Light mode' : 'Dark mode'}
              position='top'
            >
              <ActionIcon
                variant='default'
                size='lg'
                onClick={() => toggleColorScheme()}
              >
                {colorScheme === 'dark' ? (
                  <IconSun size={18} />
                ) : (
                  <IconMoon size={18} />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
          <Group gap='sm'>
            {shouldDisplayClearFiltersButton && (
              <Tooltip label={t('clearFiltersTooltip')} position='top'>
                <ActionIcon
                  variant='filled'
                  style={{ backgroundColor: '#FCC844', color: '#000' }}
                  size='lg'
                  onClick={resetFilters}
                >
                  <IconFilterOff size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            {areAnyScoresPresent && (
              <Tooltip label={t('clearScoresTooltip')} position='top'>
                <ActionIcon
                  variant='filled'
                  style={{ backgroundColor: '#F55656', color: '#fff' }}
                  size='lg'
                  onClick={() => setIsOpenClearScores(true)}
                >
                  <IconX size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            {archersDataExists && (
              <Tooltip label={t('deleteAllArchersTooltip')} position='top'>
                <ActionIcon
                  variant='filled'
                  color='red'
                  size='lg'
                  onClick={() => setIsOpenDeleteAllArchers(true)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Tooltip>
            )}
            {selectedCompetition && (
              <Tooltip label={t('deleteCompetitionTooltip')} position='top'>
                <ActionIcon
                  variant='filled'
                  style={{ backgroundColor: '#7B1010', color: '#fff' }}
                  size='lg'
                  onClick={() => setIsOpenDeleteCompetition(true)}
                >
                  <IconTrashX size={18} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>

        {selectedCompetition ? (
          <ArcherList
            allArchers={sortedArchers}
            isLoadingArchers={isLoadingArchers}
            selectedCompetition={selectedCompetition.id}
            selectedFilters={{
              club: clubFilter,
              category: categoryFilter,
              gender: genderFilter,
              ageGroup: ageGroupFilter,
            }}
          />
        ) : competitions && competitions.length > 0 ? (
          <Stack align='center' justify='center' gap='xs' mt={80}>
            <IconTrophyOff size={48} color='var(--mantine-color-dimmed)' />
            <Text size='lg' c='dimmed' fw={500}>
              {t('noCompetitionSelected')}
            </Text>
            <Text size='sm' c='dimmed'>
              {t('noCompetitionSelectedHint')}
            </Text>
          </Stack>
        ) : (
          <Stack align='center' justify='center' gap='xs' mt={80}>
            <IconTrophyOff size={48} color='var(--mantine-color-dimmed)' />
            <Text size='lg' c='dimmed' fw={500}>
              {t('noCompetitionsAvailable')}
            </Text>
            <Text size='sm' c='dimmed'>
              {t('noCompetitionsHint')}
            </Text>
          </Stack>
        )}
      </Stack>

      <CreateCompetition
        open={isOpenCompetition}
        selectedCompetition={selectedCompetition}
        onCreated={() => {
          showSuccessNotification('created');
        }}
        onClose={() => setIsOpenCompetition(false)}
      />

      <CreateCompetition
        open={isOpenAddLogo}
        selectedCompetition={selectedCompetition}
        onUpdated={(updated?: Competition) => {
          if (updated) {
            setSelectedCompetition(updated);
          }
          showSuccessNotification('updated');
        }}
        onClose={() => setIsOpenAddLogo(false)}
        isLogoUploadOnly
      />

      <ConfirmClearScores
        open={isOpenClearScores}
        onClose={() => setIsOpenClearScores(false)}
        onClear={() => {
          clearScores({ competitionId: selectedCompetition?.id ?? 0 });
          setIsOpenClearScores(false);
        }}
      />

      <ConfirmDeleteAllArchers
        open={isOpenDeleteAllArchers}
        archerCount={archers?.length ?? 0}
        competitionName={selectedCompetition?.name ?? ''}
        onClose={() => setIsOpenDeleteAllArchers(false)}
        onDelete={() => {
          deleteAllArchers();
          setIsOpenDeleteAllArchers(false);
        }}
      />

      <ConfirmDeleteCompetition
        open={isOpenDeleteCompetition}
        competitionName={selectedCompetition?.name ?? ''}
        onClose={() => setIsOpenDeleteCompetition(false)}
        onDelete={() => {
          if (!selectedCompetition) return;
          const nextCompetition = competitions?.find((c) => c.id !== selectedCompetition.id) ?? null;
          deleteCompetition(selectedCompetition.id);
          setSelectedCompetition(nextCompetition);
          setIsOpenDeleteCompetition(false);
        }}
      />
    </div>
  );
}

export default App;
