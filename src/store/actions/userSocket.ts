import { UserServiceSocket } from '../reducers';
import { Socket } from 'socket.io-client';

export interface SetUserServiceConnectionSocketAction {
  type: UserServiceSocket.SET_CONNECTION_SOCKET;
  payload: { socket: Socket };
}

export interface SetUserServiceChatSocketAction {
  type: UserServiceSocket.SET_CHAT_SOCKET;
  payload: { socket: Socket };
}

export type UserServiceSocketActions = SetUserServiceConnectionSocketAction | SetUserServiceChatSocketAction;

export function setUserServiceConnectionSocket(socket: Socket) {
  return {
    type: UserServiceSocket.SET_CONNECTION_SOCKET,
    payload: { socket },
  };
}

export function setUserServiceChatSocket(socket: Socket) {
  return {
    type: UserServiceSocket.SET_CHAT_SOCKET,
    payload: { socket },
  };
}
