import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Button,
  Card,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import ClearIcon from '@mui/icons-material/Clear';
import ImageIcon from '@mui/icons-material/Image';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import type { PickerValue } from '@mui/x-date-pickers/internals';
import { useTranslation } from 'react-i18next';
import 'dayjs/locale/sl'; // Slovene locale
import { BE_BASE_URL } from '../../constants';
import { useAddCompetition } from '../../hooks/useAddCompetition';
import { useUploadCompetitionLogo } from '../../hooks/useUploadCompetitionLogo';
import { useFilterStore, FilterStore } from '../../stores/useFilterStore';
import { CreateCompetitionProps, Competition } from '../../types';

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
    selectedCompetition?.logo_url
      ? `${BE_BASE_URL}${selectedCompetition?.logo_url}`
      : null
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { mutate: createCompetition } = useAddCompetition();
  const { mutate: uploadCompetitionLogo } = useUploadCompetitionLogo(
    selectedCompetition?.id || 0
  );

  const clearFilters = useFilterStore(
    (state: FilterStore) => state.clearFilters
  );

  const isNameValid: boolean = useMemo(() => name.length >= 5, [name]);
  const isDateValid: boolean = useMemo(() => date !== '', [date]);
  const isLocationValid: boolean = useMemo(
    () => location.length >= 5,
    [location]
  );

  const isSubmitDisabled: boolean = useMemo(
    () => !isNameValid || !isDateValid || !isLocationValid,
    [isDateValid, isLocationValid, isNameValid]
  );

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>): void => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    // preview for UI
    const previewUrl: string = URL.createObjectURL(file);
    setLogo(previewUrl);

    // actual file for backend upload
    setLogoFile(file);
  };

  const handleSubmitSuccess = (updated?: Competition): void => {
    if (updated) {
      onUpdated?.(updated);
    } else {
      onCreated?.();
    }
    clearFilters();
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
            handleSubmitSuccess(updatedCompetition);
          },
        }
      );
    } else {
      createCompetition(
        { name, date, location, logoFile },
        {
          onError: (err: Error) => console.error(err),
          onSuccess: () => handleSubmitSuccess(),
        }
      );
    }
    onClose();
  };

  const handleClearFile = (): void => {
    setLogo(null);
    const input = document.getElementById(
      'competition-image'
    ) as HTMLInputElement;
    if (input) input.value = '';
  };

  const doesLogoExist: boolean = !!logo || !!selectedCompetition?.logo_url;

  const submitButtonText: string = (
    selectedCompetition ? t('change') : t('submit')
  ).toUpperCase();

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <ModalClose>
          <Button onClick={onClose}></Button>
        </ModalClose>
        <DialogTitle>
          <Typography paddingBottom={2}>
            {isLogoUploadOnly
              ? t('competitionUploadLogo')
              : t('createCompetition')}
          </Typography>
        </DialogTitle>
        {!isLogoUploadOnly && (
          <DialogContent>{t('createCompetitionInfo')}</DialogContent>
        )}
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {!isLogoUploadOnly && (
              <>
                <FormControl>
                  <FormLabel htmlFor='competition-name' required>
                    {t('name')}
                  </FormLabel>
                  <Input
                    id='competition-name'
                    name='name'
                    type='text'
                    placeholder={t('competitionName')}
                    value={name}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setName(e.target.value)
                    }
                    autoFocus
                  />
                  <Typography
                    level='body-xs'
                    paddingLeft={1}
                    sx={{
                      background: '#E64040',
                    }}
                  >
                    {isSubmitting &&
                      name.length < 5 &&
                      t('competitionNameError')}
                  </Typography>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='competition-name' required>
                    {t('date')}
                  </FormLabel>
                  <LocalizationProvider
                    dateAdapter={AdapterDayjs}
                    adapterLocale='sl'
                  >
                    <DatePicker
                      name='competition-date'
                      value={date ? dayjs(date) : null}
                      onChange={(newValue: PickerValue) => {
                        if (newValue) setDate(newValue.format('YYYY-MM-DD'));
                        // store as ISO
                        else setDate('');
                      }}
                      // format='DD.MM.YYYY' // display in Slovene format
                      slotProps={{ textField: { size: 'small' } }} // optional styling
                    />
                  </LocalizationProvider>
                </FormControl>
                <FormControl>
                  <FormLabel htmlFor='competition-name' required>
                    {t('location')}
                  </FormLabel>
                  <Input
                    id='competition-location'
                    name='location'
                    type='text'
                    placeholder={t('competitionLocation')}
                    value={location}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setLocation(e.target.value)
                    }
                    startDecorator={
                      <LocationPinIcon
                        color='primary'
                        sx={{ paddingRight: 0.5 }}
                      />
                    }
                  />

                  <Typography
                    level='body-xs'
                    paddingLeft={1}
                    sx={{
                      background: '#E64040',
                    }}
                  >
                    {isSubmitting &&
                      location.length < 5 &&
                      t('competitionLocationError')}
                  </Typography>
                </FormControl>
              </>
            )}

            <Stack direction='column' gap={0.7}>
              <Typography
                fontSize={14}
                fontWeight={500}
                sx={{ color: '#171A1C' }}
              >
                {t('competitionLogo')}
              </Typography>
              <Stack direction='row' gap={1}>
                <Input
                  id='competition-image'
                  name='logo-upload'
                  type='file'
                  title={t('competitionUploadLogo')}
                  sx={{ display: 'none', padding: 1 }}
                  onChange={handleLogoUpload}
                />

                <label htmlFor='competition-image'>
                  <Button
                    component='span'
                    variant='solid'
                    sx={{ paddingRight: 2.5, paddingTop: 1.1 }}
                    startDecorator={
                      <ImageIcon
                        sx={{
                          marginBottom: 0.35,
                          marginLeft: -0.5,
                          paddingRight: 0.5,
                          color: '#FFF',
                        }}
                      />
                    }
                  >
                    {doesLogoExist
                      ? t('competitionLogoChange')
                      : t('competitionLogoAdd')}
                  </Button>
                </label>
                <Tooltip
                  title={t('competitionLogoDelete')}
                  placement='right'
                  arrow
                >
                  <Button
                    sx={{
                      backgroundColor: '#F55656',
                      '&:hover': {
                        backgroundColor: '#F54242',
                      },
                    }}
                    onClick={handleClearFile}
                    disabled={!isLogoUploadOnly && !logo} // more concise version
                    // disabled={isLogoUploadOnly ? false : !logo}
                  >
                    <ClearIcon />
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>
            {logo && (
              <Card variant='outlined' sx={{ width: 300 }}>
                <img
                  src={logo}
                  alt={t('competitionLogoPreviewAltText')}
                  style={{ width: '100%', borderRadius: 8 }}
                />
              </Card>
            )}
            <Button
              type='submit'
              disabled={!isLogoUploadOnly && isSubmitDisabled} // more concise version
              // disabled={isLogoUploadOnly ? false : isSubmitDisabled}
            >
              {submitButtonText}
            </Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
};

export default CreateCompetition;
