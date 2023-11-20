import { ListAsObjectType, ListInstance, ListObj } from '../../lib';
import { PaginationList } from '../reducers';

export interface PaginationListObj {
  new (...args: any[]): ListInstance;
}

export interface UpdateListPaginationListAction {
  type: PaginationList.UPDATE_LIST;
  payload: { listInstance: PaginationListObj; list: ListObj };
}

export interface UpdatePagePaginationListAction {
  type: PaginationList.UPDATE_PAGE;
  payload: { listInstance: PaginationListObj; page: number };
}

export interface UpdateListAsObjectPaginationListAction {
  type: PaginationList.UPDATE_LIST_AS_OBJECT;
  payload: { listInstance: PaginationListObj; list: ListAsObjectType };
}

export interface UpdateTakePaginationListAction {
  type: PaginationList.UPDATE_TAKE;
  payload: { listInstance: PaginationListObj; take: number };
}

export interface UpdateTotalPaginationListAction {
  type: PaginationList.UPDATE_TOTAL;
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
  list: ListObj
): UpdateListPaginationListAction {
  return {
    type: PaginationList.UPDATE_LIST,
    payload: { listInstance, list },
  };
}

export function updateListAsObjectPaginationList(
  listInstance: PaginationListObj,
  list: ListAsObjectType
): UpdateListAsObjectPaginationListAction {
  return {
    type: PaginationList.UPDATE_LIST_AS_OBJECT,
    payload: { listInstance, list },
  };
}

export function updatePagePaginationList(
  listInstance: PaginationListObj,
  page: number
): UpdatePagePaginationListAction {
  return {
    type: PaginationList.UPDATE_PAGE,
    payload: { listInstance, page },
  };
}

export function updateTakePaginationList(
  listInstance: PaginationListObj,
  take: number
): UpdateTakePaginationListAction {
  return {
    type: PaginationList.UPDATE_TAKE,
    payload: { listInstance, take },
  };
}

export function updateTotalPaginationList(
  listInstance: PaginationListObj,
  total: number
): UpdateTotalPaginationListAction {
  return {
    type: PaginationList.UPDATE_TOTAL,
    payload: { listInstance, total },
  };
}
