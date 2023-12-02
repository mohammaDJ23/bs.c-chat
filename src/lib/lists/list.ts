export interface ListObj<T = any> {
  [key: number | string]: T[];
}

export type ListAsObjectType<T = any> = Record<number | string, T>;

export type ElementInArrayType<T> = T extends (infer U)[] ? U : never;

export interface ListInstance<T = any> {
  list: ListObj<T>;
  take: number;
  page: number;
  total: number;
  listAsObject: ListAsObjectType<T>;
}

export type ListParams<T = any> = Pick<ListInstance<T>, 'take' | 'page'>;

export type ListResponse<T = any> = [T[], number];

export class BaseList<T = any> implements ListInstance<T> {
  public list: ListObj<T> = {};
  public listAsObject: ListAsObjectType<T> = {};
  public page: number = 1;
  public total: number = 0;
  public take: number = 10;

  constructor({ list, listAsObject, page, total, take }: Partial<BaseList<T>> = {}) {
    this.list = list || this.list;
    this.listAsObject = listAsObject || this.listAsObject;
    this.take = take || this.take;
    this.page = page || this.page;
    this.total = total || this.total;
  }
}

export type ListKeyType<T extends BaseList> = keyof T['list'];

export type ListType<T extends BaseList> = T['list'][ListKeyType<T>];
