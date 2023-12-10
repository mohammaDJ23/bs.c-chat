import { ConversationObj, UserObj } from '../../lib';
import { Message, MessageObj } from '../reducers';

export interface PushMessageAction {
  type: Message.PUSH_MESSAGE;
  payload: MessageObj;
}

export interface UnshiftMessagesAction {
  type: Message.UNSHIFT_MESSAGES;
  payload: MessageObj[];
}

export interface SelecteUserForStartConversationAction {
  type: Message.SEELCT_USER_FOR_START_CONVERSATION;
  payload: ConversationObj;
}

export interface SelecteFindedUserForStartConversationAction {
  type: Message.SEELCT_FINDED_USER_FOR_START_CONVERSATION;
  payload: UserObj;
}

export interface CleanFindedUserForStartConversationAction {
  type: Message.CLEAN_FINDED_USER_FOR_START_CONVERSATION;
}

export type MessageActions =
  | PushMessageAction
  | UnshiftMessagesAction
  | SelecteUserForStartConversationAction
  | SelecteFindedUserForStartConversationAction
  | CleanFindedUserForStartConversationAction;

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

export function selectUserForStartConversation(payload: ConversationObj): SelecteUserForStartConversationAction {
  return {
    type: Message.SEELCT_USER_FOR_START_CONVERSATION,
    payload,
  };
}

export function selectFindedUserForStartConversation(payload: UserObj): SelecteFindedUserForStartConversationAction {
  return {
    type: Message.SEELCT_FINDED_USER_FOR_START_CONVERSATION,
    payload,
  };
}

export function cleanFindedUserForStartConversation(): CleanFindedUserForStartConversationAction {
  return {
    type: Message.CLEAN_FINDED_USER_FOR_START_CONVERSATION,
  };
}
