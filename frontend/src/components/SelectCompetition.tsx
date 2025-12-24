import { Select, Option, Typography, type SelectOption } from '@mui/joy';
import { type SyntheticEvent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompetitions } from '../hooks/useCompetitions';
import { Competition, SelectCompetitionProps } from '../types';
import { useCompetitionStore } from '../stores/useCompetitionStore';

const SelectCompetition = ({ onSelect }: SelectCompetitionProps) => {
  const { t } = useTranslation();
  const { data: competitions } = useCompetitions();
  const { selectedCompetition, setSelectedCompetition, deselectCompetition } =
    useCompetitionStore();

  const SelectedOption = (option: SelectOption<number> | null) => {
    const selectedId = option?.value as number;
    const item: Competition | undefined = competitions?.find(
      (c) => c.id === selectedId
    );
    const label: string = item?.name ?? '';
    return (
      <Typography
        title={label} // shows full value on hover
        noWrap
        sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          display: 'block',
        }}
      >
        {label}
      </Typography>
    );
  };

  const handleCompetitionChange = (
    _event: SyntheticEvent | null,
    value: number | null
  ): void => {
    if (competitions) {
      const competition: Competition | null =
        competitions.find((comp: Competition) => comp.id === value) || null;
      setSelectedCompetition(competition);
      onSelect?.();
    }
  };

  /* useEffect(() => {
    deselectCompetition(selectedCompetition?.id || 0);
  }, [selectedCompetition, deselectCompetition]); */

  return (
    <Select
      name='competition'
      onChange={handleCompetitionChange}
      value={selectedCompetition?.id ?? null}
      placeholder={t('selectCompetition')}
      sx={{ width: 250 }}
      renderValue={SelectedOption}
      slotProps={{
        listbox: {
          sx: {
            maxWidth: 300, // or whatever you want
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          },
        },
      }}
    >
      {competitions && competitions.length > 0 ? (
        competitions.map((competition: Competition) => (
          <Option key={competition.id} value={competition.id}>
            {competition.name}
          </Option>
        ))
      ) : (
        <Option value='' disabled>
          {t('noCompetitionsAvailable')}
        </Option>
      )}
    </Select>
  );
};

export default SelectCompetition;
