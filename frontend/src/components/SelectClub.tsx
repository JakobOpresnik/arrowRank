import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { queryClient } from '../lib/queryClient';
import { SelectClubProps } from '../types';

const SelectClub = ({
  competitionId,
  clubs,
  selectedClub,
  onChange,
}: SelectClubProps) => {
  const { t } = useTranslation();

  const data = clubs.map((club: string) => ({
    value: club === 'All' ? '' : club,
    label: club === 'All' ? t('all') : club,
  }));

  return (
    <Select
      name='club'
      size='xs'
      data={data}
      value={selectedClub}
      onChange={(value) => {
        onChange(value ?? '');
        queryClient.invalidateQueries({
          queryKey: ['archersFiltered', competitionId, value],
        });
      }}
      styles={{
        input: { backgroundColor: 'var(--mantine-color-brand-8)', color: '#f0f0f0', borderColor: 'var(--mantine-color-brand-7)' },
      }}
    />
  );
};

export default SelectClub;
