import { useMemo, useState, type ChangeEvent } from 'react';
import { Button, Input, Stack, Tooltip, Typography } from '@mui/joy';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from 'react-i18next';
import { useArchersUpload } from '../hooks/useArchersUpload';
import { useLanguageStore } from '../stores/useLanguageStore';
import { UploadArchersProps, ArchersUploadProps } from '../types';

const UploadArchers = ({ competitionId, onDone }: UploadArchersProps) => {
  const { t } = useTranslation();

  const { language } = useLanguageStore();

  const [file, setFile] = useState<File | null>(null);
  const { mutate: uploadArchers } = useArchersUpload(competitionId ?? 0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const isSubmitDisabled: boolean = useMemo(
    () => !file || competitionId === null,
    [file, competitionId]
  );

  const handleSubmit = (uploadData: ArchersUploadProps): void => {
    if (!file || competitionId === null) return;
    uploadArchers(uploadData, {
      onError: (err: Error) => console.error(err),
      onSuccess: () => {
        onDone();
      },
    });
  };

  const handleClearFile = (): void => {
    setFile(null);
    const input = document.getElementById(
      'archers-file-upload'
    ) as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <Stack direction='column' gap={1}>
      <Typography>{t('uploadArchersFile')}</Typography>
      <Input
        id='archers-file-upload'
        name='file-upload'
        type='file'
        title={t('uploadArchersFileTooltip')}
        sx={{ display: 'none', padding: 1 }}
        onChange={handleFileChange}
        required
        startDecorator={<AttachFileIcon color='primary' />}
      />
      <Stack direction='row' spacing={2}>
        {/* bind the button below to the file input field */}
        <label htmlFor='archers-file-upload'>
          <Button component='span' variant='solid'>
            {t('chooseFile')}
          </Button>
        </label>
        <Tooltip title={t('clearSelectedFile')} placement='right' arrow>
          <Button
            sx={{
              backgroundColor: '#F55656',
              '&:hover': {
                backgroundColor: '#F54242',
              },
            }}
            onClick={handleClearFile}
            disabled={!file}
          >
            <ClearIcon />
          </Button>
        </Tooltip>
      </Stack>
      <Typography ml={0.5}>
        {file ? (
          <>
            {t('selectedFileLabel')}: <b>{file.name}</b>
          </>
        ) : (
          t('noFileSelected')
        )}
      </Typography>
      <Button
        type='submit'
        disabled={isSubmitDisabled}
        sx={{ marginTop: 1 }}
        onClick={() =>
          handleSubmit({ file, competitionId: competitionId ?? 0, language })
        }
      >
        {t('uploadArchersButton').toUpperCase()}
      </Button>
    </Stack>
  );
};

export default UploadArchers;
