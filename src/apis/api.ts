import { AxiosRequestConfig, CreateAxiosDefaults } from 'axios';
import { PaginationList, UserListFiltersObj, UserObj } from '../lib';
import { RootApiObj } from './resetApi';

export type FilterParams<T = any> = Record<'filters', T>;

export abstract class RootApi<D = any> implements RootApiObj<D> {
  protected _isInitialApi: boolean = false;

  constructor(public readonly api: AxiosRequestConfig<D>, public readonly config: CreateAxiosDefaults<D> = {}) {
    this.api = api;
    this.config = config;
  }

  get isInitialApi() {
    return this._isInitialApi;
  }

  setInitialApi(value: boolean = true) {
    this._isInitialApi = value;
    return this;
  }
}

export class AllUsersApi extends RootApi {
  constructor(params: PaginationList.ListParams<UserObj> & FilterParams<Partial<UserListFiltersObj>>) {
    super(
      {
        url: '/api/v1/user/all',
        method: 'get',
        params,
      },
      { baseURL: process.env.USER_SERVICE }
    );
  }
}

export class AllOwnersApi extends RootApi {
  constructor(params: PaginationList.ListParams<UserObj> & FilterParams<Partial<UserListFiltersObj>>) {
    super(
      {
        url: '/api/v1/user/all/owners',
        method: 'get',
        params,
      },
      { baseURL: process.env.USER_SERVICE }
    );
  }
}

export class StartConversationApi extends RootApi {}

export class AllConversationsApi extends RootApi {}

export class MessagesApi extends RootApi {}

export class GenerateCustomTokenApi extends RootApi {
  constructor() {
    super(
      {
        url: '/api/v1/auth/firebase/generate-custom-token',
        method: 'get',
      },
      { baseURL: process.env.AUTH_SERVICE }
    );
  }
}

export class SigninWithCustomTokenApi extends RootApi {}
