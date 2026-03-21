import {
  Group,
  Select,
  Stack,
  Text,
  Button,
  Divider,
} from '@mantine/core';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react';
import { IconTrophy, IconSearch } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import ScoreInput from '../ScoreInput';
import { TARGET_TOTAL_SCORE } from '../../constants';
import { useArchers } from '../../hooks/useArchers';
import { useCompetitions } from '../../hooks/useCompetitions';
import {
  ArcherScores,
  scoreKeys,
  ScoreKey,
  AddScoreProps,
  Archer,
  Competition,
} from '../../types';
import { ModalWrapper } from './ModalWrapper';

function initializeScores(): ArcherScores {
  return scoreKeys.reduce((acc, val) => {
    acc[`score${val}` as ScoreKey] = undefined;
    return acc;
  }, {} as ArcherScores);
}

const AddScore = ({
  open,
  selectedCompetition,
  onArcherUpdate,
  onClose,
}: AddScoreProps) => {
  const { t } = useTranslation();

  const [selectedArcher, setSelectedArcher] = useState<Archer | null>(null);
  const [scores, setScores] = useState<ArcherScores>(initializeScores);

  const { data: competitions } = useCompetitions();
  const { data: archers, refetch: refetchArchers } = useArchers(
    selectedCompetition ?? 0
  );

  useEffect(() => {
    if (open) {
      refetchArchers();
    }
  }, [open, refetchArchers]);

  const handleSubmit = (event: FormEvent<Element>): void => {
    event.preventDefault();
    if (selectedCompetition && selectedArcher && scores) {
      onArcherUpdate({
        id: selectedArcher.id,
        first_name: selectedArcher.first_name,
        last_name: selectedArcher.last_name,
        club: selectedArcher.club,
        category: selectedArcher.category,
        age_group: selectedArcher.age_group,
        gender: selectedArcher.gender,
        ...scores,
      });
    }
    setScores(initializeScores);
    setSelectedArcher(null);
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

  const scoreSum: number = useMemo(
    () => getTotalEnteredScores(scores),
    [scores]
  );

  const canSubmit: boolean = useMemo(
    () => !!selectedCompetition && !!selectedArcher && validateScores(scores),
    [selectedCompetition, selectedArcher, scores, validateScores]
  );

  const doesExceedTargetScore: boolean = useMemo(
    () => scoreSum > TARGET_TOTAL_SCORE,
    [scoreSum]
  );

  const buttonLabel: string =
    scoreSum === TARGET_TOTAL_SCORE
      ? t('addScores').toUpperCase()
      : doesExceedTargetScore
      ? `${t('addScoresExceeds').toUpperCase()} ${TARGET_TOTAL_SCORE}`
      : `${scoreSum} / ${TARGET_TOTAL_SCORE}`;

  // Build archer select data - disable those who already have scores
  const archerData = useMemo(() => {
    if (!archers) return [];
    return archers.map((archer: Archer) => {
      const hasScores = scoreKeys.some(
        (key) => archer[`score${key}` as ScoreKey] !== null
      );
      return {
        value: String(archer.id),
        label: `${archer.first_name} ${archer.last_name} (${archer.club})`,
        disabled: hasScores,
      };
    });
  }, [archers]);

  const competitionData =
    competitions?.map((c: Competition) => ({
      value: String(c.id),
      label: c.name,
    })) ?? [];

  const SubmitButton = (
    <Button
      type='submit'
      form='add-score-form'
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

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('addScoreTitle')}
      actions={SubmitButton}
    >
      <form id='add-score-form' onSubmit={handleSubmit}>
        <Text size='sm' fw={500} ml={4} mb={4}>
          {t('competition')}
        </Text>
        <Stack gap='md'>
          <Select
            name='competition'
            data={competitionData}
            defaultValue={selectedCompetition ? String(selectedCompetition) : undefined}
            placeholder={t('selectCompetition')}
            leftSection={<IconTrophy size={18} />}
          />
          <div>
            <Text size='sm' fw={500} ml={4} mb={4}>
              {t('archer')}
            </Text>
            <Select
              name='archer'
              data={archerData}
              placeholder={t('archerSearch')}
              searchable
              nothingFoundMessage={t('archerSelectNoOptions')}
              leftSection={<IconSearch size={18} />}
              onChange={(value) => {
                const archer =
                  archers?.find((a: Archer) => a.id === Number(value)) ?? null;
                setSelectedArcher(archer);
              }}
            />
          </div>
          <Divider label={t('scores')} labelPosition='center' />
          <Stack gap='md'>
            <Group grow gap='sm'>
              <ScoreInput
                placeholder={`${t('score')} 20`}
                value={scores.score20 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score20: Number(val) })
                }
              />
              <ScoreInput
                placeholder={`${t('score')} 18`}
                value={scores.score18 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score18: Number(val) })
                }
              />
              <ScoreInput
                placeholder={`${t('score')} 16`}
                value={scores.score16 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score16: Number(val) })
                }
              />
            </Group>
            <Group grow gap='sm'>
              <ScoreInput
                placeholder={`${t('score')} 14`}
                value={scores.score14 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score14: Number(val) })
                }
              />
              <ScoreInput
                placeholder={`${t('score')} 12`}
                value={scores.score12 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score12: Number(val) })
                }
              />
              <ScoreInput
                placeholder={`${t('score')} 10`}
                value={scores.score10 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score10: Number(val) })
                }
              />
            </Group>
            <Group grow gap='sm'>
              <ScoreInput
                placeholder={`${t('score')} 8`}
                value={scores.score8 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score8: Number(val) })
                }
              />
              <ScoreInput
                placeholder={`${t('score')} 6`}
                value={scores.score6 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score6: Number(val) })
                }
              />
              <ScoreInput
                placeholder={`${t('score')} 4`}
                value={scores.score4 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score4: Number(val) })
                }
              />
            </Group>
            <Stack align='center'>
              <ScoreInput
                placeholder={`${t('score')} 0`}
                value={scores.score0 ?? ''}
                onChange={(val) =>
                  setScores({ ...scores, score0: Number(val) })
                }
              />
            </Stack>
          </Stack>
        </Stack>
      </form>
    </ModalWrapper>
  );
};

export default AddScore;
