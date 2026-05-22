import React, { useState, useEffect, useRef } from "react";
import { MusicTrack } from "../types";
import { 
  Play, 
  Pause, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Users, 
  Disc, 
  Radio, 
  ListMusic, 
  Search, 
  Sparkles,
  UserPlus
} from "lucide-react";

interface VoiceChatSimulatorProps {
  queue: MusicTrack[];
  tracks: MusicTrack[];
  onPlayTrack: (track: MusicTrack) => void;
  onSkipTrack: () => void;
  onClearQueue: () => void;
  onAddToQueue: (track: MusicTrack) => void;
}

export default function VoiceChatSimulator({
  queue,
  tracks,
  onPlayTrack,
  onSkipTrack,
  onClearQueue,
  onAddToQueue,
}: VoiceChatSimulatorProps) {
  const currentTrack = queue[0] || null;
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [lyricsText, setLyricsText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customTrackTitle, setCustomTrackTitle] = useState("");
  const [customTrackArtist, setCustomTrackArtist] = useState("");
  const [customTrackUrl, setCustomTrackUrl] = useState("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice Chat users details
  const [participants, setParticipants] = useState([
    { id: "p-1", name: "Shinya (Owner)", isSpeaking: false, isMuted: false, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60" },
    { id: "p-2", name: "Rishu", isSpeaking: false, isMuted: true, avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60" },
    { id: "p-3", name: "SharmaJi", isSpeaking: false, isMuted: false, avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=60" },
    { id: "p-4", name: "Ankit_01", isSpeaking: false, isMuted: false, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60" },
  ]);

  // Synchronize dynamic speaking intervals to look extremely live!
  useEffect(() => {
    const handleInterval = setInterval(() => {
      setParticipants((prev) =>
        prev.map((p) => {
          // If bot is playing, other users speak less or more to the groove
          const speakChance = currentTrack && isPlaying ? 0.15 : 0.35;
          return {
            ...p,
            isSpeaking: p.isMuted ? false : Math.random() < speakChance,
          };
        })
      );
    }, 2500);
    return () => clearInterval(handleInterval);
  }, [currentTrack, isPlaying]);

  // Track playback logic with HTML Audio element
  useEffect(() => {
    if (audioRef.current) {
      if (currentTrack && isPlaying) {
        audioRef.current.play().catch(() => {
          // Handle browsers autoplabbing restriction
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentTrack, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  // Generate simulated lyrics state dynamically
  useEffect(() => {
    if (currentTrack) {
      setLyricsText(`🎶 [Lyrics Analysis] "${currentTrack.title}"
Artist: ${currentTrack.artist}
Requested by: @${currentTrack.requestedBy}
Stream quality: 320kbps (HQ Codec / ffmpeg alternative)

[0:15] Vibe intro starts...
[0:45] Feeling the groove of ShinMusic...
[1:20] No more pytgcalls lag! Safe direct streams activated.
[2:00] Perfect high fidelity sound on cloud run instance.`);
    } else {
      setLyricsText("No audio is currently playing in the ShinMusic voice canal. Search or select a track to start the stream.");
    }
  }, [currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  const handleTrackEnded = () => {
    onSkipTrack();
  };

  const togglePrimaryPlayback = () => {
    if (!currentTrack && tracks.length > 0) {
      onPlayTrack(tracks[0]);
    }
    setIsPlaying(!isPlaying);
  };

  const handleCustomTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTrackTitle) return;
    
    const newTrack: MusicTrack = {
      id: `custom-${Date.now()}`,
      title: customTrackTitle,
      artist: customTrackArtist || "Online Request",
      duration: "05:12",
      url: customTrackUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
      requestedBy: "AnonymUser",
      source: "YouTube"
    };

    onAddToQueue(newTrack);
    setCustomTrackTitle("");
    setCustomTrackArtist("");
    setCustomTrackUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3");
  };

  const formatProgressTime = () => {
    if (!audioRef.current) return "0:00";
    const cur = Math.floor(audioRef.current.currentTime);
    const min = Math.floor(cur / 60);
    const sec = Math.floor(cur % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const filteredTracks = tracks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* HTML5 Audio Node */}
      {currentTrack && (
        <audio
          ref={audioRef}
          src={currentTrack.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleTrackEnded}
        />
      )}

      {/* LEFT COLUMN: Telegram Voice Chat Simulator Card */}
      <div id="voice-sim-card" className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xl relative">
        
        {/* Top bar */}
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-emerald-400" />
                ShinMusic Voice Chat
              </h2>
              <p className="text-xs text-zinc-500 font-mono">Stream Hook: FFE-Stream (Active)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-semibold font-mono text-zinc-400">
              PYTGCALLS_ALT
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium text-xs">
              <Users className="w-3.5 h-3.5" />
              {participants.length + (currentTrack ? 1 : 0)} Users
            </span>
          </div>
        </div>

        {/* Dynamic Canvas Container / Voice Layout area */}
        <div className="p-6 md:p-8 flex-1 grid grid-cols-2 sm:grid-cols-3 gap-6 items-center justify-center min-h-[340px] bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900">
          
          {/* Bot Streaming Head (Always shown prominent if playing) */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              {/* Spinning Vinyl & Ring visualizer */}
              <div className={`absolute -inset-2.5 rounded-full bg-emerald-500/25 blur-sm transition-all duration-300 ${isPlaying ? "opacity-100 scale-110" : "opacity-0"}`}></div>
              
              <div className={`relative w-24 h-24 rounded-full p-1 bg-zinc-800 border-2 items-center justify-center flex transition-all duration-500 ${isPlaying ? "border-emerald-500 glow-voice-active" : "border-zinc-700"}`}>
                <div className={`absolute -inset-1 rounded-full border border-dashed border-emerald-400/50 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "12s" }}></div>
                <img
                  src={currentTrack ? currentTrack.thumbnail : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=60"}
                  alt="ShinMusic Bot"
                  className={`w-full h-full rounded-full object-cover transition-transform duration-1000 ${isPlaying ? "rotate-180" : ""}`}
                  style={{ animation: isPlaying ? "spin 8s linear infinite" : "none" }}
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Audio Bars on Top of Avatar */}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center gap-1">
                    <span className="w-1 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                    <span className="w-1 h-9 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    <span className="w-1 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.5s]"></span>
                  </div>
                )}
              </div>
            </div>
            
            <span className="mt-3 text-xs font-semibold text-zinc-100 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-400 border border-emerald-500/20">
              <Disc className="w-3 h-3 text-emerald-400" />
              ShinMusic Bot
            </span>
            <span className="text-[10px] text-zinc-500 mt-0.5 font-sans font-medium">Alternative Streamer</span>
          </div>

          {/* User Participants */}
          {participants.map((user) => (
            <div key={user.id} className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className={`relative w-18 h-18 rounded-full transition-all duration-300 ${user.isSpeaking ? "ring-4 ring-zinc-500 scale-102" : "ring-2 ring-zinc-700"}`}>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {user.isMuted && (
                    <div className="absolute bottom-0 right-0 p-1 bg-red-500 text-white rounded-full">
                      <VolumeX className="w-3 h-3" />
                    </div>
                  )}
                  {user.isSpeaking && (
                    <div className="absolute bottom-0 right-0 p-1 bg-zinc-600 border border-white rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
                    </div>
                  )}
                </div>
              </div>
              <span className="mt-2.5 text-xs text-zinc-300 font-medium tracking-tight text-center truncate w-24">
                {user.name}
              </span>
              <span className="text-[9px] text-zinc-500">Listener</span>
            </div>
          ))}

          {/* Add simulated user trigger button */}
          <button 
            id="join-mock-user-btn"
            onClick={() => {
              const newNames = ["Rohan_V", "Sweety_Roy", "Sumit_Bot", "HarshBot", "Preeti_X"];
              const randomName = newNames[Math.floor(Math.random() * newNames.length)];
              const mockUser = {
                id: `p-${Date.now()}`,
                name: randomName,
                isSpeaking: false,
                isMuted: Math.random() > 0.7,
                avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 2000000)}?w=100&auto=format&fit=crop&q=60`
              };
              setParticipants([...participants, mockUser]);
            }}
            className="flex flex-col items-center justify-center border border-dashed border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/10 rounded-xl p-3 h-28 cursor-pointer transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="mt-2 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Invite mock user</span>
          </button>

        </div>

        {/* BOTTOM ACTIVE TRACK PANEL */}
        <div id="active-track-banner" className="p-4 bg-zinc-950/80 border-t border-zinc-800/80">
          {currentTrack ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-xs text-emerald-400 uppercase tracking-widest font-bold">Now Cast-Streaming</h4>
                  <p className="text-sm font-semibold text-zinc-100 line-clamp-1">{currentTrack.title}</p>
                  <p className="text-xs text-zinc-400 font-mono">
                    {currentTrack.artist} • Req by @{currentTrack.requestedBy} • {currentTrack.source}
                  </p>
                </div>
              </div>

              {/* Player Track controls */}
              <div className="flex items-center gap-4 self-end md:self-auto">
                <div className="flex items-center gap-2">
                  <button
                    id="sim-play-pause-btn"
                    onClick={togglePrimaryPlayback}
                    className={`mt-1 p-2 bg-emerald-500 text-zinc-950 rounded-full hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer`}
                    title={isPlaying ? "Pause Stream" : "Play Stream"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  
                  <button
                    id="sim-skip-btn"
                    onClick={onSkipTrack}
                    className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full cursor-pointer"
                    title="Skip Track"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress bar info */}
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <span>{formatProgressTime()}</span>
                  <div className="w-24 md:w-36 h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span>{currentTrack.duration}</span>
                </div>

                {/* Interactive Volume bar */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="text-zinc-400 hover:text-white"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseInt(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-zinc-500 text-xs">Voice canal streaming silent. Please choose a track below to stream audio.</p>
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Library, Custom Search & Dynamic Queue controller */}
      <div className="lg:col-span-4 flex flex-col gap-6">

        {/* Dynamic Search & Queuer panel */}
        <div id="search-queue-panel" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-zinc-400" />
              Music Library Search
            </h3>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 font-mono font-medium px-2 py-0.5 rounded uppercase">
              Shinu Pool
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search sound tracks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-2 pl-9 pr-4 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-zinc-700 transition"
            />
          </div>

          {/* Track pool results */}
          <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
            {filteredTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  className={`p-2 rounded-lg flex items-center justify-between border cursor-pointer hover:bg-zinc-850 transition ${isCurrent ? "bg-emerald-500/10 border-emerald-500/30" : "bg-zinc-950 border-zinc-850"}`}
                  onClick={() => {
                    onPlayTrack(track);
                    setIsPlaying(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={track.thumbnail}
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="max-w-[140px] md:max-w-none">
                      <p className={`text-xs font-semibold truncate ${isCurrent ? "text-emerald-400" : "text-zinc-200"}`}>{track.title}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{track.artist}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToQueue(track);
                      }}
                      className="px-2 py-1 text-[9px] font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer transition"
                    >
                      + Queue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="border-zinc-800" />

          {/* Form to submit Custom Tracks */}
          <form onSubmit={handleCustomTrackSubmit} className="space-y-2.5">
            <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Play Any Music by Name & Link
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Enter song name..."
                required
                value={customTrackTitle}
                onChange={(e) => setCustomTrackTitle(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 font-sans"
              />
              <input
                type="text"
                placeholder="Artist or Requested by..."
                value={customTrackArtist}
                onChange={(e) => setCustomTrackArtist(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-100 focus:outline-none focus:border-zinc-700 font-sans"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                placeholder="Stream CDN URL / Direct MP3 link..."
                value={customTrackUrl}
                onChange={(e) => setCustomTrackUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-zinc-700"
              />
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-zinc-500 uppercase font-mono font-bold">Preset Feeds:</span>
                <select
                  onChange={(e) => setCustomTrackUrl(e.target.value)}
                  className="bg-zinc-950 text-zinc-400 border border-zinc-850 rounded p-1 text-[10px] w-full max-w-[200px]"
                >
                  <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3">Helix Song Sample 3</option>
                  <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3">Helix Song Sample 5</option>
                  <option value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3">Helix Song Sample 7</option>
                  <option value="https://audio.aurora-stream.org/ambient-space-lofi.mp3">Live Ambient Space Lofi Link</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 hover:opacity-90 rounded-lg text-xs font-extrabold transition-all uppercase tracking-wider cursor-pointer"
            >
              Cast /play Link Instant
            </button>
          </form>
        </div>

        {/* LYRICS & META SCREEN */}
        <div id="lyrics-vibe-panel" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 shadow-xl">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Disc className="w-4 h-4 text-zinc-400 animate-spin" style={{ animationDuration: "5s" }} />
            Streaming Metadata & Lyrics Analysis
          </h3>
          <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4 font-mono text-xs text-zinc-400 max-h-[140px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {lyricsText}
          </div>
          <div className="flex justify-between items-center text-[10px] text-zinc-500">
            <span>Buffer load: 100%</span>
            <span className="text-emerald-500 font-semibold font-mono animate-pulse">● FEED ONLINE</span>
          </div>
        </div>

      </div>

    </div>
  );
}
