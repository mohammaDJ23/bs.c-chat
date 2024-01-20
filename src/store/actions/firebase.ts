import { Firebase } from '../reducers';

export interface UpdateFirebaseIdTokenAction {
  type: Firebase.UPDATE_FIREBASE_ID_TOKEN;
  payload: { token: string };
}

export type FirebaseActions = UpdateFirebaseIdTokenAction;

export function updateFirebaseIdToken(token: string): UpdateFirebaseIdTokenAction {
  return {
    type: Firebase.UPDATE_FIREBASE_ID_TOKEN,
    payload: { token },
  };
}
