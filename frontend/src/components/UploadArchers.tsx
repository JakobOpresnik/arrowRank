import { useMemo, useState, type ChangeEvent } from 'react';
import { Button, Stack, Text, Tooltip, ActionIcon, Group } from '@mantine/core';
import { IconPaperclip, IconX } from '@tabler/icons-react';
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
      onError: (err: Error) => {
        console.error(err);
        alert(`Upload error: ${err.message}`);
      },
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
    <Stack gap='sm'>
      <Text>{t('uploadArchersFile')}</Text>
      <input
        id='archers-file-upload'
        name='file-upload'
        type='file'
        title={t('uploadArchersFileTooltip')}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <Group gap='sm'>
        <label htmlFor='archers-file-upload'>
          <Button component='span' leftSection={<IconPaperclip size={18} />}>
            {t('chooseFile')}
          </Button>
        </label>
        <Tooltip label={t('clearSelectedFile')} position='right' withArrow>
          <ActionIcon
            variant='filled'
            style={{ backgroundColor: '#F55656', color: '#fff' }}
            size='lg'
            onClick={handleClearFile}
            disabled={!file}
          >
            <IconX size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Text size='sm' ml={4}>
        {file ? (
          <>
            {t('selectedFileLabel')}: <b>{file.name}</b>
          </>
        ) : (
          t('noFileSelected')
        )}
      </Text>
      <Button
        disabled={isSubmitDisabled}
        mt='xs'
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
