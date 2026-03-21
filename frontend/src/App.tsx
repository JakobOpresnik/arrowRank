import './App.css';
import { useMemo, useState } from 'react';
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
  IconPhotoPlus,
  IconDownload,
  IconX,
  IconFilterOff,
  IconSun,
  IconMoon,
} from '@tabler/icons-react';
import { useArchersClearScores } from './hooks/useArchersClearScores';
import { useArchersUpdateScore } from './hooks/useArchersUpdateScore';
import { exportTableToExcel } from './utils/excel_export';
import { useFilterStore } from './stores/useFilterStore';
import { useCompetitionStore } from './stores/useCompetitionStore';
import ConfirmClearScores from './components/modals/ConfirmClearScores';
import PtlLogo from './assets/ptl_logo.png';
import { useTranslation } from 'react-i18next';
import SelectLanguage from './components/SelectLanguage';
import { useLanguageStore } from './stores/useLanguageStore';
import { BE_BASE_URL } from './constants';
import { useAdvancedArcherSorting } from './hooks/useAdvancedArcherSorting';

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

  const archersDataExists: boolean = useMemo(
    () => !!archers && archers.length > 0,
    [archers],
  );

  const areAnyFiltersApplied: boolean = useMemo(
    () =>
      !!clubFilter || !!categoryFilter || !!genderFilter || !!ageGroupFilter,
    [clubFilter, categoryFilter, genderFilter, ageGroupFilter],
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
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}`);
    }
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat('sl-SI', options).format(date);
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
      <Group
        justify={headerLogoElement ? 'space-between' : 'flex-start'}
        gap={headerLogoElement ? 0 : 40}
        align='center'
        mb='xl'
      >
        <Image src={PtlLogo} alt={t('ptlLogoAltText')} h={120} w='auto' />
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

        {headerLogoElement}
      </Group>

      <Stack gap='md'>
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
            <Button
              leftSection={<IconListDetails size={18} />}
              onClick={() => setIsOpenArchers(true)}
            >
              {t('addArchers')}
            </Button>
            <AddArchers
              open={isOpenArchers}
              onClose={() => setIsOpenArchers(false)}
            />
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setIsOpenScoreModal(true)}
            >
              {t('addScore')}
            </Button>
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
          <Group gap='sm'>
            {(archersDataExists || areAnyFiltersApplied) && (
              <Button
                leftSection={<IconDownload size={18} />}
                onClick={() =>
                  exportTableToExcel(sortedArchers, selectedCompetition)
                }
              >
                {t('exportButton')}
              </Button>
            )}
            {shouldDisplayClearFiltersButton && (
              <>
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
              </>
            )}

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
        </Group>

        {selectedCompetition && (
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
        )}
      </Stack>

      <CreateCompetition
        open={isOpenCompetition}
        selectedCompetition={selectedCompetition}
        onCreated={() => showSuccessNotification('created')}
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
          clearScores({
            competitionId: selectedCompetition?.id ?? 0,
          });
          setIsOpenClearScores(false);
        }}
      />
    </div>
  );
}

export default App;
