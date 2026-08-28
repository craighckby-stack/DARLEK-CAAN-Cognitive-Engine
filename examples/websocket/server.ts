/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: examples/websocket/server.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { createServer, Server as HttpServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { Server, Socket } from 'socket.io'

export interface User {
  id: string
  username: string
}

export interface Message {
  id: string
  username: string
  content: string
  timestamp: Date
  type: 'user' | 'system'
}

export interface ServerToClientEvents {
  'test-response': (response: { message: string; data: unknown; timestamp: string }) => void
  'user-joined': (payload: { user: User; message: Message }) => void
  'users-list': (payload: { users: User[] }) => void
  'message': (payload: Message) => void
  'user-left': (payload: { user: User; message: Message }) => void
}

export interface ClientToServerEvents {
  'test': (data: unknown) => void
  'join': (data: { username: string }) => void
  'message': (data: { content: string; username: string }) => void
}

export interface InterServerEvents {}
export interface SocketData {}

const PORT = Number(process.env.PORT) || 3003
const MAX_USERNAME_LENGTH = 50
const MAX_CONTENT_LENGTH = 1000

const httpServer: HttpServer = createServer()

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  // DO NOT change the path, it is used by Caddy to forward the request to the correct port
  path: '/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
})

const users = new Map<string, User>()

const generateMessageId = (): string => randomUUID()

const createSystemMessage = (content: string): Message => ({
  id: generateMessageId(),
  username: 'System',
  content,
  timestamp: new Date(),
  type: 'system'
})

const createUserMessage = (username: string, content: string): Message => ({
  id: generateMessageId(),
  username,
  content,
  timestamp: new Date(),
  type: 'user'
})

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('test', (data: unknown) => {
    try {
      console.log('Received test message:', data)
      socket.emit('test-response', { 
        message: 'Server received test message', 
        data,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error(`Error handling 'test' event for socket ${socket.id}:`, error)
    }
  })

  socket.on('join', (data: { username: string }) => {
    try {
      if (!data || typeof data.username !== 'string') {
        return
      }

      const username = data.username.trim().slice(0, MAX_USERNAME_LENGTH)
      if (!username) {
        return
      }

      const user: User = {
        id: socket.id,
        username
      }

      users.set(socket.id, user)

      const joinMessage = createSystemMessage(`${username} joined the chat room`)
      io.emit('user-joined', { user, message: joinMessage })

      const usersList = Array.from(users.values())
      socket.emit('users-list', { users: usersList })

      console.log(`${username} joined the chat room, current online users: ${users.size}`)
    } catch (error) {
      console.error(`Error handling 'join' event for socket ${socket.id}:`, error)
    }
  })

  socket.on('message', (data: { content: string; username: string }) => {
    try {
      if (!data || typeof data.content !== 'string' || typeof data.username !== 'string') {
        return
      }

      const content = data.content.trim().slice(0, MAX_CONTENT_LENGTH)
      const username = data.username.trim()

      if (!content || !username) {
        return
      }

      const user = users.get(socket.id)

      if (user && user.username === username) {
        const message = createUserMessage(username, content)
        io.emit('message', message)
        console.log(`${username}: ${content}`)
      }
    } catch (error) {
      console.error(`Error handling 'message' event for socket ${socket.id}:`, error)
    }
  })

  socket.on('disconnect', () => {
    try {
      const user = users.get(socket.id)

      if (user) {
        users.delete(socket.id)

        const leaveMessage = createSystemMessage(`${user.username} left the chat room`)
        io.emit('user-left', { user: { id: socket.id, username: user.username }, message: leaveMessage })

        console.log(`${user.username} left the chat room, current online users: ${users.size}`)
      } else {
        console.log(`User disconnected: ${socket.id}`)
      }
    } catch (error) {
      console.error(`Error handling 'disconnect' event for socket ${socket.id}:`, error)
    }
  })

  socket.on('error', (error: Error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`)
})

let isShuttingDown = false

const handleShutdown = (signal: string) => {
  if (isShuttingDown) return
  isShuttingDown = true
  console.log(`Received ${signal} signal, shutting down server...`)

  io.close(() => {
    httpServer.close(() => {
      console.log('WebSocket server closed')
      process.exit(0)
    })
  })

  const timer = setTimeout(() => {
    console.error('Forced shutdown due to connection timeout')
    process.exit(1)
  }, 10000)
  timer.unref()
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'))
process.on('SIGINT', () => handleShutdown('SIGINT'))