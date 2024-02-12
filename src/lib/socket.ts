import { io } from 'socket.io-client';
import { getToken } from './authentication';

export interface WsErrorObj {
  event: string;
  message: string;
  timestamp: string;
}

export function getUserServiceConnectionSocket() {
  return io(`${process.env.USER_SERVICE}`, {
    path: '/api/v1/user/socket/connection',
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    },
  });
}

export function getUserServiceChatSocket(firebaseIdToken: string) {
  return io(`${process.env.USER_SERVICE}`, {
    path: '/api/v1/user/socket/chat',
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${getToken()}`,
          FBITAuthorization: `Bearer ${firebaseIdToken}`,
        },
      },
    },
  });
}
