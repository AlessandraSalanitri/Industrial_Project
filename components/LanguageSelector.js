// components/LanguageSelector.js

import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

export default function LanguageSelector() {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;
  const { t } = useTranslation();

  const handleChange = (newLocale) => {
    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  const languages = [
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'it', name: 'Italian', flag: 'https://flagcdn.com/w40/it.png' },
    { code: 'ro', name: 'Romanian', flag: 'https://flagcdn.com/w40/ro.png' }
  ];

  return (
    <div className="language-section">
      <div className="language-label">
        {/* 🌍 <strong>{t('language')}</strong> */}
      </div>
      <div className="language-buttons">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            className={`language-button ${locale === lang.code ? 'active' : ''}`}
          >
            <img src={lang.flag} alt={lang.name} width={20} height={15} />
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
