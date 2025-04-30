export const TTSProviders = {
    BROWSER: 'browser',
  };
  
  let currentProvider = TTSProviders.BROWSER;
  
  export const setTTSProvider = (provider) => {
    currentProvider = provider;
  };
  
  // Text-to-Speech with SpeechSynthesisUtterance
  export const synthesizeSpeech = async (text, voiceParams) => {
    if (currentProvider === TTSProviders.BROWSER) {
      return browserTTS(text, voiceParams);
    }
  
    throw new Error('Unsupported TTS provider');
  };
  
  const browserTTS = async (text, { voice }) => {
    return new Promise((resolve, reject) => {
      if (!text.trim()) return reject("Text is empty");
  
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voice;
      utterance.lang = voice.lang;
  
      utterance.onend = () => resolve("done");
      utterance.onerror = (e) => reject(e);
  
      speechSynthesis.speak(utterance);
    });
  };