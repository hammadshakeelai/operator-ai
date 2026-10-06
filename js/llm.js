/**
 * FDI AI CORE: MULTI-ENGINE 4-9B MODEL CONNECTOR
 * Supports:
 * 1. Local Ollama API (e.g. qwen2.5:7b, llama3.1:8b, gemma2:9b)
 * 2. In-Browser WebGPU WebLLM (@mlc-ai/web-llm)
 * 3. Offline Neural Simulation Engine (zero-setup fast fallback)
 */

class LLMEngine {
  constructor() {
    this.provider = 'simulation'; // 'ollama' | 'webllm' | 'simulation'
    this.modelName = 'qwen2.5:7b';
    this.ollamaUrl = 'http://localhost:11434';
    this.webllmEngine = null;
    this.isInitializing = false;
    this.statusText = 'READY (NEURAL SIMULATOR)';
    this.systemPrompt = `You are CIPHER, an advanced FDI (Federal Department of Intelligence) cyber tactical copilot embedded into the Operator terminal workstation.
You assist the intelligence terminal operator in solving cyber-investigations, analyzing network breaches, decoding ciphers, and guiding field agents (such as Agent Walker) on tactical missions.
Keep responses concise, militaristic, technical, and formatted like an intelligence briefing. Never break character.`;
  }

  setProvider(provider, model) {
    this.provider = provider;
    if (model) this.modelName = model;
    this.updateStatus();
  }

  updateStatus() {
    const statusElem = document.getElementById('llmStatus');
    if (statusElem) {
      if (this.provider === 'ollama') {
        statusElem.textContent = `ONLINE (OLLAMA: ${this.modelName})`;
        statusElem.className = 'val online';
      } else if (this.provider === 'webllm') {
        statusElem.textContent = `WEBGPU (${this.modelName})`;
        statusElem.className = 'val online';
      } else {
        statusElem.textContent = 'ONLINE (LOCAL SIMULATOR 7B)';
        statusElem.className = 'val';
      }
    }
  }

  // Connect to local Ollama instance (4-9B models like Qwen 2.5 7B, Llama 3.1 8B, Gemma 2 9B)
  async queryOllama(prompt, context = '') {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.modelName,
          prompt: `${this.systemPrompt}\n\n[CASE TELEMETRY & CONTEXT]:\n${context}\n\n[OPERATOR QUERY]:\n${prompt}`,
          stream: false,
          options: {
            temperature: 0.3,
            num_predict: 250
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama HTTP ${response.status}: Ensure Ollama is running and CORS is enabled.`);
      }

      const data = await response.json();
      return data.response;
    } catch (err) {
      console.warn("Ollama connection failed, falling back to simulator:", err);
      return `[OLLAMA CONNECTION ALERT]: Unable to reach ${this.ollamaUrl}.\nTip: Run 'ollama run ${this.modelName}' and start with OLLAMA_ORIGINS="*" if on web.\nFalling back to simulated neural core:\n\n` + this.querySimulation(prompt, context);
    }
  }

  // Query In-Browser WebGPU WebLLM (MLC-AI)
  async initWebLLM() {
    if (this.webllmEngine) return true;
    if (!navigator.gpu) {
      alert("WebGPU is not enabled or supported on this browser. Falling back to Ollama or Simulation.");
      return false;
    }

    try {
      this.isInitializing = true;
      const statusElem = document.getElementById('llmStatus');
      if (statusElem) statusElem.textContent = 'DOWNLOADING MODEL WEIGHTS (WEBGPU)...';

      const webllm = await import('https://esm.run/@mlc-ai/web-llm');
      const selectedModel = this.modelName.includes('llama') ? 'Llama-3.2-3B-Instruct-q4f16_1-MLC' : 'Qwen2.5-7B-Instruct-q4f16_1-MLC';
      
      this.webllmEngine = await webllm.CreateMLCEngine(selectedModel, {
        initProgressCallback: (progress) => {
          if (statusElem) statusElem.textContent = `WEBGPU LOADING: ${Math.round(progress.progress * 100)}%`;
        }
      });
      this.isInitializing = false;
      this.updateStatus();
      return true;
    } catch (e) {
      console.error("WebLLM Init failed:", e);
      this.isInitializing = false;
      return false;
    }
  }

  async queryWebLLM(prompt, context = '') {
    if (!this.webllmEngine) {
      const ready = await this.initWebLLM();
      if (!ready) return this.querySimulation(prompt, context);
    }

    try {
      const reply = await this.webllmEngine.chat.completions.create({
        messages: [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: `[CONTEXT]: ${context}\n[OPERATOR QUERY]: ${prompt}` }
        ],
        temperature: 0.3,
        max_tokens: 250
      });
      return reply.choices[0].message.content;
    } catch (e) {
      console.warn("WebLLM inference error:", e);
      return this.querySimulation(prompt, context);
    }
  }

  // Tactical Neural Simulator (Zero-latency instant responses for game & AI course demo)
  querySimulation(prompt, context = '') {
    const p = prompt.toLowerCase();

    if (p.includes('decrypt') || p.includes('cipher') || p.includes('code')) {
      return `[CIPHER FORENSIC REPORT]: The file 'access_log.enc' uses an FDI standard Caesar/XOR offset algorithm.
Forensic analysis indicates key signature: 'OMEGA'.
Run command: 'decrypt access_log.enc OMEGA' to decode the biometric authentication hash.`;
    }

    if (p.includes('ip') || p.includes('trace') || p.includes('network') || p.includes('breach')) {
      return `[CIPHER TELEMETRY]: In 'network_dump.log', cross-reference port 443 incoming packets.
Notice rogue connection from IP: 198.51.100.42.
Recommendation: Execute 'trace 198.51.100.42' to locate the remote intrusion node.`;
    }

    if (p.includes('specter') || p.includes('mole') || p.includes('suspect')) {
      return `[CIPHER DOSSIER AUDIT]: Cross-referencing personnel records.
Key suspect 'SPECTER' has badge ID #7741.
CCTV logs indicate suspect accessed Sublevel 2 at 22:41 GMT right before power failure.`;
    }

    if (p.includes('walker') || p.includes('door') || p.includes('server room') || p.includes('help')) {
      return `[TACTICAL ADVISORY]: Agent Walker is pinned at Server Room B.
He requires the 6-digit door override code obtained from the decrypted access log (Code: 749201).
Use command: 'radio 749201' or 'call walker' to relay the passcode!`;
    }

    if (p.includes('model') || p.includes('parameter') || p.includes('qwen') || p.includes('llama') || p.includes('gemma')) {
      return `[AI ARCHITECTURE BRIEFING - 4-9B PARAMETERS]:
1. Qwen 2.5 (7B): State-of-the-art coding, instruction following, and regex/CLI execution.
2. Llama 3.1 (8B): High reasoning density, 128K context window, excellent tactical dialogue.
3. Gemma 2 (9B): Dense knowledge retrieval, low perplexity, trained on massive token volume.
4. Phi-3.5 Mini (3.8B): Fast edge inference with high quality for resource-constrained clients.
All operate efficiently under 4-bit/8-bit quantization with < 6GB VRAM footprint.`;
    }

    return `[CIPHER AI ANALYSIS]: Query received: "${prompt}".
Telemetry indicates active case 'OPERATION BLACKOUT'.
Recommended protocol:
- Inspect files with 'ls' and 'cat <file>'
- Decrypt encrypted files with 'decrypt access_log.enc <key>'
- Guide Agent Walker using 'radio <message>'`;
  }

  async ask(prompt, context = '') {
    if (this.provider === 'ollama') {
      return await this.queryOllama(prompt, context);
    } else if (this.provider === 'webllm') {
      return await this.queryWebLLM(prompt, context);
    } else {
      return this.querySimulation(prompt, context);
    }
  }
}

window.llmEngine = new LLMEngine();
