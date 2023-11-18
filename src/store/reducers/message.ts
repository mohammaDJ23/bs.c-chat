import { UserRoles } from '../../lib';
import {
  CreateMessageAction,
  RootActions,
  SelecteUserAction,
  SetMessagesAction,
  SetSearchedUsersAction,
  SetUsersAction,
} from '../actions';

export enum Message {
  CREATE_MESSAGE = 'CREATE_MESSAGE',
  SET_USERS = 'SET_USERS',
  SET_MESSAGES = 'SET_MESSAGES',
  SET_SEARCHED_USERS = 'SET_SEARCHED_USERS',
  SELECT_USER_ACTION = 'SELECT_USER_ACTION',
}

export interface MessageObj {
  userId: number;
  id: string;
  text: string;
  date: number;
  isReaded: boolean;
  isDateDisabled?: boolean;
}

export interface UserObj {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRoles;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  parent: UserObj;
}

interface MessageState {
  messages: MessageObj[];
  users: UserObj[];
  searchedUsers: UserObj[];
  selectedUser: null | UserObj;
}

const initialState: MessageState = {
  messages: [],
  users: [],
  searchedUsers: [],
  selectedUser: null,
};

function createMessage(state: MessageState, action: CreateMessageAction): MessageState {
  const newState = Object.assign({}, state);
  newState.messages = Array.from(newState.messages);
  newState.messages.push(action.payload);
  return newState;
}

function setMessages(state: MessageState, action: SetMessagesAction): MessageState {
  const newState = Object.assign({}, state);
  newState.messages = Array.from(newState.messages);
  newState.messages.unshift(...action.payload);
  return newState;
}

function setUsers(state: MessageState, action: SetUsersAction): MessageState {
  const newState = Object.assign({}, state);
  newState.users = Array.from(newState.users);
  newState.users.push(...action.payload);
  return newState;
}

function setSearchedUsers(state: MessageState, action: SetSearchedUsersAction): MessageState {
  const newState = Object.assign({}, state);
  newState.searchedUsers = Array.from(action.payload);
  return newState;
}

function selectUser(state: MessageState, action: SelecteUserAction): MessageState {
  const newState = Object.assign({}, state);
  newState.selectedUser = action.payload;
  return newState;
}

export function messageReducer(state: MessageState = initialState, actions: RootActions): MessageState {
  switch (actions.type) {
    case Message.CREATE_MESSAGE:
      return createMessage(state, actions);

    case Message.SET_MESSAGES:
      return setMessages(state, actions);

    case Message.SET_USERS:
      return setUsers(state, actions);

    case Message.SET_SEARCHED_USERS:
      return setSearchedUsers(state, actions);

    case Message.SELECT_USER_ACTION:
      return selectUser(state, actions);

    default:
      return state;
  }
}
