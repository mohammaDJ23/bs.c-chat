import { RequestProcessActions, ClearStateActions, UserServiceSocketActions, MessageActions } from './';

export type RootActions = RequestProcessActions | ClearStateActions | UserServiceSocketActions | MessageActions;
