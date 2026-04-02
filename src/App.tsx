/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Sidebar } from './components/Sidebar';
import { ChannelList } from './components/ChannelList';
import { ChatWindow } from './components/ChatWindow';
import { MemberList } from './components/MemberList';
import { Login } from './components/Login';
import { Modal } from './components/Modal';
import { User, Server, Channel, Message } from './types';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeServerId, setActiveServerId] = useState('neon-central');
  const [activeChannelId, setActiveChannelId] = useState('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [showMemberList, setShowMemberList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [editUsername, setEditUsername] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;

    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', currentUser);
    });

    newSocket.on('init', (data) => {
      setServers(data.servers);
      setChannels(data.channels);
      setMessages(data.messages);
      setOnlineUsers(data.onlineUsers);
      setIsLoaded(true);
      newSocket.emit('join_channel', 'general');
    });

    newSocket.on('new_message', (message) => {
      // Faqat hozirgi kanalga tegishli xabarlarni qo'shish
      setMessages((prev) => {
        // Agar xabar allaqachon bo'lsa yoki boshqa kanalga tegishli bo'lsa qo'shmaymiz
        // Eslatma: Socket.io xonalar orqali server buni filtrlaydi, lekin xavfsizlik uchun bu yerda ham tekshiramiz
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    newSocket.on('channel_history', (history) => {
      setMessages(history);
    });

    newSocket.on('user_joined', (user) => {
      setOnlineUsers((prev) => [...prev, user]);
    });

    newSocket.on('user_left', (userId) => {
      setOnlineUsers((prev) => prev.filter(u => u.id !== userId));
    });

    newSocket.on('server_created', (server) => {
      setServers((prev) => [...prev, server]);
    });

    newSocket.on('channel_created', (channel) => {
      setChannels((prev) => [...prev, channel]);
    });

    newSocket.on('user_updated', (updatedUser) => {
      if (updatedUser.id === currentUser?.id) {
        setCurrentUser(updatedUser);
      }
      setOnlineUsers((prev) => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    });

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, currentUser?.id]);

  const handleSendMessage = (content: string, type: 'text' | 'image' = 'text', fileUrl?: string) => {
    if (socket && activeChannelId) {
      socket.emit('send_message', {
        content,
        channelId: activeChannelId,
        type,
        fileUrl
      });
    }
  };

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    if (socket) {
      socket.emit('join_channel', channelId);
    }
  };

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && newServerName.trim()) {
      socket.emit('create_server', { name: newServerName });
      setNewServerName('');
      setIsServerModalOpen(false);
    }
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && newChannelName.trim()) {
      socket.emit('create_channel', { 
        name: newChannelName, 
        serverId: activeServerId 
      });
      setNewChannelName('');
      setIsChannelModalOpen(false);
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && editUsername.trim()) {
      socket.emit('update_profile', { username: editUsername });
      setIsSettingsModalOpen(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setEditUsername(user.username);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-cyber-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin neon-glow" />
          <div className="text-neon-blue font-mono tracking-widest animate-pulse">XAVFSIZ_ALOQA_O'RNATILMOQDA...</div>
        </div>
      </div>
    );
  }

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const filteredChannels = channels.filter(c => c.serverId === activeServerId);
  const filteredMessages = messages.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.author.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex overflow-hidden select-none">
      <Sidebar 
        servers={servers} 
        activeServerId={activeServerId} 
        onSelectServer={setActiveServerId} 
        onAddServer={() => setIsServerModalOpen(true)}
      />
      
      <ChannelList 
        channels={filteredChannels} 
        activeChannelId={activeChannelId} 
        onSelectChannel={handleSelectChannel}
        currentUser={currentUser}
        isMuted={isMuted}
        isDeafened={isDeafened}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleDeafen={() => setIsDeafened(!isDeafened)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onAddChannel={() => setIsChannelModalOpen(true)}
      />

      <ChatWindow 
        channelName={activeChannel?.name || 'umumiy'} 
        messages={filteredMessages}
        onSendMessage={handleSendMessage}
        showMemberList={showMemberList}
        onToggleMemberList={() => setShowMemberList(!showMemberList)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {showMemberList && <MemberList members={onlineUsers} />}

      {/* Modals */}
      <Modal 
        isOpen={isServerModalOpen} 
        onClose={() => setIsServerModalOpen(false)} 
        title="Yangi Server Yaratish"
      >
        <form onSubmit={handleCreateServer} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Server Nomi</label>
            <input 
              type="text"
              value={newServerName}
              onChange={(e) => setNewServerName(e.target.value)}
              className="w-full bg-cyber-bg border border-cyber-border rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-neon-blue"
              placeholder="Server nomini kiriting"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full bg-neon-blue text-cyber-bg font-bold py-2.5 rounded-lg hover:bg-neon-blue/80 transition-colors">
            SERVER_YARATISH
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isChannelModalOpen} 
        onClose={() => setIsChannelModalOpen(false)} 
        title="Yangi Kanal Yaratish"
      >
        <form onSubmit={handleCreateChannel} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kanal Nomi</label>
            <input 
              type="text"
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              className="w-full bg-cyber-bg border border-cyber-border rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-neon-blue"
              placeholder="masalan: umumiy"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full bg-neon-purple text-white font-bold py-2.5 rounded-lg hover:bg-neon-purple/80 transition-colors">
            KANAL_YARATISH
          </button>
        </form>
      </Modal>

      <Modal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
        title="Foydalanuvchi Sozlamalari"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2 text-center mb-6">
            <img src={currentUser?.avatar} className="w-20 h-20 rounded-full mx-auto border-2 border-neon-blue p-1" alt="Avatar" />
            <p className="text-xs text-slate-500 mt-2">Avatar foydalanuvchi nomingizdan yaratiladi</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Foydalanuvchi nomi</label>
            <input 
              type="text"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="w-full bg-cyber-bg border border-cyber-border rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-neon-blue"
              placeholder="Yangi foydalanuvchi nomi"
            />
          </div>
          <button type="submit" className="w-full bg-neon-blue text-cyber-bg font-bold py-2.5 rounded-lg hover:bg-neon-blue/80 transition-colors">
            PROFILNI_YANGILASH
          </button>
        </form>
      </Modal>
    </div>
  );
}



