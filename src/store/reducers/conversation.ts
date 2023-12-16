import { ConversationObj, MessageObj } from '../../lib';
import {
  PushMessageAction,
  RootActions,
  SelecteUserForStartConversationAction,
  UnshiftMessagesAction,
} from '../actions';
import { ClearState } from './clearState';

export enum Message {
  PUSH_MESSAGE = 'PUSH_MESSAGE',
  UNSHIFT_MESSAGES = 'UNSHIFT_MESSAGES',
  CLEAN_MESSAGES = 'CLEAN_MESSAGES',
  SEELCT_USER_FOR_START_CONVERSATION = 'SEELCT_USER_FOR_START_CONVERSATION',
  CLEAN_USER_FOR_START_CONVERSATION = 'CLEAN_USER_FOR_START_CONVERSATION',
}

interface ConversationsState {
  messages: MessageObj[];
  selectedUser: null | ConversationObj;
}

const initialState: ConversationsState = {
  messages: [],
  selectedUser: null,
};

function pushMessage(state: ConversationsState, action: PushMessageAction): ConversationsState {
  const newState = Object.assign({}, state);
  newState.messages = Array.from(newState.messages);
  newState.messages.push(action.payload);
  return newState;
}

function unshiftMessages(state: ConversationsState, action: UnshiftMessagesAction): ConversationsState {
  const newState = Object.assign({}, state);
  newState.messages = Array.from(newState.messages);
  newState.messages.unshift(...action.payload);
  return newState;
}

function selectUserForStartConversation(
  state: ConversationsState,
  action: SelecteUserForStartConversationAction
): ConversationsState {
  const newState = Object.assign({}, state);
  newState.selectedUser = action.payload;
  return newState;
}

function cleanUserForStartConversation(state: ConversationsState): ConversationsState {
  const newState = Object.assign({}, state);
  newState.selectedUser = null;
  return newState;
}

function cleanMessages(state: ConversationsState): ConversationsState {
  const newState = Object.assign({}, state);
  newState.messages = [];
  return newState;
}

function clearState(): ConversationsState {
  return {
    messages: [],
    selectedUser: null,
  };
}

export function conversationsReducer(
  state: ConversationsState = initialState,
  actions: RootActions
): ConversationsState {
  switch (actions.type) {
    case Message.PUSH_MESSAGE:
      return pushMessage(state, actions);

    case Message.UNSHIFT_MESSAGES:
      return unshiftMessages(state, actions);

    case Message.SEELCT_USER_FOR_START_CONVERSATION:
      return selectUserForStartConversation(state, actions);

    case Message.CLEAN_USER_FOR_START_CONVERSATION:
      return cleanUserForStartConversation(state);

    case Message.CLEAN_MESSAGES:
      return cleanMessages(state);

    case ClearState.CLEAR_STATE:
      return clearState();

    default:
      return state;
  }
}
