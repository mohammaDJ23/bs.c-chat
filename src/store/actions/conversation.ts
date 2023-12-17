import { ConversationObj } from '../../lib';
import { Message } from '../reducers';

export interface SelecteUserForStartConversationAction {
  type: Message.SEELCT_USER_FOR_START_CONVERSATION;
  payload: ConversationObj;
}

export interface CleanUserForStartConversationAction {
  type: Message.CLEAN_USER_FOR_START_CONVERSATION;
}

export type MessageActions = SelecteUserForStartConversationAction | CleanUserForStartConversationAction;

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
