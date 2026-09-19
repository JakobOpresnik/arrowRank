import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { GENDER_OPTIONS } from '../constants';
import { queryClient } from '../lib/queryClient';
import { SelectGenderProps } from '../types';
import { FILTER_SELECT_STYLES } from '../theme';

const SelectGender = ({
  competitionId,
  selectedGender,
  onChange,
}: SelectGenderProps) => {
  const { t } = useTranslation();

  const data = GENDER_OPTIONS.map((gender: string) => {
    const translationKey = `tableGender${gender}`;
    return {
      value: gender === 'All' ? '' : gender.toLowerCase(),
      label: gender === 'All' ? t('all') : t(translationKey),
    };
  });

  return (
    <Select
      name='gender'
      size='xs'
      data={data}
      value={selectedGender}
      onChange={(value) => {
        onChange(value ?? '');
        queryClient.invalidateQueries({
          queryKey: ['archersFiltered', competitionId, value],
        });
      }}
      styles={FILTER_SELECT_STYLES}
    />
  );
};

export default SelectGender;
