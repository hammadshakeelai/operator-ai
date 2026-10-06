/**
 * FDI INTERACTIVE TERMINAL EMULATOR
 * Command interpreter, history navigation, tab-completion,
 * audio feedback, and voice-command bridging.
 */

class TerminalController {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.screen = document.getElementById('terminalScreen');
    this.input = document.getElementById('termInput');
    this.commands = [
      'help', 'status', 'ls', 'dir', 'cat', 'decrypt', 'trace',
      'cctv', 'radio', 'call', 'ask', 'ai', 'clear', 'model', 'voice', 'docs',
      'dossier', 'bypass'
    ];

    this.initListeners();
    this.printBanner();
  }

  initListeners() {
    if (!this.input) return;

    this.input.addEventListener('keydown', (e) => {
      window.audioEngine.playKeyClick();

      if (e.key === 'Enter') {
        const cmd = this.input.value.trim().slice(0, 500);
        if (cmd) {
          this.history.push(cmd);
          if (this.history.length > 100) this.history.shift(); // Bound history size
          this.historyIndex = this.history.length;
          this.input.value = '';
          this.executeCommand(cmd);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = '';
        }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.autoComplete();
      }
    });

    // Wire speech recognition voice input directly to terminal
    window.audioEngine.onVoiceInput = (speechText) => {
      this.println(`[VOX RX] "${speechText}"`, 'agent');
      this.processVoiceCommand(speechText);
    };
  }

  printBanner() {
    const banner = `
================================================================================
  ██████╗ ██████╗ ███████╗██████╗  █████╗ ████████╗ ██████╗ ██████╗ 
 ██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗╚══██╔══╝██╔═══██╗██╔══██╗
 ██║   ██║██████╔╝█████╗  ██████╔╝███████║   ██║   ██║   ██║██████╔╝
 ██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗██╔══██║   ██║   ██║   ██║██╔══██╗
 ╚██████╔╝██║     ███████╗██║  ██║██║  ██║   ██║   ╚██████╔╝██║  ██║
  ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝
================================================================================
FDI TERMINAL INTERFACE v2.4.0-RELEASE | EMBEDDED 4-9B LLM INTELLIGENCE CORE
CASE #049: OPERATION BLACKOUT SYNDICATE | FIELD DISPATCH: AGENT WALKER (#8821)
--------------------------------------------------------------------------------
Type 'help' for tactical instructions, or speak into microphone (PTT).
================================================================================`;
    this.println(banner, 'system');
  }

  println(text, type = 'normal') {
    if (!this.screen) return;

    // Prune oldest DOM nodes when buffer exceeds 250 lines to prevent DOM bloat / memory leak
    while (this.screen.children.length > 250) {
      this.screen.removeChild(this.screen.firstChild);
    }

    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    line.textContent = String(text);
    this.screen.appendChild(line);
    this.screen.scrollTop = this.screen.scrollHeight;
  }

  autoComplete() {
    const current = this.input.value.trim();
    if (!current) return;

    const parts = current.split(' ');
    if (parts.length === 1) {
      const match = this.commands.find(c => c.startsWith(parts[0].toLowerCase()));
      if (match) this.input.value = match + ' ';
    } else if (parts.length === 2 && (parts[0] === 'cat' || parts[0] === 'decrypt')) {
      const files = Object.keys(window.gameEngine.files);
      const match = files.find(f => f.startsWith(parts[1]));
      if (match) this.input.value = `${parts[0]} ${match}`;
    }
  }

  // Voice speech command router
  processVoiceCommand(speech) {
    const text = speech.toLowerCase().trim();

    if (text.startsWith('ask') || text.startsWith('ai') || text.startsWith('cipher')) {
      const query = text.replace(/^(ask|ai|cipher)/, '').trim();
      this.executeCommand(`ask ${query}`);
    } else if (text.startsWith('radio') || text.startsWith('tell walker') || text.startsWith('walker')) {
      const msg = text.replace(/^(radio|tell walker|walker)/, '').trim();
      this.executeCommand(`radio ${msg}`);
    } else if (text.includes('status')) {
      this.executeCommand('status');
    } else if (text.includes('decrypt')) {
      this.executeCommand('decrypt access_log.enc OMEGA');
    } else if (text.includes('trace')) {
      this.executeCommand('trace 198.51.100.42');
    } else {
      // Default: transmit to Agent Walker or ask AI
      this.executeCommand(`radio ${text}`);
    }
  }

  async executeCommand(raw) {
    this.println(`operator@fdi-station-49:~$ ${raw}`, 'normal');
    const args = raw.trim().split(/\s+/);
    const cmd = args[0].toLowerCase();
    const param1 = args[1];
    const param2 = args[2];

    switch (cmd) {
      case 'help':
        this.println(`[FDI TACTICAL COMMAND MANUAL]
--------------------------------------------------------------------------------
ls / dir                     - List case files & forensic logs
cat <file>                   - Read evidence contents (e.g. 'cat mission_brief.txt')
decrypt <file> <key>         - Decrypt encrypted ciphers (e.g. 'decrypt access_log.enc OMEGA')
trace <ip>                   - Trace network route of suspect IP (e.g. 'trace 198.51.100.42')
cctv <cam_id>                - Render wireframe surveillance feeds (CAM-02, CAM-03)
radio <message>              - Transmit tactical orders to Agent Walker (e.g. 'radio 749201')
call walker                  - Open direct comms channel with Agent Walker
ask <query> / ai <query>     - Query 4-9B parameter AI copilot (Qwen 7B / Llama 8B / Gemma 9B)
status                       - Display case progress, objectives, and LLM telemetry
model                        - Display / configure LLM backend (Ollama, WebGPU, Sim)
voice                        - Toggle audio effects and speech synthesizer
docs                         - View course project documentation & 4-9B architecture
clear                        - Clear terminal display buffer
--------------------------------------------------------------------------------`, 'system');
        window.audioEngine.playBeep(440, 0.05);
        break;

      case 'status':
        this.println(`[FDI TELEMETRY STATUS]
CASE: ${window.gameEngine.caseId} | AGENT: Walker (Badge #${window.gameEngine.agentBadge})
AI COPILOT: ${window.llmEngine.modelName} [MODE: ${window.llmEngine.provider.toUpperCase()}]
DOOR OVERRIDE: ${window.gameEngine.doorUnlocked ? 'OPEN' : 'LOCKED'}
CASE SOLVED: ${window.gameEngine.caseWon ? 'YES (SPECTER CAPTURED)' : 'IN PROGRESS'}`, 'system');
        break;

      case 'ls':
      case 'dir':
        window.gameEngine.objectives.inspectLogs.completed = true;
        window.gameEngine.updateObjectiveUI();
        const fileList = Object.keys(window.gameEngine.files).map(f => {
          const enc = f.endsWith('.enc') ? '[ENCRYPTED]' : '[LOG/TXT]';
          return `  - ${f.padEnd(24)} ${enc}`;
        }).join('\n');
        this.println(`TOTAL EVIDENCE FILES: ${Object.keys(window.gameEngine.files).length}\n${fileList}`, 'system');
        break;

      case 'cat':
        if (!param1) {
          this.println(`Usage: cat <filename> (e.g., 'cat mission_brief.txt')`, 'error');
          window.audioEngine.playError();
          return;
        }
        if (window.gameEngine.files[param1]) {
          this.println(window.gameEngine.files[param1], 'normal');
          window.audioEngine.playBeep(520, 0.04);
        } else {
          this.println(`Error: File '${param1}' not found in case directory.`, 'error');
          window.audioEngine.playError();
        }
        break;

      case 'decrypt':
        if (!param1) {
          this.println(`Usage: decrypt <filename> <key> (e.g. 'decrypt access_log.enc OMEGA')`, 'error');
          window.audioEngine.playError();
          return;
        }
        this.println(`[CIPHER DECRYPTOR] Initializing 256-bit hash breakdown with key: '${param2 || ''}'...`, 'system');
        const decResult = window.gameEngine.decryptFile(param1, param2);
        if (decResult.success) {
          window.audioEngine.playSuccess();
          this.println(decResult.message, 'success');
          this.println(decResult.data, 'system');
        } else {
          window.audioEngine.playError();
          this.println(decResult.message, 'error');
        }
        break;

      case 'trace':
        if (!param1) {
          this.println(`Usage: trace <ip_address> (e.g. 'trace 198.51.100.42')`, 'error');
          window.audioEngine.playError();
          return;
        }
        this.println(`[SATELLITE TRACE] Pinging global nodes for target ${param1}...`, 'system');
        setTimeout(() => {
          const traceReport = window.gameEngine.traceIP(param1);
          this.println(traceReport, 'system');
          window.audioEngine.playSuccess();
          if (window.viewManager) window.viewManager.switchTab('tracer');
        }, 400);
        break;

      case 'cctv':
        if (param1) {
          const cam = param1.toUpperCase().includes('CAM') ? param1.toUpperCase() : `CAM-0${param1.replace(/\D/g, '') || '2'}`;
          if (window.viewManager) {
            window.viewManager.activeCam = cam;
            window.viewManager.switchTab('cctv');
          }
          this.println(window.gameEngine.renderCCTV(param1), 'system');
        } else {
          if (window.viewManager) window.viewManager.switchTab('cctv');
          this.println(`Switching display to CCTV surveillance matrix. Feeds: CAM-01, CAM-02, CAM-03, CAM-04`, 'system');
        }
        break;

      case 'dossier':
      case 'dossiers':
      case 'suspects':
        if (window.viewManager) window.viewManager.switchTab('dossiers');
        this.println(`Switching display to Classified Suspect Dossier Pinboard.`, 'system');
        break;

      case 'bypass':
        if (window.viewManager) window.viewManager.switchTab('bypass');
        this.println(`Switching display to Airlock 02 Frequency Cipher Bypass Matrix.`, 'system');
        break;

      case 'radio':
      case 'call':
        const radioMsg = args.slice(1).join(' ');
        if (!radioMsg && cmd !== 'call') {
          this.println(`Usage: radio <message> (e.g. 'radio 749201' or 'radio status')`, 'error');
          return;
        }
        this.println(`[TRANSMITTING TO AGENT WALKER...]`, 'muted');
        const commResponse = window.gameEngine.transmitRadio(radioMsg || 'status');
        setTimeout(() => {
          window.audioEngine.playIncomingCallTone();
          this.println(`[AGENT WALKER]: "${commResponse.text}"`, 'agent');
          window.audioEngine.speak(commResponse.text, 'agent');
          
          if (commResponse.caseComplete) {
            window.audioEngine.playSuccess();
            this.showVictoryModal();
          }
        }, 450);
        break;

      case 'ask':
      case 'ai':
        const query = args.slice(1).join(' ');
        if (!query) {
          this.println(`Usage: ask <query> (e.g. 'ask how to decrypt access_log' or 'ask analyze rogue ip')`, 'error');
          return;
        }
        this.println(`[CIPHER AI CORE (${window.llmEngine.modelName})]: Analyzing telemetry...`, 'muted');
        const reply = await window.llmEngine.ask(query, `Case: ${window.gameEngine.caseId}, Decrypted: ${window.gameEngine.isDecrypted}, Door: ${window.gameEngine.doorUnlocked}`);
        this.println(reply, 'ai');
        window.audioEngine.speak(reply, 'ai');
        break;

      case 'clear':
        if (this.screen) {
          this.screen.innerHTML = '';
          this.printBanner();
        }
        break;

      case 'voice':
        window.audioEngine.voiceEnabled = !window.audioEngine.voiceEnabled;
        this.println(`Voice Synthesis is now ${window.audioEngine.voiceEnabled ? 'ENABLED' : 'DISABLED'}.`, 'system');
        break;

      case 'docs':
        document.getElementById('docsModal')?.classList.remove('hidden');
        break;

      case 'model':
        this.println(`[CURRENT AI CONFIGURATION]
Provider: ${window.llmEngine.provider.toUpperCase()}
Active Model: ${window.llmEngine.modelName}
Supported 4-9B Models: Qwen2.5-7B, Llama-3.1-8B, Gemma-2-9B, Phi-3.5-3.8B
Use the Matrix control panel on the right or select dropdown to switch engine.`, 'system');
        break;

      default:
        this.println(`bash: ${cmd}: command not found. Type 'help' for intelligence tools.`, 'error');
        window.audioEngine.playError();
        break;
    }
  }

  showVictoryModal() {
    const modal = document.getElementById('victoryModal');
    if (modal) modal.classList.remove('hidden');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.terminalController = new TerminalController();
  window.gameEngine.updateObjectiveUI();
  window.audioEngine.startVisualizer(document.getElementById('audioCanvas'));

  // Quick Action Chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const cmd = chip.getAttribute('data-cmd');
      if (cmd && window.terminalController) {
        window.terminalController.executeCommand(cmd);
      }
    });
  });

  // File tree clicks
  document.querySelectorAll('.file-tree-item').forEach(item => {
    item.addEventListener('click', () => {
      const file = item.getAttribute('data-file');
      if (file && window.terminalController) {
        window.terminalController.executeCommand(`cat ${file}`);
      }
    });
  });

  // PTT Voice Button
  const pttBtn = document.getElementById('pttBtn');
  if (pttBtn) {
    pttBtn.addEventListener('click', () => {
      window.audioEngine.toggleRecording((text) => {
        window.terminalController.println(`[VOX RX] "${text}"`, 'agent');
        window.terminalController.processVoiceCommand(text);
      });
    });
  }

  // Tab buttons
  document.getElementById('tabCctv')?.addEventListener('click', () => {
    window.terminalController?.executeCommand('cctv CAM-02');
  });

  document.getElementById('tabDocs')?.addEventListener('click', () => {
    window.terminalController?.executeCommand('docs');
  });

  // Model Selector
  const modelSelect = document.getElementById('modelSelect');
  if (modelSelect) {
    modelSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'ollama-qwen') {
        window.llmEngine.setProvider('ollama', 'qwen2.5:7b');
      } else if (val === 'ollama-llama') {
        window.llmEngine.setProvider('ollama', 'llama3.1:8b');
      } else if (val === 'webllm-qwen') {
        window.llmEngine.setProvider('webllm', 'Qwen2.5-7B-Instruct-q4f16_1-MLC');
      } else {
        window.llmEngine.setProvider('simulation', 'qwen2.5:7b');
      }
    });
  }
});
