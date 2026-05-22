/**
 * Types for ShinMusic Bot Console & Voice Chat Simulator
 */

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  duration: string; // MM:SS
  url: string;      // Streaming audio url
  thumbnail: string;
  requestedBy: string;
  source: "YouTube" | "SoundCloud" | "Spotify" | "Local";
}

export interface BotConfig {
  botToken: string;
  apiId: string;
  apiHash: string;
  mongoDbUri: string;
  ownerId: string;
  herokuAppName: string;
  herokuApiKey: string;
  streamQuality: "High" | "Medium" | "Low";
  playbinAlternative: string;
  autoLeave: boolean;
  exportCompiled: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "shinu";
  text: string;
  timestamp: string;
}

export interface VoiceChatUser {
  id: string;
  username: string;
  avatar: string;
  isSpeaker: boolean;
  isMuted: boolean;
  volume: number;
  isBot: boolean;
}

export interface PlaybackState {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  currentTime: number; // in seconds
  duration: number;    // in seconds
  volume: number;      // 0 to 100
  loopMode: "None" | "Track" | "Queue";
  activeVoiceChat: string | null;
}
