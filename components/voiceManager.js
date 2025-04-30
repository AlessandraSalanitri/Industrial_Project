let availableVoices = [];

export const fetchAvailableVoices = () => {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth.getVoices();
      if (voices.length !== 0) {
        availableVoices = voices;
        resolve(availableVoices);
      } else {
        setTimeout(loadVoices, 100);
      }
    };

    loadVoices();
  });
};

export const getUniqueLanguages = () => {
  const languageSet = new Set(availableVoices.map(voice => voice.lang));
  const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

  const languages = Array.from(languageSet).map(code => ({
    code,
    name: languageNames.of(code)
  }));

  // let english be first and sort the rest alphabetically
  languages.sort((a, b) => {
    if (a.code.startsWith('en')) return -1;
    if (b.code.startsWith('en')) return 1;
    return a.name.localeCompare(b.name);
  });

  return languages;
};

export const getVoicesByLanguage = (languageCode) => {
  return availableVoices.filter(voice => voice.lang === languageCode);
};
