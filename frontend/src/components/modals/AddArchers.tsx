import { Select, Stack, Text, TextInput, Button, Tabs, Group } from '@mantine/core';
import UploadArchers from '../UploadArchers';
import { useMemo, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  IconTrophy,
  IconUsersGroup,
  IconUserPlus,
  IconCategory,
  IconHourglass,
  IconGenderBigender,
} from '@tabler/icons-react';
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

  const { data: competitions } = useCompetitions();

  const competitionData =
    competitions?.map((c: Competition) => ({
      value: String(c.id),
      label: c.name,
    })) ?? [];

  const categoryData = BOW_CATEGORIES.slice(1).map((cat: string) => ({
    value: cat.toLowerCase(),
    label: t(`tableCategory${cat.replace(/\s+/g, '')}`),
  }));

  const ageGroupData = AGE_GROUPS.slice(1).map((ag: string) => ({
    value: ag,
    label: t(`tableAgeGroup${ag}`),
  }));

  const genderData = GENDER_OPTIONS.slice(1).map((g: string) => ({
    value: g.toLowerCase(),
    label: t(`tableGender${g}`),
  }));

  const canSubmit: boolean = useMemo(
    () =>
      !!firstName &&
      !!lastName &&
      !!club &&
      club.length >= 3 &&
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
        onError: (err: Error) => {
          console.error(err);
          alert(`Error: ${err.message}`);
        },
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['archersFiltered'] });
          setFirstName(null);
          setLastName(null);
          setEmail(null);
          setClub(null);
          setCategory(null);
          setAgeGroup(null);
          setGender(null);
          onClose();
        },
      }
    );
  };

  const isGenderSelectDisabled: boolean = useMemo(
    () => ageGroup === 'U11',
    [ageGroup]
  );

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('addArchers')}
      maxWidth={520}
    >
      <Tabs defaultValue='upload'>
        <Tabs.List grow>
          <Tabs.Tab
            value='upload'
            leftSection={<IconUsersGroup size={18} />}
          >
            {t('uploadArchers')}
          </Tabs.Tab>
          <Tabs.Tab
            value='manual'
            leftSection={<IconUserPlus size={18} />}
          >
            {t('addArchersManually')}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='upload' pt='md'>
          <Stack gap='md'>
            <Text>{t('selectCompetitionAndUploadArchers')}</Text>
            <Select
              name='competition'
              placeholder={t('selectCompetition')}
              data={competitionData}
              leftSection={<IconTrophy size={18} />}
              onChange={(value) =>
                setSelectedCompetition(value ? Number(value) : null)
              }
            />
            <UploadArchers
              competitionId={selectedCompetition}
              onDone={() => {
                queryClient.invalidateQueries({ queryKey: ['archers'] });
                onClose();
              }}
            />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value='manual' pt='md'>
          <form onSubmit={handleSubmit}>
            <Stack gap='lg'>
              <Group grow gap='md'>
                <TextInput
                  label={t('firstName')}
                  placeholder={t('enterFirstName')}
                  value={firstName ?? ''}
                  onChange={(e) => setFirstName(e.currentTarget.value)}
                  required
                />
                <TextInput
                  label={t('lastName')}
                  placeholder={t('enterLastName')}
                  value={lastName ?? ''}
                  onChange={(e) => setLastName(e.currentTarget.value)}
                  required
                />
              </Group>
              <Group grow gap='md'>
                <TextInput
                  label={t('email')}
                  placeholder={t('enterEmail')}
                  value={email ?? ''}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  type='email'
                />
                <TextInput
                  label={t('club')}
                  placeholder={t('enterClub')}
                  value={club ?? ''}
                  onChange={(e) => setClub(e.currentTarget.value)}
                  required
                  error={
                    club !== null && club.length > 0 && club.length < 3
                      ? 'Club name must be at least 3 characters'
                      : undefined
                  }
                />
              </Group>
              <Select
                label={t('competition')}
                placeholder={t('selectCompetitionToJoin')}
                data={competitionData}
                leftSection={<IconTrophy size={18} />}
                onChange={(value) =>
                  setSelectedCompetition(value ? Number(value) : null)
                }
                required
              />
              <Group grow gap='md'>
                <Select
                  label={t('bowCategory')}
                  placeholder={t('selectBowCategory')}
                  data={categoryData}
                  leftSection={<IconCategory size={18} />}
                  onChange={(value) => setCategory(value)}
                  required
                />
                <Select
                  label={t('ageGroup')}
                  placeholder={t('selectAgeGroup')}
                  data={ageGroupData}
                  value={ageGroup}
                  leftSection={<IconHourglass size={18} />}
                  onChange={(value) => {
                    setAgeGroup(value);
                    if (value === 'U11') {
                      setGender('mixed');
                    }
                  }}
                  required
                />
              </Group>
              <Select
                label={t('gender')}
                placeholder={t('selectGender')}
                data={genderData}
                value={gender}
                leftSection={<IconGenderBigender size={18} />}
                onChange={(value) => setGender(value)}
                disabled={isGenderSelectDisabled}
                required
              />
              <Button mt='xs' type='submit' disabled={!canSubmit}>
                {t('addArcherButton').toUpperCase()}
              </Button>
            </Stack>
          </form>
        </Tabs.Panel>
      </Tabs>
    </ModalWrapper>
  );
};

export default AddArchers;
