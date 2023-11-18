import { RootActions, SetUserServiceSocketAction } from '../actions';
import { Socket } from 'socket.io-client';

export enum UserServiceSocket {
  SET_SOCKET = 'SET_SOCKET',
}

export type SocketState = Socket | null;

const initialState: SocketState = null;

function setSocket(state: SocketState, action: SetUserServiceSocketAction): SocketState {
  return action.payload.socket;
}

export function userServiceSocketReducer(state: SocketState = initialState, actions: RootActions): SocketState {
  switch (actions.type) {
    case UserServiceSocket.SET_SOCKET:
      return setSocket(state, actions);

    default:
      return state;
  }
}
