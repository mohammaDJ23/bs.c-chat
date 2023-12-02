import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {
  FormReducer,
  messageReducer,
  modalReducer,
  paginationListReducer,
  requsetProcessReducer,
  specificDetailsReducer,
  userServiceSocketReducer,
} from './reducers';

const reducers = combineReducers({
  requestProcess: requsetProcessReducer,
  userServiceSocket: userServiceSocketReducer,
  message: messageReducer,
  modals: modalReducer,
  paginationLists: paginationListReducer,
  forms: FormReducer,
  specificDetails: specificDetailsReducer,
});

export const store = createStore(reducers, {}, applyMiddleware(thunk));

export type RootState = ReturnType<typeof reducers>;
