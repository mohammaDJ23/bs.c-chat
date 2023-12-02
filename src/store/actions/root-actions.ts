import {
  RequestProcessActions,
  ClearStateActions,
  UserServiceSocketActions,
  MessageActions,
  ModalActions,
  PaginationListActions,
  FormActions,
  SpecificDetailsActions,
} from './';

export type RootActions =
  | RequestProcessActions
  | ClearStateActions
  | UserServiceSocketActions
  | MessageActions
  | ModalActions
  | PaginationListActions
  | FormActions
  | SpecificDetailsActions;
