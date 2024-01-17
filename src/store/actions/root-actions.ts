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
  FirebaseActions,
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
  | InfinityListActions
  | FirebaseActions;
