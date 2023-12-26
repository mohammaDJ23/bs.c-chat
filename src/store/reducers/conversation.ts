import { ConversationObj } from '../../lib';
import { RootActions, SelecteUserForStartConversationAction } from '../actions';
import { ClearState } from './clearState';

export enum Message {
  SEELCT_USER_FOR_START_CONVERSATION = 'SEELCT_USER_FOR_START_CONVERSATION',
  CLEAN_USER_FOR_START_CONVERSATION = 'CLEAN_USER_FOR_START_CONVERSATION',
  SHOW_MESSAGES_SPINNER_ELEMENT = 'SHOW_MESSAGES_SPINNER_ELEMENT',
  HIDE_MESSAGES_SPINNER_ELEMENT = 'HIDE_MESSAGES_SPINNER_ELEMENT',
}

interface ConversationsState {
  selectedUser: null | ConversationObj;
  isMessagesSpinnerElementActive: boolean;
}

const initialState: ConversationsState = {
  selectedUser: null,
  isMessagesSpinnerElementActive: false,
};

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

function showMessagesSpinnerElement(state: ConversationsState): ConversationsState {
  const newState = Object.assign({}, state);
  newState.isMessagesSpinnerElementActive = true;
  return newState;
}

function hideMessagesSpinnerElement(state: ConversationsState): ConversationsState {
  const newState = Object.assign({}, state);
  newState.isMessagesSpinnerElementActive = false;
  return newState;
}

function clearState(): ConversationsState {
  return {
    selectedUser: null,
    isMessagesSpinnerElementActive: false,
  };
}

export function conversationsReducer(
  state: ConversationsState = initialState,
  actions: RootActions
): ConversationsState {
  switch (actions.type) {
    case Message.SEELCT_USER_FOR_START_CONVERSATION:
      return selectUserForStartConversation(state, actions);

    case Message.CLEAN_USER_FOR_START_CONVERSATION:
      return cleanUserForStartConversation(state);

    case Message.SHOW_MESSAGES_SPINNER_ELEMENT:
      return showMessagesSpinnerElement(state);

    case Message.HIDE_MESSAGES_SPINNER_ELEMENT:
      return hideMessagesSpinnerElement(state);

    case ClearState.CLEAR_STATE:
      return clearState();

    default:
      return state;
  }
}
