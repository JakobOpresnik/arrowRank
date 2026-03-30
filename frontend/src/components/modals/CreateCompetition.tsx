import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Button,
  Stack,
  Text,
  TextInput,
  Tooltip,
  Paper,
  Group,
  ActionIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconMapPin, IconX, IconPhoto } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { BE_BASE_URL } from '../../constants';
import { useAddCompetition } from '../../hooks/useAddCompetition';
import { useUploadCompetitionLogo } from '../../hooks/useUploadCompetitionLogo';
import { useFilterStore, FilterStore } from '../../stores/useFilterStore';
import { CreateCompetitionProps, Competition } from '../../types';
import { ModalWrapper } from './ModalWrapper';
import 'dayjs/locale/sl';

const CreateCompetition = ({
  open,
  selectedCompetition,
  isLogoUploadOnly = false,
  onCreated,
  onUpdated,
  onClose,
}: CreateCompetitionProps) => {
  const { t } = useTranslation();

  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');

  const [logo, setLogo] = useState<string | null>(
    selectedCompetition?.logo_url && isLogoUploadOnly
      ? `${BE_BASE_URL}${selectedCompetition?.logo_url}`
      : null,
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { mutate: createCompetition } = useAddCompetition();
  const { mutate: uploadCompetitionLogo } = useUploadCompetitionLogo(
    selectedCompetition?.id || 0,
  );

  const clearFilters = useFilterStore(
    (state: FilterStore) => state.clearFilters,
  );

  const isNameValid: boolean = useMemo(() => name.length >= 5, [name]);
  const isDateValid: boolean = useMemo(() => date !== '', [date]);
  const isLocationValid: boolean = useMemo(
    () => location.length >= 5,
    [location],
  );

  const isSubmitDisabled: boolean = useMemo(
    () => !isNameValid || !isDateValid || !isLocationValid,
    [isDateValid, isLocationValid, isNameValid],
  );

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;
    const previewUrl: string = URL.createObjectURL(file);
    setLogo(previewUrl);
    setLogoFile(file);
  };

  const clearFormFields = (): void => {
    setName('');
    setDate('');
    setLocation('');
    setLogo(null);
    setIsSubmitting(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setIsSubmitting(true);

    if (isLogoUploadOnly) {
      uploadCompetitionLogo(
        {
          competitionId: selectedCompetition?.id || 0,
          logoFile: logo ? logoFile : null,
        },
        {
          onError: (err: Error) => console.error(err),
          onSuccess: (updatedCompetition: Competition) => {
            onUpdated?.(updatedCompetition);
            clearFilters();
          },
        },
      );
    } else {
      createCompetition(
        { name, date, location, logoFile },
        {
          onError: (err: Error) => console.error(err),
          onSuccess: () => {
            onCreated?.();
            clearFilters();
          },
        },
      );
    }

    clearFormFields();
    onClose();
  };

  const handleClearFile = (): void => {
    setLogo(null);
    const input = document.getElementById(
      'competition-image',
    ) as HTMLInputElement;
    if (input) input.value = '';
  };

  const doesLogoExist: boolean = !!logo || !!selectedCompetition?.logo_url;

  const submitButtonText: string = (
    isLogoUploadOnly ? t('change') : t('submit')
  ).toUpperCase();

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={
        isLogoUploadOnly ? t('competitionUploadLogo') : t('createCompetition')
      }
      actions={
        <Button
          type='submit'
          form='create-competition-form'
          disabled={!isLogoUploadOnly && isSubmitDisabled}
        >
          {submitButtonText}
        </Button>
      }
    >
      {!isLogoUploadOnly && (
        <Text size='sm' c='dimmed' mb='sm'>
          {t('createCompetitionInfo')}
        </Text>
      )}
      <form id='create-competition-form' onSubmit={handleSubmit}>
        <Stack gap='md'>
          {!isLogoUploadOnly && (
            <>
              <TextInput
                label={t('name')}
                placeholder={t('competitionName')}
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                required
                autoFocus
                error={
                  isSubmitting && name.length < 5
                    ? t('competitionNameError')
                    : undefined
                }
              />
              <DatePickerInput
                label={t('date')}
                placeholder={t('date')}
                value={date ? dayjs(date).toDate() : null}
                onChange={(value) => {
                  if (value) setDate(dayjs(value).format('YYYY-MM-DD'));
                  else setDate('');
                }}
                required
                locale='sl'
              />
              <TextInput
                label={t('location')}
                placeholder={t('competitionLocation')}
                value={location}
                onChange={(e) => setLocation(e.currentTarget.value)}
                required
                leftSection={<IconMapPin size={18} />}
                error={
                  isSubmitting && location.length < 5
                    ? t('competitionLocationError')
                    : undefined
                }
              />
            </>
          )}

          <Stack gap={6}>
            {!isLogoUploadOnly && (
              <Text size='sm' fw={500}>
                {t('competitionLogo')}
              </Text>
            )}
            <Group gap='sm'>
              <input
                id='competition-image'
                name='logo-upload'
                type='file'
                accept='image/*'
                style={{ display: 'none' }}
                onChange={handleLogoUpload}
              />
              <label htmlFor='competition-image'>
                <Button component='span' leftSection={<IconPhoto size={18} />}>
                  {doesLogoExist
                    ? t('competitionLogoChange')
                    : t('competitionLogoAdd')}
                </Button>
              </label>
              <Tooltip label={t('competitionLogoDelete')} position='right'>
                <ActionIcon
                  variant='filled'
                  style={{ backgroundColor: '#F55656', color: '#fff' }}
                  size='lg'
                  onClick={handleClearFile}
                  disabled={!isLogoUploadOnly && !logo}
                >
                  <IconX size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Stack>
          {logo && (
            <Paper withBorder w={300} p='xs'>
              <img
                src={logo}
                alt={t('competitionLogoPreviewAltText')}
                style={{ width: '100%', borderRadius: 8 }}
              />
            </Paper>
          )}
        </Stack>
      </form>
    </ModalWrapper>
  );
};

export default CreateCompetition;
