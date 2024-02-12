import { PaginationList, copyConstructor, paginationLists } from '../../lib';
import {
  UpdatePagePaginationListAction,
  UpdateTakePaginationListAction,
  UpdateTotalPaginationListAction,
  RootActions,
  UpdateListPaginationListAction,
  UpdateListAsObjectPaginationListAction,
} from '../actions';
import { ClearState } from './clearState';

export enum PaginationListEnums {
  UPDATE_LIST = 'UPDATE_LIST_PAGINATION_LIST',
  UPDATE_LIST_AS_OBJECT = 'UPDATE_LIST_AS_OBJECT_PAGINATION_LIST',
  UPDATE_TAKE = 'UPDATE_TAKE_PAGINATION_LIST',
  UPDATE_PAGE = 'UPDATE_PAGE_PAGINATION_LIST',
  UPDATE_TOTAL = 'UPDATE_TOTAL_PAGINATION_LIST',
}

interface PaginationListState {
  [key: string]: PaginationList.BaseList;
}

function makeListState() {
  let state: PaginationListState = {};
  for (let list in paginationLists) state[list] = new paginationLists[list as keyof typeof paginationLists]();
  return state;
}

const initialState: PaginationListState = makeListState();

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
    case PaginationListEnums.UPDATE_LIST:
      return updateListPaginationList(state, actions);

    case PaginationListEnums.UPDATE_LIST_AS_OBJECT:
      return updateListAsObjectPaginationList(state, actions);

    case PaginationListEnums.UPDATE_PAGE:
      return updatePagePaginationList(state, actions);

    case PaginationListEnums.UPDATE_TAKE:
      return updateTakePaginationList(state, actions);

    case PaginationListEnums.UPDATE_TOTAL:
      return updateTotalPaginationList(state, actions);

    case ClearState.CLEAR_STATE:
      return clearState();

    default:
      return state;
  }
}
