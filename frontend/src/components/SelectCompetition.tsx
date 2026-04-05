import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useCompetitions } from '../hooks/useCompetitions';
import { Competition, SelectCompetitionProps } from '../types';
import { useCompetitionStore } from '../stores/useCompetitionStore';

const SelectCompetition = ({ onSelect }: SelectCompetitionProps) => {
  const { t } = useTranslation();
  const { data: competitions } = useCompetitions();
  const { selectedCompetition, setSelectedCompetition } = useCompetitionStore();

  const data =
    competitions && competitions.length > 0
      ? competitions.map((c: Competition) => ({
          value: String(c.id),
          label: c.name,
        }))
      : [{ value: '', label: t('noCompetitionsAvailable'), disabled: true }];

  return (
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
    />
  );
};

export default SelectCompetition;
