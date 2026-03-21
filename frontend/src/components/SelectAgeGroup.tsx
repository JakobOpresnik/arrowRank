import { Select } from '@mantine/core';
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
      size='xs'
      data={data}
      value={selectedAgeGroup}
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

export default SelectAgeGroup;
