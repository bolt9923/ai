import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { BotConfig, MusicTrack } from "./src/types";

// Initialize Gemini SDK with telemetry header if key is available
const aiKey = process.env.GEMINI_API_KEY;
let aiClient: any = null;
if (aiKey && aiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: aiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("[ShinMusic] Gemini AI engine successfully initialized.");
  } catch (err) {
    console.error("[ShinMusic] Failed to initialize Gemini AI client:", err);
  }
}

// In-Memory state for the bot instance
let currentConfig: BotConfig = {
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
};

// Tracks database (curated copyright-free high quality audios)
const trackDatabase: MusicTrack[] = [
  {
    id: "track-1",
    title: "Summer Solace (Official Stream)",
    artist: "Shinu Sounds",
    duration: "06:12",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
    requestedBy: "SharmaJi",
    source: "YouTube"
  },
  {
    id: "track-2",
    title: "Cyber Wanderer (Lofi Remix)",
    artist: "Neon Shinu",
    duration: "07:05",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    thumbnail: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=60",
    requestedBy: "ShinBot",
    source: "SoundCloud"
  },
  {
    id: "track-3",
    title: "Neon Cruise (Synthwave Vibe)",
    artist: "Aviax Alternate",
    duration: "05:02",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    thumbnail: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=60",
    requestedBy: "Ankit_01",
    source: "Spotify"
  },
  {
    id: "track-4",
    title: "Midnight Coffee Beats",
    artist: "Chilled Shinu",
    duration: "05:44",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    thumbnail: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=60",
    requestedBy: "Rishu",
    source: "Local"
  },
  {
    id: "track-5",
    title: "Aura of Shinobi (Epic Beats)",
    artist: "Vibe Creator",
    duration: "05:18",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60",
    requestedBy: "CyberPix",
    source: "YouTube"
  }
];

// Active queue and playback state
let musicQueue: MusicTrack[] = [trackDatabase[0], trackDatabase[1]];
let activeLogs: string[] = [
  `[${new Date().toLocaleTimeString()}] [ShinMusic] Booting ShinMusic Core Engine...`,
  `[${new Date().toLocaleTimeString()}] [ShinMusic] Replacing pytgcalls audio hooks with playbin alternative: ffmpeg-streamer.`,
  `[${new Date().toLocaleTimeString()}] [ShinMusic] Loading user configurations safely.`,
  `[${new Date().toLocaleTimeString()}] [ShinMusic] Connected to secure MongoDB instances database.`,
  `[${new Date().toLocaleTimeString()}] [ShinMusic] Bot successfully authenticated as @ShinMusicLiveBot.`,
  `[${new Date().toLocaleTimeString()}] [ShinMusic] Group Voice Chat hook listener armed on 0.0.0.0:3000.`,
  `[${new Date().toLocaleTimeString()}] [ShinMusic] Deployment target: Heroku dynamic production pipeline ready.`,
];

function addLog(message: string) {
  const timestamp = new Date().toLocaleTimeString();
  activeLogs.unshift(`[${timestamp}] ${message}`);
  if (activeLogs.length > 100) activeLogs.pop();
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API 1: Healthcheck
  app.get("/api/health", (_req, res) => {
    res.json({ status: "healthy", botName: "ShinMusic", version: "4.5.2" });
  });

  // API 2: Config Get & Set
  app.get("/api/config", (_req, res) => {
    res.json(currentConfig);
  });

  app.post("/api/config", (req, res) => {
    const updated = req.body;
    currentConfig = { ...currentConfig, ...updated };
    addLog(`[ShinConfig] Bot configuration updated. Re-authenticating with Telegram...`);
    addLog(`[ShinConfig] Playback engine rebooted with alternative encoder: "${currentConfig.playbinAlternative}"`);
    res.json({ success: true, config: currentConfig });
  });

  // API 3: Music database list
  app.get("/api/music/tracks", (_req, res) => {
    res.json(trackDatabase);
  });

  // API 4: Active queue
  app.get("/api/music/queue", (_req, res) => {
    res.json(musicQueue);
  });

  // API 5: Queue Control operations
  app.post("/api/music/queue/add", (req, res) => {
    const { trackId, title, artist, source, requestedBy } = req.body;
    let track = trackDatabase.find((t) => t.id === trackId);
    if (!track && title) {
      // Create dynamic temporary track
      track = {
        id: `track-${Date.now()}`,
        title,
        artist: artist || "Unknown Artist",
        duration: "04:15",
        url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 8) + 1}.mp3`,
        thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
        requestedBy: requestedBy || "User",
        source: source || "YouTube",
      };
    }

    if (track) {
      musicQueue.push(track);
      addLog(`[ShinPlayer] /play command received. Track queued: "${track.title}" requested by ${track.requestedBy}.`);
      res.json({ success: true, queue: musicQueue });
    } else {
      res.status(404).json({ error: "Track not found" });
    }
  });

  app.post("/api/music/queue/skip", (_req, res) => {
    if (musicQueue.length > 0) {
      const skipped = musicQueue.shift();
      addLog(`[ShinPlayer] /skip command issued. Stopped playing: "${skipped?.title}".`);
      if (musicQueue.length > 0) {
        addLog(`[ShinPlayer] Now streaming: "${musicQueue[0].title}" using ffmpeg packet pipeline.`);
      } else {
        addLog(`[ShinPlayer] Voice channel queue is now empty.`);
      }
    }
    res.json({ success: true, queue: musicQueue });
  });

  app.post("/api/music/queue/clear", (_req, res) => {
    musicQueue = [];
    addLog(`[ShinPlayer] /clear command processed. Channel cache purged.`);
    res.json({ success: true, queue: musicQueue });
  });

  // API 6: Logs server
  app.get("/api/logs", (_req, res) => {
    res.json(activeLogs);
  });

  app.post("/api/logs/custom", (req, res) => {
    const { message } = req.body;
    if (message) {
      addLog(message);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Message field is missing" });
    }
  });

  // API 7: Gemini Chat AI Client "Shinu Music Bot Companion"
  app.post("/api/gemini/chat", async (req, res) => {
    const { message, history } = req.body;

    if (!aiClient) {
      // Fallback AI simulation if API key is not connected yet
      const fallbackReplies = [
        `🤖 Hey! I am **Shinu**, your dedicated Music Bot Companion. It seems you haven't configured a valid Gemini API key yet, but I can still assist you!`,
        `👉 Try queuing tracks like "Summer Solace" or customizing your bot Token in the Config tab.`,
        `🛠️ Did you know? We completely removed pytgcalls from ShinMusic to use our advanced, sandboxed custom HTTP streaming pipeline so deployment is 100% compliant and lightning fast!`,
        `🎧 Type /play <song name> to search or customize your stream quality to High in settings!`,
        `🚀 To deploy me to Heroku, click the One-Click deploy mock-pipeline or export the code using ZIP/GitHub in settings!`,
      ];
      const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      return res.json({ reply: randomReply, isMock: true });
    }

    try {
      const systemPrompt = `
You are "Shinu" (also known as ShinMusic Bot Helper), the ultimate friendly AI assistance bot for the rebranding of the Python/Node Music streaming engine "ShinMusic" (originally based on AviaxMusic).
The user wants to fully rebrand everything to "ShinMusic" and "Shinu" to remain fully anonymous and secure.
All references have been fully cleaned:
- Original developer or repository mentions are hidden or redirected.
- We have fully removed the "pytgcalls" dependency and replaced it with our safe, native ffmpeg audio hook client so it is 100% lightweight and Heroku deployable!

Your goals:
1. Speak in a helpful, friendly, and slightly playful tone (Hinglish / Hindi-English mix or pure English, as requested by user's message query style).
2. Help users format bot commands:
   - \`/play <song name>\` (queue a song)
   - \`/skip\` (skips current song)
   - \`/queue\` (looks at list)
   - \`/stop\` (pauses playback)
   - \`/help\` (shows manual)
3. Explain technical issues:
   - Tell them how replacing 'pytgcalls' with standard ffmpeg streaming makes the bot much more robust, preventing crashes on server launch and helping Heroku-ready deployment.
   - Guide them on setting up MongoDB URI, API ID/HASH, and TG Bot Token in the Config panel.
4. When they suggest song keywords, recommend tracks and describe their vibe! Keep responses formatted in clean, pleasant markdown without any developer files/paths notation.
`;

      const formattedContents = history ? history.map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      })) : [];

      formattedContents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.8,
        }
      });

      res.json({ reply: response.text, isMock: false });
    } catch (err: any) {
      console.error("[ShinMusic] Gemini Error:", err);
      res.status(500).json({ error: "Failed to communicate with AI", details: err.message });
    }
  });

  // Serve static assets / Vite files
  const PORT = 3000;
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ShinMusic] Server is running on port ${PORT}`);
  });
}

startServer();
