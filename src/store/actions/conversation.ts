import { ConversationObj, MessageObj, UserObj } from '../../lib';
import { Message } from '../reducers';

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

export interface CleanUserForStartConversationAction {
  type: Message.CLEAN_USER_FOR_START_CONVERSATION;
}

export interface SelecteFindedUserForStartConversationAction {
  type: Message.SEELCT_FINDED_USER_FOR_START_CONVERSATION;
  payload: UserObj;
}

export interface CleanFindedUserForStartConversationAction {
  type: Message.CLEAN_FINDED_USER_FOR_START_CONVERSATION;
}

export interface CleanMessagesAction {
  type: Message.CLEAN_MESSAGES;
}

export type MessageActions =
  | PushMessageAction
  | UnshiftMessagesAction
  | SelecteUserForStartConversationAction
  | SelecteFindedUserForStartConversationAction
  | CleanFindedUserForStartConversationAction
  | CleanUserForStartConversationAction
  | CleanMessagesAction;

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

export function cleanUserForStartConversation(): CleanUserForStartConversationAction {
  return {
    type: Message.CLEAN_USER_FOR_START_CONVERSATION,
  };
}

export function cleanMessages(): CleanMessagesAction {
  return {
    type: Message.CLEAN_MESSAGES,
  };
}
