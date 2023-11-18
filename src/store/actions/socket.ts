import { UserServiceSocket } from '../reducers';
import { Socket } from 'socket.io-client';

export interface SetUserServiceSocketAction {
  type: UserServiceSocket.SET_SOCKET;
  payload: { socket: Socket };
}

export type UserServiceSocketActions = SetUserServiceSocketAction;

export function setUserServiceSocket(socket: Socket) {
  return {
    type: UserServiceSocket.SET_SOCKET,
    payload: { socket },
  };
}
