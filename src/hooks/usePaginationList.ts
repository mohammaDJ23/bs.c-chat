import { useMemo } from 'react';
import { ListAsObjectType, ListInstance, ListInstanceConstructor } from '../lib';
import { useAction, useSelector } from './';

export function usePaginationList<T>(listInstance: ListInstanceConstructor<ListInstance<T>>) {
  const actions = useAction();
  const selectors = useSelector();

  return useMemo(
    function () {
      function getInstance() {
        const instance = selectors.paginationList[listInstance.name];
        if (instance) {
          return instance;
        }
        throw new Error('The list instance is not exist.');
      }

      function updateList(list: any[]): void {
        const instance = getInstance();
        const newList = { [instance.page]: list };
        actions.updateListPaginationList(listInstance, newList);
      }

      function updateAndConcatList(list: any[], page: number): void {
        const instance = getInstance();
        const newList = Object.assign(instance.list, { [page]: list });
        actions.updateListPaginationList(listInstance, newList);
      }

      function updateListAsObject(list: any[]) {
        const instance = getInstance();
        const convertedList = list.reduce((acc, val) => {
          if (val.id) {
            acc[val.id] = val;
          } else {
            throw new Error('The item of the list has to have an id to making the list as object.');
          }
          return acc;
        }, {} as ListAsObjectType);
        const newListAsObject = Object.assign(instance.listAsObject, convertedList);
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

      function getList(): any[] {
        const instance = getInstance();
        return instance.list[instance.page] || [];
      }

      function getListAsObject(): ListAsObjectType {
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
      };
    },
    [selectors.paginationList[listInstance.name]]
  );
}
