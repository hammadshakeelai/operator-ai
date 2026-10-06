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

  // Text-To-Speech (Agent Walker / AI Copilot)
  speak(text, speaker = 'agent') {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    this.playRadioSquelch('start');

    setTimeout(() => {
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);

      // Distinct voice parameters
      if (speaker === 'agent') {
        utterance.rate = 1.05;
        utterance.pitch = 0.85; // Serious tactical field agent
      } else if (speaker === 'ai') {
        utterance.rate = 1.0;
        utterance.pitch = 1.25; // Synthetic digital copilot
      }

      utterance.onend = () => {
        this.playRadioSquelch('end');
      };

      window.speechSynthesis.speak(utterance);
    }, 100);
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
        const transcript = event.results[0][0].transcript;
        if (this.onVoiceInput) {
          this.onVoiceInput(transcript);
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
      alert("Speech Recognition is not supported in this browser. Use Chrome/Edge or type terminal commands.");
      return;
    }

    this.onVoiceInput = callback;
    if (this.isRecording) {
      this.recognition.stop();
    } else {
      this.ensureContext();
      try {
        this.recognition.start();
      } catch (e) {
        console.warn("Recognition already started", e);
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
