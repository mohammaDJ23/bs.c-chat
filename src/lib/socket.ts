import { io } from 'socket.io-client';
import { getToken } from './authentication';

export function getUserServiceChatSocket() {
  return io(`${process.env.USER_SERVICE}`, {
    path: '/api/v1/user/socket/chat',
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    },
  });
}
