import { Select, Option } from '@mui/joy';
import type { SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { AGE_GROUPS } from '../constants';
import { SelectAgeGroupProps } from '../types';
import { queryClient } from '../lib/queryClient';

const SelectAgeGroup = ({
  competitionId,
  selectedAgeGroup,
  onChange,
}: SelectAgeGroupProps) => {
  const { t } = useTranslation();

  const handleAgeGroupFiltering = (
    _event: SyntheticEvent | null,
    value: string | number | null
  ): void => {
    onChange(value as string);
    queryClient.invalidateQueries({
      queryKey: ['archersFiltered', competitionId, value as string],
    });
  };

  const getAgeGroupValue = (ageGroup: string): string => {
    if (ageGroup === 'All') return '';
    return ageGroup === 'Adults' ? ageGroup.toLowerCase() : ageGroup;
  };

  return (
    <Select
      name='age-group'
      variant='plain'
      sx={{ backgroundColor: '#9CC1FF' }}
      value={selectedAgeGroup}
      onChange={handleAgeGroupFiltering}
    >
      {AGE_GROUPS.map((ageGroup: string) => {
        const translationKey = `tableAgeGroup${ageGroup}`;
        return (
          <Option key={ageGroup} value={getAgeGroupValue(ageGroup)}>
            {ageGroup === 'All' ? t('all') : t(translationKey)}
          </Option>
        );
      })}
    </Select>
  );
};

export default SelectAgeGroup;
