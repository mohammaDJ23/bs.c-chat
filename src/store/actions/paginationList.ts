import { PaginationList } from '../../lib';
import { PaginationListEnums } from '../reducers';

export interface PaginationListObj {
  new (...args: any[]): PaginationList.ListInstance;
}

export interface UpdateListPaginationListAction {
  type: PaginationListEnums.UPDATE_LIST;
  payload: { listInstance: PaginationListObj; list: PaginationList.ListObj };
}

export interface UpdatePagePaginationListAction {
  type: PaginationListEnums.UPDATE_PAGE;
  payload: { listInstance: PaginationListObj; page: number };
}

export interface UpdateListAsObjectPaginationListAction {
  type: PaginationListEnums.UPDATE_LIST_AS_OBJECT;
  payload: { listInstance: PaginationListObj; list: PaginationList.ListAsObjectType };
}

export interface UpdateTakePaginationListAction {
  type: PaginationListEnums.UPDATE_TAKE;
  payload: { listInstance: PaginationListObj; take: number };
}

export interface UpdateTotalPaginationListAction {
  type: PaginationListEnums.UPDATE_TOTAL;
  payload: { listInstance: PaginationListObj; total: number };
}

export type PaginationListActions =
  | UpdateListPaginationListAction
  | UpdatePagePaginationListAction
  | UpdateListAsObjectPaginationListAction
  | UpdateTakePaginationListAction
  | UpdateTotalPaginationListAction;

export function updateListPaginationList(
  listInstance: PaginationListObj,
  list: PaginationList.ListObj
): UpdateListPaginationListAction {
  return {
    type: PaginationListEnums.UPDATE_LIST,
    payload: { listInstance, list },
  };
}

export function updateListAsObjectPaginationList(
  listInstance: PaginationListObj,
  list: PaginationList.ListAsObjectType
): UpdateListAsObjectPaginationListAction {
  return {
    type: PaginationListEnums.UPDATE_LIST_AS_OBJECT,
    payload: { listInstance, list },
  };
}

export function updatePagePaginationList(
  listInstance: PaginationListObj,
  page: number
): UpdatePagePaginationListAction {
  return {
    type: PaginationListEnums.UPDATE_PAGE,
    payload: { listInstance, page },
  };
}

export function updateTakePaginationList(
  listInstance: PaginationListObj,
  take: number
): UpdateTakePaginationListAction {
  return {
    type: PaginationListEnums.UPDATE_TAKE,
    payload: { listInstance, take },
  };
}

export function updateTotalPaginationList(
  listInstance: PaginationListObj,
  total: number
): UpdateTotalPaginationListAction {
  return {
    type: PaginationListEnums.UPDATE_TOTAL,
    payload: { listInstance, total },
  };
}
