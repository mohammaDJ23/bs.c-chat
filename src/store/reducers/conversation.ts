import { ConversationObj, UserObj } from '../../lib';
import {
  PushMessageAction,
  RootActions,
  SelecteFindedUserForStartConversationAction,
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
  SEELCT_FINDED_USER_FOR_START_CONVERSATION = 'SEELCT_FINDED_USER_FOR_START_CONVERSATION',
  CLEAN_FINDED_USER_FOR_START_CONVERSATION = 'CLEAN_FINDED_USER_FOR_START_CONVERSATION',
}

export interface MessageObj {
  userId: number;
  id: string;
  text: string;
  date: number;
  isReaded: boolean;
  isDateDisabled?: boolean;
}

interface ConversationsState {
  messages: MessageObj[];
  selectedUser: null | ConversationObj;
  selectedFindedUser: null | UserObj;
}

const initialState: ConversationsState = {
  messages: [],
  selectedUser: null,
  selectedFindedUser: null,
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

function selectFindedUserForStartConversation(
  state: ConversationsState,
  action: SelecteFindedUserForStartConversationAction
): ConversationsState {
  const newState = Object.assign({}, state);
  newState.selectedFindedUser = action.payload;
  return newState;
}

function cleanFindedUserForStartConversation(state: ConversationsState): ConversationsState {
  const newState = Object.assign({}, state);
  newState.selectedFindedUser = null;
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
    selectedFindedUser: null,
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

    case Message.SEELCT_FINDED_USER_FOR_START_CONVERSATION:
      return selectFindedUserForStartConversation(state, actions);

    case Message.CLEAN_FINDED_USER_FOR_START_CONVERSATION:
      return cleanFindedUserForStartConversation(state);

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
