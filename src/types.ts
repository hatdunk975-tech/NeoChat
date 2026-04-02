export interface User {
  id: string;
  username: string;
  avatar: string;
  status: 'online' | 'offline' | 'idle' | 'dnd';
  role?: 'OWNER' | 'USER';
}

export interface Server {
  id: string;
  name: string;
  icon: string;
}

export interface Channel {
  id: string;
  serverId: string;
  name: string;
  type: 'text' | 'voice';
}

export interface Message {
  id: string;
  content: string;
  author: User;
  channelId: string;
  timestamp: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
}
