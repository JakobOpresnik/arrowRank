import { Select, Option } from '@mui/joy';
import type { SyntheticEvent } from 'react';
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

  const handleCategoryFiltering = (
    _event: SyntheticEvent | null,
    value: string | number | null
  ): void => {
    onChange(value as string);
    queryClient.invalidateQueries({
      queryKey: [
        'archersFiltered',
        competitionId,
        value as string,
        genderFilter,
        ageGroupFilter,
      ],
    });
  };

  return (
    <Select
      name='category'
      variant='plain'
      sx={{ backgroundColor: '#9CC1FF' }}
      value={selectedCategory}
      onChange={handleCategoryFiltering}
    >
      {BOW_CATEGORIES.map((category: string) => {
        console.log(category);
        const translationKey = `tableCategory${category.replace(/\s+/g, '')}`;
        return (
          <Option
            key={category}
            value={category === 'All' ? '' : category.toLowerCase()}
          >
            {category === 'All' ? t('all') : t(translationKey)}
          </Option>
        );
      })}
    </Select>
  );
};

export default SelectCategory;
