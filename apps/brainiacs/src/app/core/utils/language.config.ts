export interface LangOption {
  code: string;
  labelKey: string;
}

export const AVAILABLE_LANGS: LangOption[] = [
  { code: 'en', labelKey: 'navigation.selectLanguage.en' },
  { code: 'pl', labelKey: 'navigation.selectLanguage.pl' }
];
