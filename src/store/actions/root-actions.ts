import {
  RequestProcessActions,
  ClearStateActions,
  UserServiceSocketActions,
  MessageActions,
  ModalActions,
  PaginationListActions,
  FormActions,
} from './';

export type RootActions =
  | RequestProcessActions
  | ClearStateActions
  | UserServiceSocketActions
  | MessageActions
  | ModalActions
  | PaginationListActions
  | FormActions;
