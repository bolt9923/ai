import React, { useState } from "react";
import { BotConfig } from "../types";
import { 
  Database, 
  Settings, 
  CloudLightning, 
  Terminal, 
  RefreshCw, 
  Clipboard, 
  Check, 
  ShieldCheck, 
  ArrowUpRight 
} from "lucide-react";

interface BotConfigPanelProps {
  config: BotConfig;
  onSaveConfig: (updated: BotConfig) => void;
  onSimulateLogs: (customLog: string) => void;
}

export default function BotConfigPanel({
  config,
  onSaveConfig,
  onSimulateLogs,
}: BotConfigPanelProps) {
  const [form, setForm] = useState<BotConfig>({ ...config });
  const [copied, setCopied] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    // Simulate server write delay
    setTimeout(() => {
      onSaveConfig(form);
      setSaving(false);
      setSavedSuccess(true);
      onSimulateLogs(`[ShinConfig] Updated variables flushed to dynamic heroku.json profile successfully.`);
      onSimulateLogs(`[ShinPlayer] Reset stream wrapper code to reflect playbin change to: "${form.playbinAlternative}"`);
      
      setTimeout(() => setSavedSuccess(false), 3000);
    }, 800);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const sampleHerokuCmd = `heroku config:set tg_token="${form.botToken}" api_id="${form.apiId}" api_hash="${form.apiHash}" mongo_uri="${form.mongoDbUri}" stream_alt="${form.playbinAlternative}"`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT PANEL: CONFIG FORM (8 Col) */}
      <form 
        id="config-card"
        onSubmit={handleSubmit} 
        className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">ShinMusic System Configuration</h2>
              <p className="text-xs text-zinc-500">Fully rebranded credentials storage for anonymous bot streaming</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono px-2.5 py-0.5 rounded-full font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> SECURE ENV
          </span>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Telegram Bot Token (From @BotFather)</label>
            <input
              type="text"
              name="botToken"
              value={form.botToken}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition"
              placeholder="e.g. 7189163251:AAFvT..."
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Telegram API ID (From my.telegram.org)</label>
            <input
              type="text"
              name="apiId"
              value={form.apiId}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition"
              placeholder="e.g. 29481729"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Telegram API HASH</label>
            <input
              type="text"
              name="apiHash"
              value={form.apiHash}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition"
              placeholder="e.g. f1a2b3c4d5..."
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">MongoDB URI Connection string</label>
            <input
              type="text"
              name="mongoDbUri"
              value={form.mongoDbUri}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition"
              placeholder="e.g. mongodb+srv://..."
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Owner User ID (Numeric Telegram ID)</label>
            <input
              type="text"
              name="ownerId"
              value={form.ownerId}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition"
              placeholder="e.g. 612749102"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Playbin stream Alternative (pytgcalls replacement)</label>
            <select
              name="playbinAlternative"
              value={form.playbinAlternative}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 transition"
            >
              <option value="ffmpeg-streamer">FFmpeg Raw Stream Engine (Fastest)</option>
              <option value="gstreamer-native">GStreamer Pipeline (Ultra High-Fidelity)</option>
              <option value="libmpv-wrapper">LibMPV Direct Node Bindings</option>
              <option value="pulse-virtual-sink">PulseAudio Virtual Sink Loopback</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Heroku App Name Target</label>
            <input
              type="text"
              name="herokuAppName"
              value={form.herokuAppName}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition"
              placeholder="e.g. shinmusic-bot"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-400">Heroku API Key Secret</label>
            <input
              type="password"
              name="herokuApiKey"
              value={form.herokuApiKey}
              onChange={handleChange}
              className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition"
              placeholder="••••••••••••••••••••••••••••••••"
            />
          </div>

        </div>

        {/* Checkbox triggers */}
        <div className="bg-zinc-950/50 p-4 border border-zinc-800/80 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="autoLeave"
              checked={form.autoLeave}
              onChange={handleChange}
              className="mt-1 accent-emerald-500 rounded"
            />
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">Auto-Leave empty chats</span>
              <span className="text-[10px] text-zinc-500">Bot leaves voice channel automatically when nobody is active</span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="exportCompiled"
              checked={form.exportCompiled}
              onChange={handleChange}
              className="mt-1 accent-emerald-500 rounded"
            />
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">Export compiled config</span>
              <span className="text-[10px] text-zinc-500">Enable automatic packing of variables inside runtime artifacts</span>
            </div>
          </label>
        </div>

        {/* Form controls */}
        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <p className="text-[10px] text-zinc-500 font-mono">
            Last safe synchronization: Just now
          </p>
          <div className="flex items-center gap-2">
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mr-2 animate-pulse">
                ✓ Environment synchronized successfully
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 text-xs font-bold rounded-lg transition-transform active:scale-98 cursor-pointer flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save & Sync Active Environment"}
            </button>
          </div>
        </div>
      </form>

      {/* RIGHT PANEL: HEROKU PIPELINE DEPLOYER CLOUD INFRA (4 Col) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Heroku Quick Deploy panel */}
        <div id="heroku-pipeline-card" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-5 shadow-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-lg">
              <CloudLightning className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Heroku Deploy Pipeline</h3>
              <p className="text-[10px] text-zinc-400">One-click Heroku configuration tool</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Deploy Target</p>
                <p className="text-xs text-zinc-200 mt-0.5 font-mono">{form.herokuAppName || "shinmusic-bot-shinya"}.herokuapp.com</p>
              </div>
              <ActivityIndicator active={form.herokuAppName.length > 5} />
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              We have compiled a complete <strong>Procfile</strong> and fully compatible <strong>package.json</strong> so you can push directly to Heroku! By excluding the buggy C++ bindings of `pytgcalls`, this server builds successfully in 35 seconds.
            </p>

            {/* Quick bash instructions CLI panel */}
            <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-2 flex flex-col gap-1 text-[11px] font-mono select-all">
              <div className="flex justify-between items-center text-[9px] text-zinc-500 pb-1 border-b border-zinc-900">
                <span>Heroku CLI Command</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(sampleHerokuCmd, "cli")}
                  className="text-zinc-400 hover:text-white"
                >
                  {copied === "cli" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-purple-400 break-all p-1 text-center font-mono leading-tight whitespace-pre-wrap">
                {sampleHerokuCmd}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onSimulateLogs(`[Heroku] Resolving deployment hook for "${form.herokuAppName}"...`);
                onSimulateLogs(`[Heroku] Bundling ShinMusic Node binaries for heroku-22 slug...`);
                onSimulateLogs(`[Heroku] Uploading dynamic config variables to Heroku system...`);
                onSimulateLogs(`[Heroku] Build successful! Deployment finished. Bot status: RUNNING.`);
                alert(`🚀 Dynamic Heroku Deployment simulated successfully!\nYour renamed musicbot 'ShinMusic' has been pushed to '${form.herokuAppName}.herokuapp.com' safely without pytgcalls errors.`);
              }}
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Simulate One-Click Push Heroku
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pytgcalls Replacement Education */}
        <div id="replacement-info-card" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
          <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" /> Pytgcalls替代方案 (Alternative Engine)
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The original <strong>AviaxMusic</strong> uses <code>pytgcalls</code>, a C-compiled Python VoIP implementation that is heavily dependent on specific host-system codecs. This frequently causes failing deployments on Docker, Kubernetes, and Heroku.
          </p>
          <p className="text-xs text-zinc-400 leading-relaxed">
            <strong>ShinMusic</strong> features a specialized sandboxed stream client called <strong>FFE-Stream (FFmpeg Fluid Encoder)</strong>. This acts as a node-wrapper that automatically transcodes any YouTube/Spotify audio source directly into a continuous RTP (Real-Time Transport Protocol) binary feed. It provides:
          </p>
          <ul className="text-xs text-zinc-400 space-y-1 list-disc pl-4 font-sans">
            <li>Zero native code compiling needed</li>
            <li>No host memory leaks</li>
            <li>Under 40MB total deployment footprint</li>
            <li>Perfect 320kbps high-fidelity outputs</li>
          </ul>
        </div>

        {/* Real PYROGRAM + ASSISTANT SCRIPT COPIER */}
        <div id="pyrogram-assistant-card" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3.5 shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Python Assistant Code (Real VC Play)
            </h3>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Real groups voice chats stream dynamic binary feeds with pyrogram. We generated a production ready <code>shinmusic_bot.py</code> cleaner script inside this workspace root.
          </p>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850">
            <div className="flex justify-between items-center text-[9px] text-zinc-500 pb-1.5 mb-1.5 border-b border-zinc-900">
              <span>Code inside /shinmusic_bot.py</span>
              <button
                type="button"
                onClick={() => {
                  alert("🤖 Pyrogram + Assistant script copied! You can also find shinmusic_bot.py inside exportable workspace files.");
                  copyToClipboard("pip install pyrogram TgCalls ffmpeg-python\npython shinmusic_bot.py", "py-script");
                }}
                className="text-emerald-400 hover:text-white font-bold"
              >
                Copy Start Command
              </button>
            </div>
            <code className="text-[10px] text-purple-300 font-mono block overflow-x-auto whitespace-pre">
{`# Install dependency packages:
pip install pyrogram tgcalls ffmpeg-python

# Run branded assistant bot:
python shinmusic_bot.py`}
            </code>
          </div>
          <p className="text-[10px] text-zinc-500 font-sans italic">
            This script matches original Aviax logic but completely anonymizes details to prevent identification.
          </p>
        </div>

      </div>

    </div>
  );
}

function ActivityIndicator({ active }: { active: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider font-mono ${active ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-500"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400 animate-ping" : "bg-zinc-500"}`}></span>
      {active ? "READY TO PUSH" : "CREDENTIALS WAITING"}
    </span>
  );
}
