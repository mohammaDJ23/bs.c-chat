import { ConversationObj } from '../../lib';
import { Conversation } from '../reducers';

export interface ShowMessagesSpinnerElementAction {
  type: Conversation.SHOW_MESSAGES_SPINNER_ELEMENT;
}

export interface HideMessagesSpinnerElementAction {
  type: Conversation.HIDE_MESSAGES_SPINNER_ELEMENT;
}

export interface SelecteUserForStartConversationAction {
  type: Conversation.SEELCT_USER_FOR_START_CONVERSATION;
  payload: ConversationObj;
}

export interface CleanUserForStartConversationAction {
  type: Conversation.CLEAN_USER_FOR_START_CONVERSATION;
}

export type MessageActions =
  | SelecteUserForStartConversationAction
  | CleanUserForStartConversationAction
  | ShowMessagesSpinnerElementAction
  | HideMessagesSpinnerElementAction;

export function selectUserForStartConversation(payload: ConversationObj): SelecteUserForStartConversationAction {
  return {
    type: Conversation.SEELCT_USER_FOR_START_CONVERSATION,
    payload,
  };
}

export function cleanUserForStartConversation(): CleanUserForStartConversationAction {
  return {
    type: Conversation.CLEAN_USER_FOR_START_CONVERSATION,
  };
}

export function showMessagesSpinnerElement(): ShowMessagesSpinnerElementAction {
  return {
    type: Conversation.SHOW_MESSAGES_SPINNER_ELEMENT,
  };
}

export function hideMessagesSpinnerElement(): HideMessagesSpinnerElementAction {
  return {
    type: Conversation.HIDE_MESSAGES_SPINNER_ELEMENT,
  };
}
