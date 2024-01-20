import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {
  FormReducer,
  conversationsReducer,
  modalReducer,
  paginationListReducer,
  requsetProcessReducer,
  specificDetailsReducer,
  userServiceSocketReducer,
  infinityListReducer,
  firebaseReducer,
} from './reducers';

const reducers = combineReducers({
  requestProcess: requsetProcessReducer,
  userServiceSocket: userServiceSocketReducer,
  conversations: conversationsReducer,
  modals: modalReducer,
  paginationLists: paginationListReducer,
  forms: FormReducer,
  specificDetails: specificDetailsReducer,
  infinityLists: infinityListReducer,
  firebase: firebaseReducer,
});

export function store() {
  return createStore(reducers, {}, applyMiddleware(thunk));
}

export type RootState = ReturnType<typeof reducers>;
