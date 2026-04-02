import React, { useEffect, useRef, useState } from 'react';
import { Message, User } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { Hash, Bell, Pin, Users, Search, Inbox, HelpCircle, PlusCircle, Gift, Sticker, Smile, Image as ImageIcon, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatWindowProps {
  channelName: string;
  messages: Message[];
  onSendMessage: (content: string, type?: 'text' | 'image', fileUrl?: string) => void;
  showMemberList: boolean;
  onToggleMemberList: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const EMOJIS = ['⚡', '🔥', '💀', '👽', '🤖', '👾', '💎', '🌈', '🌌', '🚀', '🛸', '🛰️', '💻', '🔋', '🔌', '🕹️'];

export function ChatWindow({ 
  channelName, 
  messages, 
  onSendMessage, 
  showMemberList, 
  onToggleMemberList,
  searchQuery,
  onSearchChange
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      setShowEmojis(false);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setInput(prev => prev + emoji);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSendMessage('', 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-cyber-bg relative overflow-hidden">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-cyber-border shadow-sm z-10 bg-cyber-bg/80 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Hash size={20} className="text-slate-500" />
          <span className="font-bold text-slate-100">{channelName}</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <Bell 
            size={20} 
            className="cursor-pointer hover:text-slate-200 transition-colors" 
            onClick={() => alert('Xabarnomalar chastotasi sozlandi...')}
          />
          <Pin 
            size={20} 
            className="cursor-pointer hover:text-slate-200 transition-colors" 
            onClick={() => alert('Biriktirilgan xabarlar shifri ochildi...')}
          />
          <Users 
            size={20} 
            className={cn("cursor-pointer transition-colors", showMemberList ? "text-neon-blue" : "hover:text-slate-200")} 
            onClick={onToggleMemberList}
          />
          <div className="relative">
            <input 
              type="text" 
              placeholder="Qidiruv" 
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-cyber-card border border-cyber-border rounded px-2 py-0.5 text-xs focus:outline-none focus:border-neon-blue w-32 transition-all focus:w-48"
            />
            <Search size={14} className="absolute right-2 top-1.5 opacity-50" />
          </div>
          <Inbox 
            size={20} 
            className="cursor-pointer hover:text-slate-200 transition-colors" 
            onClick={() => alert('Kiruvchi ma\'lumotlar oqimi...')}
          />
          <HelpCircle 
            size={20} 
            className="cursor-pointer hover:text-slate-200 transition-colors" 
            onClick={() => alert('Qo\'llanmaga kirish...')}
          />
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto cyber-scrollbar p-4 space-y-4"
      >
        {searchQuery && (
          <div className="mb-4 p-2 bg-neon-blue/5 border border-neon-blue/20 rounded text-xs text-neon-blue">
            Natijalar filtrlanmoqda: "{searchQuery}"
          </div>
        )}
        
        <div className="mb-8 p-4 border-b border-cyber-border/30">
          <div className="w-16 h-16 rounded-full bg-neon-blue/10 flex items-center justify-center mb-4">
            <Hash size={40} className="text-neon-blue" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">#{channelName} kanaliga xush kelibsiz!</h1>
          <p className="text-slate-400">Bu #{channelName} kanalining boshlanishi.</p>
        </div>

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex space-x-4 group hover:bg-cyber-card/30 -mx-4 px-4 py-1 transition-colors"
            >
              <img src={msg.author.avatar} className="w-10 h-10 rounded-full mt-1 border border-cyber-border" alt="Avatar" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-neon-blue hover:underline cursor-pointer flex items-center">
                    {msg.author.username}
                    {msg.author.role === 'OWNER' && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-black rounded border border-red-500/50 tracking-tighter">
                        OWNER
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-slate-300 leading-relaxed break-words">
                  {msg.type === 'image' ? (
                    <img src={msg.fileUrl} className="max-w-sm rounded-lg border border-cyber-border mt-2 shadow-lg" alt="Uploaded" />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 relative">
        {showEmojis && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 left-4 p-2 bg-cyber-card border border-cyber-border rounded-lg shadow-2xl grid grid-cols-8 gap-2 z-20"
          >
            {EMOJIS.map(emoji => (
              <button 
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 flex items-center justify-center hover:bg-cyber-border rounded transition-colors text-xl"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}

        <form 
          onSubmit={handleSubmit}
          className="bg-cyber-card border border-cyber-border rounded-lg flex items-center px-4 py-2 space-x-4 focus-within:border-neon-blue transition-colors shadow-lg"
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageUpload}
          />
          <PlusCircle 
            className="text-slate-400 cursor-pointer hover:text-neon-blue transition-colors" 
            onClick={() => fileInputRef.current?.click()}
          />
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`#${channelName} kanaliga xabar yozing`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder-slate-500"
          />
          <div className="flex items-center space-x-3 text-slate-400">
            <Gift 
              size={20} 
              className="cursor-pointer hover:text-neon-pink transition-colors" 
              onClick={() => alert('Accessing gift vault...')}
            />
            <Sticker 
              size={20} 
              className="cursor-pointer hover:text-neon-purple transition-colors" 
              onClick={() => alert('Loading sticker packs...')}
            />
            <Smile 
              size={20} 
              className={cn("cursor-pointer transition-colors", showEmojis ? "text-neon-blue" : "hover:text-neon-blue")} 
              onClick={() => setShowEmojis(!showEmojis)}
            />
            <button type="submit" className="text-neon-blue hover:scale-110 transition-transform">
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

