import { BaseList, copyConstructor, ListInstance, lists } from '../../lib';
import {
  UpdatePagePaginationListAction,
  UpdateTakePaginationListAction,
  UpdateTotalPaginationListAction,
  RootActions,
  UpdateListPaginationListAction,
  UpdateListAsObjectPaginationListAction,
} from '../actions';
import { ClearState } from './clearState';

export enum PaginationList {
  UPDATE_LIST = 'UPDATE_LIST',
  UPDATE_LIST_AS_OBJECT = 'UPDATE_LIST_AS_OBJECT',
  UPDATE_TAKE = 'UPDATE_TAKE',
  UPDATE_PAGE = 'UPDATE_PAGE',
  UPDATE_TOTAL = 'UPDATE_TOTAL',
}

interface PaginationListState {
  [key: string]: BaseList;
}

function makeListState() {
  let state: PaginationListState = {};
  for (let list in lists) state[list] = new lists[list as keyof typeof lists]();
  return state;
}

export const initialState: PaginationListState = makeListState();

function updateListPaginationList(
  state: PaginationListState,
  action: UpdateListPaginationListAction
): PaginationListState {
  const newState = Object.assign({}, state);

  const list = action.payload.list;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].list = list;

  return newState;
}

function updateListAsObjectPaginationList(
  state: PaginationListState,
  action: UpdateListAsObjectPaginationListAction
): PaginationListState {
  const newState = Object.assign({}, state);

  const list = action.payload.list;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].listAsObject = list;

  return newState;
}

function updatePagePaginationList(
  state: PaginationListState,
  action: UpdatePagePaginationListAction
): PaginationListState {
  const newState = Object.assign({}, state);

  const page = action.payload.page;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].page = page;

  return newState;
}

function updateTakePaginationList(
  state: PaginationListState,
  action: UpdateTakePaginationListAction
): PaginationListState {
  const newState = Object.assign({}, state);

  const take = action.payload.take;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].take = take;

  return newState;
}

function updateTotalPaginationList(
  state: PaginationListState,
  action: UpdateTotalPaginationListAction
): PaginationListState {
  const newState = Object.assign({}, state);

  const total = action.payload.total;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].total = total;

  return newState;
}

function clearState(): PaginationListState {
  return makeListState();
}

export function paginationListReducer(state: PaginationListState = initialState, actions: RootActions) {
  switch (actions.type) {
    case PaginationList.UPDATE_LIST:
      return updateListPaginationList(state, actions);

    case PaginationList.UPDATE_LIST_AS_OBJECT:
      return updateListAsObjectPaginationList(state, actions);

    case PaginationList.UPDATE_PAGE:
      return updatePagePaginationList(state, actions);

    case PaginationList.UPDATE_TAKE:
      return updateTakePaginationList(state, actions);

    case PaginationList.UPDATE_TOTAL:
      return updateTotalPaginationList(state, actions);

    case ClearState.CLEAR_STATE:
      return clearState();

    default:
      return state;
  }
}
