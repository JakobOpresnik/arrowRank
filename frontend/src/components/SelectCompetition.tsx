import { useState } from 'react';
import { Select, ActionIcon, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCompetitions } from '../hooks/useCompetitions';
import { Competition, SelectCompetitionProps } from '../types';
import { useCompetitionStore } from '../stores/useCompetitionStore';
import { useDeleteCompetition } from '../hooks/useDeleteCompetition';
import ConfirmDeleteCompetition from './modals/ConfirmDeleteCompetition';

const SelectCompetition = ({ onSelect }: SelectCompetitionProps) => {
  const { t } = useTranslation();
  const { data: competitions } = useCompetitions();
  const { selectedCompetition, setSelectedCompetition } = useCompetitionStore();
  const { mutate: deleteCompetition } = useDeleteCompetition();

  const [competitionToDelete, setCompetitionToDelete] = useState<{ id: number; name: string } | null>(null);

  const data =
    competitions && competitions.length > 0
      ? competitions.map((c: Competition) => ({
          value: String(c.id),
          label: c.name,
        }))
      : [{ value: '', label: t('noCompetitionsAvailable'), disabled: true }];

  return (
    <>
      <Select
        name='competition'
        placeholder={t('selectCompetition')}
        data={data}
        value={selectedCompetition ? String(selectedCompetition.id) : null}
        onChange={(value) => {
          if (competitions && value) {
            const competition =
              competitions.find((c: Competition) => c.id === Number(value)) ?? null;
            setSelectedCompetition(competition);
            onSelect?.();
          }
        }}
        w={180}
        styles={{
          input: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
        renderOption={({ option }) => (
          <Group justify='space-between' w='100%' wrap='nowrap'>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {option.label}
            </span>
            <ActionIcon
              size='xs'
              color='red'
              variant='subtle'
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setCompetitionToDelete({ id: Number(option.value), name: option.label });
              }}
            >
              <IconTrash size={12} />
            </ActionIcon>
          </Group>
        )}
      />

      <ConfirmDeleteCompetition
        open={competitionToDelete !== null}
        competitionName={competitionToDelete?.name ?? ''}
        onClose={() => setCompetitionToDelete(null)}
        onDelete={() => {
          if (!competitionToDelete) return;
          if (selectedCompetition?.id === competitionToDelete.id) {
            const next = competitions?.find((c: Competition) => c.id !== competitionToDelete.id) ?? null;
            setSelectedCompetition(next);
          }
          deleteCompetition(competitionToDelete.id);
          setCompetitionToDelete(null);
        }}
      />
    </>
  );
};

export default SelectCompetition;
