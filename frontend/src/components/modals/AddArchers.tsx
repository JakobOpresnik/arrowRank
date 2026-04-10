import { Select, Stack, Text, TextInput, Button, Tabs, Group } from '@mantine/core';
import UploadArchers from '../UploadArchers';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
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
  selectedCompetitionId?: number | null;
}

const AddArchers = ({ open, onClose, selectedCompetitionId }: AddArchersProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { mutate: createArcher } = useAddArcher();
  const [selectedCompetition, setSelectedCompetition] = useState<number | null>(
    selectedCompetitionId ?? null
  );

  useEffect(() => {
    if (open) {
      setSelectedCompetition(selectedCompetitionId ?? null);
      setTouched({});
    }
  }, [open, selectedCompetitionId]);

  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [club, setClub] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const firstNameRef = useRef<HTMLInputElement>(null);

  const touch = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

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
      (firstName?.length ?? 0) >= 2 &&
      (lastName?.length ?? 0) >= 2 &&
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
    () => ageGroup === 'U11' || (ageGroup === 'U16' && category === 'long bow'),
    [ageGroup, category]
  );

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={t('addArchers')}
      maxWidth={520}
    >
      <Tabs defaultValue='upload' onChange={(tab) => {
        if (tab === 'manual') setTimeout(() => firstNameRef.current?.focus(), 0);
      }}>
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
              value={selectedCompetition ? String(selectedCompetition) : null}
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
                  ref={firstNameRef}
                  label={t('firstName')}
                  placeholder={t('enterFirstName')}
                  value={firstName ?? ''}
                  onChange={(e) => setFirstName(e.currentTarget.value)}
                  onBlur={() => touch('firstName')}
                  required
                  error={touched.firstName && (firstName?.length ?? 0) < 2 ? t('errorFirstNameMinLength') : undefined}
                />
                <TextInput
                  label={t('lastName')}
                  placeholder={t('enterLastName')}
                  value={lastName ?? ''}
                  onChange={(e) => setLastName(e.currentTarget.value)}
                  onBlur={() => touch('lastName')}
                  required
                  error={touched.lastName && (lastName?.length ?? 0) < 2 ? t('errorLastNameMinLength') : undefined}
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
                  onBlur={() => touch('club')}
                  required
                  error={
                    touched.club && (!club || club.length < 3)
                      ? t('errorClubMinLength')
                      : undefined
                  }
                />
              </Group>
              <Select
                label={t('competition')}
                placeholder={t('selectCompetitionToJoin')}
                data={competitionData}
                value={selectedCompetition ? String(selectedCompetition) : null}
                leftSection={<IconTrophy size={18} />}
                onChange={(value) =>
                  setSelectedCompetition(value ? Number(value) : null)
                }
                onBlur={() => touch('competition')}
                required
                error={touched.competition && !selectedCompetition ? t('errorCompetitionRequired') : undefined}
              />
              <Group grow gap='md'>
                <Select
                  label={t('bowCategory')}
                  placeholder={t('selectBowCategory')}
                  data={categoryData}
                  leftSection={<IconCategory size={18} />}
                  onChange={(value) => {
                    setCategory(value);
                    if (value === 'long bow' && ageGroup === 'U16') {
                      setGender('mixed');
                    }
                  }}
                  onBlur={() => touch('category')}
                  required
                  error={touched.category && !category ? t('errorCategoryRequired') : undefined}
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
                    if (value === 'U16' && category === 'long bow') {
                      setGender('mixed');
                    }
                  }}
                  onBlur={() => touch('ageGroup')}
                  required
                  error={touched.ageGroup && !ageGroup ? t('errorAgeGroupRequired') : undefined}
                />
              </Group>
              <Select
                label={t('gender')}
                placeholder={t('selectGender')}
                data={genderData}
                value={gender}
                leftSection={<IconGenderBigender size={18} />}
                onChange={(value) => setGender(value)}
                onBlur={() => touch('gender')}
                disabled={isGenderSelectDisabled}
                required
                error={touched.gender && !gender && !isGenderSelectDisabled ? t('errorGenderRequired') : undefined}
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
