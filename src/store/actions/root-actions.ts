import {
  RequestProcessActions,
  ClearStateActions,
  UserServiceSocketActions,
  MessageActions,
  ModalActions,
  PaginationListActions,
} from './';

export type RootActions =
  | RequestProcessActions
  | ClearStateActions
  | UserServiceSocketActions
  | MessageActions
  | ModalActions
  | PaginationListActions;
