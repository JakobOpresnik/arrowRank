import { Badge, Button, Group, Stack, Table, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconTrophy } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCompetitions } from '../hooks/useCompetitions';
import { useCompetitionStore } from '../stores/useCompetitionStore';
import { Competition, CompetitionListProps } from '../types';
import { formatDate } from '../utils/text_utils';
import MissingDataWrapper from './MissingDataWrapper';

const CompetitionList = ({ onBack }: CompetitionListProps) => {
  const { t } = useTranslation();
  const { data: competitions, isLoading, error } = useCompetitions();
  const { selectedCompetition, setSelectedCompetition } = useCompetitionStore();

  const openCompetition = (competition: Competition): void => {
    setSelectedCompetition(competition);
    onBack();
  };

  return (
    <Stack gap='md'>
      <Group justify='space-between' align='center'>
        <Button
          variant='default'
          leftSection={<IconArrowLeft size={18} />}
          onClick={onBack}
        >
          {t('backToScoreboard')}
        </Button>
        <Group gap='xs'>
          <Title order={3}>{t('allCompetitions')}</Title>
          <Badge size='lg' variant='light'>
            {competitions?.length ?? 0}
          </Badge>
        </Group>
        <div style={{ width: 200 }} />
      </Group>

      <MissingDataWrapper
        data={competitions}
        isLoading={isLoading}
        error={error}
      >
        <Table
          striped
          highlightOnHover
          withTableBorder
          styles={{
            th: {
              backgroundColor: 'var(--mantine-color-brand-8)',
              color: '#f0f0f0',
              padding: '8px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 14,
            },
            td: { padding: '8px', textAlign: 'center', fontSize: 14 },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>#</Table.Th>
              <Table.Th>{t('name')}</Table.Th>
              <Table.Th style={{ width: 140 }}>{t('date')}</Table.Th>
              <Table.Th>{t('location')}</Table.Th>
              <Table.Th>{t('organizer')}</Table.Th>
              <Table.Th style={{ width: 120 }} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {competitions?.map((competition: Competition, index: number) => {
              const isSelected = competition.id === selectedCompetition?.id;
              return (
                <Table.Tr
                  key={competition.id}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: isSelected
                      ? 'var(--mantine-color-brand-2)'
                      : undefined,
                  }}
                  onClick={() => openCompetition(competition)}
                >
                  <Table.Td>{index + 1}</Table.Td>
                  <Table.Td>
                    <Text size='sm' fw={isSelected ? 700 : 500} c={isSelected ? 'black' : undefined}>
                      {competition.name}
                    </Text>
                  </Table.Td>
                  <Table.Td c={isSelected ? 'black' : undefined}>
                    {formatDate(competition.date)}
                  </Table.Td>
                  <Table.Td c={isSelected ? 'black' : undefined}>
                    {competition.location}
                  </Table.Td>
                  <Table.Td c={isSelected ? 'black' : undefined}>
                    {competition.organizer || '-'}
                  </Table.Td>
                  <Table.Td>
                    {isSelected ? (
                      <Badge color='brand.8' variant='filled'>
                        {t('selected')}
                      </Badge>
                    ) : (
                      <Button
                        size='xs'
                        variant='light'
                        leftSection={<IconTrophy size={14} />}
                      >
                        {t('openCompetition')}
                      </Button>
                    )}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </MissingDataWrapper>
    </Stack>
  );
};

export default CompetitionList;
