// Web Audio API Synthesizer for Dalek Caan Chess
// Generates stylized digital and robotic sound effects dynamically with 0 asset overhead

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudioEngine() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  // Dummy synth to unlock iOS Web Audio
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.001);

  // Dummy speech utterance to unlock iOS Speech Synthesis
  if (window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance(' ');
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  }
}

export function playSynthSound(
  type: 'move' | 'capture' | 'check' | 'checkmate' | 'victory' | 'blip' | 'alarm',
  muted: boolean = false,
  volume: number = 0.5
) {
  if (muted) return;

  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Main volume gain node
    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0, now);
    mainGain.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
    mainGain.connect(ctx.destination);

    switch (type) {
      case 'move': {
        // Quick glide synthesizer sound
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        osc.connect(filter);
        filter.connect(mainGain);

        osc.start(now);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.stop(now + 0.13);
        break;
      }

      case 'capture': {
        // Dalek exterminator ray laser sound (Zap + white noise burst)
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

        // Ring modulation effect to sound Dalek-like
        const modulator = ctx.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.value = 45; // metallic buzz frequency
        const modGain = ctx.createGain();
        modGain.gain.value = 500;

        // Bandpass sweeps
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.22);

        modulator.connect(modGain);
        modGain.connect(osc.frequency);
        osc.connect(filter);
        filter.connect(mainGain);

        modulator.start(now);
        osc.start(now);

        mainGain.gain.setValueAtTime(volume * 0.4, now);
        mainGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.05);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        modulator.stop(now + 0.3);
        osc.stop(now + 0.3);
        break;
      }

      case 'check': {
        // Warning dual-tone high-pitched metallic ring
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'sawtooth';

        osc1.frequency.value = 660;
        osc2.frequency.value = 440;

        const filter = ctx.createBiquadFilter();
        filter.type = 'peaking';
        filter.Q.value = 10;
        filter.frequency.value = 550;

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(mainGain);

        osc1.start(now);
        osc2.start(now);

        // Rhythmic alarm pulses
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.05);
        mainGain.gain.setValueAtTime(0.01, now + 0.15);
        mainGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.2);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.stop(now + 0.5);
        osc2.stop(now + 0.5);
        break;
      }

      case 'checkmate': {
        // Sub-bass sweep and descending metallic dissonance
        const osc = ctx.createOscillator();
        const sub = ctx.createOscillator();
        osc.type = 'sawtooth';
        sub.type = 'sine';

        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.8);
        sub.frequency.setValueAtTime(90, now);
        sub.frequency.linearRampToValueAtTime(30, now + 0.9);

        // High frequency static
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 250;

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(mainGain);

        osc.start(now);
        sub.start(now);

        mainGain.gain.setValueAtTime(volume * 0.6, now);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.stop(now + 1.3);
        sub.stop(now + 1.3);
        break;
      }

      case 'victory': {
        // Triumphant dynamic robotic arpeggio
        const tempo = 0.08;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          osc.type = 'square';
          osc.frequency.value = freq;

          const bitGain = ctx.createGain();
          bitGain.gain.setValueAtTime(0, now + idx * tempo);
          bitGain.gain.linearRampToValueAtTime(volume * 0.3, now + idx * tempo + 0.01);
          bitGain.gain.exponentialRampToValueAtTime(0.001, now + idx * tempo + 0.15);

          osc.connect(bitGain);
          bitGain.connect(ctx.destination);

          osc.start(now + idx * tempo);
          osc.stop(now + idx * tempo + 0.16);
        });
        break;
      }

      case 'blip': {
        // Simple robotic UI blip
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.05);

        osc.connect(mainGain);
        osc.start(now);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.stop(now + 0.07);
        break;
      }

      case 'alarm': {
        // Pulsing radar-like alarm
        for (let i = 0; i < 3; i++) {
          const t = now + i * 0.12;
          const osc = ctx.createOscillator();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800 - i * 100, t);
          osc.frequency.linearRampToValueAtTime(100, t + 0.1);

          const pulseGain = ctx.createGain();
          pulseGain.gain.setValueAtTime(0, t);
          pulseGain.gain.linearRampToValueAtTime(volume * 0.3, t + 0.01);
          pulseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

          osc.connect(pulseGain);
          pulseGain.connect(ctx.destination);

          osc.start(t);
          osc.stop(t + 0.12);
        }
        break;
      }
    }
  } catch (error) {
    console.warn('Audio context synthesis failed:', error);
  }
}

// Keep track of active audio carrier nodes so they clean up nicely on interrupt
let speechOsc: OscillatorNode | null = null;
let speechModulator: OscillatorNode | null = null;
let speechModGain: GainNode | null = null;
let speechGain: GainNode | null = null;
let jesusOsc1: OscillatorNode | null = null;
let jesusOsc2: OscillatorNode | null = null;
let jesusGain: GainNode | null = null;

export function cleanupSpeechAudio() {
  try {
    if (speechOsc) {
      speechOsc.stop();
      speechOsc.disconnect();
      speechOsc = null;
    }
    if (speechModulator) {
      speechModulator.stop();
      speechModulator.disconnect();
      speechModulator = null;
    }
    if (speechModGain) {
      speechModGain.disconnect();
      speechModGain = null;
    }
    if (speechGain) {
      speechGain.disconnect();
      speechGain = null;
    }
    if (jesusOsc1) {
      jesusOsc1.stop();
      jesusOsc1.disconnect();
      jesusOsc1 = null;
    }
    if (jesusOsc2) {
      jesusOsc2.stop();
      jesusOsc2.disconnect();
      jesusOsc2 = null;
    }
    if (jesusGain) {
      jesusGain.disconnect();
      jesusGain = null;
    }
  } catch (e) {
    // already disconnected
  }
}

let globalChronosLoad = 0;
export function setChronosLoadValue(val: number) {
  globalChronosLoad = val;
}

export function stopSpeaking() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  cleanupSpeechAudio();
}

/**
 * Custom Speech Synthesis narrator for Dalek Caan
 * Combines built-in browser Text-To-Speech with a synchronized Web Audio API
 * 30Hz Ring Modulation drone representing Dalek vocal box mechanics.
 */
export function speakDalekText(text: string, muted: boolean = false, volume: number = 0.5, onEndCallback?: () => void, chronosLoad: number = 0) {
  const activeChronos = chronosLoad || globalChronosLoad;
  if (muted || !window.speechSynthesis) {
    if (onEndCallback) onEndCallback();
    return;
  }

  try {
    // Cancel any active speech to avoid queues stacking up
    window.speechSynthesis.cancel();
    cleanupSpeechAudio();

    // Sift out bracket descriptors (e.g. [TEMPORAL STATIC]) so they aren't read out loud
    const cleanedText = text
      .replace(/\[.*?\]/g, "")
      .replace(/["'"]/g, "")
      .trim();

    if (!cleanedText) {
      if (onEndCallback) onEndCallback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.volume = volume;
    
    // Dalek Caan is insane, so high pitch (1.3 to 1.45) with slightly elevated speed sounds incredibly loyal to his Doctor Who personality!
    // Dynamically scale parameters based on interactive Chronos Load!
    const chronosPct = activeChronos / 100;
    utterance.pitch = 1.35 + (chronosPct * 0.45); // ranges up to 1.80
    utterance.rate = 1.0 + (chronosPct * 0.5);    // ranges up to 1.50

    // Locate preferred British voice if available (English accents are ideal for Daleks)
    const voices = window.speechSynthesis.getVoices();
    const ukVoice = voices.find(v => v.lang.includes('GB') || v.lang.includes('en-GB') || v.name.toLowerCase().includes('google uk') || v.name.toLowerCase().includes('british'));
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    
    if (ukVoice) {
      utterance.voice = ukVoice;
    } else if (enVoice) {
      utterance.voice = enVoice;
    }

    // Audio frequency coupling while speaking
    utterance.onstart = () => {
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        speechGain = ctx.createGain();
        speechGain.gain.setValueAtTime(0, now);
        // Subtle background hum to add industrial vibe during voice playback
        speechGain.connect(ctx.destination);

        // Core carrier oscillator producing metallic buzz
        speechOsc = ctx.createOscillator();
        speechOsc.type = 'sawtooth';
        const carrierFreq = 120 + chronosPct * 150; // shift up to 270Hz
        speechOsc.frequency.setValueAtTime(carrierFreq, now); // standard robotic hum frequency

        // LFO acting as a ring modulator (classic Doctor Who Dalek voice effect was created using a 30Hz ring modulator)
        speechModulator = ctx.createOscillator();
        speechModulator.type = 'sine';
        const lfoFreq = 30 + chronosPct * 70; // shift metallic ring rate up to 100Hz
        speechModulator.frequency.value = lfoFreq;

        speechModGain = ctx.createGain();
        speechModGain.gain.value = 40; // vibration depth

        speechModulator.connect(speechModGain);
        speechModGain.connect(speechOsc.frequency);
        speechOsc.connect(speechGain);

        speechModulator.start(now);
        speechOsc.start(now);

        // Smoothly fade in sound
        speechGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.05);
      } catch (err) {
        console.warn("Failed to activate synchronized Dalek modulation buzz", err);
      }
    };

    // When speaking completed, shut down drone completely
    utterance.onend = () => {
      // Gentle fade-out then stop
      if (speechGain) {
        try {
          const ctx = getAudioContext();
          const now = ctx.currentTime;
          speechGain.gain.setValueAtTime(speechGain.gain.value, now);
          speechGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
          setTimeout(() => {
            cleanupSpeechAudio();
            if (onEndCallback) onEndCallback();
          }, 60);
        } catch {
          cleanupSpeechAudio();
          if (onEndCallback) onEndCallback();
        }
      } else {
        cleanupSpeechAudio();
        if (onEndCallback) onEndCallback();
      }
    };

    utterance.onerror = () => {
      cleanupSpeechAudio();
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Dalek talk synthesis failed:", err);
    if (onEndCallback) onEndCallback();
  }
}

/**
 * Custom Speech Synthesis narrator for Jesus's (Good)
 * Combines built-in browser Text-To-Speech with a synchronized Web Audio API
 * Warm golden choir drone (220Hz Sine base + 330Hz fifth) to symbolize celestial brilliance.
 */
export function speakJesusText(text: string, muted: boolean = false, volume: number = 0.5, onEndCallback?: () => void, chronosLoad: number = 0) {
  const activeChronos = chronosLoad || globalChronosLoad;
  if (muted || !window.speechSynthesis) {
    if (onEndCallback) onEndCallback();
    return;
  }

  try {
    // Cancel any active speech to avoid queues stacking up
    window.speechSynthesis.cancel();
    cleanupSpeechAudio();

    // Sift out bracket descriptors so they aren't read out loud
    const cleanedText = text
      .replace(/\[.*?\]/g, "")
      .replace(/["'"]/g, "")
      .trim();

    if (!cleanedText) {
      if (onEndCallback) onEndCallback();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.volume = volume;
    
    // Jesus speaks with a deep, calm, serene cadence
    const chronosPct = activeChronos / 100;
    utterance.pitch = 0.85 + (chronosPct * 0.35); // shifts up to 1.20
    utterance.rate = 0.85 + (chronosPct * 0.40);  // shifts up to 1.25

    // Find deep masculine, serene, or US voices
    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(v => v.lang.includes('US') || v.lang.includes('en-US') || v.name.toLowerCase().includes('google us') || v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('guy') || v.name.toLowerCase().includes('male'));
    const enVoice = voices.find(v => v.lang.startsWith('en'));

    if (usVoice) {
      utterance.voice = usVoice;
    } else if (enVoice) {
      utterance.voice = enVoice;
    }

    // Audio frequency coupling while speaking
    utterance.onstart = () => {
      try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        jesusGain = ctx.createGain();
        jesusGain.gain.setValueAtTime(0, now);
        jesusGain.connect(ctx.destination);

        // Warm sine base at 220Hz (A3)
        jesusOsc1 = ctx.createOscillator();
        jesusOsc1.type = 'sine';
        jesusOsc1.frequency.setValueAtTime(220 + chronosPct * 50, now);

        // Warm celestial fifth at 330Hz (E4)
        jesusOsc2 = ctx.createOscillator();
        jesusOsc2.type = 'sine';
        jesusOsc2.frequency.setValueAtTime(330 + chronosPct * 75, now);

        jesusOsc1.connect(jesusGain);
        jesusOsc2.connect(jesusGain);

        jesusOsc1.start(now);
        jesusOsc2.start(now);

        // Smooth golden fade-in
        jesusGain.gain.linearRampToValueAtTime(volume * 0.2, now + 0.1);
      } catch (err) {
        console.warn("Failed to activate synchronized celestial drone", err);
      }
    };

    utterance.onend = () => {
      if (jesusGain) {
        try {
          const ctx = getAudioContext();
          const now = ctx.currentTime;
          jesusGain.gain.setValueAtTime(jesusGain.gain.value, now);
          jesusGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          setTimeout(() => {
            cleanupSpeechAudio();
            if (onEndCallback) onEndCallback();
          }, 110);
        } catch {
          cleanupSpeechAudio();
          if (onEndCallback) onEndCallback();
        }
      } else {
        cleanupSpeechAudio();
        if (onEndCallback) onEndCallback();
      }
    };

    utterance.onerror = () => {
      cleanupSpeechAudio();
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Jesus talk synthesis failed:", err);
    if (onEndCallback) onEndCallback();
  }
}