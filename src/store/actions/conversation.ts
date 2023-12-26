import { ConversationObj } from '../../lib';
import { Message } from '../reducers';

export interface ShowMessagesSpinnerElementAction {
  type: Message.SHOW_MESSAGES_SPINNER_ELEMENT;
}

export interface HideMessagesSpinnerElementAction {
  type: Message.HIDE_MESSAGES_SPINNER_ELEMENT;
}

export interface SelecteUserForStartConversationAction {
  type: Message.SEELCT_USER_FOR_START_CONVERSATION;
  payload: ConversationObj;
}

export interface CleanUserForStartConversationAction {
  type: Message.CLEAN_USER_FOR_START_CONVERSATION;
}

export type MessageActions =
  | SelecteUserForStartConversationAction
  | CleanUserForStartConversationAction
  | ShowMessagesSpinnerElementAction
  | HideMessagesSpinnerElementAction;

export function selectUserForStartConversation(payload: ConversationObj): SelecteUserForStartConversationAction {
  return {
    type: Message.SEELCT_USER_FOR_START_CONVERSATION,
    payload,
  };
}

export function cleanUserForStartConversation(): CleanUserForStartConversationAction {
  return {
    type: Message.CLEAN_USER_FOR_START_CONVERSATION,
  };
}

export function showMessagesSpinnerElement(): ShowMessagesSpinnerElementAction {
  return {
    type: Message.SHOW_MESSAGES_SPINNER_ELEMENT,
  };
}

export function hideMessagesSpinnerElement(): HideMessagesSpinnerElementAction {
  return {
    type: Message.HIDE_MESSAGES_SPINNER_ELEMENT,
  };
}
