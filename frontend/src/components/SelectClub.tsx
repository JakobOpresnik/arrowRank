import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { queryClient } from '../lib/queryClient';
import { SelectClubProps } from '../types';
import { FILTER_SELECT_STYLES } from '../theme';

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
      size='sm'
      data={data}
      value={selectedClub}
      onChange={(value) => {
        onChange(value ?? '');
        queryClient.invalidateQueries({
          queryKey: ['archersFiltered', competitionId, value],
        });
      }}
      label={t('tableClub')}
      w={170}
      styles={FILTER_SELECT_STYLES}
    />
  );
};

export default SelectClub;
