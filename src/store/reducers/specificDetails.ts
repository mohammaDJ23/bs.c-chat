import { UserStatusObj } from '../../lib';
import { RootActions, SetSpecificDetailsAction } from '../actions';

export enum SpecificDetails {
  SET_SPECIFIC_DETAILS = 'SET_SPECIFIC_DETAILS',
}

export type UsersStatusType = Record<number, UserStatusObj>;

export interface SpecificDetailsState {
  usersStatus: UsersStatusType;
}

const initialState: SpecificDetailsState = {
  usersStatus: {},
};

function setSpecificDetails(state: SpecificDetailsState, action: SetSpecificDetailsAction): SpecificDetailsState {
  return {
    ...state,
    [action.payload.key]: action.payload.data,
  };
}

export function specificDetailsReducer(
  state: SpecificDetailsState = initialState,
  actions: RootActions
): SpecificDetailsState {
  switch (actions.type) {
    case SpecificDetails.SET_SPECIFIC_DETAILS:
      return setSpecificDetails(state, actions);

    default:
      return state;
  }
}
