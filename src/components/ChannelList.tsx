import React from 'react';
import { cn } from '@/src/lib/utils';
import { Channel, User } from '@/src/types';
import { Hash, Volume2, Settings, Mic, Headphones } from 'lucide-react';

interface ChannelListProps {
  channels: Channel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
  currentUser: User | null;
  isMuted: boolean;
  isDeafened: boolean;
  onToggleMute: () => void;
  onToggleDeafen: () => void;
  onOpenSettings: () => void;
  onAddChannel: () => void;
}

export function ChannelList({ 
  channels, 
  activeChannelId, 
  onSelectChannel, 
  currentUser,
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onOpenSettings,
  onAddChannel
}: ChannelListProps) {
  return (
    <div className="w-64 bg-cyber-card/50 border-r border-cyber-border flex flex-col">
      <div className="h-12 px-4 flex items-center border-b border-cyber-border font-bold text-slate-100 tracking-wider">
        NEON MARKAZI
      </div>
      
      <div className="flex-1 overflow-y-auto cyber-scrollbar p-2 space-y-1">
        <div className="text-xs font-bold text-slate-500 px-2 py-2 flex items-center justify-between uppercase tracking-widest">
          Matnli Kanallar
          <span 
            onClick={onAddChannel}
            className="cursor-pointer hover:text-neon-blue transition-colors"
          >
            +
          </span>
        </div>
        
        {channels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => onSelectChannel(channel.id)}
            className={cn(
              "group flex items-center px-2 py-1.5 rounded-md cursor-pointer transition-colors",
              activeChannelId === channel.id 
                ? "bg-neon-blue/10 text-neon-blue" 
                : "text-slate-400 hover:bg-cyber-border hover:text-slate-200"
            )}
          >
            <Hash size={18} className="mr-2 opacity-60" />
            <span className="font-medium">{channel.name}</span>
          </div>
        ))}

        <div className="text-xs font-bold text-slate-500 px-2 py-6 flex items-center justify-between uppercase tracking-widest">
          Ovozli Kanallar
          <span 
            onClick={onAddChannel}
            className="cursor-pointer hover:text-neon-blue transition-colors"
          >
            +
          </span>
        </div>
        
        <div className="group flex items-center px-2 py-1.5 rounded-md cursor-pointer text-slate-400 hover:bg-cyber-border hover:text-slate-200">
          <Volume2 size={18} className="mr-2 opacity-60" />
          <span className="font-medium">Umumiy Ovozli</span>
        </div>
      </div>

      {/* User Status Bar */}
      <div className="p-2 bg-cyber-bg/80 flex items-center space-x-2 border-t border-cyber-border">
        <div className="relative">
          <img src={currentUser?.avatar} className="w-8 h-8 rounded-full border border-neon-blue/30" alt="Avatar" />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-cyber-bg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-slate-100 truncate">{currentUser?.username}</div>
          <div className="text-[10px] text-slate-500 truncate">#{currentUser?.id.slice(0, 4)}</div>
        </div>
        <div className="flex items-center space-x-1 text-slate-400">
          <div 
            onClick={onToggleMute}
            className={cn("p-1 rounded hover:bg-cyber-border cursor-pointer transition-colors", isMuted && "text-red-500")}
          >
            {isMuted ? <Mic size={16} className="line-through" /> : <Mic size={16} />}
          </div>
          <div 
            onClick={onToggleDeafen}
            className={cn("p-1 rounded hover:bg-cyber-border cursor-pointer transition-colors", isDeafened && "text-red-500")}
          >
            {isDeafened ? <Headphones size={16} className="line-through" /> : <Headphones size={16} />}
          </div>
          <div 
            onClick={onOpenSettings}
            className="p-1 rounded hover:bg-cyber-border cursor-pointer transition-colors"
          >
            <Settings size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
