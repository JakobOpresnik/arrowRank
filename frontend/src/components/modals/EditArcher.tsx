import {
  useState,
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import {
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Button,
  Divider,
} from '@mantine/core';
import { IconCategory, IconHourglass } from '@tabler/icons-react';
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
  const [scoresChanged, setScoresChanged] = useState<boolean>(false);

  const [scores, setScores] = useState<ArcherScores>(
    initializeScores(archerToEdit)
  );

  const [shouldDisableGenderSelect, setShouldDisableGenderSelect] =
    useState<boolean>(false);

  useEffect(() => {
    setScores(initializeScores(archerToEdit));
    setScoresChanged(false);
  }, [archerToEdit]);

  const handleSubmit = (event: FormEvent<Element>): void => {
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
    return numbers.reduce((acc: number, value: number) => acc + value, 0);
  };

  const validateScores = useCallback((scores: ArcherScores): boolean => {
    return getTotalEnteredScores(scores) === TARGET_TOTAL_SCORE;
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

  const buttonLabel: string = !scoresChanged
    ? t('saveButton').toUpperCase()
    : scoreSum === TARGET_TOTAL_SCORE
    ? t('saveButton').toUpperCase()
    : doesExceedTargetScore
    ? `${t('addScoresExceeds').toUpperCase()} ${TARGET_TOTAL_SCORE}`
    : `${scoreSum} / ${TARGET_TOTAL_SCORE}`;

  const competitionData =
    competitions?.map((c: Competition) => ({
      value: String(c.id),
      label: c.name,
    })) ?? [];

  const archerDisplayValue = archerToEdit
    ? `${archerToEdit.first_name} ${archerToEdit.last_name}`
    : '';

  const categoryData = BOW_CATEGORIES.slice(1).map((cat: string) => ({
    value: cat.toLowerCase(),
    label: t(`tableCategory${cat.replace(/\s+/g, '')}`),
  }));

  const ageGroupData = AGE_GROUPS.slice(1).map((ag: string) => ({
    value: ag,
    label: t(`tableAgeGroup${ag}`),
  }));

  const genderData = GENDER_OPTIONS.slice(1).map((g: string) => ({
    value: g,
    label: t(`tableGender${g}`),
  }));

  const SubmitButton = (
    <Button
      type='submit'
      form='edit-archer-form'
      disabled={!canSubmit}
      h={48}
      fullWidth
      color={doesExceedTargetScore ? 'red' : undefined}
      style={{
        position: 'relative',
        overflow: 'hidden',
        fontSize: '1rem',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${(Math.min(scoreSum, 28) / 28) * 100}%`,
          background: 'rgba(255,255,255,0.25)',
          transition: 'width 0.3s ease',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, color: '#fff' }}>{buttonLabel}</span>
    </Button>
  );

  const makeScoreInput = (key: ScoreKey, points: number) => {
    const hasValue = isValuePresent(archerToEdit, key);
    return (
      <ScoreInput
        placeholder={`${t('score')} ${points}`}
        value={
          scores[key] !== undefined
            ? scores[key]
            : hasValue
            ? archerToEdit![key as keyof Archer] as number
            : ''
        }
        onChange={(val) => {
          setScores({ ...scores, [key]: Number(val) });
          setScoresChanged(true);
          if (archerToEdit) {
            (archerToEdit as any)[key] = Number(val);
          }
        }}
        styles={
          hasValue
            ? { input: { borderColor: 'var(--mantine-color-brand-4)' } }
            : undefined
        }
      />
    );
  };

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('editArcher')}
      actions={SubmitButton}
    >
      {archerToEdit && (
        <form id='edit-archer-form' onSubmit={handleSubmit}>
          <Text size='sm' fw={500} ml={4} mb={4}>
            {t('competition')}
          </Text>
          <Stack gap='lg'>
            <Select
              data={competitionData}
              defaultValue={
                selectedCompetition ? String(selectedCompetition) : undefined
              }
              disabled
            />
            <div>
              <Text size='sm' fw={500} ml={4} mb={4}>
                {t('archer')}
              </Text>
              <TextInput value={archerDisplayValue} disabled />
            </div>

            <TextInput
              label={t('club')}
              placeholder={t('club')}
              defaultValue={archerToEdit.club}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setClubChange(true);
                if (archerToEdit) {
                  archerToEdit.club = e.target.value;
                }
              }}
            />
            <Select
              label={t('bowCategory')}
              placeholder={t('selectBowCategory')}
              data={categoryData}
              defaultValue={archerToEdit?.category ?? ''}
              leftSection={<IconCategory size={18} />}
              onChange={(value) => {
                setCategoryChange(true);
                if (archerToEdit) {
                  archerToEdit.category = value as string;
                }
                setShouldDisableGenderSelect(
                  archerToEdit?.age_group === 'U11'
                );
              }}
            />
            <Select
              label={t('ageGroup')}
              placeholder={t('selectAgeGroup')}
              data={ageGroupData}
              defaultValue={
                archerToEdit?.age_group === 'adults'
                  ? capitalize(archerToEdit?.age_group)
                  : archerToEdit?.age_group ?? ''
              }
              leftSection={<IconHourglass size={18} />}
              onChange={(value) => {
                setAgeGroupChange(true);
                if (archerToEdit) {
                  archerToEdit.age_group =
                    value !== 'Adults' ? (value as string) : 'adults';
                }
                setShouldDisableGenderSelect(false);
                if (value === 'U11') {
                  setGenderChange(true);
                  setShouldDisableGenderSelect(true);
                  archerToEdit.gender = 'mixed';
                }
              }}
            />
            <Select
              label={t('gender')}
              placeholder={t('selectGender')}
              data={genderData}
              value={capitalize(archerToEdit?.gender)}
              leftSection={<IconHourglass size={18} />}
              onChange={(value) => {
                setGenderChange(true);
                if (archerToEdit) {
                  archerToEdit.gender = value as string;
                }
              }}
              disabled={shouldDisableGenderSelect}
            />
            <Divider label={t('scores')} labelPosition='center' />
            <Stack gap='md'>
              <Group grow gap='sm'>
                {makeScoreInput('score20', 20)}
                {makeScoreInput('score18', 18)}
                {makeScoreInput('score16', 16)}
              </Group>
              <Group grow gap='sm'>
                {makeScoreInput('score14', 14)}
                {makeScoreInput('score12', 12)}
                {makeScoreInput('score10', 10)}
              </Group>
              <Group grow gap='sm'>
                {makeScoreInput('score8', 8)}
                {makeScoreInput('score6', 6)}
                {makeScoreInput('score4', 4)}
              </Group>
              <Stack align='center'>
                {makeScoreInput('score0', 0)}
              </Stack>
            </Stack>
          </Stack>
        </form>
      )}
    </ModalWrapper>
  );
};

export default EditArcher;
