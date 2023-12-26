import { useMemo } from 'react';
import { PaginationList } from '../lib';
import { useAction, useSelector } from './';

export function usePaginationList<
  Instance extends PaginationList.BaseList,
  Lists = PaginationList.ListType<Instance>,
  Item = PaginationList.ElementInArrayType<Lists>
>(listInstance: Constructor<Instance>) {
  const actions = useAction();
  const selectors = useSelector();

  return useMemo(
    function () {
      function getInstance(): Instance {
        const instance = selectors.paginationLists[listInstance.name];
        if (instance) {
          return instance as Instance;
        }
        throw new Error('The list instance is not exist.');
      }

      function updateList(list: Item[]): void {
        const instance = getInstance();
        const newList = { [instance.page]: list };
        actions.updateListPaginationList(listInstance, newList);
      }

      function updateAndConcatList(list: Item[], page: number): void {
        const instance = getInstance();
        const newList = Object.assign(instance.list, { [page]: list });
        actions.updateListPaginationList(listInstance, newList);
      }

      function updateListAsObject(list: Item[], fn: (val: Item) => string | number): void {
        const instance = getInstance();
        const listAsObject = list.reduce((acc, val) => {
          acc[fn.call(window, val)] = val;
          return acc;
        }, {} as PaginationList.ListAsObjectType<Item>);
        const newListAsObject = Object.assign(instance.listAsObject, listAsObject);
        actions.updateListAsObjectPaginationList(listInstance, newListAsObject);
      }

      function updateTake(take: number): void {
        actions.updateTakePaginationList(listInstance, take);
      }

      function updatePage(page: number): void {
        actions.updatePagePaginationList(listInstance, page);
      }

      function updateTotal(total: number): void {
        actions.updateTotalPaginationList(listInstance, total);
      }

      function getList(): Lists {
        const instance = getInstance();
        return (instance.list[instance.page] || []) as Lists;
      }

      function getInfinityList(): Item[] {
        const instance = getInstance();
        return Object.values(instance.list).flat() as Item[];
      }

      function getListAsObject(): PaginationList.ListAsObjectType<Item> {
        const instance = getInstance();
        return instance.listAsObject;
      }

      function getPage(): number {
        const instance = getInstance();
        return instance.page;
      }

      function getTake(): number {
        const instance = getInstance();
        return instance.take;
      }

      function getTotal(): number {
        const instance = getInstance();
        return instance.total;
      }

      function getCount(): number {
        const listInstance = getInstance();
        return Math.ceil(listInstance.total / listInstance.take);
      }

      function isListEmpty(): boolean {
        const total = getTotal();
        return total <= 0;
      }

      function isNewPageEqualToCurrentPage(newPage: number): boolean {
        const instance = getInstance();
        return newPage === instance.page;
      }

      function isNewPageExist(newPage: number): boolean {
        const instance = getInstance();
        return !!instance.list[newPage];
      }

      function isListEnd(): boolean {
        const page = getPage();
        const take = getTake();
        const total = getTotal();
        return page * take >= total;
      }

      return {
        getInstance,
        updateList,
        updateAndConcatList,
        updateListAsObject,
        updateTake,
        updatePage,
        updateTotal,
        getList,
        getListAsObject,
        getPage,
        getTake,
        getTotal,
        getCount,
        isListEmpty,
        getInfinityList,
        isNewPageEqualToCurrentPage,
        isNewPageExist,
        isListEnd,
      };
    },
    [selectors.paginationLists[listInstance.name]]
  );
}
