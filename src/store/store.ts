import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import {
  messageReducer,
  modalReducer,
  paginationListReducer,
  requsetProcessReducer,
  userServiceSocketReducer,
} from './reducers';

const reducers = combineReducers({
  requestProcess: requsetProcessReducer,
  userServiceSocket: userServiceSocketReducer,
  message: messageReducer,
  modal: modalReducer,
  paginationList: paginationListReducer,
});

export const store = createStore(reducers, {}, applyMiddleware(thunk));

export type RootState = ReturnType<typeof reducers>;
