export interface ListObj<T = any> {
  [key: number]: T[];
}

export type ListAsObjectType<T = any> = Record<number | string, ListObj<T>>;

export interface ListInstance<T = any> {
  list: ListObj<T>;
  take: number;
  page: number;
  total: number;
  listAsObject: ListAsObjectType;
}

export type ListType<T extends ListInstance = ListInstance> = T['list'] extends ListObj<infer C> ? C : any;

export interface ListInstanceConstructor<K extends ListInstance> {
  new (...args: any[]): ListInstance<ListType<K>>;
}

export type ListParams<T = any> = Pick<ListInstance<T>, 'take' | 'page'>;

export type ListResponse<T extends unknown = unknown> = [T[], number];

export class BaseList implements ListInstance {
  public list: ListObj = {};
  public listAsObject: ListAsObjectType = {};
  public page: number = 1;
  public total: number = 0;
  public take: number = 10;

  constructor({ list, listAsObject, page, total, take }: Partial<BaseList> = {}) {
    this.list = list || this.list;
    this.listAsObject = listAsObject || this.listAsObject;
    this.take = take || this.take;
    this.page = page || this.page;
    this.total = total || this.total;
  }
}
