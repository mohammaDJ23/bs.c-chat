import { io } from 'socket.io-client';
import { getToken } from './authentication';

export function getUserServiceSocket() {
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
