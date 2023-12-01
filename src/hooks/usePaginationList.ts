import { useMemo } from 'react';
import { BaseList, ElementInArrayType, ListAsObjectType, ListType } from '../lib';
import { useAction, useSelector } from './';

export function usePaginationList<
  Instance extends BaseList,
  Lists = ListType<Instance>,
  Item = ElementInArrayType<Lists>
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

      function updateListAsObject(list: ListAsObjectType<Item>): void {
        const instance = getInstance();
        const newListAsObject = Object.assign(instance.listAsObject, list);
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

      function getInfinityList(): Lists {
        const instance = getInstance();
        return Object.values(instance.list).flat() as Lists;
      }

      function getListAsObject(): ListAsObjectType<Item> {
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

      function isListEmpty(): boolean {
        const instance = getInstance();
        const total = getTotal();
        return Object.keys(instance.list).length <= 0 && total <= 0;
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
        isListEmpty,
        getInfinityList,
      };
    },
    [selectors.paginationLists[listInstance.name]]
  );
}
