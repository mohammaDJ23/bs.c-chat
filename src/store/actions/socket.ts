import { UserServiceSocket } from '../reducers';
import { Socket } from 'socket.io-client';

export interface SetUserServiceChatSocketAction {
  type: UserServiceSocket.SET_CHAT_SOCKET;
  payload: { socket: Socket };
}

export type UserServiceSocketActions = SetUserServiceChatSocketAction;

export function setUserServiceChatSocket(socket: Socket) {
  return {
    type: UserServiceSocket.SET_CHAT_SOCKET,
    payload: { socket },
  };
}
