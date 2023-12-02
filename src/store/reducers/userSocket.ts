import { RootActions, SetUserServiceChatSocketAction } from '../actions';
import { Socket } from 'socket.io-client';

export enum UserServiceSocket {
  SET_CHAT_SOCKET = 'SET_CHAT_SOCKET',
}

export interface SocketState {
  connection: Socket | null;
  chat: Socket | null;
}

const initialState: SocketState = {
  connection: null,
  chat: null,
};

function setUserServiceChatSocket(state: SocketState, action: SetUserServiceChatSocketAction): SocketState {
  return Object.assign({}, state, { chat: action.payload.socket });
}

export function userServiceSocketReducer(state: SocketState = initialState, actions: RootActions): SocketState {
  switch (actions.type) {
    case UserServiceSocket.SET_CHAT_SOCKET:
      return setUserServiceChatSocket(state, actions);

    default:
      return state;
  }
}
