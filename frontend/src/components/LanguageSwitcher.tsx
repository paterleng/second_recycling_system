import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useLanguage, Language } from './LanguageContext';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
  { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' }
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
      <SelectTrigger className="w-[140px] bg-transparent border-border hover:bg-accent/50 transition-colors">
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {currentLanguage?.flag} {currentLanguage?.name}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent align="end" className="bg-popover border-border">
        {languages.map((lang) => (
          <SelectItem 
            key={lang.code} 
            value={lang.code}
            className="hover:bg-accent focus:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}