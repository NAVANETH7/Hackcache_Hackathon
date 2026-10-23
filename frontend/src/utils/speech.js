/**
 * Accessible Web Speech API Audio Guidance Wrapper
 * Tuned for elderly comprehension (calm rate, natural pitch)
 */

let speechSynth = typeof window !== 'undefined' ? window.speechSynthesis : null;

export function speakText(text, language = 'ta') {
  if (!speechSynth) {
    console.warn('[Speech] Web Speech API not supported on this browser');
    return false;
  }

  try {
    speechSynth.cancel(); // Cancel any existing speech utterance

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.85; // Slightly slower pace for elderly clarity
    utterance.pitch = 1.0;

    // Map language code to standard locale
    const langMap = {
      ta: 'ta-IN',
      hi: 'hi-IN',
      en: 'en-IN'
    };
    utterance.lang = langMap[language] || 'en-IN';

    // Try finding installed regional voice
    const voices = speechSynth.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.includes(language));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    speechSynth.speak(utterance);
    return true;
  } catch (err) {
    console.error('[Speech] Error speaking text:', err);
    return false;
  }
}

export function stopSpeaking() {
  if (speechSynth) {
    speechSynth.cancel();
  }
}
