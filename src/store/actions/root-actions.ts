import { RequestProcessActions, ClearStateActions, UserServiceSocketActions, MessageActions, ModalActions } from './';

export type RootActions =
  | RequestProcessActions
  | ClearStateActions
  | UserServiceSocketActions
  | MessageActions
  | ModalActions;
