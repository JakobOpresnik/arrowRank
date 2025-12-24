import { Avatar, Option, Select, Tooltip } from '@mui/joy';
import { t } from 'i18next';
import { SUPPORTED_LANGUAGES, LANGUAGE_FLAGS } from '../constants';
import { SelectLanguageProps, Language } from '../types';

const SelectLanguage = ({ language, setLanguage }: SelectLanguageProps) => {
  return (
    <Tooltip
      title={t('changeLanguageTooltip')}
      placement='top'
      arrow
      sx={{ paddingInline: 1.5, paddingBlock: 1 }}
    >
      <Select
        name='language'
        variant='plain'
        sx={{ backgroundColor: '#9CC1FF' }}
        value={language}
        onChange={(_e, value: string | null) => setLanguage(value as Language)}
      >
        {SUPPORTED_LANGUAGES.map((lang: string) => (
          <Option
            key={lang}
            label={
              <Avatar
                alt={`${lang} flag`}
                src={LANGUAGE_FLAGS[lang]}
                sx={{ width: 24, height: 24, marginRight: 0.5 }}
              />
            }
            value={lang}
          >
            <Avatar
              alt='Slovenian'
              src={LANGUAGE_FLAGS[lang]}
              sx={{ width: 24, height: 24, marginRight: 0.5 }}
            />
            {lang.toUpperCase()}
          </Option>
        ))}
      </Select>
    </Tooltip>
  );
};

export default SelectLanguage;
