/**
 * FDI OPERATOR AUDIO ENGINE
 * Provides Web Audio API synthesized retro sound effects,
 * SpeechSynthesis (TTS) with radio bandpass filtering,
 * and Web Speech API SpeechRecognition (STT).
 */

class AudioEngine {
  constructor() {
    this.audioCtx = null;
    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.recognition = null;
    this.isRecording = false;
    this.onVoiceInput = null;
    this.ambienceActive = false;
    this.ambienceNodes = null;

    this.initAudioContext();
    this.initSpeechRecognition();
  }

  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }

  ensureContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Cinematic sci-fi command bunker ambient drone (55Hz sub-bass + filtered tape noise)
  toggleAmbience() {
    if (!this.audioCtx) return false;
    this.ensureContext();

    if (this.ambienceActive) {
      this.stopAmbience();
      return false;
    } else {
      this.startAmbience();
      return true;
    }
  }

  startAmbience() {
    if (this.ambienceNodes || !this.audioCtx) return;
    this.ensureContext();

    try {
      // Sub drone osc
      const droneOsc = this.audioCtx.createOscillator();
      droneOsc.type = 'sawtooth';
      droneOsc.frequency.setValueAtTime(55, this.audioCtx.currentTime);

      const droneFilter = this.audioCtx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(110, this.audioCtx.currentTime);

      const droneGain = this.audioCtx.createGain();
      droneGain.gain.setValueAtTime(0.015, this.audioCtx.currentTime);

      // Subtle air noise
      const bufferSize = this.audioCtx.sampleRate * 2;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = this.audioCtx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(450, this.audioCtx.currentTime);
      noiseFilter.Q.setValueAtTime(2.0, this.audioCtx.currentTime);

      const noiseGain = this.audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.006, this.audioCtx.currentTime);

      // Connect
      droneOsc.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(this.audioCtx.destination);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.audioCtx.destination);

      droneOsc.start();
      noiseSource.start();

      this.ambienceNodes = { droneOsc, noiseSource, droneGain, noiseGain };
      this.ambienceActive = true;
    } catch (e) {
      console.warn("Ambience audio failed:", e);
    }
  }

  stopAmbience() {
    if (!this.ambienceNodes) return;
    try {
      this.ambienceNodes.droneGain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
      this.ambienceNodes.noiseGain.gain.linearRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
      setTimeout(() => {
        try {
          this.ambienceNodes.droneOsc.stop();
          this.ambienceNodes.noiseSource.stop();
        } catch (e) {}
        this.ambienceNodes = null;
        this.ambienceActive = false;
      }, 500);
    } catch (e) {
      this.ambienceNodes = null;
      this.ambienceActive = false;
    }
  }

  // Tactical radio incoming chime
  playIncomingCallTone() {
    this.playBeep(987.77, 0.08); // B5
    setTimeout(() => this.playBeep(1318.51, 0.12), 90); // E6
  }

  // Synthesized mechanical key click
  playKeyClick() {
    if (!this.sfxEnabled || !this.audioCtx) return;
    this.ensureContext();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 80, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.audioCtx.currentTime + 0.04);

    filter.type = 'bandpass';
    filter.frequency.value = 1200;

    gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.04);
  }

  // Retro radio transmission squelch / walkie-talkie burst
  playRadioSquelch(type = 'start') {
    if (!this.sfxEnabled || !this.audioCtx) return;
    this.ensureContext();

    const duration = type === 'start' ? 0.08 : 0.12;
    const bufferSize = this.audioCtx.sampleRate * duration;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = type === 'start' ? 2400 : 1800;
    filter.Q.value = 3.0;

    const gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioCtx.destination);

    noise.start();
  }

  // Terminal action beep
  playBeep(freq = 880, duration = 0.08, type = 'sine') {
    if (!this.sfxEnabled || !this.audioCtx) return;
    this.ensureContext();

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  // Success chime
  playSuccess() {
    this.playBeep(659.25, 0.06);
    setTimeout(() => this.playBeep(880, 0.12), 70);
  }

  // Warning / error buzzer
  playError() {
    this.playBeep(220, 0.15, 'sawtooth');
  }

  // Text-To-Speech (Agent Walker / AI Copilot) - Hardened against Chromium hang bug & payload flooding
  speak(text, speaker = 'agent') {
    if (!this.voiceEnabled || !('speechSynthesis' in window) || !text) return;

    try {
      window.speechSynthesis.cancel();
    } catch (e) {}

    this.playRadioSquelch('start');

    setTimeout(() => {
      // Sanitize markup and strictly limit length to prevent browser audio thread stalls
      const cleanText = String(text)
        .replace(/[*#_`~<>]/g, '')
        .trim()
        .slice(0, 280);

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Distinct voice parameters
      if (speaker === 'agent') {
        utterance.rate = 1.05;
        utterance.pitch = 0.85; // Tactical field agent
      } else if (speaker === 'ai') {
        utterance.rate = 1.0;
        utterance.pitch = 1.25; // Synthetic digital copilot
      }

      utterance.onend = () => {
        this.playRadioSquelch('end');
      };

      utterance.onerror = (e) => {
        console.warn('SpeechSynthesis error:', e);
      };

      // Safeguard against Chrome SpeechSynthesis pause/freeze bug
      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 80);
  }

  // Speech-To-Text (Voice Recognition)
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isRecording = true;
        this.playRadioSquelch('start');
        this.updatePttUI(true);
      };

      this.recognition.onresult = (event) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript.slice(0, 300);
          if (this.onVoiceInput) {
            this.onVoiceInput(transcript);
          }
        }
      };

      this.recognition.onerror = (err) => {
        console.warn('Voice recognition error:', err);
        this.isRecording = false;
        this.updatePttUI(false);
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        this.playRadioSquelch('end');
        this.updatePttUI(false);
      };
    }
  }

  toggleRecording(callback) {
    if (!this.recognition) {
      if (window.terminalController) {
        window.terminalController.println("[VOX SYSTEM ALERT]: Web Speech Recognition not available in this browser. Use Chrome/Edge or type commands in terminal.", "error");
      }
      return;
    }

    this.onVoiceInput = callback;
    if (this.isRecording) {
      try { this.recognition.stop(); } catch (e) {}
    } else {
      this.ensureContext();
      try {
        this.recognition.start();
      } catch (e) {
        console.warn("Recognition already active", e);
      }
    }
  }

  updatePttUI(isRecording) {
    const pttBtn = document.getElementById('pttBtn');
    if (pttBtn) {
      if (isRecording) {
        pttBtn.classList.add('recording');
        pttBtn.innerHTML = `<span>🔴 TRANSMITTING (VOX ACTIVE)...</span>`;
      } else {
        pttBtn.classList.remove('recording');
        pttBtn.innerHTML = `<span>🎙️ HOLD / CLICK TO TRANSMIT (VOICE)</span>`;
      }
    }
  }

  // Oscilloscope canvas animation
  startVisualizer(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = canvas.offsetHeight;

      ctx.fillStyle = '#040812';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw wave
      const isSpeaking = window.speechSynthesis && window.speechSynthesis.speaking;
      const amp = this.isRecording ? 18 : (isSpeaking ? 14 : 3);
      const freq = this.isRecording ? 0.08 : (isSpeaking ? 0.05 : 0.02);

      ctx.strokeStyle = this.isRecording ? '#ef4444' : (isSpeaking ? '#ffb703' : '#00f3ff');
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * freq + phase) * amp * Math.cos(x * 0.015);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      phase += 0.15;
      requestAnimationFrame(render);
    };

    render();
  }
}

window.audioEngine = new AudioEngine();
