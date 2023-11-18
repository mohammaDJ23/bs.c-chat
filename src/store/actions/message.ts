import { Message, MessageObj, UserObj } from '../reducers';

export interface CreateMessageAction {
  type: Message.CREATE_MESSAGE;
  payload: MessageObj;
}

export interface SetMessagesAction {
  type: Message.SET_MESSAGES;
  payload: MessageObj[];
}

export interface SetUsersAction {
  type: Message.SET_USERS;
  payload: UserObj[];
}

export interface SetSearchedUsersAction {
  type: Message.SET_SEARCHED_USERS;
  payload: UserObj[];
}

export interface SelecteUserAction {
  type: Message.SELECT_USER_ACTION;
  payload: UserObj;
}

export type MessageActions =
  | CreateMessageAction
  | SetMessagesAction
  | SetUsersAction
  | SetSearchedUsersAction
  | SelecteUserAction;

export function createMessage(payload: MessageObj): CreateMessageAction {
  return {
    type: Message.CREATE_MESSAGE,
    payload,
  };
}

export function setMessages(payload: MessageObj[]): SetMessagesAction {
  return {
    type: Message.SET_MESSAGES,
    payload,
  };
}

export function setUsers(payload: UserObj[]): SetUsersAction {
  return {
    type: Message.SET_USERS,
    payload,
  };
}

export function setSearchedUsers(payload: UserObj[]): SetSearchedUsersAction {
  return {
    type: Message.SET_SEARCHED_USERS,
    payload,
  };
}

export function selectUser(payload: UserObj): SelecteUserAction {
  return {
    type: Message.SELECT_USER_ACTION,
    payload,
  };
}
