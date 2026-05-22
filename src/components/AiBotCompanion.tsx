import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Send, Bot, User, Trash2, HelpCircle, Play, Music, Terminal, Zap, RefreshCw } from "lucide-react";

interface AiBotCompanionProps {
  onQueueTrackCommand: (searchQuery: string) => void;
  onSkipCommand: () => void;
  onClearCommand: () => void;
}

export default function AiBotCompanion({
  onQueueTrackCommand,
  onSkipCommand,
  onClearCommand,
}: AiBotCompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "shinu-1",
      sender: "shinu",
      text: "👋 Hello! Main hoon **Shinu**, aapka rebranded official AI Music assistant support. Aap mujhse music recommendations le sakte hain, lyrics search kar sakte hain, ya direct playlist control seekh sakte hain! \n\n*Aap mujhse pooch sakte hain:* \n• Kaise deploy kare Heroku par?\n• Rebrand details (Aviax to ShinMusic)\n• Lyrics and Recommendations!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Dynamic parsing of bot commands typed inside chat conversation!
    // Example: If user says /play tu mile or play summer solace
    const playMatch = textToSend.match(/^\/play\s+(.+)$/i) || textToSend.match(/^play\s+(.+)$/i);
    if (playMatch && playMatch[1]) {
      const songQuery = playMatch[1];
      setTimeout(() => {
        onQueueTrackCommand(songQuery);
      }, 1000);
    } else if (textToSend.toLowerCase().includes("/skip") || textToSend.toLowerCase() === "skip") {
      setTimeout(() => {
        onSkipCommand();
      }, 1000);
    } else if (textToSend.toLowerCase().includes("/clear") || textToSend.toLowerCase() === "clear queue") {
      setTimeout(() => {
        onClearCommand();
      }, 1000);
    }

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10), // Pass recent context
        }),
      });

      const data = await response.json();
      
      const shinuMsg: ChatMessage = {
        id: `shinu-${Date.now()}`,
        sender: "shinu",
        text: data.reply || "Aapka audio system fully working hai. Please queue tracks down below!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, shinuMsg]);
    } catch (err) {
      console.error("[ShinMusic] Client AI chat error:", err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "shinu",
        text: "⚠️ Server connectivity exception. Sub-processing alternative: Try setting your Gemini API key in Settings > Secrets to unleash full conversational abilities!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `shinu-${Date.now()}`,
        sender: "shinu",
        text: "Chat parameters flushed. Shinu assistant is ready to groove!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Instant chip handlers
  const handleChipClick = (label: string, userFriendlyQuery: string) => {
    handleSendMessage(userFriendlyQuery);
  };

  return (
    <div id="shinu-chat-panel" className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[525px] overflow-hidden shadow-2xl">
      
      {/* Bot Chat Header */}
      <div className="p-4 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5 animate-bounce" style={{ animationDuration: "3s" }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
              Shinu Assistant Chat
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-zinc-500">Official companion of @ShinMusic</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors"
          title="Clear Chat Logs"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950/20">
        {messages.map((msg) => {
          const isShinu = msg.sender === "shinu";
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${isShinu ? "mr-auto" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isShinu ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-700 text-zinc-200"}`}>
                {isShinu ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              
              <div className="flex flex-col gap-1">
                <div className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${isShinu ? "bg-zinc-800/80 text-zinc-200 border border-zinc-800/60 rounded-tl-none font-sans" : "bg-emerald-500 text-zinc-950 rounded-tr-none font-sans font-semibold"}`}>
                  {msg.text}
                </div>
                <span className={`text-[9px] font-mono text-zinc-500 ${isShinu ? "self-start" : "self-end"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-2.5 mr-auto max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-zinc-800/50 text-zinc-400 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
              <span>Shinu is formatting reply...</span>
              <span className="w-1 h-3 bg-zinc-400 rounded-full animate-bounce"></span>
              <span className="w-1 h-3 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Triggers chips list */}
      <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none border-t border-zinc-850 bg-zinc-950/40">
        <button
          onClick={() => handleChipClick("Heroku Deploy", "Heroku deploy script kaise use kare detail do?")}
          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 rounded-full text-[10px] text-zinc-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Zap className="w-3 h-3 text-purple-400" /> Heroku Deployment
        </button>
        <button
          onClick={() => handleChipClick("Rebrand Info", "AviaxMusic se ShinMusic rebrand details batao hum safe kaise rahe?")}
          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 rounded-full text-[10px] text-zinc-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Terminal className="w-3 h-3 text-emerald-400" /> Rebrand Clean-up
        </button>
        <button
          onClick={() => handleChipClick("Track Req", "Play midnight coffee beats")}
          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 rounded-full text-[10px] text-zinc-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Play className="w-3 h-3 text-emerald-400" /> /play Midnight Coffee
        </button>
        <button
          onClick={() => handleChipClick("Recommendation", "Mujhe trending lofi recommendations do")}
          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700/80 rounded-full text-[10px] text-zinc-300 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Music className="w-3 h-3 text-blue-400" /> Recommendations
        </button>
      </div>

      {/* Message input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 bg-zinc-950 border-t border-zinc-800/80 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Type message or bot command..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-100 focus:outline-none focus:border-zinc-750 font-sans"
        />
        <button
          type="submit"
          className="p-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-xl transition cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
