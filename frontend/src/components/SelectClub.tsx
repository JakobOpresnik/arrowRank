import { Select, Option } from '@mui/joy';
import { type SyntheticEvent } from 'react';
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

  const handleClubFiltering = (
    _event: SyntheticEvent | null,
    value: string | number | null
  ): void => {
    onChange(value as string);
    queryClient.invalidateQueries({
      queryKey: ['archersFiltered', competitionId, value as string],
    });
  };
  return (
    <Select
      name='club'
      variant='plain'
      sx={{ backgroundColor: '#9CC1FF' }}
      value={selectedClub}
      onChange={handleClubFiltering}
    >
      {clubs.map((club: string) => (
        <Option key={club} value={club === 'All' ? '' : club}>
          {club === 'All' ? t('all') : club}
        </Option>
      ))}
    </Select>
  );
};

export default SelectClub;
