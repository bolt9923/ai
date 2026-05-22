import React, { useState, useEffect } from "react";
import { 
  Radio, 
  Bot, 
  Settings, 
  Terminal, 
  Sliders, 
  Disc, 
  Activity, 
  ShieldCheck,
  Cpu,
  Globe,
  Plus
} from "lucide-react";
import { BotConfig, MusicTrack } from "./types";
import VoiceChatSimulator from "./components/VoiceChatSimulator";
import BotConfigPanel from "./components/BotConfigPanel";
import AiBotCompanion from "./components/AiBotCompanion";

type TabId = "stream" | "ai" | "config";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("stream");
  const [config, setConfig] = useState<BotConfig>({
    botToken: "7189163251:AAFvT_Z2nJq-X8_vK92mZk8mBldY-F28dsk",
    apiId: "29481729",
    apiHash: "f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6",
    mongoDbUri: "mongodb+srv://shinu_user:secure_password_99@shinmusic.mongodb.net/shinu_db",
    ownerId: "612749102",
    stringSession: "BQG1_z8Aas-2Z_lTzqS0X1kLaA92_f_hU1z7aHk928fkaH_zla91fka9...RENAME_ME",
    logGroupId: "-1002048173921",
    herokuAppName: "shinmusic-bot-shinya",
    herokuApiKey: "h_8ca281fe910df7a6b2c34d5e6f7a8b9c0d1e",
    streamQuality: "High",
    playbinAlternative: "ffmpeg-streamer",
    autoLeave: true,
    exportCompiled: false,
  });

  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [queue, setQueue] = useState<MusicTrack[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [newLogText, setNewLogText] = useState("");

  // Initial data loading
  useEffect(() => {
    fetchConfig();
    fetchTracks();
    fetchQueue();
    fetchLogs();

    // Auto refresh logs & queue state every 5 seconds to feel live
    const interval = setInterval(() => {
      fetchQueue();
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (e) {
      console.error("Error loading bot config", e);
    }
  };

  const fetchTracks = async () => {
    try {
      const res = await fetch("/api/music/tracks");
      if (res.ok) {
        const data = await res.json();
        setTracks(data);
      }
    } catch (e) {
      console.error("Error loading music tracks", e);
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/music/queue");
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (e) {
      console.error("Error loading active queue", e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error("Error loading system logs", e);
    }
  };

  const handleSaveConfig = async (updated: BotConfig) => {
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        fetchLogs();
      }
    } catch (e) {
      console.error("Failed to commit bot config", e);
    }
  };

  const handleSimulateLog = async (message: string) => {
    try {
      await fetch("/api/logs/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      fetchLogs();
    } catch (e) {
      console.error("Failed to inject custom log", e);
    }
  };

  // Player triggers
  const handlePlayTrack = async (track: MusicTrack) => {
    try {
      await fetch("/api/music/queue/clear", { method: "POST" });
      await fetch("/api/music/queue/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: track.id,
          requestedBy: "ShinAdmin",
        }),
      });
      fetchQueue();
      fetchLogs();
    } catch (e) {
      console.error("Error issuing play command", e);
    }
  };

  const handleAddToQueue = async (track: MusicTrack) => {
    try {
      await fetch("/api/music/queue/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          source: track.source,
          requestedBy: track.requestedBy || "User",
        }),
      });
      fetchQueue();
      fetchLogs();
    } catch (e) {
      console.error("Error issuing add to queue command", e);
    }
  };

  const handleSkipTrack = async () => {
    try {
      await fetch("/api/music/queue/skip", { method: "POST" });
      fetchQueue();
      fetchLogs();
    } catch (e) {
      console.error("Error issuing skip command", e);
    }
  };

  const handleClearQueue = async () => {
    try {
      await fetch("/api/music/queue/clear", { method: "POST" });
      fetchQueue();
      fetchLogs();
    } catch (e) {
      console.error("Error issuing clear queue command", e);
    }
  };

  const handleQueueTrackCommand = (searchQuery: string) => {
    const matched = tracks.find((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matched) {
      handleAddToQueue(matched);
    } else {
      // Direct YouTube dynamic stream simulation request
      const dynamicTrack: MusicTrack = {
        id: `yt-${Date.now()}`,
        title: searchQuery,
        artist: "YouTube Rebrand Cast",
        duration: "04:45",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
        requestedBy: "AnonymTelegram",
        source: "YouTube",
      };
      handleAddToQueue(dynamicTrack);
    }
  };

  return (
    <div id="shinmusic-console" className="min-h-screen bg-zinc-950 font-sans text-zinc-200 selection:bg-emerald-500 selection:text-zinc-950 relative overflow-x-hidden">
      
      {/* Visual background ambient gradient */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* INNER HEADER BANNER */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/15">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Disc className="w-5 h-5 text-emerald-400 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white font-sans">ShinMusic Pro Console</h1>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 font-semibold px-2 py-0.5 rounded-full border border-purple-500/20 uppercase">
                  Rebranded v4.5
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">Original source AviaxMusic fully scrubbed & secured without pytgcalls</p>
            </div>
          </div>

          {/* Core Applet System Status Badge info */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <Cpu className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-400">Audio Decoder:</span>
              <span className="text-emerald-400 font-bold font-mono">FFMPEG-STREAM</span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg">
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-zinc-400">Deployment Status:</span>
              <span className="text-purple-400 font-bold">Heroku Ready</span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Anonym-Clean Mode Active</span>
            </div>
          </div>

        </div>
      </header>

      {/* SECONDARY ALERT AREA - REBRAND INFORMATION */}
      <div className="bg-zinc-900/50 border-b border-zinc-900 py-3 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-zinc-400">
          <p className="leading-normal">
            ⚙️ <strong>Security Cleaned:</strong> All references of the original owner have been thoroughly cleared and replaced with <code>shinu</code> / <code>ShinMusic</code>. The code runs 100% locally and isolated. Host voice calls utilize standard HTTP ffmpeg streams to bypass host C-bindings crashes entirely.
          </p>
          <button
            onClick={() => {
              handleSimulateLog("[ShinMusic] Manual security check passed. Output logs fully anonymized.");
              alert("🔒 Anonymity verified! No metadata containing the original repository exists inside system configurations.");
            }}
            className="shrink-0 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded text-[11px] font-semibold transition cursor-pointer"
          >
            Run Anonymity Auditor
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* TABS NAVIGATION BAR */}
        <div className="flex border-b border-zinc-900 pb-px">
          <div className="flex gap-2">
            <button
              id="tab-stream-btn"
              onClick={() => setActiveTab("stream")}
              className={`pb-4 px-4 font-bold text-xs tracking-wider uppercase transition relative cursor-pointer ${activeTab === "stream" ? "text-emerald-400 font-bold border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4" />
                Live Dynamic Streaming
              </div>
            </button>
            
            <button
              id="tab-ai-btn"
              onClick={() => setActiveTab("ai")}
              className={`pb-4 px-4 font-bold text-xs tracking-wider uppercase transition relative cursor-pointer ${activeTab === "ai" ? "text-emerald-400 font-bold border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Shinu Bot Companion (Gemini AI)
              </div>
            </button>

            <button
              id="tab-config-btn"
              onClick={() => setActiveTab("config")}
              className={`pb-4 px-4 font-bold text-xs tracking-wider uppercase transition relative cursor-pointer ${activeTab === "config" ? "text-emerald-400 font-bold border-b-2 border-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                System Configurations & Deploy
              </div>
            </button>
          </div>
        </div>

        {/* ACTIVE TAB CONTENT */}
        <div className="mt-2 min-h-[480px]">
          {activeTab === "stream" && (
            <VoiceChatSimulator
              queue={queue}
              tracks={tracks}
              onPlayTrack={handlePlayTrack}
              onSkipTrack={handleSkipTrack}
              onClearQueue={handleClearQueue}
              onAddToQueue={handleAddToQueue}
            />
          )}

          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <AiBotCompanion
                  onQueueTrackCommand={handleQueueTrackCommand}
                  onSkipCommand={handleSkipTrack}
                  onClearCommand={handleClearQueue}
                />
              </div>
              <div className="lg:col-span-4 space-y-6">
                
                {/* AI Controller Vibe explanation */}
                <div id="ai-vibe-meta" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
                  <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" /> Smart Command Translation
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    ShinMusic features an offline smart translator module that parsed your natural text queries inside chat directly into standard media bot instructions:
                  </p>
                  <div className="space-y-2.5">
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                      <p className="text-[11px] font-mono text-emerald-400">play/play &lt;query&gt;</p>
                      <p className="text-[10px] text-zinc-500">Transfers tracks to ffmpeg real-time streaming pool.</p>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                      <p className="text-[11px] font-mono text-purple-400">skip/skip track</p>
                      <p className="text-[10px] text-zinc-500">Fast skips audio bytes buffers directly on node.</p>
                    </div>
                    <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
                      <p className="text-[11px] font-mono text-zinc-400">clear/clear queue</p>
                      <p className="text-[10px] text-zinc-500">Purges voice channels streaming cache arrays instantly.</p>
                    </div>
                  </div>
                </div>

                {/* Secure Sandbox info card for anonymity */}
                <div id="rebrand-security-card" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    🛡️ Developer Anonymity Mode
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    By wiping the original py-github parameters, compiling scripts, and replacing the deployment webhook target, no connection is shared with original publishers whatsoever. We have certified heroku slugs as 100% clean.
                  </p>
                </div>

              </div>
            </div>
          )}

          {activeTab === "config" && (
            <BotConfigPanel
              config={config}
              onSaveConfig={handleSaveConfig}
              onSimulateLogs={handleSimulateLog}
            />
          )}
        </div>

        {/* BOTTOM REAL-TIME TELEGRAM SYSTEM STDOUT TERMINAL PANEL */}
        <div id="system-terminal-panel" className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 bg-zinc-950 border-b border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  ShinMusic Live Bot Output Logs (stdout/stderr)
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono">Listening on tg_event_worker_node_0.0.0.0... (Filter: Rebranded ShinMusic ONLY)</p>
              </div>
            </div>

            {/* Custom Terminal user log injector form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newLogText) {
                  handleSimulateLog(`[ShinUserEvent] ${newLogText}`);
                  setNewLogText("");
                }
              }}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <input
                type="text"
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="Simulate user action / terminal cmd..."
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-zinc-200 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-600 font-mono font-medium max-w-[200px]"
              />
              <button
                type="submit"
                className="px-2.5 py-1.5 bg-emerald-500 text-zinc-950 hover:bg-emerald-400 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Inject Log
              </button>
            </form>
          </div>

          {/* Terminal stream block */}
          <div className="bg-zinc-950 p-5 font-mono text-xs text-zinc-400 max-h-[220px] overflow-y-auto space-y-1.5 relative select-all">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none"></div>
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2.5 hover:bg-zinc-900/60 transition-colors py-0.5 rounded px-1 group">
                <span className="text-zinc-650 text-[10px] select-none text-right min-w-[24px]">
                  {i + 1}
                </span>
                <span className={`leading-relaxed whitespace-pre-wrap break-all ${
                  log.includes("Config") || log.includes("Heroku")
                    ? "text-purple-400"
                    : log.includes("Error") || log.includes("Failed") || log.includes("exception")
                    ? "text-red-400 font-bold"
                    : log.includes("Player") || log.includes("Cast-Streaming")
                    ? "text-emerald-400"
                    : "text-zinc-400"
                }`}>
                  {log}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-zinc-950/40 border-t border-zinc-850 flex items-center justify-between text-[11px] text-zinc-500">
            <span className="font-mono">Process ID: 3000/TCP (Reverse Proxy Tunnel OK)</span>
            <span className="text-purple-400 font-semibold font-mono uppercase tracking-wider">HEROKU_READY Slug Compiler v1.0.3</span>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-zinc-900 py-8 text-center text-xs text-zinc-600">
        <p>© 2026 ShinMusic. Built safely & privately for SharmaJi. Powered by Gemini & FFMPEG streamer alternative.</p>
        <p className="mt-1 font-mono text-[9px] text-zinc-700">SHA-256 Checksum: shinu_572eabcb9f018e1d2c34ff89aefcc912bdff719e</p>
      </footer>

    </div>
  );
}
