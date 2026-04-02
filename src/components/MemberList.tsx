import React from 'react';
import { User } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface MemberListProps {
  members: User[];
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="w-60 bg-cyber-card/50 border-l border-cyber-border hidden lg:flex flex-col">
      <div className="h-12 px-4 flex items-center border-b border-cyber-border font-bold text-slate-500 text-xs uppercase tracking-widest">
        A'zolar — {members.length}
      </div>
      
      <div className="flex-1 overflow-y-auto cyber-scrollbar p-2 space-y-1">
        <div className="text-[10px] font-bold text-slate-500 px-2 py-2 uppercase tracking-widest">
          Onlayn — {members.length}
        </div>
        
        {members.map((member) => (
          <div
            key={member.id}
            className="group flex items-center px-2 py-1.5 rounded-md cursor-pointer hover:bg-cyber-border transition-colors"
          >
            <div className="relative mr-3">
              <img src={member.avatar} className="w-8 h-8 rounded-full border border-cyber-border" alt={member.username} />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-cyber-card" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-300 group-hover:text-slate-100 truncate flex items-center">
                {member.username}
                {member.role === 'OWNER' && (
                  <span className="ml-1.5 px-1 py-0.5 bg-red-500/20 text-red-500 text-[8px] font-black rounded border border-red-500/50">
                    EGASI
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                Cyberpunk 2077 o'ynamoqda
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
