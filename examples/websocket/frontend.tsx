/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: examples/websocket/frontend.tsx
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

'use client';

import { useEffect, useState, useRef, useCallback, ReactElement } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export type User = {
  id: string;
  username: string;
};

export type Message = {
  id: string;
  username: string;
  content: string;
  timestamp: Date | string;
  type: 'user' | 'system';
};

interface ServerToClientEvents {
  message: (msg: Message) => void;
  'user-joined': (data: { user: User; message: Message }) => void;
  'user-left': (data: { user: User; message: Message }) => void;
  'users-list': (data: { users: User[] }) => void;
}

interface ClientToServerEvents {
  join: (data: { username: string }) => void;
  message: (data: { content: string; username: string }) => void;
}

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

const formatTimestamp = (timestamp: Date | string): string => {
  try {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? '' : date.toLocaleTimeString();
  } catch {
    return '';
  }
};

export default function SocketDemo(): ReactElement {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);
  const [socket, setSocket] = useState<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<TypedSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    // Connect to websocket server
    // Never use PORT in the URL, alyways use XTransformPort
    // DO NOT change the path, it is used by Caddy to forward the request to the correct port
    const socketInstance: TypedSocket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    const onConnect = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onConnectError = (err: Error) => {
      setIsConnected(false);
      setConnectionError(err.message || 'Connection failed');
    };

    const onMessage = (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    };

    const onUserJoined = (data: { user: User; message: Message }) => {
      setMessages((prev) => [...prev, data.message]);
      setUsers((prev) => {
        if (!prev.some((u) => u.id === data.user.id)) {
          return [...prev, data.user];
        }
        return prev;
      });
    };

    const onUserLeft = (data: { user: User; message: Message }) => {
      setMessages((prev) => [...prev, data.message]);
      setUsers((prev) => prev.filter((u) => u.id !== data.user.id));
    };

    const onUsersList = (data: { users: User[] }) => {
      setUsers(data.users);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);
    socketInstance.on('connect_error', onConnectError);
    socketInstance.on('message', onMessage);
    socketInstance.on('user-joined', onUserJoined);
    socketInstance.on('user-left', onUserLeft);
    socketInstance.on('users-list', onUsersList);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.off('connect_error', onConnectError);
      socketInstance.off('message', onMessage);
      socketInstance.off('user-joined', onUserJoined);
      socketInstance.off('user-left', onUserLeft);
      socketInstance.off('users-list', onUsersList);
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleJoin = useCallback(() => {
    const trimmedUsername = username.trim();
    const currentSocket = socketRef.current || socket;
    if (currentSocket && trimmedUsername && isConnected) {
      currentSocket.emit('join', { username: trimmedUsername });
      setIsUsernameSet(true);
    }
  }, [username, isConnected, socket]);

  const sendMessage = useCallback(() => {
    const trimmedMessage = inputMessage.trim();
    const trimmedUsername = username.trim();
    const currentSocket = socketRef.current || socket;
    if (currentSocket && trimmedMessage && trimmedUsername && isConnected) {
      currentSocket.emit('message', {
        content: trimmedMessage,
        username: trimmedUsername,
      });
      setInputMessage('');
    }
  }, [inputMessage, username, isConnected, socket]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    },
    [sendMessage]
  );

  const handleJoinKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleJoin();
      }
    },
    [handleJoin]
  );

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>WebSocket Demo</span>
            <div className="flex items-center space-x-2">
              {users.length > 0 && isUsernameSet && (
                <span className="text-xs text-gray-500 font-normal">
                  {users.length} user{users.length !== 1 ? 's' : ''} online
                </span>
              )}
              <span
                className={`text-sm px-2 py-1 rounded ${
                  isConnected
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isConnected ? 'Connected' : connectionError || 'Disconnected'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isUsernameSet ? (
            <div className="space-y-2">
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleJoinKeyPress}
                placeholder="Enter your username..."
                disabled={!isConnected}
                className="flex-1"
              />
              <Button
                onClick={handleJoin}
                disabled={!isConnected || !username.trim()}
                className="w-full"
              >
                Join Chat
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="h-80 w-full border rounded-md p-4">
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">No messages yet</p>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="border-b pb-2 last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                msg.type === 'system'
                                  ? 'text-blue-600 italic'
                                  : 'text-gray-700'
                              }`}
                            >
                              {msg.username}
                            </p>
                            <p
                              className={`${
                                msg.type === 'system'
                                  ? 'text-blue-500 italic'
                                  : 'text-gray-900'
                              }`}
                            >
                              {msg.content}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {formatTimestamp(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={!isConnected}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!isConnected || !inputMessage.trim()}
                >
                  Send
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}