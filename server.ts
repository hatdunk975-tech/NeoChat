import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  // In-memory store for demo
  const state = {
    users: new Map<string, any>(), // socketId -> user
    servers: [
      { id: 'neon-central', name: 'Neon Markazi', icon: '⚡' },
      { id: 'cyber-hub', name: 'Kiber Hub', icon: '🌐' },
      { id: 'void-deck', name: 'Bo\'shliq Palubasi', icon: '🌑' }
    ],
    channels: [
      { id: 'umumiy', serverId: 'neon-central', name: 'umumiy', type: 'text' },
      { id: 'dasturchilar', serverId: 'neon-central', name: 'dasturchilar', type: 'text' },
      { id: 'dam-olish', serverId: 'neon-central', name: 'dam-olish', type: 'text' },
      { id: 'elonlar', serverId: 'cyber-hub', name: 'elonlar', type: 'text' },
      { id: 'savdo', serverId: 'cyber-hub', name: 'savdo', type: 'text' },
    ],
    messages: [
      {
        id: 'msg-1',
        content: 'Neon Markaziga xush kelibsiz! Bu yerda umumiy suhbat ketadi.',
        author: { id: 'system', username: 'TIZIM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=system', role: 'OWNER' },
        channelId: 'umumiy',
        timestamp: new Date().toISOString(),
        type: 'text'
      },
      {
        id: 'msg-2',
        content: 'Dasturchilar kanalida faqat kod haqida gaplashamiz.',
        author: { id: 'system', username: 'TIZIM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=system', role: 'OWNER' },
        channelId: 'dasturchilar',
        timestamp: new Date().toISOString(),
        type: 'text'
      },
      {
        id: 'msg-3',
        content: 'Kiber Hub elonlarini shu yerda kuzatib boring.',
        author: { id: 'system', username: 'TIZIM', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=system', role: 'OWNER' },
        channelId: 'elonlar',
        timestamp: new Date().toISOString(),
        type: 'text'
      }
    ] as any[],
    onlineUsers: new Set<string>()
  };

  app.use(express.json({ limit: '50mb' }));

    // Auth endpoint
    app.post('/api/login', (req, res) => {
      const { username, password } = req.body;
      
      let role: 'OWNER' | 'USER' = 'USER';
      // Agar parol 20132016 bo'lsa, ismi nima bo'lishidan qat'iy nazar OWNER bo'ladi
      if (password === '20132016') {
        role = 'OWNER';
      }

      const user = {
        id: uuidv4(),
        username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        status: 'online',
        role
      };

      res.json({ user });
    });

  // Socket.io logic
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userData) => {
      const user = {
        id: userData.id || socket.id,
        username: userData.username || `User_${socket.id.slice(0, 4)}`,
        avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${socket.id}`,
        status: 'online',
        role: userData.role || 'USER'
      };
      state.users.set(socket.id, user);
      state.onlineUsers.add(user.id);

      // Send initial state
      socket.emit('init', {
        user,
        servers: state.servers,
        channels: state.channels,
        messages: state.messages.filter(m => m.channelId === 'general'),
        onlineUsers: Array.from(state.users.values())
      });

      // Broadcast new user
      socket.broadcast.emit('user_joined', user);
    });

    socket.on('create_server', (serverData) => {
      const newServer = {
        id: uuidv4(),
        name: serverData.name,
        icon: serverData.icon || '🆕'
      };
      state.servers.push(newServer);
      io.emit('server_created', newServer);
    });

    socket.on('create_channel', (channelData) => {
      const newChannel = {
        id: uuidv4(),
        serverId: channelData.serverId,
        name: channelData.name,
        type: channelData.type || 'text'
      };
      state.channels.push(newChannel);
      io.emit('channel_created', newChannel);
    });

    socket.on('update_profile', (profileData) => {
      const user = state.users.get(socket.id);
      if (user) {
        user.username = profileData.username || user.username;
        user.avatar = profileData.avatar || user.avatar;
        state.users.set(socket.id, user);
        io.emit('user_updated', user);
      }
    });

    socket.on('send_message', (messageData) => {
      const user = state.users.get(socket.id);
      if (!user) return;

      const newMessage = {
        id: uuidv4(),
        content: messageData.content,
        author: user,
        channelId: messageData.channelId,
        timestamp: new Date().toISOString(),
        type: messageData.type || 'text',
        fileUrl: messageData.fileUrl
      };

      state.messages.push(newMessage);
      io.to(messageData.channelId).emit('new_message', newMessage);
    });

    socket.on('join_channel', (channelId) => {
      // Barcha oldingi xonalardan chiqish (o'zining socket.id xonasidan tashqari)
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });
      
      socket.join(channelId);
      console.log(`Socket ${socket.id} joined channel: ${channelId}`);
      
      // Kanal tarixini yuborish
      const channelMessages = state.messages.filter(m => m.channelId === channelId);
      socket.emit('channel_history', channelMessages);
    });

    socket.on('disconnect', () => {
      const user = state.users.get(socket.id);
      if (user) {
        state.onlineUsers.delete(user.id);
        io.emit('user_left', user.id);
        state.users.delete(socket.id);
      }
      console.log('User disconnected:', socket.id);
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
