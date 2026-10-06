/**
 * FDI TACTICAL MULTI-VIEW & INTERACTIVE WORKSPACE
 * Powers the interactive CCTV Surveillance Viewer,
 * Satellite Tracer Network Canvas, Evidence Pinboard,
 * and Cipher Bypass Mini-Game.
 */

class ViewManager {
  constructor() {
    this.activeTab = 'terminal';
    this.activeCam = 'CAM-02';
    this.cctvInterval = null;
    this.cctvCanvas = null;
    this.tracerCanvas = null;
    this.tracerAnim = null;
    this.scanEnhanced = false;
    this.bypassSolved = false;

    this.initTabs();
    this.initCctv();
    this.initTracer();
    this.initDossiers();
    this.initBypassGame();
  }

  // Switch center workstation tabs
  switchTab(tabName) {
    this.activeTab = tabName;
    
    // Update tab bar UI
    document.querySelectorAll('.terminal-tab').forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });

    // Update tab views
    document.querySelectorAll('.tab-view').forEach(v => {
      v.classList.toggle('hidden', v.id !== `view-${tabName}`);
    });

    // Ensure audio feedback
    if (window.audioEngine) window.audioEngine.playBeep(600, 0.04);

    if (tabName === 'cctv') {
      this.renderCctvFrame();
    } else if (tabName === 'tracer') {
      this.startTracerAnimation();
    } else {
      if (this.tracerAnim) cancelAnimationFrame(this.tracerAnim);
    }
  }

  initTabs() {
    document.querySelectorAll('.terminal-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        if (target) this.switchTab(target);
      });
    });
  }

  // ==========================================
  // 1. INTERACTIVE LIVE CCTV SURVEILLANCE
  // ==========================================
  initCctv() {
    this.cctvCanvas = document.getElementById('cctvCanvas');
    
    // Cam selector buttons
    document.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cam-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.activeCam = btn.getAttribute('data-cam');
        this.scanEnhanced = false;
        if (window.audioEngine) window.audioEngine.playBeep(750, 0.05);
        this.renderCctvFrame();
      });
    });

    // Enhance / AI Scan button
    const enhanceBtn = document.getElementById('enhanceCctvBtn');
    if (enhanceBtn) {
      enhanceBtn.addEventListener('click', () => {
        this.scanEnhanced = true;
        if (window.audioEngine) {
          window.audioEngine.playBeep(880, 0.06);
          setTimeout(() => window.audioEngine.playBeep(1200, 0.1), 80);
        }
        this.renderCctvFrame();
      });
    }

    // Auto-update timer
    setInterval(() => {
      if (this.activeTab === 'cctv') {
        this.renderCctvFrame();
      }
    }, 100);
  }

  renderCctvFrame() {
    if (!this.cctvCanvas) return;
    const ctx = this.cctvCanvas.getContext('2d');
    const w = this.cctvCanvas.width = this.cctvCanvas.offsetWidth;
    const h = this.cctvCanvas.height = this.cctvCanvas.offsetHeight;

    // Dark background with CCTV green/grey tint
    ctx.fillStyle = '#060d0b';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 255, 128, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Dynamic simulated scene based on activeCam
    const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
    
    if (this.activeCam === 'CAM-02') {
      // Sublevel 2 Corridor
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;

      // Corridor perspective lines
      ctx.beginPath();
      ctx.moveTo(w * 0.1, 0); ctx.lineTo(w * 0.35, h * 0.6);
      ctx.moveTo(w * 0.9, 0); ctx.lineTo(w * 0.65, h * 0.6);
      ctx.moveTo(w * 0.35, h * 0.6); ctx.lineTo(w * 0.65, h * 0.6);
      ctx.moveTo(w * 0.35, h * 0.6); ctx.lineTo(w * 0.35, h);
      ctx.moveTo(w * 0.65, h * 0.6); ctx.lineTo(w * 0.65, h);
      ctx.stroke();

      // Door wireframe
      ctx.strokeStyle = '#00f3ff';
      ctx.strokeRect(w * 0.42, h * 0.35, w * 0.16, h * 0.25);
      ctx.fillStyle = '#00f3ff';
      ctx.font = '10px monospace';
      ctx.fillText('SERVER B AIRLOCK', w * 0.43, h * 0.33);

      // Suspect figure
      ctx.fillStyle = '#ffb703';
      ctx.beginPath();
      ctx.arc(w * 0.48, h * 0.52, 14, 0, Math.PI * 2); // Head
      ctx.fill();
      ctx.fillRect(w * 0.45, h * 0.55, 30, 45); // Body

      // AI Bounding box
      if (this.scanEnhanced) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.42, h * 0.46, 50, 75);
        ctx.fillStyle = '#ef4444';
        ctx.font = '11px monospace';
        ctx.fillText('[!] TARGET: SPECTER (98.4% MATCH)', w * 0.35, h * 0.44);
        ctx.fillText('BADGE #7741 // ELENA ROSTOVA', w * 0.35, h * 0.68);
      }
    } else if (this.activeCam === 'CAM-03') {
      // Server Vault B Interior
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;

      // Server racks
      for (let i = 0; i < 4; i++) {
        const rx = w * 0.15 + i * (w * 0.2);
        ctx.strokeRect(rx, h * 0.2, w * 0.15, h * 0.6);
        for (let s = h * 0.25; s < h * 0.75; s += 20) {
          ctx.beginPath(); ctx.moveTo(rx, s); ctx.lineTo(rx + w * 0.15, s); ctx.stroke();
          ctx.fillStyle = (i === 1 && s < h * 0.45) ? '#ef4444' : '#10b981';
          ctx.fillRect(rx + 6, s + 4, 6, 6);
        }
      }

      if (this.scanEnhanced) {
        ctx.strokeStyle = '#ffb703';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.35, h * 0.25, w * 0.15, 60);
        ctx.fillStyle = '#ffb703';
        ctx.font = '11px monospace';
        ctx.fillText('[EXFILTRATION DETECTED // RACK 02]', w * 0.28, h * 0.22);
      }
    } else {
      // Default camera view
      ctx.strokeStyle = '#64748b';
      ctx.strokeRect(w * 0.2, h * 0.2, w * 0.6, h * 0.6);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText(`FEED: ${this.activeCam} // SECURE SECTOR`, w * 0.3, h * 0.5);
    }

    // Timestamp & Camera HUD overlay
    ctx.fillStyle = '#10b981';
    ctx.font = '12px monospace';
    ctx.fillText(`🔴 LIVE REC | ${this.activeCam} | ${time} GMT`, 15, 25);
    ctx.fillText(`FPS: 15.0 | RES: 1080p | ENCR: FDI-SEC-4`, 15, h - 15);

    // CRT Noise grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 60; i++) {
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
  }

  // ==========================================
  // 2. SATELLITE NETWORK TRACER MAP
  // ==========================================
  initTracer() {
    this.tracerCanvas = document.getElementById('tracerCanvas');
    const pingBtn = document.getElementById('pingRouteBtn');
    if (pingBtn) {
      pingBtn.addEventListener('click', () => {
        if (window.audioEngine) {
          window.audioEngine.playBeep(700, 0.08);
          setTimeout(() => window.audioEngine.playBeep(1100, 0.12), 120);
        }
        if (window.gameEngine) {
          window.gameEngine.objectives.traceRogueIP.completed = true;
          window.gameEngine.updateObjectiveUI();
        }
        this.startTracerAnimation(true);
      });
    }
  }

  startTracerAnimation(highlightC2 = false) {
    if (!this.tracerCanvas) return;
    if (this.tracerAnim) {
      cancelAnimationFrame(this.tracerAnim);
      this.tracerAnim = null;
    }
    const ctx = this.tracerCanvas.getContext('2d');
    let t = 0;

    const nodes = [
      { id: 'FDI_DISPATCH', label: 'FDI Station 49 (Operator)', x: 0.15, y: 0.5, color: '#00f3ff' },
      { id: 'APEX_DMZ', label: 'Apex DMZ (10.0.1.5)', x: 0.35, y: 0.35, color: '#10b981' },
      { id: 'VPN_TUNNEL', label: 'Encrypted Tunnel (172.16.89.1)', x: 0.55, y: 0.65, color: '#ffb703' },
      { id: 'FRANKFURT_GW', label: 'Frankfurt Hub (84.112.5.3)', x: 0.72, y: 0.38, color: '#a78bfa' },
      { id: 'ZURICH_C2', label: 'Zurich C2 Rogue (198.51.100.42)', x: 0.88, y: 0.6, color: '#ef4444' }
    ];

    const render = () => {
      const w = this.tracerCanvas.width = this.tracerCanvas.offsetWidth;
      const h = this.tracerCanvas.height = this.tracerCanvas.offsetHeight;

      ctx.fillStyle = '#040814';
      ctx.fillRect(0, 0, w, h);

      // Radar rings
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let r = 50; r < w; r += 70) {
        ctx.beginPath(); ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2); ctx.stroke();
      }

      // Draw connection lines
      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];
        ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(n1.x * w, n1.y * h);
        ctx.lineTo(n2.x * w, n2.y * h);
        ctx.stroke();

        // Animated data packet pulse
        const progress = ((t * 0.02) + i * 0.25) % 1;
        const px = n1.x * w + (n2.x * w - n1.x * w) * progress;
        const py = n1.y * h + (n2.y * h - n1.y * h) * progress;
        ctx.fillStyle = '#00f3ff';
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      }

      // Draw nodes
      nodes.forEach(n => {
        const nx = n.x * w;
        const ny = n.y * h;

        // Glow
        ctx.fillStyle = n.color;
        ctx.shadowColor = n.color;
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(nx, ny, 8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '11px monospace';
        ctx.fillText(n.label, nx - 40, ny - 15);
      });

      t++;
      if (this.activeTab === 'tracer') {
        this.tracerAnim = requestAnimationFrame(render);
      }
    };

    render();
  }

  // ==========================================
  // 3. EVIDENCE PINBOARD & SUSPECT DOSSIERS
  // ==========================================
  initDossiers() {
    // Interrogate buttons
    document.querySelectorAll('.interrogate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rawSuspect = btn.getAttribute('data-suspect') || '';
        const suspect = rawSuspect.replace(/[^\w\s.]/g, '').slice(0, 50);
        this.switchTab('terminal');
        if (window.terminalController && suspect) {
          window.terminalController.executeCommand(`ask what is the background on suspect ${suspect}?`);
        }
      });
    });

    // Flag as mole button
    document.querySelectorAll('.accuse-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rawSuspect = btn.getAttribute('data-suspect') || '';
        const suspect = rawSuspect.replace(/[^\w\s.]/g, '').slice(0, 50);
        this.switchTab('terminal');
        if (window.terminalController && suspect) {
          window.terminalController.executeCommand(`radio ${suspect} is the mole`);
        }
      });
    });
  }

  // ==========================================
  // 4. CIPHER BYPASS MINIGAME
  // ==========================================
  initBypassGame() {
    const dials = [
      document.getElementById('dial-0'),
      document.getElementById('dial-1'),
      document.getElementById('dial-2'),
      document.getElementById('dial-3'),
      document.getElementById('dial-4'),
      document.getElementById('dial-5')
    ];

    const targetCode = ['7', '4', '9', '2', '0', '1'];

    dials.forEach((dial, idx) => {
      if (!dial) return;
      dial.addEventListener('input', () => {
        // Enforce single digit constraint
        dial.value = dial.value.replace(/[^0-9]/g, '').slice(0, 1);
        if (window.audioEngine) window.audioEngine.playKeyClick();
        this.checkBypassCode(dials, targetCode);
      });
    });

    const autoFillBtn = document.getElementById('autoFillBypassBtn');
    if (autoFillBtn) {
      autoFillBtn.addEventListener('click', () => {
        dials.forEach((d, i) => {
          if (d) d.value = targetCode[i];
        });
        this.checkBypassCode(dials, targetCode);
      });
    }
  }

  checkBypassCode(dials, targetCode) {
    const current = dials.map(d => (d && d.value) ? d.value.replace(/[^0-9]/g, '') : '0');
    const isMatch = current.every((val, idx) => val === targetCode[idx]);
    const statusBox = document.getElementById('bypassStatus');

    if (isMatch) {
      this.bypassSolved = true;
      if (statusBox) {
        statusBox.className = 'bypass-status success';
        statusBox.textContent = '✔ AIRLOCK 02 OVERRIDE VERIFIED! CODE: 749201';
      }
      if (window.audioEngine) window.audioEngine.playSuccess();
      if (window.gameEngine) {
        window.gameEngine.doorUnlocked = true;
        window.gameEngine.objectives.unlockServerRoom.completed = true;
        window.gameEngine.updateObjectiveUI();
      }
    } else {
      if (statusBox) {
        statusBox.className = 'bypass-status pending';
        statusBox.textContent = `DIAL ALIGNMENT: [ ${current.join(' - ')} ] // PENDING 749201`;
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.viewManager = new ViewManager();
});
