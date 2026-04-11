import { Stack, Text, Group, ThemeIcon, Divider, Badge, Code } from '@mantine/core';
import {
  IconTrophy,
  IconUsersGroup,
  IconTarget,
  IconAward,
  IconDownload,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useTranslation, Trans } from 'react-i18next';
import { ModalWrapper } from './ModalWrapper';

const btnComponents = { btn: <Code /> };

interface AboutAppProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { icon: IconTrophy,      color: 'blue',   titleKey: 'aboutStep1Title', descKey: 'aboutStep1Desc' },
  { icon: IconUsersGroup,  color: 'teal',   titleKey: 'aboutStep2Title', descKey: 'aboutStep2Desc' },
  { icon: IconTarget,      color: 'violet', titleKey: 'aboutStep3Title', descKey: 'aboutStep3Desc' },
  { icon: IconAward,       color: 'yellow', titleKey: 'aboutStep4Title', descKey: 'aboutStep4Desc' },
  { icon: IconDownload,    color: 'green',  titleKey: 'aboutStep5Title', descKey: 'aboutStep5Desc' },
] as const;

const BOW_CATEGORY_KEYS = [
  { key: 'tableCategoryBarebow',        color: 'blue'   },
  { key: 'tableCategoryLongbow',        color: 'teal'   },
  { key: 'tableCategoryTraditionalbow', color: 'violet' },
  { key: 'tableCategoryPrimitivebow',   color: 'orange' },
  { key: 'tableCategoryGuest',          color: 'gray'   },
] as const;

const AGE_GROUP_KEYS = ['tableAgeGroupU11', 'tableAgeGroupU16', 'tableAgeGroupAdults'] as const;

const AboutApp = ({ open, onClose }: AboutAppProps) => {
  const { t } = useTranslation();

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      closeOnClickOutside
      title={
        <Group gap='sm'>
          <IconInfoCircle size={20} />
          <span>{t('aboutTitle')}</span>
        </Group>
      }
      maxWidth={560}
    >
      <Stack gap='lg'>
        {/* App description */}
        <Group gap='sm' align='flex-start' wrap='nowrap'>
          <ThemeIcon size={44} radius='md' variant='light' color='blue' style={{ flexShrink: 0 }}>
            <IconTarget size={26} />
          </ThemeIcon>
          <Stack gap={4}>
            <Text fw={700} size='md'>{t('aboutAppName')}</Text>
            <Text size='sm' c='dimmed'>{t('aboutDescription')}</Text>
          </Stack>
        </Group>

        <Divider label={t('aboutHowToUse')} labelPosition='left' />

        {/* Steps */}
        <Stack gap='md'>
          {STEPS.map((step, i) => (
            <Group key={i} gap='sm' align='flex-start' wrap='nowrap'>
              <ThemeIcon size={36} radius='md' variant='light' color={step.color} style={{ flexShrink: 0 }}>
                <step.icon size={20} />
              </ThemeIcon>
              <Stack gap={2} style={{ flex: 1 }}>
                <Text fw={600} size='sm'>{i + 1}. {t(step.titleKey)}</Text>
                <Text size='sm' c='dimmed'>
                  <Trans i18nKey={step.descKey} components={btnComponents} />
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>

        <Divider label={t('aboutCategories')} labelPosition='left' />

        <Group gap='xs'>
          {BOW_CATEGORY_KEYS.map(({ key, color }) => (
            <Badge key={key} variant='light' color={color}>{t(key)}</Badge>
          ))}
        </Group>

        <Divider label={t('aboutAgeGroups')} labelPosition='left' />

        <Group gap='xs'>
          {AGE_GROUP_KEYS.map((key) => (
            <Badge key={key} variant='outline'>{t(key)}</Badge>
          ))}
        </Group>
      </Stack>
    </ModalWrapper>
  );
};

export default AboutApp;
