import { InfinityList } from '../../lib';
import { InfinityListEnums } from '../reducers';

export interface InifinityListObj {
  new (...args: any[]): InfinityList.ListInstance;
}

export interface ResetListInfinityListAction {
  type: InfinityListEnums.RESET_LIST;
  payload: { listInstance: InifinityListObj };
}

export interface UpdateListInfinityListAction {
  type: InfinityListEnums.UPDATE_LIST;
  payload: { listInstance: InifinityListObj; list: InfinityList.ListType };
}

export interface UpdatePageInfinityListAction {
  type: InfinityListEnums.UPDATE_PAGE;
  payload: { listInstance: InifinityListObj; page: number };
}

export interface UpdateListAsObjectInfinityListAction {
  type: InfinityListEnums.UPDATE_LIST_AS_OBJECT;
  payload: { listInstance: InifinityListObj; list: InfinityList.ListAsObjectType };
}

export interface UpdateTakeInfinityListAction {
  type: InfinityListEnums.UPDATE_TAKE;
  payload: { listInstance: InifinityListObj; take: number };
}

export interface UpdateTotalInfinityListAction {
  type: InfinityListEnums.UPDATE_TOTAL;
  payload: { listInstance: InifinityListObj; total: number };
}

export type InfinityListActions =
  | UpdateListInfinityListAction
  | UpdatePageInfinityListAction
  | UpdateListAsObjectInfinityListAction
  | UpdateTakeInfinityListAction
  | UpdateTotalInfinityListAction
  | ResetListInfinityListAction;

export function updateListInfinityList(
  listInstance: InifinityListObj,
  list: InfinityList.ListType
): UpdateListInfinityListAction {
  return {
    type: InfinityListEnums.UPDATE_LIST,
    payload: { listInstance, list },
  };
}

export function updateListAsObjectInfinityList(
  listInstance: InifinityListObj,
  list: InfinityList.ListAsObjectType
): UpdateListAsObjectInfinityListAction {
  return {
    type: InfinityListEnums.UPDATE_LIST_AS_OBJECT,
    payload: { listInstance, list },
  };
}

export function updatePageInfinityList(listInstance: InifinityListObj, page: number): UpdatePageInfinityListAction {
  return {
    type: InfinityListEnums.UPDATE_PAGE,
    payload: { listInstance, page },
  };
}

export function updateTakeInfinityList(listInstance: InifinityListObj, take: number): UpdateTakeInfinityListAction {
  return {
    type: InfinityListEnums.UPDATE_TAKE,
    payload: { listInstance, take },
  };
}

export function updateTotalInfinityList(listInstance: InifinityListObj, total: number): UpdateTotalInfinityListAction {
  return {
    type: InfinityListEnums.UPDATE_TOTAL,
    payload: { listInstance, total },
  };
}

export function resetListInfinityList(listInstance: InifinityListObj): ResetListInfinityListAction {
  return {
    type: InfinityListEnums.RESET_LIST,
    payload: { listInstance },
  };
}

export namespace InfinityListStore {}
