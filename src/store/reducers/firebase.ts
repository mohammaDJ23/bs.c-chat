import { RootActions, UpdateFirebaseIdTokenAction } from '../actions';
import { ClearState } from './clearState';

export enum Firebase {
  UPDATE_FIREBASE_ID_TOKEN = 'UPDATE_FIREBASE_ID_TOKEN',
}

interface FirebaseState {
  firebaseIdToken: string;
}

const initialState: FirebaseState = {
  firebaseIdToken: '',
};

function updateFirebaseIdToken(state: FirebaseState, action: UpdateFirebaseIdTokenAction): FirebaseState {
  const newState = Object.assign({}, state);
  newState.firebaseIdToken = action.payload.token;
  return newState;
}

function clearState(): FirebaseState {
  return {
    firebaseIdToken: '',
  };
}

export function firebaseReducer(state: FirebaseState = initialState, actions: RootActions): FirebaseState {
  switch (actions.type) {
    case Firebase.UPDATE_FIREBASE_ID_TOKEN:
      return updateFirebaseIdToken(state, actions);

    case ClearState.CLEAR_STATE:
      return clearState();

    default:
      return state;
  }
}
