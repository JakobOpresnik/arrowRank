import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { AGE_GROUPS } from '../constants';
import { SelectAgeGroupProps } from '../types';
import { FILTER_SELECT_STYLES } from '../theme';
import { queryClient } from '../lib/queryClient';

const SelectAgeGroup = ({
  competitionId,
  selectedAgeGroup,
  onChange,
}: SelectAgeGroupProps) => {
  const { t } = useTranslation();

  const getAgeGroupValue = (ageGroup: string): string => {
    if (ageGroup === 'All') return '';
    return ageGroup === 'Adults' ? ageGroup.toLowerCase() : ageGroup;
  };

  const data = AGE_GROUPS.map((ageGroup: string) => {
    const translationKey = `tableAgeGroup${ageGroup}`;
    return {
      value: getAgeGroupValue(ageGroup),
      label: ageGroup === 'All' ? t('all') : t(translationKey),
    };
  });

  return (
    <Select
      name='age-group'
      size='sm'
      data={data}
      value={selectedAgeGroup}
      onChange={(value) => {
        onChange(value ?? '');
        queryClient.invalidateQueries({
          queryKey: ['archersFiltered', competitionId, value],
        });
      }}
      label={t('tableAgeGroup')}
      w={170}
      styles={FILTER_SELECT_STYLES}
    />
  );
};

export default SelectAgeGroup;
