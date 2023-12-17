import { ConversationObj } from '../../lib';
import { RootActions, SelecteUserForStartConversationAction } from '../actions';
import { ClearState } from './clearState';

export enum Message {
  SEELCT_USER_FOR_START_CONVERSATION = 'SEELCT_USER_FOR_START_CONVERSATION',
  CLEAN_USER_FOR_START_CONVERSATION = 'CLEAN_USER_FOR_START_CONVERSATION',
}

interface ConversationsState {
  selectedUser: null | ConversationObj;
}

const initialState: ConversationsState = {
  selectedUser: null,
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

function clearState(): ConversationsState {
  return {
    selectedUser: null,
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

    case ClearState.CLEAR_STATE:
      return clearState();

    default:
      return state;
  }
}
