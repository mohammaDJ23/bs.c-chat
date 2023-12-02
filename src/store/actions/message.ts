import { UserObj } from '../../lib';
import { Message, MessageObj } from '../reducers';

export interface PushMessageAction {
  type: Message.PUSH_MESSAGE;
  payload: MessageObj;
}

export interface UnshiftMessagesAction {
  type: Message.UNSHIFT_MESSAGES;
  payload: MessageObj[];
}

export interface SelecteUserAction {
  type: Message.UPDATE_SELECTD_USER;
  payload: UserObj;
}

export type MessageActions = PushMessageAction | UnshiftMessagesAction | SelecteUserAction;

export function pushMessage(payload: MessageObj): PushMessageAction {
  return {
    type: Message.PUSH_MESSAGE,
    payload,
  };
}

export function unshiftMessages(payload: MessageObj[]): UnshiftMessagesAction {
  return {
    type: Message.UNSHIFT_MESSAGES,
    payload,
  };
}

export function selectUser(payload: UserObj): SelecteUserAction {
  return {
    type: Message.UPDATE_SELECTD_USER,
    payload,
  };
}
