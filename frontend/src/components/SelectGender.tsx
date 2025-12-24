import { Select, Option } from '@mui/joy';
import { type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { GENDER_OPTIONS } from '../constants';
import { queryClient } from '../lib/queryClient';
import { SelectGenderProps } from '../types';

const SelectGender = ({
  competitionId,
  selectedGender,
  onChange,
}: SelectGenderProps) => {
  const { t } = useTranslation();

  const handleGenderFiltering = (
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
      name='gender'
      variant='plain'
      sx={{ backgroundColor: '#9CC1FF' }}
      value={selectedGender}
      onChange={handleGenderFiltering}
    >
      {GENDER_OPTIONS.map((gender: string) => {
        const translationKey = `tableGender${gender}`;
        return (
          <Option
            key={gender}
            value={gender === 'All' ? '' : gender.toLowerCase()}
          >
            {gender === 'All' ? t('all') : t(translationKey)}
          </Option>
        );
      })}
    </Select>
  );
};

export default SelectGender;
