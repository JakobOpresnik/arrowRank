import { Select } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { BOW_CATEGORIES } from '../constants';
import { queryClient } from '../lib/queryClient';
import { useFilterStore } from '../stores/useFilterStore';
import { SelectCategoryProps } from '../types';

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
      styles={{
        input: { backgroundColor: 'var(--mantine-color-brand-8)', color: '#f0f0f0', borderColor: 'var(--mantine-color-brand-7)' },
      }}
    />
  );
};

export default SelectCategory;
