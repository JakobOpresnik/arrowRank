import './App.css';
import { useMemo, useState, type ReactNode } from 'react';
import CreateCompetition from './components/modals/CreateCompetition';
import { Box, Button, Stack, Tooltip, Typography } from '@mui/joy';
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
import AddIcon from '@mui/icons-material/Add';
import FormatListBulletedAddIcon from '@mui/icons-material/FormatListBulletedAdd';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useArchersClearScores } from './hooks/useArchersClearScores';
import { useArchersUpdateScore } from './hooks/useArchersUpdateScore';
import { exportTableToExcel } from './utils/excel_export';
import { useFilterStore } from './stores/useFilterStore';
import { useCompetitionStore } from './stores/useCompetitionStore';
import ConfirmClearScores from './components/modals/ConfirmClearScores';
// import PtlLogo from './assets/ptl_logo.svg';
import { useTranslation } from 'react-i18next';
import SelectLanguage from './components/SelectLanguage';
import { useLanguageStore } from './stores/useLanguageStore';
import { BE_BASE_URL } from './constants';
import SnackBar from './components/SnackBar';
import { useAdvancedArcherSorting } from './hooks/useAdvancedArcherSorting';
// import SentlokLogo from './assets/sentlok_logo.svg';

export type CompetitionState = 'created' | 'updated' | null;
type OptionalElement = ReactNode | null | undefined;

function App() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const [isOpenCompetition, setIsOpenCompetition] = useState<boolean>(false);

  const [isSnackBarOpen, setIsSnackBarOpen] = useState<boolean>(false);
  const [competitionState, setCompetitionState] =
    useState<CompetitionState>(null);

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

  // const selectedCompetition: Competition | null = useCompetitionStore(
  //   (state: CompetitionStore) => state.selectedCompetition
  // );
  const { selectedCompetition, setSelectedCompetition } = useCompetitionStore();

  const { data: archers, isLoading: isLoadingArchers } = useArchersFiltered(
    selectedCompetition?.id ?? 0,
    clubFilter ?? '',
    categoryFilter ?? '',
    genderFilter ?? '',
    ageGroupFilter ?? '',
    SORTING
  );
  const { mutate: updateScore } = useArchersUpdateScore(
    selectedCompetition?.id ?? 0
  );
  const { mutate: clearScores } = useArchersClearScores(
    selectedCompetition?.id ?? 0
  );

  const archersDataExists: boolean = useMemo(
    () => !!archers && archers.length > 0,
    [archers]
  );

  const areAnyFiltersApplied: boolean = useMemo(
    () =>
      !!clubFilter || !!categoryFilter || !!genderFilter || !!ageGroupFilter,
    [clubFilter, categoryFilter, genderFilter, ageGroupFilter]
  );

  const areAnyScoresPresent: boolean = useMemo(() => {
    if (!archers || archers.length === 0) return false;
    return archers.some((archer: Archer) =>
      scoreKeys.some(
        (points) => archer[`score${points}` as keyof Archer] !== null
      )
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
      month: '2-digit', // use 'long' for full month names
      year: 'numeric',
    };

    return new Intl.DateTimeFormat('sl-SI', options).format(date);
  }

  const closeSnackBar = (): void => setIsSnackBarOpen(false);

  const HeaderLogo = (): OptionalElement => {
    if (!selectedCompetition) return null;
    const { logo_url } = selectedCompetition;
    const handleClick = () => setIsOpenAddLogo(true);

    if (!logo_url) {
      return (
        <Tooltip title={t('competitionLogoAddTooltip')} placement='top' arrow>
          <AddPhotoAlternateIcon
            sx={{ width: 40, height: 'auto' }}
            cursor='pointer'
            onClick={handleClick}
          />
        </Tooltip>
      );
    }

    return (
      <Box
        component='img'
        src={`${BE_BASE_URL}${selectedCompetition!.logo_url}`}
        alt={t('competitionLogoHeaderAltText')}
        sx={{ height: 150, width: 'auto', cursor: 'pointer' }}
        onClick={() => setIsOpenAddLogo(true)}
      />
    );
  };

  const headerLogoElement: OptionalElement = HeaderLogo();

  const shouldDisplayClearFiltersButton: boolean =
    archersDataExists || areAnyFiltersApplied;

  return (
    <div className='App'>
      <Stack
        direction='row'
        justifyContent={headerLogoElement ? 'space-between' : 'flex-start'}
        gap={headerLogoElement ? 0 : 10}
        alignItems='center'
        mb={6}
      >
        <Box
          component='img'
          // src={PtlLogo}
          alt={t('ptlLogoAltText')}
          sx={{ height: 150, width: 'auto' }}
        />
        <Stack direction='column' alignItems='center' spacing={1}>
          <Typography
            level='h1'
            fontSize='3rem'
            letterSpacing={3}
            style={{
              wordSpacing: 10,
              color: '#FFF',
            }}
          >
            PTL {t('scoreboard').toUpperCase()}
          </Typography>
          {selectedCompetition && (
            <Typography
              level='h1'
              fontSize='2rem'
              letterSpacing={3}
              style={{
                wordSpacing: 10,
                color: '#FFF',
              }}
            >
              {selectedCompetition.name}
              <br />
              {formatDate(selectedCompetition.date)}
            </Typography>
          )}
        </Stack>

        <HeaderLogo />
      </Stack>

      <Stack direction='column' spacing={3}>
        <Stack direction='row' spacing={2} justifyContent='space-between'>
          <Stack direction='row' spacing={2}>
            <SelectCompetition
              onSelect={() =>
                queryClient.invalidateQueries({ queryKey: ['archers'] })
              }
            />
            <Button
              sx={{ paddingInline: 3, paddingBlock: 1.5 }}
              onClick={() => setIsOpenCompetition(true)}
            >
              <AddToQueueIcon sx={{ marginRight: 2 }} />
              <Typography sx={{ color: '#FFF' }}>
                {t('createCompetition')}
              </Typography>
            </Button>
            <Button
              sx={{ paddingInline: 3, paddingBlock: 1.5 }}
              onClick={() => setIsOpenArchers(true)}
            >
              <FormatListBulletedAddIcon sx={{ marginRight: 2 }} />
              <Typography sx={{ color: '#FFF' }}>{t('addArchers')}</Typography>
            </Button>
            <AddArchers
              open={isOpenArchers}
              onClose={() => setIsOpenArchers(false)}
            />
            <Button
              sx={{ paddingInline: 3, paddingBlock: 1.5 }}
              onClick={() => setIsOpenScoreModal(true)}
            >
              <AddIcon sx={{ marginRight: 2 }} />
              <Typography sx={{ color: '#FFF' }}>{t('addScore')}</Typography>
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
          </Stack>
          <Stack direction='row' spacing={2}>
            {(archersDataExists || areAnyFiltersApplied) && (
              <Button
                sx={{ paddingInline: 3, paddingBlock: 1.5 }}
                onClick={() => exportTableToExcel(sortedArchers)}
              >
                <SaveAltIcon sx={{ marginRight: 2 }} />
                <Typography sx={{ color: '#FFF' }}>
                  {t('exportButton')}
                </Typography>
              </Button>
            )}
            {shouldDisplayClearFiltersButton && (
              <>
                <Tooltip
                  title={t('clearFiltersTooltip')}
                  placement='top'
                  sx={{ paddingInline: 1.5, paddingBlock: 1 }}
                >
                  <Button
                    sx={{
                      backgroundColor: '#FCC844',
                      '&:hover': {
                        backgroundColor: '#F2B00A',
                      },
                    }}
                    onClick={resetFilters}
                  >
                    <FilterAltOffIcon />
                  </Button>
                </Tooltip>
                {areAnyScoresPresent && (
                  <Tooltip
                    title={t('clearScoresTooltip')}
                    placement='top'
                    sx={{ paddingInline: 1.5, paddingBlock: 1 }}
                  >
                    <Button
                      sx={{
                        backgroundColor: '#F55656',
                        '&:hover': {
                          backgroundColor: '#F54242',
                        },
                      }}
                      onClick={() => setIsOpenClearScores(true)}
                    >
                      <ClearIcon />
                    </Button>
                  </Tooltip>
                )}
              </>
            )}

            <SelectLanguage language={language} setLanguage={setLanguage} />
          </Stack>
        </Stack>

        <SnackBar
          open={isSnackBarOpen}
          competitionState={competitionState}
          onClose={closeSnackBar}
        />

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
        onCreated={() => {
          setCompetitionState('created');
          setIsSnackBarOpen(true);
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
          setCompetitionState('updated');
          setIsSnackBarOpen(true);
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
