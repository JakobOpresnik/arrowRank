import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { BOW_CATEGORIES } from '../constants';
import { queryClient } from '../lib/queryClient';
import { useFilterStore } from '../stores/useFilterStore';
import { SelectCategoryProps } from '../types';
import { FILTER_SELECT_STYLES } from '../theme';

const SelectCategory = ({
  competitionId,
  selectedCategory,
  onChange,
}: SelectCategoryProps) => {
  const { t } = useTranslation();
  const { genderFilter, ageGroupFilter } = useFilterStore();

  const data = BOW_CATEGORIES.map((category: string) => {
    const translationKey = `tableCategory${category.replace(/\s+/g, '')}`;
    return {
      value: category === 'All' ? '' : category.toLowerCase(),
      label: category === 'All' ? t('all') : t(translationKey),
    };
  });

  return (
    <Select
      name='category'
      size='xs'
      data={data}
      value={selectedCategory}
      onChange={(value) => {
        onChange(value ?? '');
        queryClient.invalidateQueries({
          queryKey: [
            'archersFiltered',
            competitionId,
            value,
            genderFilter,
            ageGroupFilter,
          ],
        });
      }}
      styles={FILTER_SELECT_STYLES}
    />
  );
};

export default SelectCategory;
