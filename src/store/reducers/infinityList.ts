import { InfinityList, infinityLists, copyConstructor } from '../../lib';
import {
  UpdatePageInfinityListAction,
  UpdateTakeInfinityListAction,
  UpdateTotalInfinityListAction,
  RootActions,
  UpdateListInfinityListAction,
  UpdateListAsObjectInfinityListAction,
} from '../actions';
import { ClearState } from './clearState';

export enum InfinityListEnums {
  UPDATE_LIST = 'UPDATE_LIST_INFINITY_LIST',
  UPDATE_LIST_AS_OBJECT = 'UPDATE_LIST_AS_OBJECT_INFINITY_LIST',
  UPDATE_TAKE = 'UPDATE_TAKE_INFINITY_LIST',
  UPDATE_PAGE = 'UPDATE_PAGE_INFINITY_LIST',
  UPDATE_TOTAL = 'UPDATE_TOTAL_INFINITY_LIST',
}

interface InfinityListState {
  [key: string]: InfinityList.BaseList;
}

function makeListState() {
  let state: InfinityListState = {};
  for (let list in infinityLists) state[list] = new infinityLists[list as keyof typeof infinityLists]();
  return state;
}

const initialState: InfinityListState = makeListState();

function updateListInfinityList(state: InfinityListState, action: UpdateListInfinityListAction): InfinityListState {
  const newState = Object.assign({}, state);

  const list = action.payload.list;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].list = list;

  return newState;
}

function updateListAsObjectInfinityList(
  state: InfinityListState,
  action: UpdateListAsObjectInfinityListAction
): InfinityListState {
  const newState = Object.assign({}, state);

  const list = action.payload.list;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].listAsObject = list;

  return newState;
}

function updatePageInfinityList(state: InfinityListState, action: UpdatePageInfinityListAction): InfinityListState {
  const newState = Object.assign({}, state);

  const page = action.payload.page;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].page = page;

  return newState;
}

function updateTakeInfinityList(state: InfinityListState, action: UpdateTakeInfinityListAction): InfinityListState {
  const newState = Object.assign({}, state);

  const take = action.payload.take;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].take = take;

  return newState;
}

function updateTotalInfinityList(state: InfinityListState, action: UpdateTotalInfinityListAction): InfinityListState {
  const newState = Object.assign({}, state);

  const total = action.payload.total;
  const listInstance = action.payload.listInstance;

  const copiedList = copyConstructor(state[listInstance.name]);

  newState[listInstance.name] = copiedList;
  newState[listInstance.name].total = total;

  return newState;
}

function clearState(): InfinityListState {
  return makeListState();
}

export function infinityListReducer(state: InfinityListState = initialState, actions: RootActions) {
  switch (actions.type) {
    case InfinityListEnums.UPDATE_LIST:
      return updateListInfinityList(state, actions);

    case InfinityListEnums.UPDATE_LIST_AS_OBJECT:
      return updateListAsObjectInfinityList(state, actions);

    case InfinityListEnums.UPDATE_PAGE:
      return updatePageInfinityList(state, actions);

    case InfinityListEnums.UPDATE_TAKE:
      return updateTakeInfinityList(state, actions);

    case InfinityListEnums.UPDATE_TOTAL:
      return updateTotalInfinityList(state, actions);

    case ClearState.CLEAR_STATE:
      return clearState();

    default:
      return state;
  }
}
