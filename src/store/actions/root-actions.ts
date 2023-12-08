import {
  RequestProcessActions,
  ClearStateActions,
  UserServiceSocketActions,
  MessageActions,
  ModalActions,
  PaginationListActions,
  FormActions,
  SpecificDetailsActions,
  InfinityListActions,
} from './';

export type RootActions =
  | RequestProcessActions
  | ClearStateActions
  | UserServiceSocketActions
  | MessageActions
  | ModalActions
  | PaginationListActions
  | FormActions
  | SpecificDetailsActions
  | InfinityListActions;
