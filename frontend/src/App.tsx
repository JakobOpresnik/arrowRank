import './App.css';
import { useEffect, useMemo, useState } from 'react';
import { useHotkeys } from '@mantine/hooks';
import CreateCompetition from './components/modals/CreateCompetition';
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
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
  IconInfoCircle,
  IconBrandLinkedin,
  IconWorld,
  IconMail,
  IconPower,
  IconTable,
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
import AboutApp from './components/modals/AboutApp';
import ConfirmExit from './components/modals/ConfirmExit';
import PtlLogo from './assets/ptl_logo.png';
import { useTranslation } from 'react-i18next';
import SelectLanguage from './components/SelectLanguage';
import { useLanguageStore } from './stores/useLanguageStore';
import { BE_BASE_URL } from './constants';
import { useAdvancedArcherSorting } from './hooks/useAdvancedArcherSorting';
import { useCompetitions } from './hooks/useCompetitions';
import CompetitionList from './components/CompetitionList';
import ScrollToTop from './components/ScrollToTop';
import { formatDate } from './utils/text_utils';

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
  const [isOpenDeleteAllArchers, setIsOpenDeleteAllArchers] =
    useState<boolean>(false);
  const [isOpenDeleteCompetition, setIsOpenDeleteCompetition] =
    useState<boolean>(false);
  const [isOpenAbout, setIsOpenAbout] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [isOpenExit, setIsOpenExit] = useState<boolean>(false);
  const [view, setView] = useState<'scoreboard' | 'competitions'>('scoreboard');

  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);

  const {
    clubFilter,
    categoryFilter,
    genderFilter,
    ageGroupFilter,
    setClubFilter,
    setCategoryFilter,
    setGenderFilter,
    setAgeGroupFilter,
    setSearchTerm,
  } = useFilterStore();

  const { selectedCompetition, setSelectedCompetition } = useCompetitionStore();
  const { data: competitions } = useCompetitions();
  useEffect(() => {
    if (competitions && selectedCompetition) {
      const stillExists = competitions.some(
        (c) => c.id === selectedCompetition.id,
      );
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
  // unfiltered list keeps club options and the empty-competition check independent of filters
  const { data: allArchers, isLoading: isLoadingAllArchers } =
    useArchersFiltered(selectedCompetition?.id ?? 0, '', '', '', '', SORTING);
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
    [
      selectedCompetition,
      clubFilter,
      categoryFilter,
      genderFilter,
      ageGroupFilter,
    ],
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

  const handleExport = async (): Promise<void> => {
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
      const { cancelled, path: savedPath } = await exportTableToExcel(
        sortedArchers,
        selectedCompetition,
      );
      if (cancelled) {
        notifications.update({
          id: notifId,
          title: t('exportCancelled'),
          message: '',
          color: 'gray',
          loading: false,
          autoClose: 3000,
          withCloseButton: true,
        });
        return;
      }
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
        ) : (
          ''
        ),
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
  };

  const hasCompetitions: boolean = !!competitions && competitions.length > 0;
  const canExport: boolean = archersDataExists || areAnyFiltersApplied;

  // letters also fire with Shift/Caps Lock held
  const letterHotkey = (
    key: string,
    handler: () => void,
  ): [string, () => void][] => [
    [key, handler],
    [`shift+${key}`, handler],
  ];
  useHotkeys([
    ...letterHotkey('n', () => archersDataExists && setIsOpenScoreModal(true)),
    ...letterHotkey('a', () => hasCompetitions && setIsOpenArchers(true)),
    ...letterHotkey('e', () => canExport && handleExport()),
    ['mod+e', () => canExport && handleExport()],
    ...letterHotkey('c', () =>
      hasCompetitions &&
      setView((prev) => (prev === 'competitions' ? 'scoreboard' : 'competitions')),
    ),
    ...letterHotkey('d', () => toggleColorScheme()),
    ...letterHotkey('i', () => setIsOpenAbout((prev) => !prev)),
    ['shift+?', () => setIsOpenAbout((prev) => !prev)],
  ]);

  const handleSubmit = (update: ArcherUpdate): void => {
    setIsOpenScoreModal(false);
    updateScore(update);
  };

  const resetFilters = (): void => {
    setClubFilter('');
    setCategoryFilter('');
    setGenderFilter('');
    setAgeGroupFilter('');
    setSearchTerm('');
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

    // a missing logo file falls back to the add button instead of broken alt text
    if (!logo_url || logo_url === failedLogoUrl) {
      return (
        <Tooltip label={t('competitionLogoAddTooltip')} position='top'>
          <ActionIcon
            aria-label={t('competitionLogoAddTooltip')}
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
      <UnstyledButton
        onClick={handleClick}
        aria-label={t('competitionLogoChange')}
      >
        <Image
          src={`${BE_BASE_URL}${logo_url}`}
          alt={t('competitionLogoHeaderAltText')}
          h={120}
          w='auto'
          onError={() => setFailedLogoUrl(logo_url)}
        />
      </UnstyledButton>
    );
  })();

  const themeTooltip: string =
    colorScheme === 'dark' ? t('lightModeTooltip') : t('darkModeTooltip');

  const shouldDisplayClearFiltersButton: boolean =
    archersDataExists || areAnyFiltersApplied;

  return (
    <div className='App'>
      <div className='App-content'>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            marginBottom: 'var(--mantine-spacing-xl)',
          }}
        >
          <Image
            src={PtlLogo}
            draggable={false}
            alt={t('ptlLogoAltText')}
            h={120}
            w='auto'
            style={{ justifySelf: 'start' }}
          />
          <Stack align='center' gap={4}>
            <Title order={1} fz='2.4rem' fw={700} lts={2}>
              PTL {t('scoreboard').toUpperCase()}
            </Title>
            {selectedCompetition && (
              <Text size='xl' fw={500} c='dimmed' ta='center'>
                {selectedCompetition.name} &middot;{' '}
                {formatDate(selectedCompetition.date)}
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
              {hasCompetitions && (
                <Button
                  variant='default'
                  leftSection={<IconTable size={18} />}
                  onClick={() =>
                    setView((prev) =>
                      prev === 'competitions' ? 'scoreboard' : 'competitions',
                    )
                  }
                >
                  {t('allCompetitions')}
                </Button>
              )}
              <Button
                leftSection={<IconTrophy size={18} />}
                onClick={() => setIsOpenCompetition(true)}
              >
                {t('createCompetition')}
              </Button>
              {hasCompetitions && (
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
            {canExport && (
              <Button
                leftSection={<IconDownload size={18} />}
                onClick={handleExport}
              >
                {t('exportButton')}
              </Button>
            )}
          </Group>

          {/* Row 2: language + theme (left) | clear filters + clear scores (right) */}
          <Group justify='space-between'>
            <Group gap='sm'>
              <SelectLanguage language={language} setLanguage={setLanguage} />
              <Tooltip label={themeTooltip} position='top'>
                <ActionIcon
                  aria-label={themeTooltip}
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
              <Tooltip label={t('aboutTooltip')} position='top'>
                <ActionIcon
                  aria-label={t('aboutTooltip')}
                  variant='default'
                  size='lg'
                  onClick={() => setIsOpenAbout(true)}
                >
                  <IconInfoCircle size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
            <Group gap='sm'>
              {shouldDisplayClearFiltersButton && (
                <Tooltip label={t('clearFiltersTooltip')} position='top'>
                  <ActionIcon
                    aria-label={t('clearFiltersTooltip')}
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
                    aria-label={t('clearScoresTooltip')}
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
                    aria-label={t('deleteAllArchersTooltip')}
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
                    aria-label={t('deleteCompetitionTooltip')}
                    variant='filled'
                    style={{ backgroundColor: '#7B1010', color: '#fff' }}
                    size='lg'
                    onClick={() => setIsOpenDeleteCompetition(true)}
                  >
                    <IconTrashX size={18} />
                  </ActionIcon>
                </Tooltip>
              )}
              {(shouldDisplayClearFiltersButton || areAnyScoresPresent || archersDataExists || !!selectedCompetition) && (
                <Divider orientation='vertical' />
              )}
              <Tooltip label={t('exitTooltip')} position='top'>
                <ActionIcon
                  aria-label={t('exitTooltip')}
                  variant='filled'
                  color='red'
                  size='lg'
                  disabled={isClosing}
                  onClick={() => setIsOpenExit(true)}
                >
                  {isClosing ? (
                    <Loader size={14} color='white' />
                  ) : (
                    <IconPower size={18} />
                  )}
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>

          {view === 'competitions' ? (
            <CompetitionList onBack={() => setView('scoreboard')} />
          ) : selectedCompetition ? (
            <ArcherList
              allArchers={allArchers}
              isLoadingArchers={isLoadingAllArchers}
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
      </div>
      {/* end App-content */}

      {/* Footer */}
      <Group
        justify='center'
        align='center'
        h={80}
        gap='xs'
        pt='md'
        pb='sm'
        style={{
          marginTop: '2rem',
          borderTop: '1px solid var(--mantine-color-default-border)',
          opacity: 0.45,
          backgroundColor: 'var(--mantine-color-default-hover)',
        }}
      >
        <Text size='sm' fw={500} c='dimmed'>
          {t('madeBy', { name: 'Jakob Oprešnik' })}
        </Text>
        <Text size='sm' c='dimmed'>
          ·
        </Text>
        <Tooltip label='jakob.opresnik@gmail.com' position='top'>
          <ActionIcon
            aria-label={`${t('email')}: jakob.opresnik@gmail.com`}
            component='a'
            href='mailto:jakob.opresnik@gmail.com'
            variant='subtle'
            color='gray'
            size='sm'
          >
            <IconMail size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label='LinkedIn' position='top'>
          <ActionIcon
            aria-label='LinkedIn'
            variant='subtle'
            color='gray'
            size='sm'
            onClick={() => {
              const url =
                'https://www.linkedin.com/in/jakob-opre%C5%A1nik-369214204/';
              if (window.electronApi?.openExternalUrl) {
                window.electronApi.openExternalUrl(url);
              } else {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <IconBrandLinkedin size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label={t('portfolioTooltip')} position='top'>
          <ActionIcon
            aria-label={t('portfolioTooltip')}
            variant='subtle'
            color='gray'
            size='sm'
            onClick={() => {
              const url = 'https://www.jakobopresnik.si/';
              if (window.electronApi?.openExternalUrl) {
                window.electronApi.openExternalUrl(url);
              } else {
                window.open(url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            <IconWorld size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>

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
          const nextCompetition =
            competitions?.find((c) => c.id !== selectedCompetition.id) ?? null;
          deleteCompetition(selectedCompetition.id);
          setSelectedCompetition(nextCompetition);
          setIsOpenDeleteCompetition(false);
        }}
      />

      <ScrollToTop />

      <AboutApp open={isOpenAbout} onClose={() => setIsOpenAbout(false)} />

      <ConfirmExit
        open={isOpenExit}
        onClose={() => setIsOpenExit(false)}
        onConfirm={async () => {
          setIsOpenExit(false);
          setIsClosing(true);
          if (window.electronApi?.closeApp) {
            await window.electronApi.closeApp();
          } else {
            window.close();
          }
        }}
      />
    </div>
  );
}

export default App;
