import { RequestProcessActions, ClearStateActions, UserServiceSocketActions } from './';

export type RootActions = RequestProcessActions | ClearStateActions | UserServiceSocketActions;
