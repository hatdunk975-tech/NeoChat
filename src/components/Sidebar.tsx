import React from 'react';
import { cn } from '@/src/lib/utils';
import { Server } from '@/src/types';
import { Plus, Compass } from 'lucide-react';

interface SidebarProps {
  servers: Server[];
  activeServerId: string;
  onSelectServer: (id: string) => void;
  onAddServer: () => void;
}

export function Sidebar({ servers, activeServerId, onSelectServer, onAddServer }: SidebarProps) {
  return (
    <div className="w-20 bg-cyber-bg border-r border-cyber-border flex flex-col items-center py-4 space-y-4">
      <div 
        className={cn(
          "w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center cursor-pointer transition-all hover:rounded-xl hover:bg-neon-blue/20 group",
          activeServerId === 'home' && "rounded-xl bg-neon-blue/30"
        )}
        onClick={() => onSelectServer('home')}
      >
        <Compass className="text-neon-blue group-hover:scale-110 transition-transform" />
      </div>
      
      <div className="w-8 h-[2px] bg-cyber-border rounded-full" />
      
      {servers.map((server) => (
        <div 
          key={server.id}
          className="relative group flex items-center"
          onClick={() => onSelectServer(server.id)}
        >
          <div className={cn(
            "absolute -left-4 w-2 h-0 bg-neon-blue rounded-r-full transition-all group-hover:h-5",
            activeServerId === server.id && "h-10"
          )} />
          <div className={cn(
            "w-12 h-12 rounded-full bg-cyber-card flex items-center justify-center cursor-pointer transition-all hover:rounded-xl hover:bg-neon-purple/20 text-xl border border-cyber-border group-hover:border-neon-purple/50",
            activeServerId === server.id && "rounded-xl border-neon-blue bg-neon-blue/10"
          )}>
            {server.icon}
          </div>
        </div>
      ))}

      <div 
        onClick={onAddServer}
        className="w-12 h-12 rounded-full bg-cyber-card flex items-center justify-center cursor-pointer transition-all hover:rounded-xl hover:bg-green-500/20 text-green-400 border border-cyber-border hover:border-green-500/50"
      >
        <Plus size={24} />
      </div>
    </div>
  );
}
