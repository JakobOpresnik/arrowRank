import {
  Select,
  Option,
  Stack,
  Typography,
  Input,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  tabClasses,
  FormControl,
  FormLabel,
} from '@mui/joy';
import UploadArchers from '../UploadArchers';
import {
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type SyntheticEvent,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import CategoryIcon from '@mui/icons-material/Category';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import WcIcon from '@mui/icons-material/Wc';
import { useTranslation } from 'react-i18next';
import { Competition } from '../../types';
import { useAddArcher } from '../../hooks/useAddArcher';
import { useCompetitions } from '../../hooks/useCompetitions';
import { BOW_CATEGORIES, AGE_GROUPS, GENDER_OPTIONS } from '../../constants';
import { ModalWrapper } from './ModalWrapper';

interface AddArchersProps {
  open: boolean;
  onClose: () => void;
}

const AddArchers = ({ open, onClose }: AddArchersProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate: createArcher } = useAddArcher();
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(
    null
  );

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [club, setClub] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);

  // const [accordionIndex, setAccordionIndex] = useState<number | null>(0);

  const { data: competitions } = useCompetitions();

  const handleCompetitionChange = (
    _event: SyntheticEvent | null,
    value: string | number | null
  ): void => {
    setSelectedCompetition(value as number);
  };

  const canSubmit: boolean = useMemo(
    () =>
      !!firstName &&
      !!lastName &&
      !!club &&
      !!selectedCompetition &&
      !!category &&
      !!gender &&
      !!ageGroup,
    [firstName, lastName, club, selectedCompetition, category, gender, ageGroup]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    createArcher(
      {
        first_name: firstName ?? '',
        last_name: lastName ?? '',
        email: email ?? '',
        club: club ?? '',
        competition: String(selectedCompetition ?? 0),
        category: category ?? '',
        gender: gender ?? '',
        age_group:
          ageGroup === 'Adults' ? ageGroup.toLowerCase() : ageGroup ?? '',
      },
      {
        onError: (err: Error) => console.error(err),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['archersFiltered'] });
          onClose();
        },
      }
    );
    setFirstName(null);
    setLastName(null);
    setEmail(null);
    setClub(null);
    setCategory(null);
    setAgeGroup(null);
    setGender(null);
    onClose();
  };

  const isGenderSelectDisabled: boolean = useMemo(
    () =>
      ageGroup === 'U10' ||
      category === 'primitive bow' ||
      category === 'guest',
    [ageGroup, category]
  );

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('addArchers')}
      maxWidth={1000}
    >
      <Tabs
        aria-label='add archers tabs'
        orientation='horizontal'
        variant='plain'
        defaultValue={0}
        sx={{ width: 575 }}
      >
        <TabList
          disableUnderline
          sx={{
            p: 0.5,
            gap: 0.5,
            borderRadius: 'xl',
            bgcolor: 'background.level1',
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              boxShadow: 'sm',
              bgcolor: 'background.surface',
            },
          }}
        >
          <Tab disableIndicator sx={{ width: '50%' }}>
            <Stack direction='row' alignItems='center' gap={1.5}>
              <GroupAddIcon color='primary' />
              <Typography>{t('uploadArchers')}</Typography>
            </Stack>
          </Tab>
          <Tab disableIndicator sx={{ width: '50%' }}>
            <Stack direction='row' alignItems='center' gap={1.5}>
              <PersonAddAlt1Icon color='primary' />
              <Typography>{t('addArchersManually')}</Typography>
            </Stack>
          </Tab>
        </TabList>

        <TabPanel value={0}>
          <Stack direction='column' gap={2}>
            <Typography>{t('selectCompetitionAndUploadArchers')}</Typography>
            <Select
              name='competition'
              startDecorator={
                <EmojiEventsIcon color='primary' sx={{ paddingRight: 1 }} />
              }
              defaultValue=''
              placeholder={t('selectCompetition')}
              onChange={handleCompetitionChange}
            >
              {competitions?.map((competition: Competition) => (
                <Option key={competition.id} value={competition.id}>
                  {competition.name}
                </Option>
              ))}
            </Select>
            <UploadArchers
              competitionId={selectedCompetition}
              onDone={() => {
                queryClient.invalidateQueries({ queryKey: ['archers'] });
                onClose();
              }}
            />
          </Stack>
        </TabPanel>

        <TabPanel value={1}>
          <Stack direction='column' gap={2}>
            <form onSubmit={handleSubmit}>
              <Stack direction='column' gap={2.5}>
                <Stack direction='row' gap={2}>
                  <Stack direction='column' sx={{ width: '50%' }}>
                    <FormControl required>
                      <FormLabel>
                        <Typography ml={0.5}>{t('firstName')}</Typography>
                      </FormLabel>
                      <Input
                        id='first-name'
                        name='first-name'
                        type='text'
                        placeholder={t('enterFirstName')}
                        value={firstName ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setFirstName(e.target.value)
                        }
                        required
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction='column' sx={{ width: '50%' }}>
                    <FormControl required>
                      <FormLabel>
                        <Typography ml={0.5}>{t('lastName')}</Typography>
                      </FormLabel>
                      <Input
                        id='last-name'
                        name='last-name'
                        type='text'
                        placeholder={t('enterLastName')}
                        value={lastName ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setLastName(e.target.value)
                        }
                        required
                      />
                    </FormControl>
                  </Stack>
                </Stack>
                <Stack direction='row' gap={2}>
                  <Stack direction='column' sx={{ width: '50%' }}>
                    <FormControl>
                      <FormLabel>
                        <Typography ml={0.5}>{t('email')}</Typography>
                      </FormLabel>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        placeholder={t('enterEmail')}
                        value={email ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setEmail(e.target.value)
                        }
                      />
                    </FormControl>
                  </Stack>
                  <Stack direction='column' sx={{ width: '50%' }}>
                    <FormControl>
                      <FormLabel>
                        <Typography ml={0.5}>{t('club')}</Typography>
                      </FormLabel>
                      <Input
                        id='club'
                        name='club'
                        type='text'
                        placeholder={t('enterClub')}
                        value={club ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setClub(e.target.value)
                        }
                      />
                    </FormControl>
                  </Stack>
                </Stack>
                <Stack direction='column' gap={2}>
                  <Stack direction='column' gap={0.5} width='100%'>
                    <FormControl required>
                      <FormLabel>
                        <Typography>{t('competition')}</Typography>
                      </FormLabel>
                      <Select
                        name='competition'
                        startDecorator={
                          <EmojiEventsIcon
                            color='primary'
                            sx={{ paddingRight: 1 }}
                          />
                        }
                        defaultValue=''
                        placeholder={t('selectCompetitionToJoin')}
                        onChange={handleCompetitionChange}
                        required
                      >
                        {competitions?.map((competition: Competition) => (
                          <Option key={competition.id} value={competition.id}>
                            {competition.name}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction='column' gap={0.5} width='100%'>
                    <FormControl required>
                      <FormLabel>
                        <Typography>{t('bowCategory')}</Typography>
                      </FormLabel>
                      <Select
                        name='bow-category'
                        variant='outlined'
                        defaultValue={category ?? ''}
                        placeholder={t('selectBowCategory')}
                        onChange={(
                          _event: SyntheticEvent | null,
                          newValue: string | null
                        ) => {
                          setCategory(newValue);
                          // auto set gender to mixed for primitive bow and guest
                          if (
                            newValue === 'primitive bow' ||
                            newValue === 'guest'
                          ) {
                            setGender('mixed');
                          }
                        }}
                        startDecorator={
                          <CategoryIcon
                            color='primary'
                            sx={{ marginRight: 0.5 }}
                          />
                        }
                        required
                      >
                        {BOW_CATEGORIES.slice(1).map((category: string) => {
                          const translationKey = `tableCategory${category.replace(
                            /\s+/g,
                            ''
                          )}`;
                          return (
                            <Option
                              key={category}
                              value={category.toLowerCase()}
                            >
                              {t(translationKey)}
                            </Option>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction='column' gap={0.5} width='100%'>
                    <FormControl required>
                      <FormLabel>
                        <Typography>{t('ageGroup')}</Typography>
                      </FormLabel>
                      <Select
                        name='age-group'
                        variant='outlined'
                        value={ageGroup}
                        placeholder={t('selectAgeGroup')}
                        onChange={(
                          _event: SyntheticEvent | null,
                          newValue: string | null
                        ) => {
                          setAgeGroup(newValue);
                          // auto set gender to mixed for U10
                          if (newValue === 'U10') {
                            setGender('mixed');
                          }
                        }}
                        startDecorator={
                          <HourglassTopIcon
                            color='primary'
                            sx={{ marginRight: 0.5 }}
                          />
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
                    </FormControl>
                  </Stack>
                  <Stack direction='column' gap={0.5} width='100%'>
                    <FormControl>
                      <FormLabel>
                        <Typography>{t('gender')}</Typography>
                      </FormLabel>
                      <Select
                        name='gender'
                        variant='outlined'
                        value={gender}
                        placeholder={t('selectGender')}
                        onChange={(
                          _event: SyntheticEvent | null,
                          newValue: string | null
                        ) => {
                          setGender(newValue);
                        }}
                        startDecorator={
                          <WcIcon color='primary' sx={{ marginRight: 0.5 }} />
                        }
                        disabled={isGenderSelectDisabled}
                        required
                      >
                        {GENDER_OPTIONS.slice(1).map((gender: string) => {
                          const translationKey = `tableGender${gender}`;
                          return (
                            <Option key={gender} value={gender.toLowerCase()}>
                              {t(translationKey)}
                            </Option>
                          );
                        })}
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
                <Button sx={{ mt: 1 }} type='submit' disabled={!canSubmit}>
                  {t('addArcherButton').toUpperCase()}
                </Button>
              </Stack>
            </form>
          </Stack>
        </TabPanel>
      </Tabs>
    </ModalWrapper>
  );
};

export default AddArchers;
