import {
  useState,
  type SyntheticEvent,
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  Autocomplete,
  FormControl,
  Select,
  Stack,
  Typography,
  Option,
  Input,
  Button,
  Divider,
} from '@mui/joy';
import CategoryIcon from '@mui/icons-material/Category';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { useTranslation } from 'react-i18next';
import ScoreInput from '../ScoreInput';
import {
  TARGET_TOTAL_SCORE,
  BOW_CATEGORIES,
  AGE_GROUPS,
  GENDER_OPTIONS,
} from '../../constants';
import { useArcher } from '../../hooks/useArcher';
import { useArchers } from '../../hooks/useArchers';
import { useCompetitions } from '../../hooks/useCompetitions';
import {
  Archer,
  ArcherScores,
  scoreKeys,
  ScoreKey,
  AddScoreProps,
  Competition,
} from '../../types';
import { capitalize } from '../../utils/text_utils';
import { ModalWrapper } from './ModalWrapper';

function initializeScores(archer: Archer | undefined): ArcherScores {
  return scoreKeys.reduce((acc: ArcherScores, val) => {
    acc[`score${val}` as ScoreKey] = archer
      ? (archer[`score${val}` as keyof Archer] as number | undefined)
      : undefined;
    return acc;
  }, {} as ArcherScores);
}

const EditArcher = ({
  open,
  selectedCompetition,
  selectedArcherId,
  onArcherUpdate,
  onClose,
}: AddScoreProps) => {
  const { t } = useTranslation();

  const [selectedAnotherCompetition, setSelectedAnotherCompetition] = useState<
    number | null
  >(selectedCompetition);

  const { data: competitions } = useCompetitions();
  const { data: archers } = useArchers(selectedCompetition ?? 0);
  const { data: archerToEdit } = useArcher(
    selectedAnotherCompetition ?? 0,
    selectedArcherId ?? null
  );

  const [clubChange, setClubChange] = useState<boolean>(false);
  const [categoryChange, setCategoryChange] = useState<boolean>(false);
  const [ageGroupChange, setAgeGroupChange] = useState<boolean>(false);
  const [genderChange, setGenderChange] = useState<boolean>(false);

  const [scores, setScores] = useState<ArcherScores>(
    initializeScores(archerToEdit)
  );

  const [shouldDisableGenderSelect, setShouldDisableGenderSelect] =
    useState<boolean>(false);

  useEffect(() => setScores(initializeScores(archerToEdit)), [archerToEdit]);

  const handleCompetitionChange = (
    _event: SyntheticEvent | null,
    value: string | number | null
  ): void => {
    setSelectedAnotherCompetition(value as number);
  };

  const handleSubmit = (event: FormEvent<Element>): void => {
    console.log('submit');
    event.preventDefault();
    if (archerToEdit) {
      onArcherUpdate({
        ...archerToEdit,
        first_name: archerToEdit.first_name,
        last_name: archerToEdit.last_name,
        club: archerToEdit.club,
        category: archerToEdit.category,
        age_group: archerToEdit.age_group,
        gender: archerToEdit.gender.toLowerCase(),
      });
      setClubChange(false);
      setCategoryChange(false);
      setAgeGroupChange(false);
      onClose();
    } else {
      console.error('Archer data is incomplete');
    }
  };

  const getTotalEnteredScores = (scores: ArcherScores): number => {
    const values: (number | undefined)[] = Object.values(scores);
    const numbers: number[] = values.filter(
      (value): value is number =>
        value !== undefined && !isNaN(value) && value >= 0
    );
    const sum: number = numbers.reduce(
      (acc: number, value: number) => acc + value,
      0
    );
    return sum;
  };

  const validateScores = useCallback((scores: ArcherScores): boolean => {
    const sum: number = getTotalEnteredScores(scores);
    if (sum !== TARGET_TOTAL_SCORE) return false;
    return true;
  }, []);

  const canSubmit: boolean = useMemo(() => {
    const hasValidSelection =
      !!selectedCompetition && !!selectedArcherId && validateScores(scores);

    const hasChanges =
      !!clubChange || !!categoryChange || !!ageGroupChange || !!genderChange;

    return hasValidSelection || hasChanges;
  }, [
    selectedCompetition,
    selectedArcherId,
    scores,
    clubChange,
    categoryChange,
    ageGroupChange,
    genderChange,
    validateScores,
  ]);

  const isValuePresent = (
    archer: Archer | undefined,
    score: ScoreKey
  ): boolean => {
    if (!archer) return false;
    const value: string | number | undefined = archer[score as keyof Archer];
    return value !== undefined && (value as number) > 0;
  };

  const scoreSum: number = useMemo(
    () => getTotalEnteredScores(scores),
    [scores]
  );

  const doesExceedTargetScore: boolean = useMemo(
    () => scoreSum > TARGET_TOTAL_SCORE,
    [scoreSum]
  );

  const buttonLabel: string =
    scoreSum === TARGET_TOTAL_SCORE
      ? t('tableEditButton').toUpperCase()
      : doesExceedTargetScore
      ? `${t('addScoresExceeds').toUpperCase()} ${TARGET_TOTAL_SCORE}`
      : `${scoreSum} / ${TARGET_TOTAL_SCORE}`;

  const SubmitButton = (
    <Button
      type='submit'
      form='edit-archer-form'
      disabled={!canSubmit}
      sx={{
        // size
        height: 48,
        position: 'relative',
        overflow: 'hidden',

        fontSize: '1rem',

        // normal enabled state
        background: doesExceedTargetScore ? '#ED6666' : '#0B6BCB',

        // custom disabled style
        '&.Mui-disabled': {
          color: doesExceedTargetScore ? '#FFF' : '#00000042',
          background: doesExceedTargetScore ? '#ED6666' : '#0000001F',
        },

        // progress bar layer
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${(Math.min(scoreSum, 28) / 28) * 100}%`, // progress %
          background: '#FFFFFF40',
          transition: 'width 0.3s ease',
          pointerEvents: 'none',
        },
      }}
    >
      {buttonLabel}
    </Button>
  );

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('editArcher')}
      actions={SubmitButton}
    >
      {archerToEdit && (
        <form id='edit-archer-form' onSubmit={handleSubmit}>
          <Typography ml={0.5} mb={0.5}>
            {t('competition')}
          </Typography>
          <Stack direction='column' spacing={2}>
            <Select
              defaultValue={selectedCompetition}
              onChange={handleCompetitionChange}
              disabled
            >
              {competitions?.map((competition: Competition) => (
                <Option key={competition.id} value={competition.id}>
                  {competition.name}
                </Option>
              ))}
            </Select>
            <FormControl>
              <Typography ml={0.5} mb={0.5}>
                {t('archer')}
              </Typography>
              <Autocomplete
                name='archer'
                options={archers ?? []}
                value={archerToEdit ?? null}
                getOptionLabel={(archer: Archer) =>
                  `${archer.first_name} ${archer.last_name}`
                }
                isOptionEqualToValue={(option: Archer, value: Archer) =>
                  option.id === value.id
                }
                disabled
              />
            </FormControl>

            <Stack direction='column' gap={0.5} width='100%'>
              <Typography>{t('club')}</Typography>
              <Input
                id='archer-club'
                name='club'
                type='text'
                placeholder={t('club')}
                defaultValue={archerToEdit!.club}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setClubChange(true);
                  if (archerToEdit) {
                    archerToEdit.club = e.target.value;
                  }
                }}
              />
            </Stack>
            <Stack direction='column' gap={0.5} width='100%'>
              <Typography>{t('bowCategory')}</Typography>
              <Select
                variant='outlined'
                defaultValue={archerToEdit?.category ?? ''}
                placeholder={t('selectBowCategory')}
                onChange={(
                  _event: SyntheticEvent | null,
                  newValue: string | null
                ) => {
                  setCategoryChange(true);
                  if (archerToEdit) {
                    archerToEdit.category = newValue as string;
                  }
                  // auto set gender to mixed for primitive bow and guest
                  setShouldDisableGenderSelect(
                    archerToEdit?.age_group === 'U10'
                  );
                  if (newValue === 'primitive bow' || newValue === 'guest') {
                    setGenderChange(true);
                    setShouldDisableGenderSelect(true);
                    archerToEdit.gender = 'mixed';
                  }
                }}
                startDecorator={
                  <CategoryIcon color='primary' sx={{ marginRight: 0.5 }} />
                }
                required
              >
                {BOW_CATEGORIES.slice(1).map((category: string) => {
                  const translationKey = `tableCategory${category.replace(
                    /\s+/g,
                    ''
                  )}`;
                  return (
                    <Option key={category} value={category.toLowerCase()}>
                      {t(translationKey)}
                    </Option>
                  );
                })}
              </Select>
            </Stack>
            <Stack direction='column' gap={0.5} width='100%'>
              <Typography>{t('ageGroup')}</Typography>
              <Select
                variant='outlined'
                defaultValue={
                  archerToEdit?.age_group === 'adults'
                    ? capitalize(archerToEdit?.age_group)
                    : archerToEdit?.age_group ?? ''
                }
                placeholder={t('selectAgeGroup')}
                onChange={(
                  _event: SyntheticEvent | null,
                  newValue: string | null
                ) => {
                  setAgeGroupChange(true);
                  if (archerToEdit) {
                    archerToEdit.age_group =
                      newValue !== 'Adults' ? (newValue as string) : 'adults';
                  }
                  // auto set gender to mixed for U10
                  setShouldDisableGenderSelect(
                    archerToEdit?.category === 'primitive bow' ||
                      archerToEdit?.category === 'guest'
                  );
                  if (newValue === 'U10') {
                    setGenderChange(true);
                    setShouldDisableGenderSelect(true);
                    archerToEdit.gender = 'mixed';
                  }
                }}
                startDecorator={
                  <HourglassTopIcon color='primary' sx={{ marginRight: 0.5 }} />
                }
                required
              >
                {AGE_GROUPS.slice(1).map((ageGroup: string) => {
                  const translationKey = `tableAgeGroup${ageGroup}`;
                  return (
                    <Option key={ageGroup} value={ageGroup}>
                      {t(translationKey)}
                    </Option>
                  );
                })}
              </Select>
            </Stack>
            <Stack direction='column' gap={0.5} width='100%'>
              <Typography>{t('gender')}</Typography>
              <Select
                variant='outlined'
                value={capitalize(archerToEdit?.gender)}
                placeholder={t('selectGender')}
                onChange={(
                  _event: SyntheticEvent | null,
                  newValue: string | null
                ) => {
                  setGenderChange(true);
                  if (archerToEdit) {
                    archerToEdit.gender = newValue as string;
                  }
                }}
                startDecorator={
                  <HourglassTopIcon color='primary' sx={{ marginRight: 0.5 }} />
                }
                disabled={shouldDisableGenderSelect}
                required
              >
                {GENDER_OPTIONS.slice(1).map((gender: string) => {
                  const translationKey = `tableGender${gender}`;
                  return (
                    <Option key={gender} value={gender}>
                      {t(translationKey)}
                    </Option>
                  );
                })}
              </Select>
            </Stack>
            <Divider>{t('scores')}</Divider>
            <Stack direction='column' spacing={2} mt={5} mb={2}>
              <Stack direction='row' spacing={2}>
                <ScoreInput
                  id='archer-score-20'
                  name='score-20'
                  type='number'
                  placeholder={`${t('score')} 20`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score20')
                      ? archerToEdit!.score20
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score20')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score20: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score20 = Number(e.target.value);
                    }
                  }}
                />
                <ScoreInput
                  id='archer-score-18'
                  name='score-18'
                  type='number'
                  placeholder={`${t('score')} 18`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score18')
                      ? archerToEdit!.score18
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score18')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score18: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score18 = Number(e.target.value);
                    }
                  }}
                />
                <ScoreInput
                  id='archer-score-16'
                  name='score-16'
                  type='number'
                  placeholder={`${t('score')} 16`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score16')
                      ? archerToEdit!.score16
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score16')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score16: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score16 = Number(e.target.value);
                    }
                  }}
                />
              </Stack>
              <Stack direction='row' spacing={2}>
                <ScoreInput
                  id='archer-score-14'
                  name='score-14'
                  type='number'
                  placeholder={`${t('score')} 14`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score14')
                      ? archerToEdit!.score14
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score14')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score14: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score14 = Number(e.target.value);
                    }
                  }}
                />
                <ScoreInput
                  id='archer-score-12'
                  name='score-12'
                  type='number'
                  placeholder={`${t('score')} 12`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score12')
                      ? archerToEdit!.score12
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score12')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score12: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score12 = Number(e.target.value);
                    }
                  }}
                />
                <ScoreInput
                  id='archer-score-10'
                  name='score-10'
                  type='number'
                  placeholder={`${t('score')} 10`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score10')
                      ? archerToEdit!.score10
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score10')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score10: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score10 = Number(e.target.value);
                    }
                  }}
                />
              </Stack>
              <Stack direction='row' spacing={2}>
                <ScoreInput
                  id='archer-score-8'
                  name='score-8'
                  type='number'
                  placeholder={`${t('score')} 8`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score8')
                      ? archerToEdit!.score8
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score8')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score8: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score8 = Number(e.target.value);
                    }
                  }}
                />
                <ScoreInput
                  id='archer-score-6'
                  name='score-6'
                  type='number'
                  placeholder={`${t('score')} 6`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score6')
                      ? archerToEdit!.score6
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score6')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score6: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score6 = Number(e.target.value);
                    }
                  }}
                />
                <ScoreInput
                  id='archer-score-4'
                  name='score-4'
                  type='number'
                  placeholder={`${t('score')} 4`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score4')
                      ? archerToEdit!.score4
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score4')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score4: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score4 = Number(e.target.value);
                    }
                  }}
                />
              </Stack>
              <Stack direction='row' alignSelf='center' width='30%'>
                <ScoreInput
                  id='archer-score-0'
                  name='score-0'
                  type='number'
                  placeholder={`${t('score')} 0`}
                  defaultValue={
                    isValuePresent(archerToEdit, 'score0')
                      ? archerToEdit!.score0
                      : ''
                  }
                  sx={{
                    borderColor: isValuePresent(archerToEdit, 'score0')
                      ? '#0B6BCB'
                      : '',
                  }}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setScores({
                      ...scores,
                      score0: Number(e.target.value),
                    });
                    if (archerToEdit) {
                      archerToEdit.score0 = Number(e.target.value);
                    }
                  }}
                />
              </Stack>
            </Stack>
          </Stack>
        </form>
      )}
    </ModalWrapper>
  );
};

export default EditArcher;
