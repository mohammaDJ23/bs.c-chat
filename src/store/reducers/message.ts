import { UserObj } from '../../lib';
import { PushMessageAction, RootActions, SelecteUserAction, UnshiftMessagesAction } from '../actions';

export enum Message {
  PUSH_MESSAGE = 'PUSH_MESSAGE',
  UNSHIFT_MESSAGES = 'UNSHIFT_MESSAGES',
  UPDATE_SELECTD_USER = 'UPDATE_SELECTD_USER',
}

export interface MessageObj {
  userId: number;
  id: string;
  text: string;
  date: number;
  isReaded: boolean;
  isDateDisabled?: boolean;
}

interface MessageState {
  messages: MessageObj[];
  selectedUser: null | UserObj;
}

const initialState: MessageState = {
  messages: [],
  selectedUser: null,
};

function pushMessage(state: MessageState, action: PushMessageAction): MessageState {
  const newState = Object.assign({}, state);
  newState.messages = Array.from(newState.messages);
  newState.messages.push(action.payload);
  return newState;
}

function unshiftMessages(state: MessageState, action: UnshiftMessagesAction): MessageState {
  const newState = Object.assign({}, state);
  newState.messages = Array.from(newState.messages);
  newState.messages.unshift(...action.payload);
  return newState;
}

function updateSelectedUser(state: MessageState, action: SelecteUserAction): MessageState {
  const newState = Object.assign({}, state);
  newState.selectedUser = action.payload;
  return newState;
}

export function messageReducer(state: MessageState = initialState, actions: RootActions): MessageState {
  switch (actions.type) {
    case Message.PUSH_MESSAGE:
      return pushMessage(state, actions);

    case Message.UNSHIFT_MESSAGES:
      return unshiftMessages(state, actions);

    case Message.UPDATE_SELECTD_USER:
      return updateSelectedUser(state, actions);

    default:
      return state;
  }
}
