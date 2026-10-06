/**
 * FDI CASE MANAGEMENT & GAME LOGIC ENGINE
 * Inspired by 'The Operator' (Bureau 81)
 * Case File #049: OPERATION BLACKOUT SYNDICATE
 */

class GameEngine {
  constructor() {
    this.caseId = 'CASE-049';
    this.agentName = 'Walker';
    this.agentBadge = '8821';
    
    // Mission Progress Objectives
    this.objectives = {
      inspectLogs: { text: "Audit local case evidence ('ls', 'cat')", completed: false },
      decryptAccess: { text: "Decrypt access_log.enc with cipher key", completed: false },
      traceRogueIP: { text: "Trace suspicious IP in network_dump.log", completed: false },
      unlockServerRoom: { text: "Transmit door code to Agent Walker via radio", completed: false },
      identifyMole: { text: "Identify the inside mole ('SPECTER')", completed: false }
    };

    // Virtual Virtual Filesystem
    this.files = {
      'mission_brief.txt': `=====================================================
FEDERAL DEPARTMENT OF INTELLIGENCE (FDI) - TOP SECRET
CASE FILE #049: OPERATION BLACKOUT SYNDICATE
=====================================================
DATE: 2026-10-06 | LOCATION: Apex Dynamics Cyber Facility
INCIDENT: Physical & digital intrusion. Facility generators cut.
PRIMARY DISPATCH: Agent Walker (Badge #8821) on site.
TACTICAL OPERATOR (YOU): Provide cyber intelligence, decode
firewall ciphers, trace network hops, and guide Walker safely.

MISSION PROTOCOLS:
1. Audit system logs and decrypt 'access_log.enc'.
2. Trace rogue network anomalies.
3. Assist Agent Walker to breach Server Room B.
4. Pinpoint the rogue insider operative (Codename: SPECTER).`,

      'access_log.enc': `[ENCRYPTED CIPHER BLOCK // FDI-AES-XOR]
-----------------------------------------------------
KVMMW$749201$WYSKTI$EVMX
TVERVLM$EX$WZKPIXIP$2$FSSV$SZIVVMHI
KEY_HINT: The last letter of the Greek alphabet. (5 letters: O****)
Run: 'decrypt access_log.enc <KEY>' to decode.`,

      'access_log.decrypted': `[DECRYPTED BIOMETRIC ACCESS LOG]
-----------------------------------------------------
TIMESTAMP: 22:38:14 GMT
TERMINAL: Server Room B - Primary Vault
ACCESS CODE: 749201
AUTHORIZED BADGE: #7741 [NAME: ROSTOVA, ELENA]
SECURITY OVERRIDE: SUCCESSFUL
NOTE: Manual airlock lockdown triggered immediately after entry.`,

      'network_dump.log': `[NET-SNIFFER v4.2 TELEMETRY DUMP - PORT 443 / 8080]
TIME      SRC IP           DST IP           PACKETS   FLAGS
22:30:01  10.0.4.12        10.0.0.1         1240      ACK/OK
22:31:45  10.0.4.88        10.0.0.1         850       ACK/OK
22:35:12  198.51.100.42    10.0.1.5 (VAULT) 98402     SYN_FLOOD [ROGUE!]
22:36:00  10.0.2.14        10.0.0.1         320       ACK/OK

ALERT: IP 198.51.100.42 bypassed external IDS perimeter!
Execute: 'trace 198.51.100.42' to track route.`,

      'suspect_dossier.txt': `[CLASSIFIED PERSONNEL DOSSIERS]
-----------------------------------------------------
1. Dr. Vance Alden | Chief Security Architect | Badge #4491
   Status: Clean. Located in safe room Bunker A.
   
2. Marcus Kane | Lead System Administrator | Badge #5120
   Status: Interrogated. Cleared of external ties.

3. Elena Rostova | Cryptographic Analyst | Badge #7741
   Alias: SPECTER
   Status: FLIGHT RISK. Disappeared from Sublevel 2 before blackout.
   Associated with Blackout Syndicate cyber cartel.`,

      'cctv_log.txt': `[CCTV SURVEILLANCE EVENT LOGS]
CAM-01 (Main Lobby): 22:25:00 - Normal foot traffic.
CAM-02 (Sublevel 2 Corridor): 22:39:10 - Silhouette entered Server Room B.
CAM-03 (Server Room B Interior): 22:40:02 - Terminal accessed, flash drive inserted.
CAM-04 (Emergency Exit): 22:42:15 - Motion detected at alleyway escape bay.

Type 'cctv CAM-02' or 'cctv CAM-03' to examine wireframes.`
    };

    this.isDecrypted = false;
    this.doorUnlocked = false;
    this.caseWon = false;
  }

  // Check objective update
  updateObjectiveUI() {
    const list = document.getElementById('objectiveList');
    if (!list) return;

    list.innerHTML = '';
    for (const [key, obj] of Object.entries(this.objectives)) {
      const item = document.createElement('div');
      item.className = `objective-item ${obj.completed ? 'completed' : 'in-progress'}`;
      item.innerHTML = `${obj.completed ? '✔' : '◻'} ${obj.text}`;
      list.appendChild(item);
    }
  }

  // Decryption mechanic
  decryptFile(filename, key) {
    if (filename !== 'access_log.enc') {
      return { success: false, message: `File '${filename}' is not an encrypted container or does not exist.` };
    }

    if (!key || key.toUpperCase() !== 'OMEGA') {
      return { success: false, message: `DECRYPTION ERROR: Invalid cryptographic key '${key || ''}'. Check KEY_HINT in the file!` };
    }

    this.isDecrypted = true;
    this.files['access_log.txt'] = this.files['access_log.decrypted'];
    this.objectives.decryptAccess.completed = true;
    this.updateObjectiveUI();

    return {
      success: true,
      data: this.files['access_log.decrypted'],
      message: `[DECRYPTION SUCCESSFUL]: 256-bit hash verified.\nBiometric code extracted: 749201\nRelay this code to Agent Walker using 'radio 749201'!`
    };
  }

  // Radio transmitter to Agent Walker
  transmitRadio(message) {
    if (!message || typeof message !== 'string') {
      return { speaker: 'Walker', text: 'Radio static... repeat transmission, Operator?' };
    }
    const clean = message.toLowerCase().trim().slice(0, 300);

    if (clean.includes('749201') || clean.includes('door') || clean.includes('code')) {
      if (!this.isDecrypted) {
        return {
          speaker: 'Walker',
          text: "Operator, I need the verified override code from the decrypted access log! Check access_log.enc first!"
        };
      }

      this.doorUnlocked = true;
      this.objectives.unlockServerRoom.completed = true;
      this.updateObjectiveUI();

      return {
        speaker: 'Walker',
        text: "Code 749201 worked! Server Room B airlock is open! I see an active terminal and a burner phone. Operator, check suspect dossiers and tell me who the inside mole is!"
      };
    }

    if (clean.includes('rostova') || clean.includes('elena') || clean.includes('specter') || clean.includes('7741')) {
      if (!this.doorUnlocked) {
        return {
          speaker: 'Walker',
          text: "Copy that operator, but I can't secure the terminal until I get into Server Room B! Give me the door code!"
        };
      }

      this.objectives.identifyMole.completed = true;
      this.caseWon = true;
      this.updateObjectiveUI();

      return {
        speaker: 'Walker',
        text: "CONFIRMED! Elena Rostova is SPECTER! I've cornered her at Emergency Exit 4. Extraction team inbound. Incredible work, Operator! Case #049 is CLOSED!",
        caseComplete: true
      };
    }

    if (clean.includes('status') || clean.includes('where')) {
      return {
        speaker: 'Walker',
        text: this.doorUnlocked 
          ? "I'm inside Server Room B examining the compromised server. Who authorized this intrusion? Check the dossier!"
          : "I'm outside Server Room B. Heavy security blast door is locked down. Find the override code in access_log.enc!"
      };
    }

    return {
      speaker: 'Walker',
      text: `Copy Operator: "${message}". Standing by for tactical intelligence. What's our next move?`
    };
  }

  // IP Tracer
  traceIP(ip) {
    if (ip !== '198.51.100.42') {
      return `[TRACE FAILURE]: Host ${ip} is unreachable or masking ICMP packets.
Hint: Look for rogue IPs in 'network_dump.log'.`;
    }

    this.objectives.traceRogueIP.completed = true;
    this.updateObjectiveUI();

    return `[GLOBAL FDI SATELLITE TRACE ENGINE]
======================================================
TARGET: 198.51.100.42 (Rogue Proxy Infiltration Node)
HOP 1: 10.0.1.5 (Apex Internal DMZ) ........... [0.4 ms]
HOP 2: 172.16.89.1 (Encrypted VPN Tunnel) .... [12.8 ms]
HOP 3: 84.112.5.3 (Frankfurt Gateway) ......... [48.2 ms]
HOP 4: 198.51.100.42 (Blackout Syndicate C2) .. [74.5 ms]

GEOLOCATION: Zurich Cyber-Bunker, Switzerland
ORGANIZATION: Syndicate Front Entity "Nyx Holdings"
ANOMALY: Linked to internal FDI badge #7741 (Elena Rostova)!`;
  }

  // Wireframe CCTV ASCII camera visualizer
  renderCCTV(camId) {
    const id = camId.toUpperCase();
    if (id === 'CAM-02' || id === '2') {
      return `
[CCTV CAM-02: SUBLEVEL 2 CORRIDOR - TIMESTAMP 22:39:10]
+------------------------------------------------------+
| [REC] LIVE 0.5 FPS            SIGNAL: 98% ENCRYPTED  |
|                                                      |
|        /\\                                            |
|       /  \\            +----------------+             |
|      / /\\ \\           | SERVER ROOM B  |             |
|     | |  | |          | [LOCKED]       |             |
|     | (o.o)| <--- [SUSPECT IN TACTICAL HOOD]         |
|     | /--\\ |          +----------------+             |
|     |_|  |_|                 ||                      |
|                              ||                      |
+------------------------------------------------------+
[ANALYSIS]: Subject entered biometric passcode at key console.`;
    }

    if (id === 'CAM-03' || id === '3') {
      return `
[CCTV CAM-03: SERVER VAULT B INTERIOR - TIMESTAMP 22:40:02]
+------------------------------------------------------+
| [REC] LIVE 0.5 FPS            SIGNAL: HIGH NOISE     |
|                                                      |
|   [RACK 01]    [RACK 02]    [RACK 03]                |
|    |===|        |===|        |===|                   |
|    |   |        | o |        |   |                   |
|    |===|        |/|\\| <--- DATA EXFILTRATION IN PROG |
|                 |/ \\|                                |
|                                                      |
+------------------------------------------------------+
[ANALYSIS]: Thumbdrive labelled "SPECTER-CORE" inserted into Rack 02.`;
    }

    return `[CCTV ERROR]: Unknown feed '${camId}'. Available feeds: CAM-01, CAM-02, CAM-03, CAM-04.`;
  }
}

window.gameEngine = new GameEngine();
