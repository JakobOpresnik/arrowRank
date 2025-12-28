import {
  Autocomplete,
  FormControl,
  Select,
  Stack,
  Typography,
  Option,
  Button,
  Divider,
} from '@mui/joy';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type SyntheticEvent,
} from 'react';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SearchIcon from '@mui/icons-material/Search';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_selectedAnotherCompetition, setSelectedAnotherCompetition] = useState<
    number | null
  >(selectedCompetition);

  const [scores, setScores] = useState<ArcherScores>(initializeScores);

  const { data: competitions } = useCompetitions();
  const { data: archers, refetch: refetchArchers } = useArchers(
    selectedCompetition ?? 0
  );

  const handleCompetitionChange = (
    _event: SyntheticEvent | null,
    value: string | number | null
  ): void => {
    setSelectedAnotherCompetition(value as number);
  };

  // refetch archers every time the modal is opened,
  // to disable archers who already have scores
  useEffect(() => {
    if (open) {
      refetchArchers();
    }
  }, [open, refetchArchers]);

  const handleSubmit = (event: FormEvent<Element>): void => {
    event.preventDefault();
    if (selectedCompetition && selectedArcher && scores) {
      onArcherUpdate({
        first_name: selectedArcher.first_name,
        last_name: selectedArcher.last_name,
        club: selectedArcher.club,
        category: selectedArcher.category,
        age_group: selectedArcher.age_group,
        gender: selectedArcher.gender,
        ...scores,
      });
    }
    // reset score inputs
    setScores(initializeScores);
    setSelectedArcher(null);
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

  const SubmitButton = (
    <Button
      type='submit'
      form='add-score-form'
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
      title={t('addScoreTitle')}
      actions={SubmitButton}
    >
      <form id='add-score-form' onSubmit={handleSubmit}>
        <Typography ml={0.5} mb={0.5}>
          {t('competition')}
        </Typography>
        <Stack direction='column' spacing={2}>
          <Select
            name='competition'
            defaultValue={selectedCompetition}
            onChange={handleCompetitionChange}
            placeholder={t('selectCompetition')}
            startDecorator={
              <EmojiEventsIcon color='primary' sx={{ marginRight: 0.5 }} />
            }
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
              placeholder={t('archerSearch')}
              onChange={(
                _event: SyntheticEvent<Element, Event>,
                value: Archer | null
              ): void => {
                setSelectedArcher(value);
              }}
              getOptionLabel={(option: Archer) =>
                `${option.first_name} ${option.last_name} (${option.club})`
              }
              getOptionDisabled={(archer: Archer) =>
                scoreKeys.some(
                  (key) => archer[`score${key}` as ScoreKey] !== null
                )
              }
              noOptionsText={t('archerSelectNoOptions')}
              startDecorator={
                <SearchIcon color='primary' sx={{ marginRight: 0.5 }} />
              }
            />
          </FormControl>
          <Divider>{t('scores')}</Divider>
          <Stack direction='column' spacing={2} mt={5} mb={2}>
            <Stack direction='row' spacing={2}>
              <ScoreInput
                id='archer-score-20'
                name='score-20'
                type='number'
                placeholder={`${t('score')} 20`}
                value={scores.score20 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score20: Number(e.target.value) })
                }
              />
              <ScoreInput
                id='archer-score-18'
                name='score-18'
                type='number'
                placeholder={`${t('score')} 18`}
                value={scores.score18 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score18: Number(e.target.value) })
                }
              />
              <ScoreInput
                id='archer-score-16'
                name='score-16'
                type='number'
                placeholder={`${t('score')} 16`}
                value={scores.score16 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score16: Number(e.target.value) })
                }
              />
            </Stack>
            <Stack direction='row' spacing={2}>
              <ScoreInput
                id='archer-score-14'
                name='score-14'
                type='number'
                placeholder={`${t('score')} 14`}
                value={scores.score14 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score14: Number(e.target.value) })
                }
              />
              <ScoreInput
                id='archer-score-12'
                name='score-12'
                type='number'
                placeholder={`${t('score')} 12`}
                value={scores.score12 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score12: Number(e.target.value) })
                }
              />
              <ScoreInput
                id='archer-score-10'
                name='score-10'
                type='number'
                placeholder={`${t('score')} 10`}
                value={scores.score10 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score10: Number(e.target.value) })
                }
              />
            </Stack>
            <Stack direction='row' spacing={2}>
              <ScoreInput
                id='archer-score-8'
                name='score-8'
                type='number'
                placeholder={`${t('score')} 8`}
                value={scores.score8 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score8: Number(e.target.value) })
                }
              />
              <ScoreInput
                id='archer-score-6'
                name='score-6'
                type='number'
                placeholder={`${t('score')} 6`}
                value={scores.score6 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score6: Number(e.target.value) })
                }
              />
              <ScoreInput
                id='archer-score-4'
                name='score-4'
                type='number'
                placeholder={`${t('score')} 4`}
                value={scores.score4 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score4: Number(e.target.value) })
                }
              />
            </Stack>
            <Stack direction='row' alignSelf='center' width='30%'>
              <ScoreInput
                id='archer-score-0'
                name='score-0'
                type='number'
                placeholder={`${t('score')} 0`}
                value={scores.score0 ?? ''}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setScores({ ...scores, score0: Number(e.target.value) })
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
