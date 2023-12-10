import { useMemo } from 'react';
import { InfinityList } from '../lib';
import { useAction, useSelector } from '.';

export function useInfinityList<
  Instance extends InfinityList.BaseList,
  Lists = InfinityList.ListType<Instance>,
  Item = InfinityList.ElementInArrayType<Lists>
>(listInstance: Constructor<Instance>) {
  const actions = useAction();
  const selectors = useSelector();

  return useMemo(
    function () {
      function getInstance(): Instance {
        const instance = selectors.infinityLists[listInstance.name];
        if (instance) {
          return instance as Instance;
        }
        throw new Error('The list instance is not exist.');
      }

      function updateList(list: Item[]): void {
        actions.updateListInfinityList(listInstance, list);
      }

      function updateAndConcatList(list: Item[]): void {
        const instance = getInstance();
        const newList = instance.list.concat(list);
        actions.updateListInfinityList(listInstance, newList);
      }

      function unshiftList(item: Item): void {
        const instance = getInstance();
        const newList = instance.list;
        newList.unshift(item);
        actions.updateListInfinityList(listInstance, newList);
      }

      function updateListAsObject(list: Item[], fn: (val: Item) => string | number): void {
        const instance = getInstance();
        const listAsObject = list.reduce((acc, val) => {
          acc[fn.call(window, val)] = val;
          return acc;
        }, {} as InfinityList.ListAsObjectType<Item>);
        const newListAsObject = Object.assign(instance.listAsObject, listAsObject);
        actions.updateListAsObjectInfinityList(listInstance, newListAsObject);
      }

      function updateTake(take: number): void {
        actions.updateTakeInfinityList(listInstance, take);
      }

      function updatePage(page: number): void {
        actions.updatePageInfinityList(listInstance, page);
      }

      function updateTotal(total: number): void {
        actions.updateTotalInfinityList(listInstance, total);
      }

      function getList(): Item[] {
        const instance = getInstance();
        return instance.list as Item[];
      }

      function getListAsObject(): InfinityList.ListAsObjectType<Item> {
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
        isNewPageEqualToCurrentPage,
        isListEnd,
        unshiftList,
      };
    },
    [selectors.infinityLists[listInstance.name]]
  );
}
